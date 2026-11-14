<?php

use App\FrameX\Modules\ContentStudio\Events\ContentRevisionCreated;
use App\FrameX\Modules\ContentStudio\Events\ContentRevisionRestored;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentRevision;
use App\FrameX\Modules\ContentStudio\Services\RevisionService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

test('createSnapshot persists immutable revision and updates current_revision_id', function () {
    Event::fake([ContentRevisionCreated::class]);

    $author = User::factory()->create(['name' => 'Alice']);
    $content = Content::factory()->create(['author_id' => $author->id, 'title' => 'Original Title']);

    $service = new RevisionService;
    $revision = $service->createSnapshot(
        content: $content,
        data: [
            'title' => 'Updated Title',
            'excerpt' => 'Updated excerpt',
            'body_html' => '<p>Version 1 content</p>',
            'body_json' => ['type' => 'doc', 'content' => []],
        ],
        author: $author,
        summary: 'First publication draft'
    );

    expect($revision)->not->toBeNull()
        ->and($revision->title)->toBe('Updated Title')
        ->and($revision->excerpt)->toBe('Updated excerpt')
        ->and($revision->body_html)->toBe('<p>Version 1 content</p>')
        ->and($revision->change_summary)->toBe('First publication draft')
        ->and($content->fresh()->current_revision_id)->toBe($revision->id)
        ->and($content->fresh()->title)->toBe('Updated Title');

    Event::assertDispatched(ContentRevisionCreated::class, function ($event) use ($content, $revision) {
        return $event->content->id === $content->id && $event->revision->id === $revision->id;
    });
});

test('restoreRevision creates a linear restore snapshot and switches active revision', function () {
    Event::fake([ContentRevisionCreated::class, ContentRevisionRestored::class]);

    $author = User::factory()->create(['name' => 'Bob']);
    $restorer = User::factory()->create(['name' => 'Editor Charlie']);
    $content = Content::factory()->create(['author_id' => $author->id]);

    $service = new RevisionService;

    // Revision 1
    $rev1 = $service->createSnapshot($content, [
        'title' => 'Clean Stable Version',
        'body_html' => '<p>Great content</p>',
    ], $author, 'Initial clean version');

    // Revision 2
    $rev2 = $service->createSnapshot($content, [
        'title' => 'Broken Experimental Version',
        'body_html' => '<p>Corrupted format</p>',
    ], $author, 'Experimental test');

    expect($content->fresh()->title)->toBe('Broken Experimental Version')
        ->and($content->fresh()->current_revision_id)->toBe($rev2->id);

    // Restore Revision 1
    $restoredRev = $service->restoreRevision($content, $rev1, $restorer);

    expect($content->fresh()->current_revision_id)->toBe($restoredRev->id)
        ->and($content->fresh()->title)->toBe('Clean Stable Version')
        ->and($content->fresh()->body_html)->toBe('<p>Great content</p>')
        ->and($restoredRev->change_summary)->toContain('Restored from revision #'.$rev1->id);

    Event::assertDispatched(ContentRevisionRestored::class, function ($event) use ($content, $rev1, $restorer) {
        return $event->content->id === $content->id &&
               $event->revision->id === $rev1->id &&
               $event->restoredBy->id === $restorer->id;
    });
});

test('restoreRevision prevents restoring revision of a different content', function () {
    $contentA = Content::factory()->create();
    $contentB = Content::factory()->create();

    $revB = ContentRevision::factory()->create(['content_id' => $contentB->id]);

    $service = new RevisionService;

    expect(fn () => $service->restoreRevision($contentA, $revB))
        ->toThrow(InvalidArgumentException::class);
});

test('diffRevisions computes accurate comparison between two revisions', function () {
    $author = User::factory()->create(['name' => 'Dana']);
    $content = Content::factory()->create();

    $rev1 = ContentRevision::factory()->create([
        'content_id' => $content->id,
        'author_id' => $author->id,
        'title' => 'Version One',
        'excerpt' => 'Intro A',
        'body_html' => '<p>Old text</p>',
    ]);

    $rev2 = ContentRevision::factory()->create([
        'content_id' => $content->id,
        'author_id' => $author->id,
        'title' => 'Version Two',
        'excerpt' => 'Intro A',
        'body_html' => '<p>New improved text</p>',
    ]);

    $service = new RevisionService;
    $diff = $service->diffRevisions($rev1, $rev2);

    expect($diff['title']['changed'])->toBeTrue()
        ->and($diff['title']['from'])->toBe('Version One')
        ->and($diff['title']['to'])->toBe('Version Two')
        ->and($diff['excerpt']['changed'])->toBeFalse()
        ->and($diff['body_html']['changed'])->toBeTrue()
        ->and($diff['body_html']['from'])->toBe('<p>Old text</p>')
        ->and($diff['body_html']['to'])->toBe('<p>New improved text</p>');
});
