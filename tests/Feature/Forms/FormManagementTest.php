<?php

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated user can view forms index in current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'name' => 'Demo Request Form',
    ]);

    $response = $this->actingAs($user)->get("/{$team->slug}/forms");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('manage/forms/index')
        ->has('forms.data', 1)
        ->where('forms.data.0.name', 'Demo Request Form')
    );
});

test('user can create a new dynamic form with field definitions', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this->actingAs($user)->post("/{$team->slug}/forms", [
        'name' => 'Support Inquiry',
        'slug' => 'support-inquiry',
        'description' => 'Customer technical support requests',
        'fields' => [
            ['name' => 'ticket_subject', 'label' => 'Subject', 'type' => 'text', 'required' => true],
            ['name' => 'priority', 'label' => 'Priority', 'type' => 'text', 'required' => false],
            ['name' => 'description', 'label' => 'Issue Details', 'type' => 'textarea', 'required' => true],
        ],
        'submit_button_text' => 'Submit Ticket',
        'is_active' => true,
    ]);

    $response->assertRedirect("/{$team->slug}/forms");

    $this->assertDatabaseHas('forms', [
        'team_id' => $team->id,
        'name' => 'Support Inquiry',
        'slug' => 'support-inquiry',
        'submit_button_text' => 'Submit Ticket',
    ]);
});

test('user can view and export form submissions as json', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $form = Form::factory()->create([
        'team_id' => $team->id,
    ]);

    FormSubmission::factory()->count(3)->create([
        'form_id' => $form->id,
        'team_id' => $team->id,
    ]);

    // View submissions UI
    $response = $this->actingAs($user)->get("/{$team->slug}/forms/{$form->id}/submissions");
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('manage/forms/submissions')
        ->has('submissions.data', 3)
    );

    // Export submissions
    $exportResponse = $this->actingAs($user)->postJson("/{$team->slug}/forms/{$form->id}/submissions/export");
    $exportResponse->assertOk();
    $exportResponse->assertJsonStructure([
        'form',
        'exported_at',
        'count',
        'submissions',
    ]);
    expect($exportResponse->json('count'))->toBe(3);
});

test('form management isolates forms across teams', function () {
    $userA = User::factory()->create();
    $teamA = $userA->currentTeam;

    $userB = User::factory()->create();
    $teamB = $userB->currentTeam;

    $formTeamB = Form::factory()->create([
        'team_id' => $teamB->id,
        'name' => 'Secret Team B Form',
    ]);

    // User A cannot view Team B's form submissions or edit
    $response = $this->actingAs($userA)->get("/{$teamA->slug}/forms/{$formTeamB->id}/submissions");
    $response->assertForbidden();
});
