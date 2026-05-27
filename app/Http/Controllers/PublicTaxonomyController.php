<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Blog;
use Inertia\Inertia;

class PublicTaxonomyController extends Controller
{
    // ── Categories ─────────────────────────────────────────────────────────

    public function categoriesIndex()
    {
        $categories = Category::withCount([
            'blogs' => fn ($q) => $q->where('is_published', true),
        ])->orderByDesc('blogs_count')->get();

        // Recent post per category
        $categories->each(function ($cat) {
            $cat->latest_blog = $cat->blogs()
                ->where('is_published', true)
                ->with('user')
                ->latest('published_at')
                ->first(['id', 'title', 'slug', 'published_at', 'user_id']);
        });

        $total = Blog::where('is_published', true)->count();

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'total'      => $total,
        ]);
    }

    public function categoriesShow(string $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $blogs = $category->blogs()
            ->where('is_published', true)
            ->with(['user', 'tags'])
            ->latest('published_at')
            ->paginate(12);

        return Inertia::render('categories/show', [
            'category' => $category,
            'blogs'    => $blogs,
        ]);
    }

    // ── Tags ───────────────────────────────────────────────────────────────

    public function tagsIndex()
    {
        $tags = Tag::withCount([
            'blogs' => fn ($q) => $q->where('is_published', true),
        ])->orderByDesc('blogs_count')->get();

        $total = Blog::where('is_published', true)->count();

        return Inertia::render('tags/index', [
            'tags'  => $tags,
            'total' => $total,
        ]);
    }

    public function tagsShow(string $slug)
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        $blogs = $tag->blogs()
            ->where('is_published', true)
            ->with(['user', 'category'])
            ->latest('published_at')
            ->paginate(12);

        return Inertia::render('tags/show', [
            'tag'   => $tag,
            'blogs' => $blogs,
        ]);
    }
}
