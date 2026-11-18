<?php

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Models\Media;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('dashboard provides content studio telemetry and metrics', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    // 2 Published items
    Content::factory()->count(2)->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'status' => ContentStatus::Published->value,
    ]);

    // 1 Draft item
    Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'status' => ContentStatus::Draft->value,
    ]);

    // 1 Scheduled item
    $scheduledItem = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'status' => ContentStatus::Scheduled->value,
        'title' => 'Scheduled Press Release',
        'scheduled_for' => now()->addDays(2),
    ]);

    // Media item
    Media::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'size' => 1048576, // 1 MB
    ]);

    $response = $this->actingAs($user)->get(route('dashboard', ['current_team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('contentStudio')
        ->where('contentStudio.totalPublished', 2)
        ->where('contentStudio.draftOrReview', 1)
        ->where('contentStudio.scheduledReleases', 1)
        ->where('contentStudio.totalMedia', 1)
        ->where('contentStudio.mediaStorageFormatted', '1.0 MB')
        ->has('contentStudio.upcomingReleases', 1)
        ->where('contentStudio.upcomingReleases.0.title', 'Scheduled Press Release')
    );
});

test('dashboard telemetry isolates content between teams', function () {
    $userA = User::factory()->create();
    $teamA = $userA->currentTeam;

    $userB = User::factory()->create();
    $teamB = $userB->currentTeam;

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    // Team B creates 5 published posts
    Content::factory()->count(5)->create([
        'team_id' => $teamB->id,
        'author_id' => $userB->id,
        'content_type_id' => $postType->id,
        'status' => ContentStatus::Published->value,
    ]);

    // Team A accesses dashboard and should see 0
    $response = $this->actingAs($userA)->get(route('dashboard', ['current_team' => $teamA->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('contentStudio.totalPublished', 0)
        ->where('contentStudio.scheduledReleases', 0)
    );
});
