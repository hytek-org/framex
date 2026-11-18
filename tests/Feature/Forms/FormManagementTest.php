<?php

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated user can view forms index with metrics and filters in current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $activeForm = Form::factory()->create([
        'team_id' => $team->id,
        'name' => 'Demo Request Form',
        'is_active' => true,
    ]);

    Form::factory()->create([
        'team_id' => $team->id,
        'name' => 'Paused Legacy Form',
        'is_active' => false,
    ]);

    FormSubmission::factory()->count(2)->create([
        'form_id' => $activeForm->id,
        'team_id' => $team->id,
        'status' => 'unread',
    ]);

    $this->actingAs($user)
        ->get("/{$team->slug}/forms")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('manage/forms/index')
            ->has('forms.data', 2)
            ->where('stats.total_forms', 2)
            ->where('stats.active_forms', 1)
            ->where('stats.total_submissions', 2)
            ->where('stats.unread_submissions', 2)
        );

    $this->actingAs($user)
        ->get("/{$team->slug}/forms?status=active&search=Demo")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('manage/forms/index')
            ->has('forms.data', 1)
            ->where('forms.data.0.name', 'Demo Request Form')
        );
});

test('user can create a new dynamic form with rich field definitions and duplicate slugs are validated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $payload = [
        'name' => 'Support Inquiry',
        'slug' => 'support-inquiry',
        'description' => 'Customer technical support requests',
        'fields' => [
            ['name' => 'ticket_subject', 'label' => 'Subject', 'type' => 'text', 'required' => true, 'width' => 'full'],
            ['name' => 'priority', 'label' => 'Priority', 'type' => 'select', 'required' => true, 'width' => 'half', 'options' => ['Low', 'High']],
            ['name' => 'description', 'label' => 'Issue Details', 'type' => 'textarea', 'required' => true, 'help_text' => 'Include reproduction steps'],
        ],
        'submit_button_text' => 'Submit Ticket',
        'is_active' => true,
        'notify_team' => true,
    ];

    $this->actingAs($user)
        ->post("/{$team->slug}/forms", $payload)
        ->assertRedirect("/{$team->slug}/forms");

    $this->assertDatabaseHas('forms', [
        'team_id' => $team->id,
        'name' => 'Support Inquiry',
        'slug' => 'support-inquiry',
        'submit_button_text' => 'Submit Ticket',
    ]);

    // Duplicate slug within same team returns validation error instead of 500
    $this->actingAs($user)
        ->post("/{$team->slug}/forms", $payload)
        ->assertSessionHasErrors(['slug']);
});

test('user can toggle status and duplicate an existing form', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'name' => 'Lead Capture',
        'slug' => 'lead-capture',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->patch("/{$team->slug}/forms/{$form->id}/toggle")
        ->assertRedirect();

    expect($form->fresh()->is_active)->toBeFalse();

    $response = $this->actingAs($user)
        ->post("/{$team->slug}/forms/{$form->id}/duplicate");

    $copy = Form::where('team_id', $team->id)->where('slug', 'lead-capture-copy')->first();
    expect($copy)->not->toBeNull()
        ->and($copy->name)->toBe('Lead Capture (Copy)')
        ->and($copy->is_active)->toBeFalse();

    $response->assertRedirect("/{$team->slug}/forms/{$copy->id}/edit");
});

