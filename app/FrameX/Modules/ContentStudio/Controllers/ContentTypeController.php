<?php

namespace App\FrameX\Modules\ContentStudio\Controllers;

use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContentTypeController extends Controller
{
    private const ALLOWED_SUPPORTS = [
        'revisions',
        'taxonomies',
        'seo',
        'media',
        'workflow',
    ];

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

    public function index(Request $request): Response
    {
        $team = $this->getTeam($request);

        $contentTypes = ContentType::query()
            ->withCount(['contents' => fn ($q) => $q->where('team_id', $team->id)])
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get();

        return Inertia::render('manage/content-types/index', [
            'contentTypes' => $contentTypes,
            'availableSupports' => self::ALLOWED_SUPPORTS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100|unique:content_types,slug',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'supports' => 'nullable|array',
            'supports.*' => ['string', Rule::in(self::ALLOWED_SUPPORTS)],
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        if (ContentType::where('slug', $slug)->exists()) {
            return back()->withErrors(['slug' => 'A content type with this slug already exists.']);
        }

        ContentType::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?: 'file-text',
            'supports' => ! empty($validated['supports']) ? array_values($validated['supports']) : self::ALLOWED_SUPPORTS,
            'is_system' => false,
        ]);

        return back()->with('success', 'Content type created successfully.');
    }

    public function update(Request $request, string $current_team, ContentType $contentType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('content_types', 'slug')->ignore($contentType->id),
            ],
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'supports' => 'nullable|array',
            'supports.*' => ['string', Rule::in(self::ALLOWED_SUPPORTS)],
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : $contentType->slug;

        $contentType->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?: ($contentType->icon ?? 'file-text'),
            'supports' => isset($validated['supports']) ? array_values($validated['supports']) : $contentType->supports,
        ]);

        return back()->with('success', 'Content type updated successfully.');
    }

    public function destroy(Request $request, string $current_team, ContentType $contentType): RedirectResponse
    {
        if ($contentType->is_system) {
            return back()->withErrors(['content_type' => 'System content types cannot be deleted.']);
        }

        if ($contentType->contents()->exists()) {
            return back()->withErrors(['content_type' => 'Cannot delete a content type that still has content items.']);
        }

        $contentType->delete();

        return back()->with('success', 'Content type deleted successfully.');
    }
}
