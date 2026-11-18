<?php

namespace Database\Factories;

use App\FrameX\Modules\ContentStudio\Models\ContentType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ContentType>
 */
class ContentTypeFactory extends Factory
{
    protected $model = ContentType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'icon' => 'file-text',
            'supports' => ['revisions', 'taxonomies', 'seo', 'media', 'workflow'],
            'is_system' => false,
        ];
    }

    /**
     * State for the system 'post' type.
     */
    public function post(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Post',
            'slug' => 'post',
            'description' => 'Articles and blog posts with authors, revisions, categories and tags.',
            'icon' => 'file-text',
            'supports' => ['revisions', 'taxonomies', 'seo', 'media', 'workflow'],
            'is_system' => true,
        ]);
    }

    /**
     * State for the system 'page' type.
     */
    public function page(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Page',
            'slug' => 'page',
            'description' => 'Static or structured landing pages, about pages, and documentation.',
            'icon' => 'layout',
            'supports' => ['revisions', 'seo', 'media'],
            'is_system' => true,
        ]);
    }
}
