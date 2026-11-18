<?php

namespace App\FrameX\Modules\ContentStudio\Models;

use Database\Factories\ContentTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ContentType extends Model
{
    use HasFactory;

    protected static function newFactory(): ContentTypeFactory
    {
        return ContentTypeFactory::new();
    }

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'supports',
        'is_system',
    ];

    protected $casts = [
        'supports' => 'array',
        'is_system' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (ContentType $type) {
            if (empty($type->slug)) {
                $type->slug = Str::slug($type->name);
            }
            if (empty($type->supports)) {
                $type->supports = ['revisions', 'taxonomies', 'seo', 'media', 'workflow'];
            }
        });
    }

    public function contents(): HasMany
    {
        return $this->hasMany(Content::class);
    }

    public function supportsFeature(string $feature): bool
    {
        return in_array($feature, $this->supports ?? [], true);
    }
}
