<?php

use App\Models\Blog;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('public blogs index displays published blogs', function () {
    $category = Category::factory()->create(['name' => 'Engineering']);
    $tag = Tag::factory()->create(['name' => 'Laravel']);

    $publishedBlog = Blog::factory()->published()->create([
        'title' => 'Published Article',
        'category_id' => $category->id,
    ]);
    $publishedBlog->tags()->attach($tag);

    $draftBlog = Blog::factory()->draft()->create([
        'title' => 'Draft Article',
    ]);

    $response = $this->get(route('blogs.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('blogs/index')
        ->has('blogs.data', 1)
        ->where('blogs.data.0.title', 'Published Article')
        ->has('categories')
        ->has('tags')
    );
});

test('public blogs index can filter by category', function () {
    $catEngineering = Category::factory()->create(['name' => 'Engineering', 'slug' => 'engineering']);
    $catDesign = Category::factory()->create(['name' => 'Design', 'slug' => 'design']);

    Blog::factory()->published()->create([
        'title' => 'Engineering Post',
        'category_id' => $catEngineering->id,
    ]);

    Blog::factory()->published()->create([
        'title' => 'Design Post',
        'category_id' => $catDesign->id,
    ]);

    $response = $this->get(route('blogs.index', ['category' => 'engineering']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('blogs/index')
        ->has('blogs.data', 1)
        ->where('blogs.data.0.title', 'Engineering Post')
    );
});

test('public blogs index can filter by tag', function () {
    $tagLaravel = Tag::factory()->create(['name' => 'Laravel', 'slug' => 'laravel']);
    $tagReact = Tag::factory()->create(['name' => 'React', 'slug' => 'react']);

    $blogLaravel = Blog::factory()->published()->create(['title' => 'Laravel Post']);
    $blogLaravel->tags()->attach($tagLaravel);

    $blogReact = Blog::factory()->published()->create(['title' => 'React Post']);
    $blogReact->tags()->attach($tagReact);

    $response = $this->get(route('blogs.index', ['tag' => 'laravel']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('blogs/index')
        ->has('blogs.data', 1)
        ->where('blogs.data.0.title', 'Laravel Post')
    );
});

test('public blog show displays single published post', function () {
    $category = Category::factory()->create();
    $blog = Blog::factory()->published()->create([
        'title' => 'My Detailed Post',
        'slug' => 'my-detailed-post',
        'category_id' => $category->id,
    ]);

    $response = $this->get(route('blogs.show', $blog->slug));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('blogs/show')
        ->where('blog.title', 'My Detailed Post')
        ->has('related')
    );
});

test('public blog show returns 404 for draft blog', function () {
    $blog = Blog::factory()->draft()->create([
        'slug' => 'unpublished-draft-post',
    ]);

    $response = $this->get(route('blogs.show', $blog->slug));

    $response->assertNotFound();
});

test('team member can view team blog listing', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $blogInTeam = Blog::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'title' => 'Team Post',
    ]);

    $otherTeam = Team::factory()->create();
    $blogOtherTeam = Blog::factory()->create([
        'team_id' => $otherTeam->id,
        'title' => 'Other Team Post',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('manage.blogs.index', ['current_team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('manage/blogs/index')
        ->has('blogs.data', 1)
        ->where('blogs.data.0.title', 'Team Post')
    );
});

test('team member with create permission can view blog create page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->get(route('manage.blogs.create', ['current_team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('manage/blogs/create')
        ->has('categories')
        ->has('tags')
    );
});

