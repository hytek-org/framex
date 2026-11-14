<?php

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('creating a blog synchronizes content entity and creates initial revision', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $category = Category::factory()->create();

    $blog = Blog::create([
        'user_id' => $user->id,
        'team_id' => $team->id,
        'category_id' => $category->id,
        'title' => 'The Future of Laravel Architectures',
        'slug' => 'the-future-of-laravel-architectures',
        'excerpt' => 'An introduction to FrameX modular architecture.',
        'content' => '<p>Deep architectural overview</p>',
        'is_published' => true,
        'published_at' => now(),
    ]);

    $content = Content::where('slug', 'the-future-of-laravel-architectures')->first();

    expect($content)->not->toBeNull()
        ->and($content->title)->toBe('The Future of Laravel Architectures')
        ->and($content->status)->toBe(ContentStatus::Published)
        ->and($content->currentRevision)->not->toBeNull()
        ->and($content->currentRevision->body_html)->toBe('<p>Deep architectural overview</p>')
        ->and($content->category_id)->toBe($category->id);
});

test('updating a blog creates new content revision', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);

    $blog = Blog::create([
        'user_id' => $user->id,
        'team_id' => $team->id,
        'title' => 'Initial Title',
        'slug' => 'initial-title',
        'content' => '<p>Version 1</p>',
        'is_published' => false,
    ]);

    $blog->update([
        'title' => 'Updated Title',
        'content' => '<p>Version 2 with updates</p>',
        'is_published' => true,
    ]);

    $content = Content::where('slug', 'initial-title')->first();

    expect($content->title)->toBe('Updated Title')
        ->and($content->status)->toBe(ContentStatus::Published)
        ->and($content->currentRevision->body_html)->toBe('<p>Version 2 with updates</p>')
        ->and($content->revisions)->toHaveCount(2);
});

test('deleting a blog deletes corresponding content item', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $blog = Blog::create([
        'user_id' => $user->id,
        'team_id' => $team->id,
        'title' => 'To Be Deleted',
        'slug' => 'to-be-deleted',
        'content' => '<p>Temporary</p>',
    ]);

    expect(Content::where('slug', 'to-be-deleted')->exists())->toBeTrue();

    $blog->delete();

    expect(Content::where('slug', 'to-be-deleted')->exists())->toBeFalse()
        ->and(Content::withTrashed()->where('slug', 'to-be-deleted')->exists())->toBeTrue();
});
