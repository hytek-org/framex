<?php

namespace Database\Factories;

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentRevision;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Content>
 */
class ContentFactory extends Factory
{
    protected $model = Content::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence();

        return [
            'content_type_id' => ContentType::factory(),
            'team_id' => Team::factory(),
            'author_id' => User::factory(),
            'reviewer_id' => null,
            'category_id' => null,
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 9999),
            'excerpt' => fake()->paragraph(),
            'status' => ContentStatus::Draft,
            'current_revision_id' => null,
            'featured_media_id' => null,
            'cover_image' => null,
            'published_at' => null,
            'scheduled_for' => null,
            'expires_at' => null,
        ];
    }

    /**
     * Mark content as published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ContentStatus::Published,
            'published_at' => now()->subDay(),
        ]);
    }

    /**
     * Mark content as scheduled.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ContentStatus::Scheduled,
            'scheduled_for' => now()->addDays(2),
            'published_at' => null,
        ]);
    }

    /**
     * Mark content as in review.
     */
    public function inReview(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ContentStatus::InReview,
        ]);
    }

    /**
     * Mark content as archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ContentStatus::Archived,
        ]);
    }

    /**
     * Automatically attach an initial revision and set current_revision_id.
     */
    public function withRevision(?string $bodyHtml = null): static
    {
        return $this->afterCreating(function (Content $content) use ($bodyHtml) {
            $revision = ContentRevision::factory()->create([
                'content_id' => $content->id,
                'author_id' => $content->author_id,
                'title' => $content->title,
                'excerpt' => $content->excerpt,
                'body_html' => $bodyHtml ?? '<p>'.fake()->paragraph().'</p>',
            ]);

            $content->updateQuietly(['current_revision_id' => $revision->id]);
        });
    }
}
