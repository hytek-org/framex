<?php

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('creating a blog does not duplicate an entry into content studio', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $category = Category::factory()->create();

    $blog = Blog::create([
        'user_id' => $user->id,
        'team_id' => $team->id,
        'category_id' => $category->id,
        'title' => 'Independent Blog Entry',
        'slug' => 'independent-blog-entry',
        'excerpt' => 'Should stay only in blogs table.',
        'content' => '<p>Blog body</p>',
        'is_published' => true,
        'published_at' => now(),
    ]);

    expect($blog->exists)->toBeTrue()
        ->and(Content::where('slug', 'independent-blog-entry')->exists())->toBeFalse();
});
