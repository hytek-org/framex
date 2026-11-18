<?php

namespace App\Http\Controllers;

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\Media;
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
     * Perform fuzzy search across content, media, blogs, files, categories, tags, team members, and actions.
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim($request->query('q', ''));

        // Resolve current team
        $team = $request->route('current_team');
        if (is_string($team)) {
            $team = Team::where('slug', $team)->firstOrFail();
        }

        if (! $team) {
            return response()->json([
                'contents' => [],
                'media' => [],
                'blogs' => [],
                'files' => [],
                'categories' => [],
                'tags' => [],
                'members' => [],
                'quickActions' => [],
            ]);
        }

        $allQuickActions = [
            [
                'id' => 'new-content',
                'title' => 'New Content Entry',
                'description' => 'Draft a new post, article or document in Content Studio',
                'url' => "/{$team->slug}/content/create",
                'category' => 'Content Studio',
                'icon' => 'PenTool',
            ],
            [
                'id' => 'media-library',
                'title' => 'Media Studio',
                'description' => 'Manage images, banners, and digital assets',
                'url' => "/{$team->slug}/media",
                'category' => 'Media Studio',
                'icon' => 'Image',
            ],
            [
                'id' => 'content-list',
                'title' => 'Content Catalog',
                'description' => 'Browse and filter all published and drafted content',
                'url' => "/{$team->slug}/content",
                'category' => 'Content Studio',
                'icon' => 'BookOpen',
            ],
            [
                'id' => 'categories',
                'title' => 'Manage Categories',
                'description' => 'Organize taxonomies and categories',
                'url' => "/{$team->slug}/manage/categories",
                'category' => 'Taxonomy',
                'icon' => 'Folder',
            ],
            [
                'id' => 'tags',
                'title' => 'Manage Tags',
                'description' => 'Manage tagging dictionary',
                'url' => "/{$team->slug}/manage/tags",
                'category' => 'Taxonomy',
                'icon' => 'Tags',
            ],
            [
                'id' => 'team-settings',
                'title' => 'Team & Roles',
                'description' => 'Manage team roles and member permissions',
                'url' => '/settings/teams',
                'category' => 'Administration',
                'icon' => 'Users',
            ],
            [
                'id' => 'api-tokens',
                'title' => 'API Tokens',
                'description' => 'Manage headless API access keys and scopes',
                'url' => '/api-tokens',
                'category' => 'Developer',
                'icon' => 'Key',
            ],
            [
                'id' => 'billing-portal',
                'title' => 'Subscription & Billing',
                'description' => 'Manage plan and payment invoices',
                'url' => '/billing',
                'category' => 'Billing',
                'icon' => 'CreditCard',
            ],
            [
                'id' => 'sitemap',
                'title' => 'Dynamic XML Sitemap',
                'description' => 'Inspect public SEO sitemap',
                'url' => '/sitemap.xml',
                'category' => 'SEO',
                'icon' => 'Globe',
            ],
        ];

        // If query is too short, return recent items
        if (strlen($q) < 2) {
            return response()->json([
                'contents' => Content::where('team_id', $team->id)
                    ->with('contentType:id,name,slug')
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'content_type_id', 'title', 'slug', 'excerpt', 'status', 'published_at']),
                'media' => Media::where('team_id', $team->id)
                    ->latest()
                    ->limit(4)
                    ->get(['id', 'filename', 'mime_type', 'size', 'disk', 'path']),
                'blogs' => Blog::where('team_id', $team->id)->latest()->limit(3)->get(['id', 'title', 'slug', 'excerpt', 'is_published']),
                'files' => TeamFile::where('team_id', $team->id)->latest()->limit(3)->get(['id', 'name', 'path', 'mime_type', 'size']),
                'categories' => Category::orderBy('name')->limit(3)->get(['id', 'name', 'slug', 'description', 'color']),
                'tags' => Tag::orderBy('name')->limit(3)->get(['id', 'name', 'slug']),
                'members' => $team->members()->limit(3)->get(['users.id', 'users.name', 'users.email']),
                'quickActions' => array_slice($allQuickActions, 0, 4),
            ]);
        }

        $contents = Content::where('team_id', $team->id)
            ->with('contentType:id,name,slug')
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('excerpt', 'like', "%{$q}%")
                    ->orWhere('content', 'like', "%{$q}%");
            })
            ->latest()
            ->limit(6)
            ->get(['id', 'content_type_id', 'title', 'slug', 'excerpt', 'status', 'published_at']);

        $media = Media::where('team_id', $team->id)
            ->where(function ($query) use ($q) {
                $query->where('filename', 'like', "%{$q}%")
                    ->orWhere('alt_text', 'like', "%{$q}%");
            })
            ->latest()
            ->limit(6)
            ->get(['id', 'filename', 'mime_type', 'size', 'disk', 'path']);

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

        $matchingQuickActions = array_values(array_filter($allQuickActions, function ($action) use ($q) {
            return str_contains(strtolower($action['title']), strtolower($q))
                || str_contains(strtolower($action['description']), strtolower($q))
                || str_contains(strtolower($action['category']), strtolower($q));
        }));

        return response()->json([
            'contents' => $contents,
            'media' => $media,
            'blogs' => $blogs,
            'files' => $files,
            'categories' => $categories,
            'tags' => $tags,
            'members' => $members,
            'quickActions' => $matchingQuickActions,
        ]);
    }
}
