<?php

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentRevision;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('content types have default capabilities and slug generation', function () {
    $type = ContentType::create([
        'name' => 'Case Study',
        'description' => 'Customer stories and case studies',
        'icon' => 'briefcase',
    ]);

    expect($type->slug)->toBe('case-study')
        ->and($type->supports)->toContain('revisions', 'taxonomies', 'seo', 'media', 'workflow')
        ->and($type->supportsFeature('revisions'))->toBeTrue()
        ->and($type->supportsFeature('e-commerce'))->toBeFalse();
});

test('content can be created with relationships and revisions', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $type = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();
    $category = Category::factory()->create();
    $tags = Tag::factory()->count(2)->create();

    $content = Content::create([
        'content_type_id' => $type->id,
        'team_id' => $team->id,
        'author_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Building Modern Laravel Apps',
        'slug' => 'building-modern-laravel-apps',
        'excerpt' => 'A comprehensive guide to FrameX architecture.',
        'status' => ContentStatus::Draft,
    ]);

    $content->tags()->attach($tags->pluck('id'));

    $revision = ContentRevision::create([
        'content_id' => $content->id,
        'author_id' => $user->id,
        'title' => $content->title,
        'excerpt' => $content->excerpt,
        'body_html' => '<p>Welcome to FrameX</p>',
        'body_json' => ['type' => 'doc'],
        'change_summary' => 'Initial draft',
        'created_at' => now(),
    ]);

    $content->update(['current_revision_id' => $revision->id]);

    expect($content->fresh()->contentType->id)->toBe($type->id)
        ->and($content->fresh()->team->id)->toBe($team->id)
        ->and($content->fresh()->author->id)->toBe($user->id)
        ->and($content->fresh()->category->id)->toBe($category->id)
        ->and($content->fresh()->tags)->toHaveCount(2)
        ->and($content->fresh()->currentRevision->id)->toBe($revision->id)
        ->and($content->fresh()->body_html)->toBe('<p>Welcome to FrameX</p>')
        ->and($content->fresh()->body)->toBe('<p>Welcome to FrameX</p>');
});

test('published scope only returns published content with past published_at', function () {
    $team = Team::factory()->create();
    $type = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $draft = Content::factory()->create([
        'team_id' => $team->id,
        'content_type_id' => $type->id,
        'status' => ContentStatus::Draft,
    ]);

    $futurePublished = Content::factory()->create([
        'team_id' => $team->id,
        'content_type_id' => $type->id,
        'status' => ContentStatus::Published,
        'published_at' => now()->addDay(),
    ]);

    $livePublished = Content::factory()->create([
        'team_id' => $team->id,
        'content_type_id' => $type->id,
        'status' => ContentStatus::Published,
        'published_at' => now()->subHour(),
    ]);

    $results = Content::published()->get();

    expect($results->pluck('id'))
        ->toContain($livePublished->id)
        ->not->toContain($draft->id)
        ->not->toContain($futurePublished->id);

    expect($livePublished->isPublished())->toBeTrue()
        ->and($futurePublished->isPublished())->toBeFalse()
        ->and($draft->isPublished())->toBeFalse();
});

test('content supports soft deletes', function () {
    $content = Content::factory()->create();

    $content->delete();

    expect(Content::find($content->id))->toBeNull()
        ->and(Content::withTrashed()->find($content->id))->not->toBeNull();
});

test('content factory withRevision helper creates revision snapshot', function () {
    $content = Content::factory()->withRevision('<p>Test Content</p>')->create();

    expect($content->currentRevision)->not->toBeNull()
        ->and($content->body_html)->toBe('<p>Test Content</p>')
        ->and($content->revisions)->toHaveCount(1);
});
