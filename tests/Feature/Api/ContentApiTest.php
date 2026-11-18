<?php

use App\Models\Blog;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Str;

function createScopedApiToken(User $user, Team $team, array $abilities = ['*']): string
{
    $plainText = 'framex_live_'.Str::random(40);
    $hashed = hash('sha256', $plainText);

    $user->tokens()->create([
        'name' => 'Test Token',
        'team_id' => $team->id,
        'token' => $hashed,
        'abilities' => $abilities,
        'expires_at' => null,
    ]);

    return $plainText;
}

test('api can list team blogs with blogs:read scope', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $blogInTeam = Blog::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'title' => 'API Team Post',
    ]);

    $otherTeam = Team::factory()->create();
    Blog::factory()->create([
        'team_id' => $otherTeam->id,
        'title' => 'Other Team API Post',
    ]);

    $token = createScopedApiToken($user, $team, ['blogs:read']);

    $response = $this->withToken($token)->getJson('/api/v1/blogs');

    $response->assertOk();
    $response->assertJsonCount(1);
    $response->assertJsonFragment(['title' => 'API Team Post']);
    $response->assertJsonMissing(['title' => 'Other Team API Post']);
});

test('api rejects listing blogs when token lacks blogs:read scope', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $token = createScopedApiToken($user, $team, ['categories:read']);

    $response = $this->withToken($token)->getJson('/api/v1/blogs');

    $response->assertForbidden();
});

test('api can create a blog with blogs:create scope', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = Category::factory()->create();
    $tag = Tag::factory()->create();

    $token = createScopedApiToken($user, $team, ['blogs:create', 'blogs:read']);

    $response = $this->withToken($token)->postJson('/api/v1/blogs', [
        'title' => 'API Created Blog',
        'excerpt' => 'An excerpt from API',
        'content' => '<p>Body from API</p>',
        'is_published' => true,
        'category_id' => $category->id,
        'tag_ids' => [$tag->id],
    ]);

    $response->assertCreated();
    $response->assertJsonFragment(['title' => 'API Created Blog']);

    $this->assertDatabaseHas('blogs', [
        'title' => 'API Created Blog',
        'slug' => 'api-created-blog',
        'team_id' => $team->id,
        'user_id' => $user->id,
    ]);
});

test('api can retrieve a single blog post by slug', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $blog = Blog::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'title' => 'Specific Blog',
        'slug' => 'specific-blog',
    ]);

    $token = createScopedApiToken($user, $team, ['blogs:read']);

    $response = $this->withToken($token)->getJson("/api/v1/blogs/{$blog->slug}");

    $response->assertOk();
    $response->assertJsonFragment(['title' => 'Specific Blog', 'slug' => 'specific-blog']);
});

test('api can update a blog post with blogs:update scope', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $blog = Blog::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'title' => 'Initial Title',
        'slug' => 'initial-title',
    ]);

    $token = createScopedApiToken($user, $team, ['blogs:update', 'blogs:read']);

    $response = $this->withToken($token)->putJson("/api/v1/blogs/{$blog->slug}", [
        'title' => 'Updated via API',
        'content' => '<p>New Content</p>',
    ]);

    $response->assertOk();
    $response->assertJsonFragment(['title' => 'Updated via API', 'slug' => 'updated-via-api']);

    $this->assertDatabaseHas('blogs', [
        'id' => $blog->id,
        'title' => 'Updated via API',
    ]);
});

test('api can delete a blog post with blogs:delete scope', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $blog = Blog::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'slug' => 'to-be-deleted',
    ]);

    $token = createScopedApiToken($user, $team, ['blogs:delete']);

    $response = $this->withToken($token)->deleteJson("/api/v1/blogs/{$blog->slug}");

    $response->assertOk();
    $this->assertDatabaseMissing('blogs', [
        'id' => $blog->id,
    ]);
});

test('api requests without token are rejected', function () {
    $response = $this->getJson('/api/v1/blogs');

    $response->assertUnauthorized();
});

test('api token from another team cannot access this teams data', function () {
    $userA = User::factory()->create();
    $teamA = $userA->currentTeam;

    $userB = User::factory()->create();
    $teamB = $userB->currentTeam;

    Blog::factory()->create([
        'team_id' => $teamB->id,
        'user_id' => $userB->id,
        'slug' => 'team-b-secret-post',
    ]);

    $tokenA = createScopedApiToken($userA, $teamA, ['blogs:read']);

    // Attempt to access team B's blog via slug with team A's token
    $response = $this->withToken($tokenA)->getJson('/api/v1/blogs/team-b-secret-post');

    $response->assertNotFound();
});
