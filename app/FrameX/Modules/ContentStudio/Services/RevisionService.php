<?php

namespace App\FrameX\Modules\ContentStudio\Services;

use App\FrameX\Modules\ContentStudio\Events\ContentRevisionCreated;
use App\FrameX\Modules\ContentStudio\Events\ContentRevisionRestored;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentRevision;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RevisionService
{
    /**
     * Create an immutable snapshot revision for a content record.
     *
     * @param  array<string, mixed>  $data
     */
    public function createSnapshot(
        Content $content,
        array $data,
        ?User $author = null,
        ?string $summary = null
    ): ContentRevision {
        return DB::transaction(function () use ($content, $data, $author, $summary) {
            $authorId = $author?->id ?? $content->author_id;
            $title = $data['title'] ?? $content->title;
            $excerpt = array_key_exists('excerpt', $data) ? $data['excerpt'] : $content->excerpt;
            $bodyHtml = $data['body_html'] ?? $content->currentRevision?->body_html;
            $bodyJson = $data['body_json'] ?? $content->currentRevision?->body_json;
            $changeSummary = $summary ?? ($data['change_summary'] ?? 'Updated content');

            $revision = ContentRevision::create([
                'content_id' => $content->id,
                'author_id' => $authorId,
                'title' => $title,
                'excerpt' => $excerpt,
                'body_html' => $bodyHtml,
                'body_json' => $bodyJson,
                'change_summary' => $changeSummary,
                'created_at' => now(),
            ]);

            $contentUpdateData = [
                'current_revision_id' => $revision->id,
            ];

            if (isset($data['title'])) {
                $contentUpdateData['title'] = $data['title'];
            }

            if (array_key_exists('excerpt', $data)) {
                $contentUpdateData['excerpt'] = $data['excerpt'];
            }

            $content->update($contentUpdateData);

            event(new ContentRevisionCreated($content, $revision));

            return $revision;
        });
    }

    /**
     * Restore a historical revision as a new active snapshot.
     */
    public function restoreRevision(
        Content $content,
        ContentRevision $revision,
        ?User $restorer = null
    ): ContentRevision {
        if ($revision->content_id !== $content->id) {
            throw new InvalidArgumentException("Revision {$revision->id} does not belong to Content {$content->id}.");
        }

        return DB::transaction(function () use ($content, $revision, $restorer) {
            $restorerName = $restorer?->name ?? 'system';
            $summary = "Restored from revision #{$revision->id} by {$restorerName}";

            $restoredSnapshot = $this->createSnapshot(
                content: $content,
                data: [
                    'title' => $revision->title,
                    'excerpt' => $revision->excerpt,
                    'body_html' => $revision->body_html,
                    'body_json' => $revision->body_json,
                    'change_summary' => $summary,
                ],
                author: $restorer,
                summary: $summary
            );

            event(new ContentRevisionRestored($content, $revision, $restorer));

            return $restoredSnapshot;
        });
    }

    /**
     * Calculate structural difference between two revisions.
     *
     * @return array<string, mixed>
     */
    public function diffRevisions(ContentRevision $from, ContentRevision $to): array
    {
        return [
            'from_id' => $from->id,
            'to_id' => $to->id,
            'title' => [
                'from' => $from->title,
                'to' => $to->title,
                'changed' => $from->title !== $to->title,
            ],
            'excerpt' => [
                'from' => $from->excerpt,
                'to' => $to->excerpt,
                'changed' => $from->excerpt !== $to->excerpt,
            ],
            'body_html' => [
                'from' => $from->body_html,
                'to' => $to->body_html,
                'changed' => $from->body_html !== $to->body_html,
            ],
            'created_at' => [
                'from' => $from->created_at?->toISOString(),
                'to' => $to->created_at?->toISOString(),
            ],
            'author' => [
                'from' => $from->author?->name,
                'to' => $to->author?->name,
            ],
        ];
    }
}
