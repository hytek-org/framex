<?php

namespace App\FrameX\Modules\ContentStudio\Models;

use App\Models\User;
use Database\Factories\ContentRevisionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentRevision extends Model
{
    use HasFactory;

    protected static function newFactory(): ContentRevisionFactory
    {
        return ContentRevisionFactory::new();
    }

    public $timestamps = false;

    protected $fillable = [
        'content_id',
        'author_id',
        'title',
        'excerpt',
        'body_json',
        'body_html',
        'change_summary',
        'created_at',
    ];

    protected $casts = [
        'body_json' => 'array',
        'created_at' => 'datetime',
    ];

    public function content(): BelongsTo
    {
        return $this->belongsTo(Content::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
