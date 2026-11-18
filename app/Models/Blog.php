<?php

namespace App\Models;

use App\Concerns\LogsActivity;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Observers\BlogObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[ObservedBy([BlogObserver::class])]
class Blog extends Model
{
    use HasFactory, LogsActivity;

    public function logActivityEvent(string $action): string
    {
        if ($action === 'updated' && $this->wasChanged('is_published') && $this->is_published) {
            return 'blog.published';
        }

        return "blog.{$action}";
    }

    public function logActivityDescription(string $action): string
    {
        if ($action === 'updated' && $this->wasChanged('is_published') && $this->is_published) {
            return "Blog post '{$this->title}' was published.";
        }

        return match ($action) {
            'created' => "Blog post '{$this->title}' was created.",
            'updated' => "Blog post '{$this->title}' was updated.",
            'deleted' => "Blog post '{$this->title}' was deleted.",
            default => "Blog post '{$this->title}' was {$action}.",
        };
    }

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'is_published',
        'published_at',
        'user_id',
        'team_id',
        'category_id',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'blog_tag');
    }

    public function contentItem(): HasOne
    {
        return $this->hasOne(Content::class, 'slug', 'slug');
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