test('team member can create a blog post with tags and image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = Category::factory()->create();
    $tag = Tag::factory()->create();

    $image = UploadedFile::fake()->image('cover.jpg', 600, 400);

    $response = $this
        ->actingAs($user)
        ->post(route('manage.blogs.store', ['current_team' => $team->slug]), [
            'title' => 'Newly Created Post',
            'excerpt' => 'This is a brief summary.',
            'content' => '<p>Full rich content goes here.</p>',
            'is_published' => true,
            'category_id' => $category->id,
            'tag_ids' => [$tag->id],
            'cover_image' => $image,
        ]);

    $response->assertRedirect(route('manage.blogs.index'));

    $this->assertDatabaseHas('blogs', [
        'title' => 'Newly Created Post',
        'slug' => 'newly-created-post',
        'team_id' => $team->id,
        'user_id' => $user->id,
        'category_id' => $category->id,
        'is_published' => true,
    ]);

    $blog = Blog::where('slug', 'newly-created-post')->first();
    expect($blog->tags->pluck('id')->all())->toContain($tag->id);
    expect($blog->cover_image)->not->toBeNull();
    Storage::disk('public')->assertExists($blog->cover_image);
});

test('blog creation generates unique slug on collision', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    Blog::factory()->create([
        'title' => 'Duplicate Title',
        'slug' => 'duplicate-title',
        'team_id' => $team->id,
        'user_id' => $user->id,
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('manage.blogs.store', ['current_team' => $team->slug]), [
            'title' => 'Duplicate Title',
            'content' => 'Another article with duplicate title.',
            'is_published' => false,
        ]);

    $response->assertRedirect(route('manage.blogs.index'));

    $this->assertDatabaseHas('blogs', [
        'slug' => 'duplicate-title-1',
    ]);
});

test('team member can edit and update an existing blog post', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $blog = Blog::factory()->create([
        'title' => 'Original Title',
        'slug' => 'original-title',
        'team_id' => $team->id,
        'user_id' => $user->id,
        'is_published' => false,
        'published_at' => null,
    ]);

    $newCategory = Category::factory()->create();

    $response = $this
        ->actingAs($user)
        ->put(route('manage.blogs.update', ['current_team' => $team->slug, 'blog' => $blog->slug]), [
            'title' => 'Updated Title',
            'excerpt' => 'Updated excerpt',
            'content' => '<p>Updated content body</p>',
            'category_id' => $newCategory->id,
            'is_published' => true,
        ]);

    $response->assertRedirect(route('manage.blogs.index', ['current_team' => $team->slug]));

    $blog->refresh();
    expect($blog->title)->toBe('Updated Title');
    expect($blog->slug)->toBe('updated-title');
    expect($blog->category_id)->toBe($newCategory->id);
    expect($blog->is_published)->toBeTrue();
    expect($blog->published_at)->not->toBeNull();
});

test('team member can delete a blog post', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $path = UploadedFile::fake()->image('cover.png')->store('blogs', 'public');

    $blog = Blog::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'cover_image' => $path,
    ]);

    $tag = Tag::factory()->create();
    $blog->tags()->attach($tag);

    $response = $this
        ->actingAs($user)
        ->delete(route('manage.blogs.destroy', ['current_team' => $team->slug, 'blog' => $blog->slug]));

    $response->assertRedirect();

    $this->assertDatabaseMissing('blogs', [
        'id' => $blog->id,
    ]);

    $this->assertDatabaseMissing('blog_tag', [
        'blog_id' => $blog->id,
    ]);

    Storage::disk('public')->assertMissing($path);
});

test('user cannot manage blogs of a team they do not belong to', function () {
    $owner = User::factory()->create();
    $teamA = $owner->currentTeam;

    $intruder = User::factory()->create();
    $teamB = $intruder->currentTeam;

    $blog = Blog::factory()->create([
        'team_id' => $teamA->id,
        'user_id' => $owner->id,
    ]);

    // Attempting to visit teamA's blog manage route with intruder returns 403 (EnsureTeamMembership)
    $response = $this
        ->actingAs($intruder)
        ->get("/{$teamA->slug}/manage/blogs");

    $response->assertForbidden();

    // Attempting to delete teamA's blog
    $deleteResponse = $this
        ->actingAs($intruder)
        ->delete("/{$teamA->slug}/manage/blogs/{$blog->slug}");

    $deleteResponse->assertForbidden();
});
