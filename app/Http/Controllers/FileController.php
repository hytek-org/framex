<?php

namespace App\Http\Controllers;

use App\Actions\Teams\RecordTeamActivity;
use App\Models\Team;
use App\Models\TeamFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FileController extends Controller
{
    public function index(Request $request, Team $current_team): Response
    {
        return Inertia::render('files/index', [
            'files' => $current_team->files()
                ->latest()
                ->get()
                ->map(fn (TeamFile $file) => [
                    'id' => $file->id,
                    'name' => $file->name,
                    'mime_type' => $file->mime_type,
                    'size' => $file->size,
                    'created_at' => $file->created_at->diffForHumans(),
                ]),
        ]);
    }

    public function store(Request $request, Team $current_team, RecordTeamActivity $activity): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $uploadedFile = $validated['file'];
        $path = $uploadedFile->store("teams/{$current_team->id}");

        $file = $current_team->files()->create([
            'user_id' => $request->user()->id,
            'disk' => config('filesystems.default'),
            'path' => $path,
            'name' => $uploadedFile->getClientOriginalName(),
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
        ]);

        $activity->handle($current_team, $request->user(), 'file.uploaded', "{$file->name} was uploaded.");

        return back();
    }

    public function destroy(Request $request, Team $current_team, TeamFile $file, RecordTeamActivity $activity): RedirectResponse
    {
        abort_unless($file->team_id === $current_team->id, 404);

        Storage::disk($file->disk)->delete($file->path);
        $file->delete();

        $activity->handle($current_team, $request->user(), 'file.deleted', "{$file->name} was deleted.");

        return back();
    }
}
