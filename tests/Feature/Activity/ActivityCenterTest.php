<?php

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Webhooks\Models\WebhookEndpoint;
use App\Models\ActivityLog;
use App\Models\Team;
use App\Models\TeamFolder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('unauthenticated users are redirected from workspace activity', function () {
    $team = Team::factory()->create();

    $this->get(route('activity.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));
});

test('users cannot access another teams activity logs', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();

    $this->actingAs($user)
        ->get(route('activity.index', ['current_team' => $otherTeam->slug]))
        ->assertForbidden();
});

test('activity logs are scoped to the current team and represent deleted users safely', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $otherTeam = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);
    $user->update(['current_team_id' => $team->id]);

    ActivityLog::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'event' => 'content.published',
        'description' => 'Published Quarterly Roadmap',
    ]);

    ActivityLog::create([
        'team_id' => $team->id,
        'user_id' => null,
        'event' => 'team.cleanup',
        'description' => 'Automated workspace cleanup',
    ]);

    ActivityLog::create([
        'team_id' => $otherTeam->id,
        'user_id' => null,
        'event' => 'content.created',
        'description' => 'Other team secret event',
    ]);

    $this->actingAs($user)
        ->get(route('activity.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('activity/index')
            ->has('activities.data', 3)
            ->where('activities.data.0.actor_type', 'system_or_deleted')
        );
});

test('activity center supports search, category, actor, and date filters', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);
    $user->update(['current_team_id' => $team->id]);

    ActivityLog::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'event' => 'content.updated',
        'description' => 'Updated Launch Announcement',
    ]);

    ActivityLog::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'event' => 'billing.subscription.updated',
        'description' => 'Upgraded to Pro plan',
    ]);

    $this->actingAs($user)
        ->get(route('activity.index', [
            'current_team' => $team->slug,
            'search' => 'Launch',
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('activities.data', 1));

    $this->actingAs($user)
        ->get(route('activity.index', [
            'current_team' => $team->slug,
            'category' => 'billing',
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('activities.data', 1)
            ->where('activities.data.0.event', 'billing.subscription.updated')
        );

    $this->actingAs($user)
        ->get(route('activity.index', [
            'current_team' => $team->slug,
            'actor' => (string) $user->id,
            'date_from' => now()->toDateString(),
            'date_to' => now()->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('activities.data', 2));
});

test('activity metadata redacts sensitive fields', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);
    $user->update(['current_team_id' => $team->id]);

    ActivityLog::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'event' => 'security.token.created',
        'description' => 'Created API token',
        'metadata' => [
            'api_token' => 'secret-plain-token-123',
            'nested' => [
                'password' => 'hunter2',
                'safe_label' => 'Production Key',
            ],
        ],
    ]);

    $this->actingAs($user)
        ->get(route('activity.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('activities.data.0.metadata.api_token', '[REDACTED]')
            ->where('activities.data.0.metadata.nested.password', '[REDACTED]')
            ->where('activities.data.0.metadata.nested.safe_label', 'Production Key')
        );
});

test('drive folders, forms, webhooks, and billing actions record workspace activity', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);
    $user->update(['current_team_id' => $team->id]);

    $this->actingAs($user);

    TeamFolder::create([
        'team_id' => $team->id,
        'name' => 'Design Assets',
    ]);

    Form::factory()->create([
        'team_id' => $team->id,
        'name' => 'Enterprise Demo Request',
    ]);

    WebhookEndpoint::factory()->create([
        'team_id' => $team->id,
        'name' => 'CRM Sync',
    ]);

    $this->post(route('billing.checkout', ['plan' => 'pro']))->assertRedirect();

    $events = ActivityLog::where('team_id', $team->id)->pluck('event')->all();

    expect($events)->toContain('drive.folder.created')
        ->toContain('form.created')
        ->toContain('webhook.created')
        ->toContain('billing.subscription.created');
});
