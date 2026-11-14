<?php

namespace App\FrameX\Modules\ContentStudio\Services;

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Events\ContentPublished;
use App\FrameX\Modules\ContentStudio\Events\ContentStatusChanged;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PublishingWorkflowService
{
    /**
     * Map of valid state transitions.
     *
     * @var array<string, array<string>>
     */
    protected array $allowedTransitions = [
        'draft' => ['in_review', 'scheduled', 'published', 'archived'],
        'in_review' => ['draft', 'approved', 'published', 'scheduled'],
        'approved' => ['published', 'scheduled', 'draft'],
        'scheduled' => ['published', 'draft', 'archived'],
        'published' => ['draft', 'archived'],
        'archived' => ['draft'],
    ];

    /**
     * Check if a content entity can transition to the given status.
     */
    public function canTransitionTo(Content $content, ContentStatus $targetStatus): bool
    {
        $currentStatus = $content->status instanceof ContentStatus
            ? $content->status->value
            : (string) $content->status;

        $targetValue = $targetStatus->value;

        if ($currentStatus === $targetValue) {
            return true;
        }

        return in_array($targetValue, $this->allowedTransitions[$currentStatus] ?? [], true);
    }

    /**
     * Transition a content item to a new status.
     */
    public function transitionTo(Content $content, ContentStatus $targetStatus, ?User $actor = null): void
    {
        if (! $this->canTransitionTo($content, $targetStatus)) {
            $from = $content->status instanceof ContentStatus ? $content->status->value : (string) $content->status;
            throw new InvalidArgumentException("Illegal workflow transition from '{$from}' to '{$targetStatus->value}'.");
        }

        $fromStatus = $content->status instanceof ContentStatus ? $content->status : ContentStatus::from($content->status);

        DB::transaction(function () use ($content, $fromStatus, $targetStatus, $actor) {
            $content->update(['status' => $targetStatus]);

            event(new ContentStatusChanged($content, $fromStatus, $targetStatus, $actor));

            if ($targetStatus === ContentStatus::Published) {
                event(new ContentPublished($content, $actor));
            }
        });
    }

    /**
     * Submit content for editorial review.
     */
    public function submitForReview(Content $content, User $author): void
    {
        $this->transitionTo($content, ContentStatus::InReview, $author);
    }

    /**
     * Approve content for publication.
     */
    public function approve(Content $content, User $reviewer): void
    {
        DB::transaction(function () use ($content, $reviewer) {
            $content->update(['reviewer_id' => $reviewer->id]);
            $this->transitionTo($content, ContentStatus::Approved, $reviewer);
        });
    }

    /**
     * Reject content back to draft.
     */
    public function reject(Content $content, User $reviewer, ?string $reason = null): void
    {
        DB::transaction(function () use ($content, $reviewer) {
            $content->update(['reviewer_id' => $reviewer->id]);
            $this->transitionTo($content, ContentStatus::Draft, $reviewer);
        });
    }

    /**
     * Publish content immediately.
     */
    public function publish(Content $content, ?User $publisher = null): void
    {
        DB::transaction(function () use ($content, $publisher) {
            $content->update([
                'published_at' => $content->published_at ?? now(),
                'scheduled_for' => null,
            ]);

            $this->transitionTo($content, ContentStatus::Published, $publisher);
        });
    }

    /**
     * Schedule content for future release.
     */
    public function schedule(Content $content, DateTimeInterface $publishAt, ?User $scheduler = null): void
    {
        DB::transaction(function () use ($content, $publishAt, $scheduler) {
            $content->update([
                'scheduled_for' => $publishAt,
                'published_at' => null,
            ]);

            $this->transitionTo($content, ContentStatus::Scheduled, $scheduler);
        });
    }

    /**
     * Unpublish content and return to draft.
     */
    public function unpublish(Content $content, ?User $unpublisher = null): void
    {
        DB::transaction(function () use ($content, $unpublisher) {
            $this->transitionTo($content, ContentStatus::Draft, $unpublisher);
        });
    }

    /**
     * Archive content.
     */
    public function archive(Content $content, ?User $archiver = null): void
    {
        $this->transitionTo($content, ContentStatus::Archived, $archiver);
    }

    /**
     * Publish all scheduled items whose release time has passed.
     */
    public function publishScheduled(): int
    {
        $items = Content::where('status', ContentStatus::Scheduled->value)
            ->whereNotNull('scheduled_for')
            ->where('scheduled_for', '<=', now())
            ->get();

        $count = 0;

        foreach ($items as $item) {
            DB::transaction(function () use ($item) {
                $item->update([
                    'status' => ContentStatus::Published,
                    'published_at' => $item->scheduled_for ?? now(),
                    'scheduled_for' => null,
                ]);

                event(new ContentStatusChanged($item, ContentStatus::Scheduled, ContentStatus::Published));
                event(new ContentPublished($item));
            });

            $count++;
        }

        return $count;
    }
}
