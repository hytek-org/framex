<?php

use App\Models\Blog;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\TeamFile;
use App\Models\User;
use App\Enums\TeamRole;

test('guests are redirected to the login page when trying to search', function () {
    $team = Team::factory()->create();

    $response = $this->get(route('search.api', ['current_team' => $team->slug]));
    $response->assertRedirect(route('login'));
});

test('non-team members are rejected when trying to search', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $nonMember = User::factory()->create();

    $response = $this->actingAs($nonMember)
        ->get(route('search.api', ['current_team' => $team->slug]));

    $response->assertForbidden();
});

test('authenticated team members receive fallback items on empty or short queries', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    // Create a blog, file, category, tag
    $blog = Blog::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'title' => 'Fallback Blog Post',
        'slug' => 'fallback-blog-post',
        'excerpt' => 'An excerpt',
        'content' => 'Blog content',
        'is_published' => true,
    ]);

    $file = TeamFile::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'disk' => 'local',
        'path' => 'docs/fallback.pdf',
        'name' => 'fallback.pdf',
        'mime_type' => 'application/pdf',
        'size' => 1024,
    ]);

    $category = Category::create([
        'name' => 'Tech category',
        'description' => 'Description here',
        'color' => '#123456',
    ]);

    $tag = Tag::create([
        'name' => 'Vue',
    ]);

    $response = $this->actingAs($user)
        ->get(route('search.api', ['current_team' => $team->slug, 'q' => '']));

    $response->assertOk();
    $data = $response->json();

    expect($data)->toHaveKeys(['blogs', 'files', 'categories', 'tags', 'members']);
    expect($data['blogs'])->toHaveCount(1);
    expect($data['blogs'][0]['title'])->toBe('Fallback Blog Post');
    expect($data['files'])->toHaveCount(1);
    expect($data['files'][0]['name'])->toBe('fallback.pdf');
    expect($data['categories'])->toHaveCount(1);
    expect($data['categories'][0]['name'])->toBe('Tech category');
    expect($data['tags'])->toHaveCount(1);
    expect($data['tags'][0]['name'])->toBe('Vue');
});

test('authenticated team members can search and receive matching scoped items', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    // Team 2 to test scoping
    $otherTeam = Team::factory()->create();

    // Blog in current team
    Blog::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'title' => 'Matching Laravel Post',
        'slug' => 'matching-laravel-post',
        'is_published' => true,
    ]);

    // Blog in other team (should not be returned)
    Blog::create([
        'team_id' => $otherTeam->id,
        'user_id' => $user->id,
        'title' => 'Other Laravel Post',
        'slug' => 'other-laravel-post',
        'is_published' => true,
    ]);

    // File in current team
    TeamFile::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'disk' => 'local',
        'path' => 'laravel-cheatsheet.pdf',
        'name' => 'laravel-cheatsheet.pdf',
        'mime_type' => 'application/pdf',
        'size' => 2048,
    ]);

    // Global Category matching
    Category::create([
        'name' => 'Laravel framework',
        'color' => '#ffffff',
    ]);

    // Global Tag matching
    Tag::create([
        'name' => 'laravel-tag',
    ]);

    $response = $this->actingAs($user)
        ->get(route('search.api', ['current_team' => $team->slug, 'q' => 'laravel']));

    $response->assertOk();
    $data = $response->json();

    // Verify correct items are returned and other team items are excluded
    expect($data['blogs'])->toHaveCount(1);
    expect($data['blogs'][0]['title'])->toBe('Matching Laravel Post');

    expect($data['files'])->toHaveCount(1);
    expect($data['files'][0]['name'])->toBe('laravel-cheatsheet.pdf');

    expect($data['categories'])->toHaveCount(1);
    expect($data['categories'][0]['name'])->toBe('Laravel framework');

    expect($data['tags'])->toHaveCount(1);
    expect($data['tags'][0]['name'])->toBe('laravel-tag');
});
