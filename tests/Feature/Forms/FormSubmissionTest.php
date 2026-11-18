<?php

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use App\FrameX\Modules\Forms\Notifications\FormSubmissionReceived;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('public hosted form page renders active form schema and supports embed mode', function () {
    $team = Team::factory()->create(['name' => 'Acme Studio']);

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'name' => 'Partner Inquiry',
        'slug' => 'partner-inquiry',
        'is_active' => true,
    ]);

    $this->get('/forms/partner-inquiry')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('forms/show')
            ->where('form.name', 'Partner Inquiry')
            ->where('form.slug', 'partner-inquiry')
            ->where('form.is_active', true)
            ->where('form.team_name', 'Acme Studio')
            ->where('isEmbed', false)
        );

    $this->get('/forms/partner-inquiry?embed=1')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('forms/show')
            ->where('isEmbed', true)
        );
});

test('public hosted form page shows paused state gracefully for inactive forms', function () {
    $team = Team::factory()->create();

    Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'closed-survey',
        'is_active' => false,
    ]);

    $this->get('/forms/closed-survey')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('forms/show')
            ->where('form.is_active', false)
            ->where('isPreview', false)
        );
});

test('guest can submit valid data to an active dynamic form including choice and consent fields', function () {
    Notification::fake();

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'contact-us',
        'is_active' => true,
        'notify_team' => true,
        'fields' => [
            ['name' => 'full_name', 'label' => 'Full Name', 'type' => 'text', 'required' => true],
            ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
            ['name' => 'plan', 'label' => 'Plan', 'type' => 'select', 'required' => true, 'options' => ['Starter', 'Enterprise']],
            ['name' => 'interests', 'label' => 'Interests', 'type' => 'checkbox_group', 'required' => false, 'options' => ['CMS', 'API', 'Forms']],
            ['name' => 'agree', 'label' => 'Agree to terms', 'type' => 'checkbox', 'required' => true],
            ['name' => 'message', 'label' => 'Message', 'type' => 'textarea', 'required' => false],
        ],
    ]);

    $response = $this->postJson("/forms/{$form->slug}/submit", [
        'full_name' => 'Jane Developer',
        'email' => 'jane@example.com',
        'plan' => 'Enterprise',
        'interests' => ['CMS', 'Forms'],
        'agree' => true,
        'message' => 'Interested in FrameX enterprise license.',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('form_submissions', [
        'form_id' => $form->id,
        'team_id' => $team->id,
        'status' => 'unread',
    ]);

    $submission = FormSubmission::where('form_id', $form->id)->first();
    expect($submission->data['full_name'])->toBe('Jane Developer')
        ->and($submission->data['email'])->toBe('jane@example.com')
        ->and($submission->data['plan'])->toBe('Enterprise')
        ->and($submission->data['interests'])->toBe(['CMS', 'Forms']);

    Notification::assertSentTo($user, FormSubmissionReceived::class);
});

test('dynamic validation rules are enforced for required, email, select options, and required consent fields', function () {
    $team = Team::factory()->create();

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'newsletter-signup',
        'fields' => [
            ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
            ['name' => 'tier', 'label' => 'Tier', 'type' => 'select', 'required' => true, 'options' => ['Free', 'Pro']],
            ['name' => 'terms', 'label' => 'Terms', 'type' => 'checkbox', 'required' => true],
        ],
    ]);

    $this->postJson("/forms/{$form->slug}/submit", [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'tier', 'terms']);

    $this->postJson("/forms/{$form->slug}/submit", [
        'email' => 'not-an-email',
        'tier' => 'InvalidTier',
        'terms' => false,
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'tier', 'terms']);
});

test('honeypot field triggers spam detection and rejects submission', function () {
    $team = Team::factory()->create();

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'secure-form',
    ]);

    $this->postJson("/forms/{$form->slug}/submit", [
        'name' => 'Spam Bot',
        'email' => 'bot@spam.com',
        '_gotcha' => 'I am a bot filling hidden fields',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['form']);

    expect(FormSubmission::where('form_id', $form->id)->count())->toBe(0);
});

test('inactive form returns not found on submission', function () {
    $team = Team::factory()->create();

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'expired-promo',
        'is_active' => false,
    ]);

    $this->postJson("/forms/{$form->slug}/submit", [
        'name' => 'Late User',
    ])->assertNotFound();
});
