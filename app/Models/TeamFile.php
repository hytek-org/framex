<?php

namespace App\Models;

use App\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['team_id', 'user_id', 'disk', 'path', 'name', 'mime_type', 'size'])]
class TeamFile extends Model
{
    use HasFactory, LogsActivity;

    public function logActivityEvent(string $action): string
    {
        return match ($action) {
            'created' => 'file.uploaded',
            'deleted' => 'file.deleted',
            default => "file.{$action}",
        };
    }

    public function logActivityDescription(string $action): string
    {
        return match ($action) {
            'created' => "{$this->name} was uploaded.",
            'deleted' => "{$this->name} was deleted.",
            default => "{$this->name} was {$action}.",
        };
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
