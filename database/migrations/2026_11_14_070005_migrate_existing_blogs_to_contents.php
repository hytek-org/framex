<?php

use App\FrameX\Modules\ContentStudio\Models\ContentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('blogs') || ! Schema::hasTable('contents')) {
            return;
        }

        if (DB::table('blogs')->count() === 0) {
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

        $fallbackTeamId = DB::table('teams')->value('id');

        $blogs = DB::table('blogs')->get();

        foreach ($blogs as $blog) {
            $teamId = $blog->team_id ?? $fallbackTeamId;

            if (! $teamId) {
                continue;
            }

            $existingContent = DB::table('contents')
                ->where('team_id', $teamId)
                ->where('content_type_id', $postType->id)
                ->where('slug', $blog->slug)
                ->first();

            $contentId = $existingContent?->id;

            if (! $existingContent) {
                $contentId = DB::table('contents')->insertGetId([
                    'content_type_id' => $postType->id,
                    'team_id' => $teamId,
                    'author_id' => $blog->user_id,
                    'category_id' => $blog->category_id,
                    'title' => $blog->title,
                    'slug' => $blog->slug,
                    'excerpt' => $blog->excerpt,
                    'status' => $blog->is_published ? 'published' : 'draft',
                    'cover_image' => $blog->cover_image,
                    'published_at' => $blog->published_at,
                    'created_at' => $blog->created_at,
                    'updated_at' => $blog->updated_at,
                ]);
            }

            // Create initial revision if missing
            $existingRevision = DB::table('content_revisions')
                ->where('content_id', $contentId)
                ->first();

            if (! $existingRevision) {
                $revisionId = DB::table('content_revisions')->insertGetId([
                    'content_id' => $contentId,
                    'author_id' => $blog->user_id,
                    'title' => $blog->title,
                    'excerpt' => $blog->excerpt,
                    'body_html' => $blog->content,
                    'body_json' => null,
                    'change_summary' => 'Migrated from legacy blog record',
                    'created_at' => $blog->created_at ?? now(),
                ]);

                DB::table('contents')->where('id', $contentId)->update([
                    'current_revision_id' => $revisionId,
                ]);
            }

            // Copy tags if blog_tag exists
            if (Schema::hasTable('blog_tag') && Schema::hasTable('content_tag')) {
                $tagIds = DB::table('blog_tag')->where('blog_id', $blog->id)->pluck('tag_id');
                foreach ($tagIds as $tagId) {
                    $exists = DB::table('content_tag')
                        ->where('content_id', $contentId)
                        ->where('tag_id', $tagId)
                        ->exists();

                    if (! $exists) {
                        DB::table('content_tag')->insert([
                            'content_id' => $contentId,
                            'tag_id' => $tagId,
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe no-op to prevent destructive data loss of contents
    }
};
