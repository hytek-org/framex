<?php

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function createStudioApiToken(User $user, Team $team, array $abilities = ['*']): string
{
    $plainText = 'framex_live_'.Str::random(40);
    $hashed = hash('sha256', $plainText);

    $user->tokens()->create([
        'name' => 'Studio Token',
        'team_id' => $team->id,
        'token' => $hashed,
        'abilities' => $abilities,
        'expires_at' => null,
    ]);

    return $plainText;
}

test('content studio api lists published items with filters', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();
    $pageType = ContentType::where('slug', 'page')->first() ?? ContentType::factory()->page()->create();

    $category = Category::factory()->create(['slug' => 'tech']);
    $tag = Tag::factory()->create(['slug' => 'laravel']);

    $post = Content::factory()->published()->withRevision('<p>Body 1</p>')->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'category_id' => $category->id,
        'title' => 'Building Extensible Systems',
        'slug' => 'building-extensible-systems',
    ]);
    $post->tags()->attach($tag->id);

    $page = Content::factory()->published()->withRevision('<p>Page Body</p>')->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $pageType->id,
        'title' => 'About FrameX Platform',
        'slug' => 'about-framex-platform',
    ]);

    $otherTeam = Team::factory()->create();
    $otherTeamContent = Content::factory()->published()->create([
        'team_id' => $otherTeam->id,
        'title' => 'Other Team Secret',
    ]);

    $token = createStudioApiToken($user, $team);

    // 1. List all for team
    $response = $this->withToken($token)->getJson('/api/v1/content');
    $response->assertStatus(200)
        ->assertJsonCount(2, 'data')
        ->assertJsonFragment(['slug' => 'building-extensible-systems'])
        ->assertJsonFragment(['slug' => 'about-framex-platform'])
        ->assertJsonMissing(['title' => 'Other Team Secret']);

    // 2. Filter by type=post
    $response = $this->withToken($token)->getJson('/api/v1/content?type=post');
    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['slug' => 'building-extensible-systems']);

    // 3. Filter by category
    $response = $this->withToken($token)->getJson('/api/v1/content?category=tech');
    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['slug' => 'building-extensible-systems']);

    // 4. Filter by tag
    $response = $this->withToken($token)->getJson('/api/v1/content?tag=laravel');
    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['slug' => 'building-extensible-systems']);
});

test('content studio api returns full detail with revisions and seo metadata', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $content = Content::factory()->published()->withRevision('<h2>In-depth Guide</h2>')->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'title' => 'Complete Laravel Guide',
        'slug' => 'complete-laravel-guide',
    ]);

    $token = createStudioApiToken($user, $team);

    $response = $this->withToken($token)->getJson('/api/v1/content/post/complete-laravel-guide');

    $response->assertStatus(200)
        ->assertJsonPath('data.title', 'Complete Laravel Guide')
        ->assertJsonPath('data.slug', 'complete-laravel-guide')
        ->assertJsonPath('data.body_html', '<h2>In-depth Guide</h2>')
        ->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'slug',
                'excerpt',
                'status',
                'body_html',
                'type',
                'seo' => [
                    'meta_title',
                    'meta_description',
                    'canonical_url',
                    'structured_data',
                ],
            ],
        ]);
});

test('content studio api returns taxonomy summaries', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    Category::factory()->create(['name' => 'Architecture']);
    Tag::factory()->create(['name' => 'PHP 8.5']);

    $token = createStudioApiToken($user, $team);

    $catResponse = $this->withToken($token)->getJson('/api/v1/taxonomies/categories');
    $catResponse->assertStatus(200)
        ->assertJsonFragment(['name' => 'Architecture']);

    $tagResponse = $this->withToken($token)->getJson('/api/v1/taxonomies/tags');
    $tagResponse->assertStatus(200)
        ->assertJsonFragment(['name' => 'PHP 8.5']);
});