test('user can triage, bulk update, delete, and export form submissions as json and csv', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $form = Form::factory()->create([
        'team_id' => $team->id,
        'slug' => 'sales-leads',
        'fields' => [
            ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'required' => true],
            ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
        ],
    ]);

    $sub1 = FormSubmission::factory()->create([
        'form_id' => $form->id,
        'team_id' => $team->id,
        'status' => 'unread',
        'data' => ['name' => '=SUM(A1:A2)', 'email' => 'alice@example.com'],
    ]);

    $sub2 = FormSubmission::factory()->create([
        'form_id' => $form->id,
        'team_id' => $team->id,
        'status' => 'unread',
        'data' => ['name' => 'Bob Smith', 'email' => 'bob@example.com'],
    ]);

    $sub3 = FormSubmission::factory()->create([
        'form_id' => $form->id,
        'team_id' => $team->id,
        'status' => 'archived',
        'data' => ['name' => 'Carol Lee', 'email' => 'carol@example.com'],
    ]);

    // View submissions UI with counts
    $this->actingAs($user)
        ->get("/{$team->slug}/forms/{$form->id}/submissions")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('manage/forms/submissions')
            ->has('submissions.data', 3)
            ->where('statusCounts.all', 3)
            ->where('statusCounts.unread', 2)
            ->where('statusCounts.archived', 1)
        );

    // Filter by status
    $this->actingAs($user)
        ->get("/{$team->slug}/forms/{$form->id}/submissions?status=archived")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('submissions.data', 1)
        );

    // Update single submission status
    $this->actingAs($user)
        ->patch("/{$team->slug}/forms/{$form->id}/submissions/{$sub1->id}", ['status' => 'read'])
        ->assertRedirect();
    expect($sub1->fresh()->status)->toBe('read');

    // Export JSON
    $exportJson = $this->actingAs($user)->postJson("/{$team->slug}/forms/{$form->id}/submissions/export");
    $exportJson->assertOk()
        ->assertJsonStructure(['form', 'exported_at', 'count', 'submissions']);
    expect($exportJson->json('count'))->toBe(3);

    // Export CSV with formula injection neutralization
    $exportCsv = $this->actingAs($user)->post("/{$team->slug}/forms/{$form->id}/submissions/export", [
        'format' => 'csv',
    ]);
    $exportCsv->assertOk();
    expect($exportCsv->headers->get('Content-Type'))->toContain('text/csv')
        ->and($exportCsv->getContent())->toContain("'=SUM(A1:A2)")
        ->and($exportCsv->getContent())->toContain('Bob Smith');

    // Bulk mark as spam
    $this->actingAs($user)
        ->post("/{$team->slug}/forms/{$form->id}/submissions/bulk", [
            'ids' => [$sub1->id, $sub2->id],
            'action' => 'spam',
        ])
        ->assertRedirect();
    expect($sub1->fresh()->status)->toBe('spam')
        ->and($sub2->fresh()->status)->toBe('spam');

    // Delete single submission
    $this->actingAs($user)
        ->delete("/{$team->slug}/forms/{$form->id}/submissions/{$sub3->id}")
        ->assertRedirect();
    $this->assertDatabaseMissing('form_submissions', ['id' => $sub3->id]);
});

test('form management isolates forms and submissions across teams', function () {
    $userA = User::factory()->create();
    $teamA = $userA->currentTeam;

    $userB = User::factory()->create();
    $teamB = $userB->currentTeam;

    $formTeamB = Form::factory()->create([
        'team_id' => $teamB->id,
        'name' => 'Secret Team B Form',
    ]);

    $submissionTeamB = FormSubmission::factory()->create([
        'form_id' => $formTeamB->id,
        'team_id' => $teamB->id,
    ]);

    $this->actingAs($userA)->get("/{$teamA->slug}/forms/{$formTeamB->id}/submissions")->assertForbidden();
    $this->actingAs($userA)->patch("/{$teamA->slug}/forms/{$formTeamB->id}/toggle")->assertForbidden();
    $this->actingAs($userA)->post("/{$teamA->slug}/forms/{$formTeamB->id}/duplicate")->assertForbidden();
    $this->actingAs($userA)->patch("/{$teamA->slug}/forms/{$formTeamB->id}/submissions/{$submissionTeamB->id}", ['status' => 'read'])->assertForbidden();
    $this->actingAs($userA)->delete("/{$teamA->slug}/forms/{$formTeamB->id}/submissions/{$submissionTeamB->id}")->assertForbidden();
});
