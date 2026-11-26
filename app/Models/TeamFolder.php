<?php

namespace App\Models;

use App\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamFolder extends Model
{
    use HasFactory, LogsActivity;

    public function logActivityEvent(string $action): string
    {
        return "drive.folder.{$action}";
    }

    public function logActivityDescription(string $action): string
    {
        return match ($action) {
            'created' => "Created Drive folder '{$this->name}'",
            'updated' => "Renamed Drive folder '{$this->name}'",
            'deleted' => "Deleted Drive folder '{$this->name}'",
            default => "Drive folder '{$this->name}' {$action}",
        };
    }

    protected $fillable = [
        'team_id',
        'parent_id',
        'name',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(TeamFolder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(TeamFolder::class, 'parent_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(TeamFile::class, 'folder_id');
    }
}
