<?php

namespace App\FrameX\Modules\ContentStudio\Models;

use App\Models\Team;
use App\Models\User;
use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected static function newFactory(): MediaFactory
    {
        return MediaFactory::new();
    }

    protected $table = 'media';

    protected $fillable = [
        'team_id',
        'folder_id',
        'user_id',
        'disk',
        'filename',
        'path',
        'mime_type',
        'size',
        'alt_text',
        'caption',
        'focal_point',
        'dimensions',
    ];

    protected $casts = [
        'size' => 'integer',
        'focal_point' => 'array',
        'dimensions' => 'array',
    ];

    protected $appends = [
        'url',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'folder_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }
}
