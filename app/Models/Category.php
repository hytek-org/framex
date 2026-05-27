<?php

namespace App\Models;

use App\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use LogsActivity;

    public function logActivityEvent(string $action): string
    {
        return "category.{$action}";
    }

    public function logActivityDescription(string $action): string
    {
        return match ($action) {
            'created' => "Category '{$this->name}' was created.",
            'updated' => "Category '{$this->name}' was updated.",
            'deleted' => "Category '{$this->name}' was deleted.",
            default => "Category '{$this->name}' was {$action}.",
        };
    }

    protected $fillable = ['name', 'slug', 'description', 'color'];

    protected static function booted(): void
    {
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    public function blogs()
    {
        return $this->hasMany(Blog::class);
    }
}
