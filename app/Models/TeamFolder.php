<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamFolder extends Model
{
    use HasFactory;

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
