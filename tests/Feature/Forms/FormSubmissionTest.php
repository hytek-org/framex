<?php

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use App\Models\Team;

test('guest can submit valid data to an active dynamic form', function () {
    dump('ENV IN TEST: ' . app()['env'], 'RUNNING UNIT TESTS: ' . (app()->runningUnitTests() ? 'yes' : 'no'));
    $team = Team::factory()->create();

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'contact-us',
        'is_active' => true,
        'fields' => [
            ['name' => 'full_name', 'label' => 'Full Name', 'type' => 'text', 'required' => true],
            ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
            ['name' => 'message', 'label' => 'Message', 'type' => 'textarea', 'required' => false],
        ],
    ]);

    $this->withoutExceptionHandling();
    $response = $this->postJson("/forms/{$form->slug}/submit", [
        'full_name' => 'Jane Developer',
        'email' => 'jane@example.com',
        'message' => 'Interested in FrameX enterprise license.',
    ]);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
    ]);

    $this->assertDatabaseHas('form_submissions', [
        'form_id' => $form->id,
        'team_id' => $team->id,
        'status' => 'unread',
    ]);

    $submission = FormSubmission::where('form_id', $form->id)->first();
    expect($submission->data['full_name'])->toBe('Jane Developer')
        ->and($submission->data['email'])->toBe('jane@example.com');
});

test('dynamic validation rules are enforced for required and email fields', function () {
    $team = Team::factory()->create();

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'newsletter-signup',
        'fields' => [
            ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
        ],
    ]);

    // Missing email
    $this->withoutExceptionHandling();
    $response = $this->postJson("/forms/{$form->slug}/submit", []);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);

    // Invalid email format
    $this->withoutExceptionHandling();
    $response = $this->postJson("/forms/{$form->slug}/submit", [
        'email' => 'not-an-email',
    ]);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
});

test('honeypot field triggers spam detection and rejects submission', function () {
    $team = Team::factory()->create();

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'secure-form',
    ]);

    $this->withoutExceptionHandling();
    $response = $this->postJson("/forms/{$form->slug}/submit", [
        'name' => 'Spam Bot',
        'email' => 'bot@spam.com',
        '_gotcha' => 'I am a bot filling hidden fields',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['form']);
    expect(FormSubmission::where('form_id', $form->id)->count())->toBe(0);
});

test('inactive form returns not found', function () {
    $team = Team::factory()->create();

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'expired-promo',
        'is_active' => false,
    ]);

    $this->withoutExceptionHandling();
    $response = $this->postJson("/forms/{$form->slug}/submit", [
        'name' => 'Late User',
    ]);

    $response->assertNotFound();
});
