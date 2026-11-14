<?php

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Services\RevisionService;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can view content studio dashboard and filter by type', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();
    $pageType = ContentType::where('slug', 'page')->first() ?? ContentType::factory()->page()->create();

    Content::factory()->create([
        'team_id' => $team->id,
        'content_type_id' => $postType->id,
        'title' => 'Article One',
    ]);

    Content::factory()->create([
        'team_id' => $team->id,
        'content_type_id' => $pageType->id,
        'title' => 'Landing Page One',
    ]);

    $response = $this->actingAs($user)
        ->get("/{$team->slug}/content");

    $response->assertStatus(200);

    $filteredResponse = $this->actingAs($user)
        ->get("/{$team->slug}/content?type=post");

    $filteredResponse->assertStatus(200);
});

test('user can create new content with revisions and seo metadata', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();
    $category = Category::factory()->create();
    $tag = Tag::factory()->create();

    $response = $this->actingAs($user)
        ->post("/{$team->slug}/content", [
            'content_type_id' => $postType->id,
            'title' => 'How to Architect Scalable Systems',
            'excerpt' => 'An in-depth article on FrameX platform architecture.',
            'body_html' => '<p>Deep content architecture insights</p>',
            'body_json' => ['type' => 'doc'],
            'category_id' => $category->id,
            'tag_ids' => [$tag->id],
            'status' => 'draft',
            'meta_title' => 'How to Architect Scalable Systems | Best Practices',
            'meta_description' => 'Comprehensive architecture guide for modern Laravel systems.',
            'canonical_url' => 'https://example.com/scalable-architecture',
        ]);

    $response->assertRedirect("/{$team->slug}/content");

    $content = Content::where('title', 'How to Architect Scalable Systems')->first();

    expect($content)->not->toBeNull()
        ->and($content->currentRevision)->not->toBeNull()
        ->and($content->currentRevision->body_html)->toBe('<p>Deep content architecture insights</p>')
        ->and($content->seoMetadata)->not->toBeNull()
        ->and($content->seoMetadata->meta_title)->toBe('How to Architect Scalable Systems | Best Practices')
        ->and($content->tags)->toHaveCount(1);
});

test('user can update content and generate a new snapshot revision', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $content = Content::factory()->withRevision('<p>Version 1</p>')->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'title' => 'Initial Version',
    ]);

    $response = $this->actingAs($user)
        ->put("/{$team->slug}/content/{$content->slug}", [
            'title' => 'Updated Version 2',
            'body_html' => '<p>Version 2 with major revisions</p>',
            'change_summary' => 'Added new chapters',
        ]);

    $response->assertRedirect();

    $content->refresh();

    expect($content->title)->toBe('Updated Version 2')
        ->and($content->currentRevision->body_html)->toBe('<p>Version 2 with major revisions</p>')
        ->and($content->currentRevision->change_summary)->toBe('Added new chapters')
        ->and($content->revisions)->toHaveCount(2);
});

test('user can inspect revisions diff and restore historical version via time machine', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $content = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
    ]);

    $revisionService = app(RevisionService::class);
    $rev1 = $revisionService->createSnapshot($content, [
        'title' => 'First Version',
        'body_html' => '<p>Original clean content</p>',
    ], $user, 'Initial baseline');

    $rev2 = $revisionService->createSnapshot($content, [
        'title' => 'Second Version',
        'body_html' => '<p>Draft with errors</p>',
    ], $user, 'Messy draft');

    // 1. Get revisions list
    $listResponse = $this->actingAs($user)
        ->getJson("/{$team->slug}/content/{$content->slug}/revisions");

    $listResponse->assertStatus(200)
        ->assertJsonStructure(['revisions' => [['id', 'title', 'is_current']]]);

    // 2. Get structural diff between rev1 and current
    $diffResponse = $this->actingAs($user)
        ->getJson("/{$team->slug}/content/{$content->slug}/revisions/{$rev1->id}/diff");

    $diffResponse->assertStatus(200)
        ->assertJsonPath('diff.title.changed', true)
        ->assertJsonPath('diff.body_html.changed', true);

    // 3. Restore rev1
    $restoreResponse = $this->actingAs($user)
        ->post("/{$team->slug}/content/{$content->slug}/revisions/{$rev1->id}/restore");

    $restoreResponse->assertRedirect();

    $content->refresh();

    expect($content->title)->toBe('First Version')
        ->and($content->currentRevision->body_html)->toBe('<p>Original clean content</p>')
        ->and($content->revisions)->toHaveCount(3);
});

test('user can transition workflow stage from draft to in_review and published', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $content = Content::factory()->create([
        'team_id' => $team->id,
        'status' => ContentStatus::Draft,
    ]);

    // Transition to in_review
    $response = $this->actingAs($user)
        ->postJson("/{$team->slug}/content/{$content->slug}/transition", [
            'status' => 'in_review',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('status', 'in_review');

    expect($content->fresh()->status)->toBe(ContentStatus::InReview);

    // Transition to published
    $publishResponse = $this->actingAs($user)
        ->postJson("/{$team->slug}/content/{$content->slug}/transition", [
            'status' => 'published',
        ]);

    $publishResponse->assertStatus(200)
        ->assertJsonPath('status', 'published');

    expect($content->fresh()->status)->toBe(ContentStatus::Published);
});
