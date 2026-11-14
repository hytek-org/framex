<?php

namespace App\FrameX\Modules\ContentStudio\Controllers;

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentRevision;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Models\SeoMetadata;
use App\FrameX\Modules\ContentStudio\Services\PublishingWorkflowService;
use App\FrameX\Modules\ContentStudio\Services\RevisionService;
use App\FrameX\Modules\ContentStudio\Services\SeoService;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContentStudioController extends Controller
{
    public function __construct(
        protected RevisionService $revisionService,
        protected PublishingWorkflowService $workflowService,
        protected SeoService $seoService
    ) {}

    protected function getTeam(Request $request): Team
    {
        $slug = $request->route('current_team');
        if ($slug) {
            $team = Team::where('slug', $slug)->first();
            if ($team) {
                return $team;
            }
        }

        return Auth::user()->currentTeam;
    }

    /**
     * Display content list.
     */
    public function index(Request $request): Response
    {
        $team = $this->getTeam($request);

        $query = Content::where('team_id', $team->id)
            ->with(['contentType', 'category', 'tags', 'author'])
            ->latest();

        if ($request->filled('type')) {
            $query->ofType($request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $contents = $query->paginate(15)->withQueryString();
        $contentTypes = ContentType::orderBy('name')->get();

        return Inertia::render('manage/content/index', [
            'contents' => $contents,
            'contentTypes' => $contentTypes,
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    /**
     * Show creation screen.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('manage/content/create', [
            'contentTypes' => ContentType::orderBy('name')->get(),
            'categories' => Category::orderBy('name')->get(),
            'tags' => Tag::orderBy('name')->get(),
            'defaultType' => $request->input('type', 'post'),
        ]);
    }

    /**
     * Store newly created content entity.
     */
    public function store(Request $request): RedirectResponse
    {
        $team = $this->getTeam($request);
        $user = Auth::user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'content_type_id' => 'required|exists:content_types,id',
            'excerpt' => 'nullable|string',
            'body_html' => 'nullable|string',
            'body_json' => 'nullable|array',
            'category_id' => 'nullable|exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'cover_image' => 'nullable|string|max:2048',
            'status' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'canonical_url' => 'nullable|string|max:2048',
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']).'-'.Str::lower(Str::random(6));

        $status = ! empty($validated['status'])
            ? ContentStatus::tryFrom($validated['status']) ?? ContentStatus::Draft
            : ContentStatus::Draft;

        $content = Content::create([
            'content_type_id' => $validated['content_type_id'],
            'team_id' => $team->id,
            'author_id' => $user->id,
            'category_id' => $validated['category_id'] ?? null,
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'status' => $status,
            'cover_image' => $validated['cover_image'] ?? null,
            'published_at' => $status === ContentStatus::Published ? now() : null,
        ]);

        // Create initial snapshot revision
        $this->revisionService->createSnapshot(
            content: $content,
            data: [
                'title' => $content->title,
                'excerpt' => $content->excerpt,
                'body_html' => $validated['body_html'] ?? null,
                'body_json' => $validated['body_json'] ?? null,
                'change_summary' => 'Initial content creation',
            ],
            author: $user
        );

        // Sync tags
        if (! empty($validated['tag_ids'])) {
            $content->tags()->sync($validated['tag_ids']);
        }

        // Save SEO Metadata if provided
        if (! empty($validated['meta_title']) || ! empty($validated['meta_description']) || ! empty($validated['canonical_url'])) {
            SeoMetadata::create([
                'team_id' => $team->id,
                'seoble_type' => Content::class,
                'seoble_id' => $content->id,
                'meta_title' => $validated['meta_title'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
                'canonical_url' => $validated['canonical_url'] ?? null,
            ]);
        }

        return redirect()->route('content.index', ['current_team' => $team->slug])
            ->with('success', 'Content item created successfully.');
    }

    /**
     * Show edit screen with time-machine revisions and SEO settings.
     */
    public function edit(Request $request, string $current_team, Content $content): Response
    {
        $team = $this->getTeam($request);
        abort_unless($content->team_id === $team->id, 403);

        $content->load([
            'contentType',
            'category',
            'tags',
            'currentRevision',
            'seoMetadata',
            'revisions.author',
        ]);

        return Inertia::render('manage/content/edit', [
            'content' => $content,
            'contentTypes' => ContentType::orderBy('name')->get(),
            'categories' => Category::orderBy('name')->get(),
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    /**
     * Update content and generate revision snapshot.
     */
    public function update(Request $request, string $current_team, Content $content): RedirectResponse
    {
        $team = $this->getTeam($request);
        $user = Auth::user();
        abort_unless($content->team_id === $team->id, 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'body_html' => 'nullable|string',
            'body_json' => 'nullable|array',
            'category_id' => 'nullable|exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'cover_image' => 'nullable|string|max:2048',
            'change_summary' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'canonical_url' => 'nullable|string|max:2048',
        ]);

        $content->update([
            'title' => $validated['title'],
            'excerpt' => $validated['excerpt'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
        ]);

        if (! empty($validated['slug'])) {
            $content->update(['slug' => Str::slug($validated['slug'])]);
        }

        // Snapshot revision
        $this->revisionService->createSnapshot(
            content: $content,
            data: [
                'title' => $content->title,
                'excerpt' => $content->excerpt,
                'body_html' => $validated['body_html'] ?? null,
                'body_json' => $validated['body_json'] ?? null,
                'change_summary' => $validated['change_summary'] ?? 'Updated content',
            ],
            author: $user
        );

        if (isset($validated['tag_ids'])) {
            $content->tags()->sync($validated['tag_ids']);
        }

        // SEO update
        SeoMetadata::updateOrCreate(
            ['seoble_type' => Content::class, 'seoble_id' => $content->id],
            [
                'team_id' => $team->id,
                'meta_title' => $validated['meta_title'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
                'canonical_url' => $validated['canonical_url'] ?? null,
            ]
        );

        return back()->with('success', 'Content updated and revision saved.');
    }

    /**
     * Soft delete content entity.
     */
    public function destroy(Request $request, string $current_team, Content $content): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($content->team_id === $team->id, 403);

        $content->delete();

        return redirect()->route('content.index', ['current_team' => $team->slug])
            ->with('success', 'Content item deleted successfully.');
    }

    /**
     * Revisions list for Content Time Machine.
     */
    public function revisions(Request $request, string $current_team, Content $content): JsonResponse
    {
        $team = $this->getTeam($request);
        abort_unless($content->team_id === $team->id, 403);

        $revisions = $content->revisions()
            ->with('author:id,name,email')
            ->get()
            ->map(fn ($rev) => [
                'id' => $rev->id,
                'title' => $rev->title,
                'excerpt' => $rev->excerpt,
                'change_summary' => $rev->change_summary,
                'created_at' => $rev->created_at?->toIso8601String(),
                'is_current' => $rev->id === $content->current_revision_id,
                'author' => $rev->author ? ['id' => $rev->author->id, 'name' => $rev->author->name] : null,
            ]);

        return response()->json(['revisions' => $revisions]);
    }

    /**
     * Return structural diff between historical revision and current revision.
     */
    public function diff(Request $request, string $current_team, Content $content, ContentRevision $revision): JsonResponse
    {
        $team = $this->getTeam($request);
        abort_unless($content->team_id === $team->id, 403);
        abort_unless($revision->content_id === $content->id, 404);

        $current = $content->currentRevision;
        if (! $current) {
            return response()->json(['error' => 'No active revision exists.'], 400);
        }

        $diff = $this->revisionService->diffRevisions($revision, $current);

        return response()->json(['diff' => $diff]);
    }

    /**
     * Restore a historical revision as the active state.
     */
    public function restoreRevision(Request $request, string $current_team, Content $content, ContentRevision $revision): RedirectResponse|JsonResponse
    {
        $team = $this->getTeam($request);
        $user = Auth::user();
        abort_unless($content->team_id === $team->id, 403);

        $this->revisionService->restoreRevision($content, $revision, $user);

        if ($request->wantsJson()) {
            return response()->json(['message' => "Revision #{$revision->id} restored successfully."]);
        }

        return back()->with('success', "Revision #{$revision->id} restored successfully.");
    }

    /**
     * Editorial workflow status transition.
     */
    public function transition(Request $request, string $current_team, Content $content): RedirectResponse|JsonResponse
    {
        $team = $this->getTeam($request);
        $user = Auth::user();
        abort_unless($content->team_id === $team->id, 403);

        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $targetStatus = ContentStatus::from($validated['status']);
        $this->workflowService->transitionTo($content, $targetStatus, $user);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => "Content status updated to {$targetStatus->label()}.",
                'status' => $targetStatus->value,
            ]);
        }

        return back()->with('success', "Content status updated to {$targetStatus->label()}.");
    }

    /**
     * Perform bulk operations on selected contents.
     */
    public function bulkAction(Request $request): RedirectResponse|JsonResponse
    {
        $team = $this->getTeam($request);

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
            'action' => 'required|string|in:publish,unpublish,archive,delete,export_json',
        ]);

        $ids = $validated['ids'];
        $action = $validated['action'];

        $query = Content::where('team_id', $team->id)->whereIn('id', $ids);

        if ($action === 'export_json') {
            $contents = $query->with(['contentType', 'category', 'tags', 'author'])->get();

            return response()->json([
                'exported_at' => now()->toIso8601String(),
                'count' => $contents->count(),
                'contents' => $contents,
            ]);
        }

        $count = match ($action) {
            'publish' => $query->update([
                'status' => ContentStatus::Published->value,
                'published_at' => now(),
            ]),
            'unpublish' => $query->update([
                'status' => ContentStatus::Draft->value,
                'published_at' => null,
            ]),
            'archive' => $query->update([
                'status' => ContentStatus::Archived->value,
            ]),
            'delete' => $query->delete(),
        };

        $actionLabel = match ($action) {
            'publish' => 'published',
            'unpublish' => 'unpublished',
            'archive' => 'archived',
            'delete' => 'deleted',
        };

        $message = "Successfully {$actionLabel} {$count} content item(s).";

        if ($request->wantsJson()) {
            return response()->json([
                'message' => $message,
                'affected' => $count,
            ]);
        }

        return back()->with('success', $message);
    }
}
