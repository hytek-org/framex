<?php

namespace Database\Factories;

use App\FrameX\Modules\Forms\Models\Form;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Form>
 */
class FormFactory extends Factory
{
    protected $model = Form::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(2, true).' Form';

        return [
            'team_id' => Team::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'fields' => [
                [
                    'name' => 'name',
                    'label' => 'Full Name',
                    'type' => 'text',
                    'placeholder' => 'Jane Doe',
                    'required' => true,
                ],
                [
                    'name' => 'email',
                    'label' => 'Email Address',
                    'type' => 'email',
                    'placeholder' => 'jane@example.com',
                    'required' => true,
                ],
                [
                    'name' => 'message',
                    'label' => 'Your Message',
                    'type' => 'textarea',
                    'placeholder' => 'How can we help?',
                    'required' => false,
                ],
            ],
            'submit_button_text' => 'Send Message',
            'success_message' => 'Thank you! Your message has been received.',
            'redirect_url' => null,
            'is_active' => true,
            'notify_team' => true,
        ];
    }
}
