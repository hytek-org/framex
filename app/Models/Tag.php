<?php

namespace App\Models;

use App\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tag extends Model
{
    use LogsActivity;

    public function logActivityEvent(string $action): string
    {
        return "tag.{$action}";
    }

    public function logActivityDescription(string $action): string
    {
        return match ($action) {
            'created' => "Tag '{$this->name}' was created.",
            'updated' => "Tag '{$this->name}' was updated.",
            'deleted' => "Tag '{$this->name}' was deleted.",
            default => "Tag '{$this->name}' was {$action}.",
        };
    }

    protected $fillable = ['name', 'slug'];

    protected static function booted(): void
    {
        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }

    public function blogs()
    {
        return $this->belongsToMany(Blog::class, 'blog_tag');
    }
}
