<?php

namespace Database\Factories;

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentRevision;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentRevision>
 */
class ContentRevisionFactory extends Factory
{
    protected $model = ContentRevision::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $body = fake()->paragraphs(3, true);

        return [
            'content_id' => Content::factory(),
            'author_id' => User::factory(),
            'title' => fake()->sentence(),
            'excerpt' => fake()->paragraph(),
            'body_json' => [
                'type' => 'doc',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'content' => [
                            ['type' => 'text', 'text' => $body],
                        ],
                    ],
                ],
            ],
            'body_html' => '<p>'.nl2br(e($body)).'</p>',
            'change_summary' => 'Initial snapshot',
            'created_at' => now(),
        ];
    }
}
