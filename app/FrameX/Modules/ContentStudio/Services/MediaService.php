<?php

namespace App\FrameX\Modules\ContentStudio\Services;

use App\FrameX\Modules\ContentStudio\Models\Media;
use App\FrameX\Modules\ContentStudio\Models\MediaFolder;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    /**
     * Store an uploaded file into the media library with metadata.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function upload(
        UploadedFile $file,
        Team $team,
        User $user,
        ?MediaFolder $folder = null,
        array $attributes = []
    ): Media {
        $disk = $attributes['disk'] ?? 'public';
        $extension = $file->getClientOriginalExtension();
        $uniqueName = Str::random(32).($extension ? ".{$extension}" : '');
        $folderPath = "media/{$team->id}".($folder ? "/{$folder->slug}" : '');
        $path = $file->storeAs($folderPath, $uniqueName, $disk);

        $dimensions = null;
        if (str_starts_with($file->getMimeType() ?? '', 'image/')) {
            $imageSize = @getimagesize($file->getRealPath());
            if ($imageSize) {
                $dimensions = [
                    'width' => $imageSize[0],
                    'height' => $imageSize[1],
                ];
            }
        }

        return Media::create([
            'team_id' => $team->id,
            'folder_id' => $folder?->id,
            'user_id' => $user->id,
            'disk' => $disk,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'size' => $file->getSize() ?: 0,
            'alt_text' => $attributes['alt_text'] ?? null,
            'caption' => $attributes['caption'] ?? null,
            'focal_point' => $attributes['focal_point'] ?? ['x' => 50, 'y' => 50],
            'dimensions' => $dimensions,
        ]);
    }

    /**
     * Delete a media entity and purge its underlying disk file.
     */
    public function delete(Media $media): bool
    {
        Storage::disk($media->disk)->delete($media->path);

        return (bool) $media->delete();
    }

    /**
     * Move media item into a folder.
     */
    public function move(Media $media, ?MediaFolder $folder = null): Media
    {
        $media->update([
            'folder_id' => $folder?->id,
        ]);

        return $media;
    }
}
