<?php

namespace Database\Factories;

use App\FrameX\Modules\Webhooks\Models\WebhookEndpoint;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WebhookEndpoint>
 */
class WebhookEndpointFactory extends Factory
{
    protected $model = WebhookEndpoint::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'name' => fake()->words(2, true).' Webhook',
            'url' => fake()->url(),
            'secret' => WebhookEndpoint::generateSecret(),
            'events' => ['content.published', 'form.submitted'],
            'is_active' => true,
            'description' => fake()->sentence(),
        ];
    }
}
