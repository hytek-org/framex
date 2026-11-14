<?php

namespace App\FrameX\Modules\ContentStudio\Controllers;

use App\FrameX\Modules\ContentStudio\Models\Media;
use App\FrameX\Modules\ContentStudio\Models\MediaFolder;
use App\FrameX\Modules\ContentStudio\Services\MediaService;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __construct(
        protected MediaService $mediaService
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
     * List media items and folders.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = Auth::user();
        $team = $this->getTeam($request);

        $folderId = $request->input('folder_id');
        $query = Media::where('team_id', $team->id)->latest();

        if ($request->filled('folder_id')) {
            $query->where('folder_id', $folderId);
        } elseif (! $request->boolean('all')) {
            $query->whereNull('folder_id');
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                    ->orWhere('alt_text', 'like', "%{$search}%")
                    ->orWhere('caption', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            if ($request->input('type') === 'image') {
                $query->where('mime_type', 'like', 'image/%');
            } elseif ($request->input('type') === 'document') {
                $query->where('mime_type', 'like', 'application/%');
            }
        }

        $media = $query->paginate($request->integer('per_page', 24))->withQueryString();
        $folders = MediaFolder::where('team_id', $team->id)
            ->where('parent_id', $folderId ?: null)
            ->withCount('media')
            ->orderBy('name')
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'media' => $media,
                'folders' => $folders,
            ]);
        }

        return Inertia::render('manage/media/index', [
            'media' => $media,
            'folders' => $folders,
            'currentFolder' => $folderId ? MediaFolder::find($folderId) : null,
        ]);
    }

    /**
     * Upload and persist new media file.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $user = Auth::user();
        $team = $this->getTeam($request);

        $validated = $request->validate([
            'file' => 'required|file|max:20480',
            'folder_id' => 'nullable|exists:media_folders,id',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:1000',
        ]);

        $folder = ! empty($validated['folder_id']) ? MediaFolder::find($validated['folder_id']) : null;

        $media = $this->mediaService->upload(
            file: $request->file('file'),
            team: $team,
            user: $user,
            folder: $folder,
            attributes: [
                'alt_text' => $validated['alt_text'] ?? null,
                'caption' => $validated['caption'] ?? null,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Media uploaded successfully',
                'media' => $media,
            ], 201);
        }

        return back()->with('success', 'Media uploaded successfully');
    }

    /**
     * Update media metadata.
     */
    public function update(Request $request, string $current_team, Media $media): RedirectResponse|JsonResponse
    {
        $team = $this->getTeam($request);
        abort_unless($media->team_id === $team->id, 403);

        $validated = $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:1000',
            'folder_id' => 'nullable|exists:media_folders,id',
            'focal_point' => 'nullable|array',
            'focal_point.x' => 'nullable|numeric|min:0|max:100',
            'focal_point.y' => 'nullable|numeric|min:0|max:100',
        ]);

        $media->update($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Media updated successfully',
                'media' => $media->fresh(),
            ]);
        }

        return back()->with('success', 'Media updated successfully');
    }

    /**
     * Delete media item.
     */
    public function destroy(Request $request, string $current_team, Media $media): RedirectResponse|JsonResponse
    {
        $team = $this->getTeam($request);
        abort_unless($media->team_id === $team->id, 403);

        $this->mediaService->delete($media);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Media deleted successfully']);
        }

        return back()->with('success', 'Media deleted successfully');
    }

    /**
     * Create folder.
     */
    public function storeFolder(Request $request): RedirectResponse|JsonResponse
    {
        $user = Auth::user();
        $team = $this->getTeam($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        $folder = MediaFolder::create([
            'team_id' => $team->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'name' => $validated['name'],
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Folder created successfully',
                'folder' => $folder,
            ], 201);
        }

        return back()->with('success', 'Folder created successfully');
    }
}
