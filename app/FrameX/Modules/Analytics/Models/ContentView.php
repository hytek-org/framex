<?php

namespace App\FrameX\Modules\Analytics\Models;

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentView extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_id',
        'team_id',
        'ip_hash',
        'referrer',
        'view_date',
    ];

    protected $casts = [
        'view_date' => 'date',
    ];

    public function content(): BelongsTo
    {
        return $this->belongsTo(Content::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
