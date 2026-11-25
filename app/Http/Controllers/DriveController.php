<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamFile;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DriveController extends Controller
{
    private const DISK = 'local';
    private const MAX_BYTES = 102400;
    private const MAX_DEPTH = 8;
    private const MAX_MOVE_DESCENDANTS = 500;
    private const PAGE_SIZE = 40;

    private const IMAGE_MIMES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    ];

    public function index(Request $request, Team $current_team): Response
    {
        $filters = $request->validate([
            'folder' => ['nullable', 'integer', 'min:1'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:name,date,size'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);

        $folderId = isset($filters['folder']) ? (int) $filters['folder'] : null;
        $search = trim(str_replace(['%', '_'], '', $filters['q'] ?? ''));
        $sort = $filters['sort'] ?? 'date';
        $direction = $filters['direction'] ?? 'desc';

        $currentFolder = $folderId ? $this->findFolder($current_team, $folderId) : null;

        $folderQuery = DB::table('team_folders')
            ->leftJoin('team_folders as parent_folder', function ($join) use ($current_team) {
                $join->on('parent_folder.id', '=', 'team_folders.parent_id')
                    ->where('parent_folder.team_id', '=', $current_team->id);
            })
            ->where('team_folders.team_id', $current_team->id);

        if ($search !== '') {
            $folderQuery->where('team_folders.name', 'like', "%{$search}%");
        } elseif ($folderId === null) {
            $folderQuery->whereNull('team_folders.parent_id');
        } else {
            $folderQuery->where('team_folders.parent_id', $folderId);
        }

        $folderQuery->orderBy(
            $sort === 'date' ? 'team_folders.created_at' : 'team_folders.name',
            $direction
        );

        $folders = $folderQuery
            ->select([
                'team_folders.id',
                'team_folders.name',
                'team_folders.parent_id',
                'team_folders.created_at',
                'parent_folder.name as parent_name',
            ])
            ->paginate(self::PAGE_SIZE, ['*'], 'folders_page')
            ->withQueryString()
            ->through(fn (object $folder) => [
                'id' => (int) $folder->id,
                'name' => $folder->name,
                'parent_id' => $folder->parent_id ? (int) $folder->parent_id : null,
                'parent_name' => $folder->parent_name,
                'created_at' => Carbon::parse($folder->created_at)->diffForHumans(),
            ]);

        $filesQuery = $current_team->files()
            ->leftJoin('users as uploader', 'uploader.id', '=', 'team_files.user_id')
            ->leftJoin('team_folders as containing_folder', function ($join) use ($current_team) {
                $join->on('containing_folder.id', '=', 'team_files.folder_id')
                    ->where('containing_folder.team_id', '=', $current_team->id);
            });

        if ($search !== '') {
            $filesQuery->where('team_files.name', 'like', "%{$search}%");
        } elseif ($folderId === null) {
            $filesQuery->whereNull('team_files.folder_id');
        } else {
            $filesQuery->where('team_files.folder_id', $folderId);
        }

        $fileOrder = match ($sort) {
            'name' => 'team_files.name',
            'size' => 'team_files.size',
            default => 'team_files.created_at',
        };

        $files = $filesQuery
            ->orderBy($fileOrder, $direction)
            ->select([
                'team_files.*',
                'uploader.name as uploader_name',
                'containing_folder.name as folder_name',
            ])
            ->paginate(self::PAGE_SIZE, ['*'], 'files_page')
            ->withQueryString()
            ->through(fn (TeamFile $file) => [
                'id' => (int) $file->id,
                'name' => $file->name,
                'mime_type' => $file->mime_type,
                'size' => (int) $file->size,
                'folder_id' => $file->folder_id ? (int) $file->folder_id : null,
                'folder_name' => $file->folder_name,
                'uploader_name' => $file->uploader_name,
                'created_at' => $file->created_at?->diffForHumans(),
                'can_preview' => in_array($file->mime_type, [...self::IMAGE_MIMES, 'application/pdf'], true),
                'preview_kind' => in_array($file->mime_type, self::IMAGE_MIMES, true)
                    ? 'image'
                    : ($file->mime_type === 'application/pdf' ? 'pdf' : null),
            ]);

        $breadcrumbs = [];
        $cursor = $currentFolder;
        $visited = [];

        while ($cursor !== null && count($breadcrumbs) < self::MAX_DEPTH) {
            if (in_array((int) $cursor->id, $visited, true)) {
                abort(409, 'Invalid folder hierarchy.');
            }

            $visited[] = (int) $cursor->id;
            array_unshift($breadcrumbs, [
                'id' => (int) $cursor->id,
                'name' => $cursor->name,
            ]);
            $cursor = $cursor->parent_id
                ? $this->findFolder($current_team, (int) $cursor->parent_id)
                : null;
        }

        return Inertia::render('drives/index', [
            'files' => $files,
            'folders' => $folders,
            'currentFolder' => $currentFolder ? [
                'id' => (int) $currentFolder->id,
                'name' => $currentFolder->name,
                'parent_id' => $currentFolder->parent_id ? (int) $currentFolder->parent_id : null,
            ] : null,
            'breadcrumbs' => $breadcrumbs,
            'filters' => [
                'q' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'limits' => [
                'max_file_bytes' => self::MAX_BYTES,
                'max_folder_depth' => self::MAX_DEPTH,
            ],
        ]);
    }

    public function store(Request $request, Team $current_team)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:100'],
            'folder_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        abort_unless($user !== null, 401);

        /** @var UploadedFile $upload */
        $upload = $validated['file'];
        $mime = $this->detectAllowedMime($upload);

        if ($upload->getSize() > self::MAX_BYTES || $mime === null) {
            throw ValidationException::withMessages([
                'file' => 'This file type is not allowed or the file exceeds the 100 KB limit.',
            ]);
        }

        $folderId = isset($validated['folder_id']) ? (int) $validated['folder_id'] : null;
        if ($folderId !== null) {
            $this->findFolder($current_team, $folderId);
        }

        $extension = strtolower($upload->getClientOriginalExtension());
        $originalName = $this->safeUploadName($upload, $extension);
        $path = null;

        try {
            $path = $upload->storeAs(
                "teams/{$current_team->id}",
                Str::uuid()->toString() . '.' . $extension,
                self::DISK
            );

            if (! is_string($path) || $path === '') {
                throw new \RuntimeException('Private storage did not return a stored path.');
            }

            DB::transaction(function () use ($current_team, $folderId, $user, $path, $originalName, $mime, $upload) {
                if ($folderId !== null) {
                    $this->lockTeamHierarchy($current_team);
                    $this->findFolder($current_team, $folderId);
                }

                $record = $current_team->files()->make([
                    'user_id' => $user->id,
                    'folder_id' => $folderId,
                    'disk' => self::DISK,
                    'path' => $path,
                    'name' => $originalName,
                    'mime_type' => $mime,
                    'size' => $upload->getSize(),
                ]);
                $record->save();
            });
        } catch (Throwable $exception) {
            if (is_string($path) && $path !== '') {
                try {
                    Storage::disk(self::DISK)->delete($path);
                } catch (Throwable $cleanupException) {
                    report($cleanupException);
                }
            }

            report($exception);
            return back()->withErrors(['file' => 'The upload could not be completed. Please try again.']);
        }

        return back()->with('success', 'File uploaded successfully.');
    }

    public function createFolder(Request $request, Team $current_team)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'parent_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $name = trim($validated['name']);
        $this->validateName($name, 'name');
        $parentId = isset($validated['parent_id']) ? (int) $validated['parent_id'] : null;

        DB::transaction(function () use ($current_team, $parentId, $name) {
            $this->lockTeamHierarchy($current_team);

            if ($parentId !== null) {
                $this->findFolder($current_team, $parentId);
                if ($this->folderLevel($current_team, $parentId) >= self::MAX_DEPTH) {
                    throw ValidationException::withMessages([
                        'name' => 'The maximum folder nesting depth has been reached.',
                    ]);
                }
            }

            $this->assertFolderNameAvailable($current_team, $name, $parentId);

            DB::table('team_folders')->insert([
                'team_id' => $current_team->id,
                'parent_id' => $parentId,
                'name' => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', 'Folder created.');
    }

    public function renameFile(Request $request, Team $current_team, int $file)
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:180']]);
        $name = trim($validated['name']);
        $this->validateName($name, 'name');

        DB::transaction(function () use ($current_team, $file, $name) {
            $record = $current_team->files()->whereKey($file)->lockForUpdate()->firstOrFail();
            $this->assertStoredPath($current_team, $record);

            if (strtolower(pathinfo($name, PATHINFO_EXTENSION)) !== strtolower(pathinfo($record->name, PATHINFO_EXTENSION))) {
                throw ValidationException::withMessages([
                    'name' => 'Keep the original file extension when renaming.',
                ]);
            }

            $record->name = $name;
            $record->save();
        });

        return back()->with('success', 'File renamed.');
    }

    public function renameFolder(Request $request, Team $current_team, int $folder)
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:120']]);
        $name = trim($validated['name']);
        $this->validateName($name, 'name');

        DB::transaction(function () use ($current_team, $folder, $name) {
            $this->lockTeamHierarchy($current_team);
            $record = DB::table('team_folders')
                ->where('team_id', $current_team->id)
                ->where('id', $folder)
                ->lockForUpdate()
                ->first();

            // Explicit boolean avoids PHP language-server's nullable-object warning.
            abort_unless($record !== null, 404);

            $parentId = $record->parent_id !== null ? (int) $record->parent_id : null;
            $this->assertFolderNameAvailable($current_team, $name, $parentId, $folder);

            DB::table('team_folders')
                ->where('team_id', $current_team->id)
                ->where('id', $folder)
                ->update(['name' => $name, 'updated_at' => now()]);
        });

        return back()->with('success', 'Folder renamed.');
    }

    public function move(Request $request, Team $current_team)
    {
        $validated = $request->validate([
            'kind' => ['required', 'in:file,folder'],
            'id' => ['required', 'integer', 'min:1'],
            'folder_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $id = (int) $validated['id'];
        $destinationId = isset($validated['folder_id']) ? (int) $validated['folder_id'] : null;

        DB::transaction(function () use ($current_team, $validated, $id, $destinationId) {
            if ($validated['kind'] === 'file') {
                $this->lockTeamHierarchy($current_team);
                if ($destinationId !== null) {
                    $this->findFolder($current_team, $destinationId);
                }
                $record = $current_team->files()->whereKey($id)->lockForUpdate()->firstOrFail();
                $this->assertStoredPath($current_team, $record);
                $record->folder_id = $destinationId;
                $record->save();
                return;
            }

            $this->lockTeamHierarchy($current_team);
            if ($destinationId !== null) {
                $this->findFolder($current_team, $destinationId);
            }
            $folder = DB::table('team_folders')
                ->where('team_id', $current_team->id)
                ->where('id', $id)
                ->lockForUpdate()
                ->first();
            abort_unless($folder !== null, 404);

            if ($destinationId === $id || $this->isDescendant($current_team, $id, $destinationId)) {
                throw ValidationException::withMessages([
                    'folder' => 'A folder cannot be moved into itself or one of its descendants.',
                ]);
            }

            $subtreeHeight = $this->subtreeHeight($current_team, $id);
            $destinationDepth = $this->folderLevel($current_team, $destinationId);
            if ($destinationDepth + 1 + $subtreeHeight > self::MAX_DEPTH) {
                throw ValidationException::withMessages([
                    'folder' => 'This move would exceed the maximum folder nesting depth.',
                ]);
            }

            $this->assertFolderNameAvailable($current_team, $folder->name, $destinationId, $id);

            DB::table('team_folders')
                ->where('team_id', $current_team->id)
                ->where('id', $id)
                ->update(['parent_id' => $destinationId, 'updated_at' => now()]);
        });

        return back()->with('success', 'Item moved.');
    }

    public function destroy(Request $request, Team $current_team, int $file)
    {
        // Commit the metadata deletion first. Filesystems cannot participate in the
        // database transaction; a failed physical cleanup leaves only a private orphan,
        // never a database record pointing at a missing file.
        $path = DB::transaction(function () use ($current_team, $file) {
            $record = $current_team->files()->whereKey($file)->lockForUpdate()->firstOrFail();
            $this->assertStoredPath($current_team, $record);
            $path = $record->path;
            $record->delete();
            return $path;
        });

        try {
            $disk = Storage::disk(self::DISK);
            if ($disk->exists($path) && ! $disk->delete($path)) {
                throw new \RuntimeException('Unable to remove stored file.');
            }
        } catch (Throwable $exception) {
            report($exception);
            return back()->with('warning', 'The file record was deleted, but private storage cleanup could not be completed.');
        }

        return back()->with('success', 'File deleted.');
    }

    public function destroyFolder(Request $request, Team $current_team, int $folder)
    {
        DB::transaction(function () use ($current_team, $folder) {
            $this->lockTeamHierarchy($current_team);
            $record = DB::table('team_folders')
                ->where('team_id', $current_team->id)
                ->where('id', $folder)
                ->lockForUpdate()
                ->first();
            abort_unless($record !== null, 404);

            $hasFolders = DB::table('team_folders')
                ->where('team_id', $current_team->id)
                ->where('parent_id', $folder)
                ->exists();
            $hasFiles = $current_team->files()->where('folder_id', $folder)->exists();

            if ($hasFolders || $hasFiles) {
                throw ValidationException::withMessages([
                    'folder' => 'This folder is not empty. Move or delete its contents first.',
                ]);
            }

            DB::table('team_folders')
                ->where('team_id', $current_team->id)
                ->where('id', $folder)
                ->delete();
        });

        return back()->with('success', 'Folder deleted.');
    }

    /** Create a seven-day, read-only public link. No share record is persisted. */
    public function shareFile(Request $request, Team $current_team, int $file)
    {
        $record = $this->findFile($current_team, $file);
        abort_unless(Storage::disk(self::DISK)->exists($record->path), 404);

        $expiresAt = now()->addDays(7);
        $url = URL::temporarySignedRoute(
            'drive.shared.file',
            $expiresAt,
            ['current_team' => $current_team->slug, 'file' => $record->id]
        );

        return response()->json([
            'url' => $url,
            'expires_at' => $expiresAt->toIso8601String(),
            'permission' => 'viewer',
        ]);
    }

    /** Create a seven-day, read-only link to a folder and its live contents. */
    public function shareFolder(Request $request, Team $current_team, int $folder)
    {
        $this->findFolder($current_team, $folder);

        $expiresAt = now()->addDays(7);
        $url = URL::temporarySignedRoute(
            'drive.shared.folder',
            $expiresAt,
            ['current_team' => $current_team->slug, 'folder' => $folder]
        );

        return response()->json([
            'url' => $url,
            'expires_at' => $expiresAt->toIso8601String(),
            'permission' => 'viewer',
        ]);
    }

    /** Public signed-link endpoint. The signature and expiry are checked on every request. */
    public function sharedFile(Request $request, string $current_team, string $file)
    {
        abort_unless(URL::hasValidSignature($request), 403);
        abort_unless(ctype_digit($file) && (int) $file > 0, 404);

        // Resolve the team from the slug in the signed URL, then scope the file to it.
        $team = Team::query()->where('slug', $current_team)->firstOrFail();
        $record = $team->files()->whereKey((int) $file)->firstOrFail();
        $this->assertStoredPath($team, $record);

        $disk = Storage::disk(self::DISK);
        abort_unless($disk->exists($record->path), 404);
        $stream = $disk->readStream($record->path);
        abort_unless(is_resource($stream), 404);

        $inline = in_array($record->mime_type, [...self::IMAGE_MIMES, 'application/pdf', 'text/plain', 'text/csv'], true);
        $disposition = $inline ? 'inline' : 'attachment';
        $filename = $this->safeDisplayName($record->name);

        return response()->stream(
            function () use ($stream) {
                try {
                    fpassthru($stream);
                } finally {
                    if (is_resource($stream)) fclose($stream);
                }
            },
            200,
            [
                'Content-Type' => $record->mime_type ?: 'application/octet-stream',
                'Content-Length' => (string) $record->size,
                'Content-Disposition' => $disposition . '; filename="' . addcslashes($filename, '"\\') . '"',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store, max-age=0',
                'Referrer-Policy' => 'no-referrer',
            ]
        );
    }

    /** Public signed folder listing. Child folders and newly-added files are included dynamically. */
    public function sharedFolder(Request $request, string $current_team, string $folder)
    {
        abort_unless(URL::hasValidSignature($request), 403);
        abort_unless(ctype_digit($folder) && (int) $folder > 0, 404);

        $team = Team::query()->where('slug', $current_team)->firstOrFail();
        $record = DB::table('team_folders')
            ->where('team_id', $team->id)
            ->where('id', (int) $folder)
            ->first();
        abort_unless($record !== null, 404);
        $expiresAt = Carbon::createFromTimestamp((int) $request->query('expires'));

        $folders = DB::table('team_folders')
            ->where('team_id', $team->id)
            ->where('parent_id', $folder)
            ->orderBy('name')
            ->get(['id', 'name']);
        $files = $team->files()->where('folder_id', $folder)->orderBy('name')->get();

        $escape = static fn ($value) => e((string) $value);
        $items = '';
        foreach ($folders as $child) {
            $url = URL::temporarySignedRoute('drive.shared.folder', $expiresAt, ['current_team' => $team->slug, 'folder' => $child->id]);
            $items .= '<li><span>📁</span> <a href="' . $escape($url) . '">' . $escape($child->name) . '</a></li>';
        }
        foreach ($files as $file) {
            $this->assertStoredPath($team, $file);
            $url = URL::temporarySignedRoute('drive.shared.file', $expiresAt, ['current_team' => $team->slug, 'file' => $file->id]);
            $items .= '<li><span>📄</span> <a href="' . $escape($url) . '">' . $escape($file->name) . '</a> <small>' . $escape(number_format((int) $file->size) . ' bytes') . '</small></li>';
        }

        $html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . $escape($record->name) . '</title><style>body{font:16px system-ui,sans-serif;max-width:760px;margin:48px auto;padding:0 20px;color:#202124}h1{font-size:24px}li{padding:12px 4px;border-bottom:1px solid #eee}a{color:#1967d2;text-decoration:none}small{color:#777;margin-left:8px}.notice{color:#666;font-size:13px}</style></head><body><h1>📁 ' . $escape($record->name) . '</h1><p class="notice">Shared read-only folder · Link expires ' . $escape($expiresAt->toDayDateTimeString()) . '</p><ul>' . ($items !== '' ? $items : '<li>This folder is empty.</li>') . '</ul></body></html>';

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
            'Cache-Control' => 'private, no-store, max-age=0',
            'Referrer-Policy' => 'no-referrer',
        ]);
    }

    public function download(Request $request, Team $current_team, int $file)
    {
        $record = $this->findFile($current_team, $file);
        $disk = Storage::disk(self::DISK);
        abort_unless($disk->exists($record->path), 404);

        $stream = $disk->readStream($record->path);
        abort_unless(is_resource($stream), 404);

        return response()->streamDownload(
            function () use ($stream) {
                try {
                    fpassthru($stream);
                } finally {
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                }
            },
            $this->safeDisplayName($record->name),
            [
                'Content-Type' => 'application/octet-stream',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store, max-age=0',
                'Pragma' => 'no-cache',
                'Content-Security-Policy' => "default-src 'none'; sandbox",
            ]
        );
    }

    public function preview(Request $request, Team $current_team, int $file)
    {
        $record = $this->findFile($current_team, $file);
        $allowed = [...self::IMAGE_MIMES, 'application/pdf'];
        abort_unless(in_array($record->mime_type, $allowed, true), 404);

        $disk = Storage::disk(self::DISK);
        abort_unless($disk->exists($record->path), 404);
        $stream = $disk->readStream($record->path);
        abort_unless(is_resource($stream), 404);

        $extension = $record->mime_type === 'application/pdf' ? 'pdf' : 'image';

        return response()->stream(
            function () use ($stream) {
                try {
                    fpassthru($stream);
                } finally {
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                }
            },
            200,
            [
                'Content-Type' => $record->mime_type,
                'Content-Length' => (string) $record->size,
                'Content-Disposition' => "inline; filename=\"preview.{$extension}\"",
                'X-Content-Type-Options' => 'nosniff',
                'X-Frame-Options' => 'SAMEORIGIN',
                'Cross-Origin-Resource-Policy' => 'same-origin',
                'Referrer-Policy' => 'no-referrer',
                'Cache-Control' => 'private, no-store, max-age=0',
            ]
        );
    }

    private function findFolder(Team $team, int $id): object
    {
        $folder = DB::table('team_folders')
            ->where('team_id', $team->id)
            ->where('id', $id)
            ->first();

        abort_if($folder === null, 404);
        return $folder;
    }

    private function findFile(Team $team, int $id): TeamFile
    {
        $file = $team->files()->whereKey($id)->firstOrFail();
        $this->assertStoredPath($team, $file);
        return $file;
    }

    private function assertStoredPath(Team $team, TeamFile $file): void
    {
        $prefix = "teams/{$team->id}/";
        $path = $file->path;
        $segments = is_string($path) ? explode('/', $path) : [];

        abort_unless(
            $file->disk === self::DISK &&
            is_string($path) &&
            Str::startsWith($path, $prefix) &&
            ! str_contains($path, "\\") &&
            ! str_contains($path, "\0") &&
            ! in_array('..', $segments, true) &&
            count($segments) === 3 &&
            ($segments[0] ?? null) === 'teams' &&
            ($segments[1] ?? null) === (string) $team->id &&
            isset($segments[2]) &&
            preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|png|jpe?g|webp|gif)$/i', $segments[2]) === 1,
            404
        );
    }

    private function lockTeamHierarchy(Team $team): void
    {
        Team::query()->whereKey($team->getKey())->lockForUpdate()->firstOrFail();
    }

    private function validateName(string $name, string $field): void
    {
        if (
            $name === '' ||
            $name === '.' ||
            $name === '..' ||
            preg_match('~[\\/\x00-\x1F\x7F]~u', $name) === 1
        ) {
            throw ValidationException::withMessages([$field => 'Enter a valid name.']);
        }
    }

    private function safeUploadName(UploadedFile $file, string $extension): string
    {
        $name = str_replace('\\', '/', $file->getClientOriginalName());
        $name = basename($name);
        $name = preg_replace('/[\x00-\x1F\x7F]/u', '', $name) ?? '';
        $name = trim($name);

        if ($name === '' || $name === '.' || $name === '..') {
            $name = 'document.' . $extension;
        }

        $stem = pathinfo($name, PATHINFO_FILENAME);
        $maxStemLength = max(1, 180 - mb_strlen($extension) - 1);
        $stem = mb_substr($stem, 0, $maxStemLength);

        return $stem . '.' . $extension;
    }

    private function safeDisplayName(string $name): string
    {
        $name = str_replace(['/', '\\'], '_', $name);
        $name = preg_replace('/[\x00-\x1F\x7F]/u', '', $name) ?? 'download';
        return mb_substr(trim($name) ?: 'download', 0, 180);
    }

    private function assertFolderNameAvailable(Team $team, string $name, ?int $parentId, ?int $ignoreId = null): void
    {
        $query = DB::table('team_folders')
            ->where('team_id', $team->id)
            ->where('name', $name);

        $parentId === null
            ? $query->whereNull('parent_id')
            : $query->where('parent_id', $parentId);

        if ($ignoreId !== null) {
            $query->where('id', '<>', $ignoreId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'name' => 'A folder with this name already exists in this location.',
            ]);
        }
    }

    private function folderLevel(Team $team, ?int $folderId): int
    {
        $level = 0;
        $visited = [];

        while ($folderId !== null) {
            if (in_array($folderId, $visited, true) || $level >= self::MAX_DEPTH) {
                abort(409, 'Invalid folder hierarchy.');
            }

            $visited[] = $folderId;
            $folder = $this->findFolder($team, $folderId);
            $level++;
            $folderId = $folder->parent_id !== null ? (int) $folder->parent_id : null;
        }

        return $level;
    }

    private function isDescendant(Team $team, int $folderId, ?int $destinationId): bool
    {
        $visited = [];
        while ($destinationId !== null) {
            if ($destinationId === $folderId) {
                return true;
            }
            if (in_array($destinationId, $visited, true) || count($visited) >= self::MAX_DEPTH) {
                abort(409, 'Invalid folder hierarchy.');
            }

            $visited[] = $destinationId;
            $destination = $this->findFolder($team, $destinationId);
            $destinationId = $destination->parent_id !== null ? (int) $destination->parent_id : null;
        }

        return false;
    }

    private function subtreeHeight(Team $team, int $folderId): int
    {
        $frontier = [$folderId];
        $height = 0;
        $visited = 0;

        while ($frontier !== [] && $height < self::MAX_DEPTH) {
            $children = DB::table('team_folders')
                ->where('team_id', $team->id)
                ->whereIn('parent_id', $frontier)
                ->limit(self::MAX_MOVE_DESCENDANTS + 1)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            if ($children === []) {
                break;
            }

            $visited += count($children);
            if ($visited > self::MAX_MOVE_DESCENDANTS) {
                throw ValidationException::withMessages([
                    'folder' => 'This folder contains too many nested folders to move in one operation.',
                ]);
            }

            $height++;
            $frontier = $children;
        }

        if ($frontier !== [] && $height >= self::MAX_DEPTH) {
            throw ValidationException::withMessages([
                'folder' => 'This folder hierarchy exceeds the supported nesting depth.',
            ]);
        }

        return $height;
    }

    private function detectAllowedMime(UploadedFile $file): ?string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();
        if (! $path || ! is_file($path) || $file->getSize() > self::MAX_BYTES) {
            return null;
        }

        $actualMime = (new \finfo(FILEINFO_MIME_TYPE))->file($path) ?: '';
        $imageMimes = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
        ];

        if (isset($imageMimes[$extension])) {
            $image = @getimagesize($path);
            $expected = $imageMimes[$extension];
            $width = (int) ($image[0] ?? 0);
            $height = (int) ($image[1] ?? 0);
            $safeDimensions = $width > 0 && $height > 0 && $width <= 8000 && $height <= 8000 && ($width * $height) <= 20000000;
            return $image && $safeDimensions && ($image['mime'] ?? null) === $expected && $actualMime === $expected
                ? $expected
                : null;
        }

        $openXml = [
            'docx' => [
                'mime' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'entry' => 'word/document.xml',
            ],
            'xlsx' => [
                'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'entry' => 'xl/workbook.xml',
            ],
            'pptx' => [
                'mime' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'entry' => 'ppt/presentation.xml',
            ],
        ];

        if (isset($openXml[$extension])) {
            $expected = $openXml[$extension]['mime'];
            if (! in_array($actualMime, [$expected, 'application/zip', 'application/x-zip', 'application/x-zip-compressed'], true)) {
                return null;
            }
            return $this->validOfficePackage($path, $openXml[$extension]['entry']) ? $expected : null;
        }

        if (in_array($extension, ['doc', 'xls', 'ppt'], true)) {
            $oleSignature = hex2bin('D0CF11E0A1B11AE1');
            $header = file_get_contents($path, false, null, 0, 8);
            $validMime = in_array($actualMime, [
                'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
                'application/x-ole-storage', 'application/CDFV2', 'application/vnd.ms-office',
                'application/octet-stream',
            ], true);
            if (! $validMime || $header !== $oleSignature) {
                return null;
            }

            return match ($extension) {
                'doc' => 'application/msword',
                'xls' => 'application/vnd.ms-excel',
                'ppt' => 'application/vnd.ms-powerpoint',
            };
        }

        if ($extension === 'pdf') {
            $header = file_get_contents($path, false, null, 0, 5);
            $tailOffset = max(0, (int) filesize($path) - 2048);
            $tail = file_get_contents($path, false, null, $tailOffset);
            return $actualMime === 'application/pdf' && $header === '%PDF-' && is_string($tail) && str_contains($tail, '%%EOF')
                ? 'application/pdf'
                : null;
        }

        if (in_array($extension, ['txt', 'csv'], true)) {
            if (! in_array($actualMime, ['text/plain', 'text/csv', 'application/csv', 'application/x-empty'], true)) {
                return null;
            }
            $contents = file_get_contents($path);
            if ($contents === false || str_contains($contents, "\0") || ! mb_check_encoding($contents, 'UTF-8')) {
                return null;
            }
            return $extension === 'csv' ? 'text/csv' : 'text/plain';
        }

        return null;
    }

    private function validOfficePackage(string $path, string $requiredEntry): bool
    {
        if (! class_exists(\ZipArchive::class)) {
            return false;
        }

        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            return false;
        }

        try {
            if (
                $zip->numFiles < 1 ||
                $zip->numFiles > 200 ||
                $zip->locateName('[Content_Types].xml') === false ||
                $zip->locateName($requiredEntry) === false
            ) {
                return false;
            }

            $uncompressedTotal = 0;
            for ($index = 0; $index < $zip->numFiles; $index++) {
                $stat = $zip->statIndex($index);
                $entry = $zip->getNameIndex($index);
                if (! is_array($stat) || ! is_string($entry)) {
                    return false;
                }

                $uncompressedTotal += (int) ($stat['size'] ?? 0);
                if ($uncompressedTotal > 5 * 1024 * 1024) {
                    return false;
                }

                if (preg_match('~(?:^|/)(?:vbaProject\.bin|activeX|embeddings)(?:/|$)~i', $entry)) {
                    return false;
                }
            }

            return true;
        } finally {
            $zip->close();
        }
    }
}
