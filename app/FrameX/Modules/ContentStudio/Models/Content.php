<?php

namespace App\FrameX\Modules\ContentStudio\Models;

use App\Concerns\LogsActivity;
use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\User;
use Database\Factories\ContentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Content extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected static function newFactory(): ContentFactory
    {
        return ContentFactory::new();
    }

    protected $fillable = [
        'content_type_id',
        'team_id',
        'category_id',
        'author_id',
        'reviewer_id',
        'title',
        'slug',
        'excerpt',
        'status',
        'current_revision_id',
        'featured_media_id',
        'cover_image',
        'published_at',
        'scheduled_for',
        'expires_at',
    ];

    protected $casts = [
        'status' => ContentStatus::class,
        'published_at' => 'datetime',
        'scheduled_for' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function logActivityEvent(string $action): string
    {
        if ($action === 'updated' && $this->wasChanged('status') && $this->status === ContentStatus::Published) {
            return 'content.published';
        }

        return "content.{$action}";
    }

    public function logActivityDescription(string $action): string
    {
        if ($action === 'updated' && $this->wasChanged('status') && $this->status === ContentStatus::Published) {
            return "Content '{$this->title}' was published.";
        }

        return match ($action) {
            'created' => "Content '{$this->title}' was created.",
            'updated' => "Content '{$this->title}' was updated.",
            'deleted' => "Content '{$this->title}' was deleted.",
            default => "Content '{$this->title}' was {$action}.",
        };
    }

    public function contentType(): BelongsTo
    {
        return $this->belongsTo(ContentType::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(ContentRevision::class)->latest('created_at');
    }

    public function currentRevision(): BelongsTo
    {
        return $this->belongsTo(ContentRevision::class, 'current_revision_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'content_tag');
    }

    public function seoMetadata(): MorphOne
    {
        return $this->morphOne(SeoMetadata::class, 'seoble');
    }

    public function getBodyHtmlAttribute(): ?string
    {
        return $this->currentRevision?->body_html;
    }

    public function getBodyJsonAttribute(): ?array
    {
        return $this->currentRevision?->body_json;
    }

    public function getBodyAttribute(): ?string
    {
        return $this->getBodyHtmlAttribute();
    }

    public function isPublished(): bool
    {
        return $this->status === ContentStatus::Published &&
            $this->published_at !== null &&
            $this->published_at->isPast();
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ContentStatus::Published->value)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeForTeam(Builder $query, int $teamId): Builder
    {
        return $query->where('team_id', $teamId);
    }

    public function scopeOfType(Builder $query, string $typeSlug): Builder
    {
        return $query->whereHas('contentType', fn ($q) => $q->where('slug', $typeSlug));
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
