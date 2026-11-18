<?php

use App\Models\Blog;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('public categories index displays all categories with blog counts', function () {
    $category = Category::factory()->create(['name' => 'Technology']);

    Blog::factory()->published()->create([
        'category_id' => $category->id,
    ]);

    Blog::factory()->draft()->create([
        'category_id' => $category->id,
    ]);

    $response = $this->get(route('categories.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('categories/index')
        ->has('categories', 1)
        ->where('categories.0.name', 'Technology')
        ->where('categories.0.blogs_count', 1)
    );
});

test('public category show displays category with its published blogs', function () {
    $category = Category::factory()->create(['name' => 'Design', 'slug' => 'design']);

    $publishedBlog = Blog::factory()->published()->create([
        'title' => 'Design Systems',
        'category_id' => $category->id,
    ]);

    Blog::factory()->draft()->create([
        'title' => 'Draft Design',
        'category_id' => $category->id,
    ]);

    $response = $this->get(route('categories.show', 'design'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('categories/show')
        ->where('category.slug', 'design')
        ->has('blogs.data', 1)
        ->where('blogs.data.0.title', 'Design Systems')
    );
});

test('public tags index displays all tags with blog counts', function () {
    $tag = Tag::factory()->create(['name' => 'PHP']);

    $blog = Blog::factory()->published()->create();
    $blog->tags()->attach($tag);

    $response = $this->get(route('tags.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('tags/index')
        ->has('tags', 1)
        ->where('tags.0.name', 'PHP')
        ->where('tags.0.blogs_count', 1)
    );
});

test('team member can manage categories (create, update, delete)', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    // 1. List
    $response = $this
        ->actingAs($user)
        ->get(route('manage.categories.index', ['current_team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->component('manage/categories/index'));

    // 2. Create
    $createResponse = $this
        ->actingAs($user)
        ->post(route('manage.categories.store', ['current_team' => $team->slug]), [
            'name' => 'Backend Development',
            'description' => 'Server-side tutorials',
            'color' => '#10b981',
        ]);

    $createResponse->assertRedirect();
    $this->assertDatabaseHas('categories', [
        'name' => 'Backend Development',
        'slug' => 'backend-development',
        'color' => '#10b981',
    ]);

    $category = Category::where('slug', 'backend-development')->first();

    // 3. Update
    $updateResponse = $this
        ->actingAs($user)
        ->put(route('manage.categories.update', ['current_team' => $team->slug, 'category' => $category->slug]), [
            'name' => 'Advanced Backend',
            'description' => 'Updated description',
            'color' => '#6366f1',
        ]);

    $updateResponse->assertRedirect();
    $category->refresh();
    expect($category->name)->toBe('Advanced Backend');
    expect($category->color)->toBe('#6366f1');

    // 4. Delete
    $deleteResponse = $this
        ->actingAs($user)
        ->delete(route('manage.categories.destroy', ['current_team' => $team->slug, 'category' => $category->slug]));

    $deleteResponse->assertRedirect();
    $this->assertDatabaseMissing('categories', [
        'id' => $category->id,
    ]);
});

test('team member can manage tags (create, update, delete)', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    // 1. List
    $response = $this
        ->actingAs($user)
        ->get(route('manage.tags.index', ['current_team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->component('manage/tags/index'));

    // 2. Create
    $createResponse = $this
        ->actingAs($user)
        ->post(route('manage.tags.store', ['current_team' => $team->slug]), [
            'name' => 'TypeScript',
        ]);

    $createResponse->assertRedirect();
    $this->assertDatabaseHas('tags', [
        'name' => 'TypeScript',
        'slug' => 'typescript',
    ]);

    $tag = Tag::where('slug', 'typescript')->first();

    // 3. Update
    $updateResponse = $this
        ->actingAs($user)
        ->put(route('manage.tags.update', ['current_team' => $team->slug, 'tag' => $tag->slug]), [
            'name' => 'TypeScript 5',
        ]);

    $updateResponse->assertRedirect();
    $tag->refresh();
    expect($tag->name)->toBe('TypeScript 5');

    // 4. Delete
    $deleteResponse = $this
        ->actingAs($user)
        ->delete(route('manage.tags.destroy', ['current_team' => $team->slug, 'tag' => $tag->slug]));

    $deleteResponse->assertRedirect();
    $this->assertDatabaseMissing('tags', [
        'id' => $tag->id,
    ]);
});
