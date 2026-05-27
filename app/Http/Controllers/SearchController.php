<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\TeamFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Perform fuzzy search across blogs, files, categories, tags, and team members.
     */
    public function search(Request $request): JsonResponse
    {
        $q = $request->query('q', '');

        // Resolve current team
        $team = $request->route('current_team');
        if (is_string($team)) {
            $team = Team::where('slug', $team)->firstOrFail();
        }

        if (!$team) {
            return response()->json([
                'blogs' => [],
                'files' => [],
                'categories' => [],
                'tags' => [],
                'members' => [],
            ]);
        }

        // If query is too short, return empty structure or recent items
        if (strlen(trim($q)) < 2) {
            return response()->json([
                'blogs' => Blog::where('team_id', $team->id)->latest()->limit(3)->get(['id', 'title', 'slug', 'excerpt', 'is_published']),
                'files' => TeamFile::where('team_id', $team->id)->latest()->limit(3)->get(['id', 'name', 'path', 'mime_type', 'size']),
                'categories' => Category::orderBy('name')->limit(3)->get(['id', 'name', 'slug', 'description', 'color']),
                'tags' => Tag::orderBy('name')->limit(3)->get(['id', 'name', 'slug']),
                'members' => $team->members()->limit(3)->get(['users.id', 'users.name', 'users.email']),
            ]);
        }

        $blogs = Blog::where('team_id', $team->id)
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('excerpt', 'like', "%{$q}%")
                    ->orWhere('content', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get(['id', 'title', 'slug', 'excerpt', 'is_published']);

        $files = TeamFile::where('team_id', $team->id)
            ->where('name', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'name', 'path', 'mime_type', 'size']);

        $categories = Category::where('name', 'like', "%{$q}%")
            ->orWhere('description', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'name', 'slug', 'description', 'color']);

        $tags = Tag::where('name', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'name', 'slug']);

        $members = $team->members()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get(['users.id', 'users.name', 'users.email']);

        return response()->json([
            'blogs' => $blogs,
            'files' => $files,
            'categories' => $categories,
            'tags' => $tags,
            'members' => $members,
        ]);
    }
}
