<?php

namespace App\Observers;

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Services\RevisionService;
use App\Models\Blog;
use App\Models\Team;

class BlogObserver
{
    public function saved(Blog $blog): void
    {
        if (! $blog->team_id) {
            $blog->team_id = $blog->user?->current_team_id ?? Team::first()?->id;
        }

        if (! $blog->team_id) {
            return;
        }

        $postType = ContentType::firstOrCreate(
            ['slug' => 'post'],
            [
                'name' => 'Post',
                'description' => 'Articles and blog posts with authors, revisions, categories and tags.',
                'icon' => 'file-text',
                'supports' => ['revisions', 'taxonomies', 'seo', 'media', 'workflow'],
                'is_system' => true,
            ]
        );

        $status = $blog->is_published ? ContentStatus::Published : ContentStatus::Draft;

        $content = Content::firstOrNew([
            'content_type_id' => $postType->id,
            'team_id' => $blog->team_id,
            'slug' => $blog->slug,
        ]);

        $isNew = ! $content->exists;

        $content->fill([
            'author_id' => $blog->user_id,
            'category_id' => $blog->category_id,
            'title' => $blog->title,
            'excerpt' => $blog->excerpt,
            'status' => $status,
            'cover_image' => $blog->cover_image,
            'published_at' => $blog->published_at,
        ]);

        $content->save();

        // Create snapshot revision if new or content/title was updated
        if ($isNew || $content->currentRevision?->body_html !== $blog->content || $content->currentRevision?->title !== $blog->title) {
            $revisionService = app(RevisionService::class);
            $revisionService->createSnapshot(
                content: $content,
                data: [
                    'title' => $blog->title,
                    'excerpt' => $blog->excerpt,
                    'body_html' => $blog->content,
                    'body_json' => null,
                    'change_summary' => $isNew ? 'Initial blog creation' : 'Updated from blog',
                ],
                author: $blog->user
            );
        }

        // Sync tags if blog has tags relation loaded or available
        if ($blog->relationLoaded('tags')) {
            $content->tags()->sync($blog->tags->pluck('id'));
        }
    }

    public function deleted(Blog $blog): void
    {
        Content::where('slug', $blog->slug)
            ->where('team_id', $blog->team_id)
            ->delete();
    }

    public function restored(Blog $blog): void
    {
        Content::withTrashed()
            ->where('slug', $blog->slug)
            ->where('team_id', $blog->team_id)
            ->restore();
    }
}
