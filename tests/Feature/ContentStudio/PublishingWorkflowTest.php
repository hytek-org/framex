<?php

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Events\ContentPublished;
use App\FrameX\Modules\ContentStudio\Events\ContentStatusChanged;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Services\PublishingWorkflowService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

test('full editorial lifecycle from draft to published', function () {
    Event::fake([ContentStatusChanged::class, ContentPublished::class]);

    $author = User::factory()->create();
    $reviewer = User::factory()->create();
    $content = Content::factory()->create(['author_id' => $author->id, 'status' => ContentStatus::Draft]);

    $service = new PublishingWorkflowService;

    // 1. Submit for review
    $service->submitForReview($content, $author);
    expect($content->fresh()->status)->toBe(ContentStatus::InReview);

    // 2. Approve
    $service->approve($content, $reviewer);
    expect($content->fresh()->status)->toBe(ContentStatus::Approved)
        ->and($content->fresh()->reviewer_id)->toBe($reviewer->id);

    // 3. Publish
    $service->publish($content, $reviewer);
    expect($content->fresh()->status)->toBe(ContentStatus::Published)
        ->and($content->fresh()->isPublished())->toBeTrue()
        ->and($content->fresh()->published_at)->not->toBeNull();

    Event::assertDispatched(ContentPublished::class);
    Event::assertDispatched(ContentStatusChanged::class, 3);
});

test('scheduling content and automated publisher command', function () {
    Event::fake([ContentPublished::class]);

    $contentDue = Content::factory()->create([
        'status' => ContentStatus::Scheduled,
        'scheduled_for' => now()->subMinute(),
    ]);

    $contentFuture = Content::factory()->create([
        'status' => ContentStatus::Scheduled,
        'scheduled_for' => now()->addHour(),
    ]);

    $this->artisan('content:publish-scheduled')
        ->expectsOutputToContain('Successfully published 1 scheduled content item(s).')
        ->assertSuccessful();

    expect($contentDue->fresh()->status)->toBe(ContentStatus::Published)
        ->and($contentDue->fresh()->published_at)->not->toBeNull()
        ->and($contentFuture->fresh()->status)->toBe(ContentStatus::Scheduled);
});

test('invalid state transition throws exception', function () {
    $content = Content::factory()->create(['status' => ContentStatus::Draft]);
    $service = new PublishingWorkflowService;

    // Direct transition from Draft to Approved is invalid without InReview
    expect(fn () => $service->transitionTo($content, ContentStatus::Approved))
        ->toThrow(InvalidArgumentException::class);
});

test('unpublishing moves content back to draft', function () {
    $content = Content::factory()->published()->create();
    $service = new PublishingWorkflowService;

    $service->unpublish($content);

    expect($content->fresh()->status)->toBe(ContentStatus::Draft);
});
