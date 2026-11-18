<?php

namespace Database\Factories;

use App\FrameX\Modules\ContentStudio\Models\Media;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    protected $model = Media::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = fake()->slug().'.png';

        return [
            'team_id' => Team::factory(),
            'user_id' => User::factory(),
            'folder_id' => null,
            'disk' => 'public',
            'filename' => $filename,
            'path' => 'media/'.$filename,
            'mime_type' => 'image/png',
            'size' => fake()->numberBetween(1024, 1024 * 1024),
            'alt_text' => fake()->sentence(),
            'caption' => fake()->sentence(),
            'dimensions' => ['width' => 1200, 'height' => 800],
        ];
    }
}
