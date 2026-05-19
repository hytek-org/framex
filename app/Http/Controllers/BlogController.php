<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource for public.
     */
    public function publicIndex()
    {
        $blogs = Blog::where('is_published', true)
            ->with(['user'])
            ->latest('published_at')
            ->paginate(12);

        return Inertia::render('blogs/index', [
            'blogs' => $blogs
        ]);
    }

    /**
     * Display single blog post.
     */
    public function publicShow($slug)
    {
        $blog = Blog::where('slug', $slug)
            ->where('is_published', true)
            ->with(['user'])
            ->firstOrFail();

        return Inertia::render('blogs/show', [
            'blog' => $blog
        ]);
    }

    /**
     * Display a listing of the resource for admin/management.
     */
    public function index()
    {
        $blogs = Blog::with(['user'])->latest()->paginate(10);
        return Inertia::render('manage/blogs/index', [
            'blogs' => $blogs
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('manage/blogs/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'is_published' => 'boolean',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $count = 1;
        while (Blog::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }
        
        $imagePath = null;
        if ($request->hasFile('cover_image')) {
            $imagePath = $request->file('cover_image')->store('blogs', 'public');
        }

        $blog = Blog::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'] ?? null,
            'cover_image' => $imagePath,
            'is_published' => $request->boolean('is_published'),
            'published_at' => $request->boolean('is_published') ? now() : null,
            'user_id' => Auth::id(),
            'team_id' => Auth::user()->current_team_id ?? null,
        ]);

        return redirect()->route('manage.blogs.index')->with('success', 'Blog created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Blog $blog)
    {
        return Inertia::render('manage/blogs/show', [
            'blog' => $blog
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog)
    {
        return Inertia::render('manage/blogs/edit', [
            'blog' => $blog
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'is_published' => 'boolean',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        if ($validated['title'] !== $blog->title) {
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Blog::where('slug', $slug)->where('id', '!=', $blog->id)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }
            $blog->slug = $slug;
        }

        if ($request->hasFile('cover_image')) {
            if ($blog->cover_image) {
                Storage::disk('public')->delete($blog->cover_image);
            }
            $blog->cover_image = $request->file('cover_image')->store('blogs', 'public');
        }

        if ($request->boolean('is_published') && !$blog->is_published) {
            $blog->published_at = now();
        }

        $blog->title = $validated['title'];
        $blog->excerpt = $validated['excerpt'] ?? null;
        $blog->content = $validated['content'] ?? null;
        $blog->is_published = $request->boolean('is_published');
        
        $blog->save();

        return redirect()->route('manage.blogs.index')->with('success', 'Blog updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog)
    {
        if ($blog->cover_image) {
            Storage::disk('public')->delete($blog->cover_image);
        }
        $blog->delete();

        return redirect()->route('manage.blogs.index')->with('success', 'Blog deleted successfully.');
    }
}
