<?php

namespace App\Http\Controllers\Api\v1;

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Http\Controllers\Controller;
use App\Http\Resources\ContentDetailResource;
use App\Http\Resources\ContentResource;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContentApiController extends Controller
{
    /**
     * List content items scoped to team with flexible filtering.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $teamId = $request->user()->current_team_id;

        $query = Content::where('team_id', $teamId)
            ->with(['contentType', 'category', 'tags', 'author'])
            ->latest('published_at');

        // Status filter: defaults to published unless explicitly filtered
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        } else {
            $query->published();
        }

        // Type filter (e.g. type=post or type=page)
        if ($request->filled('type')) {
            $query->ofType($request->input('type'));
        }

        // Category filter
        if ($request->filled('category')) {
            $categorySlug = $request->input('category');
            $query->whereHas('category', fn ($q) => $q->where('slug', $categorySlug));
        }

        // Tag filter
        if ($request->filled('tag')) {
            $tagSlug = $request->input('tag');
            $query->whereHas('tags', fn ($q) => $q->where('slug', $tagSlug));
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $perPage = min(max($request->integer('per_page', 15), 1), 100);

        return ContentResource::collection($query->paginate($perPage));
    }

    /**
     * Retrieve single content item by type and slug.
     */
    public function show(Request $request, string $type, string $slug): ContentDetailResource
    {
        $teamId = $request->user()->current_team_id;

        $content = Content::where('team_id', $teamId)
            ->where('slug', $slug)
            ->ofType($type)
            ->with(['contentType', 'category', 'tags', 'author', 'currentRevision', 'seoMetadata'])
            ->firstOrFail();

        return new ContentDetailResource($content);
    }

    /**
     * List categories for content.
     */
    public function categories(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->withCount(['blogs as contents_count' => fn ($q) => $q->where('is_published', true)])
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * List tags for content.
     */
    public function tags(Request $request): JsonResponse
    {
        $tags = Tag::query()
            ->withCount(['blogs as contents_count' => fn ($q) => $q->where('is_published', true)])
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $tags]);
    }
}
