<?php

namespace App\FrameX\Modules\ContentStudio\Models;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SeoMetadata extends Model
{
    use HasFactory;

    protected $table = 'seo_metadata';

    protected $fillable = [
        'team_id',
        'seoble_type',
        'seoble_id',
        'meta_title',
        'meta_description',
        'canonical_url',
        'og_title',
        'og_description',
        'og_image',
        'twitter_card',
        'no_index',
        'no_follow',
        'structured_data',
    ];

    protected $casts = [
        'no_index' => 'boolean',
        'no_follow' => 'boolean',
        'structured_data' => 'array',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function seoble(): MorphTo
    {
        return $this->morphTo();
    }
}
