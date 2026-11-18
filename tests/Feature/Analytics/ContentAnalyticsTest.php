<?php

use App\FrameX\Modules\Analytics\Models\ContentView;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\Models\User;

test('public telemetry view beacon records content view with anonymized ip', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $content = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
    ]);

    $response = $this->postJson('/api/v1/telemetry/view', [
        'content_id' => $content->id,
        'referrer' => 'https://twitter.com/laravelphp',
    ]);

    $response->assertOk();
    $response->assertJson([
        'recorded' => true,
    ]);

    $this->assertDatabaseHas('content_views', [
        'content_id' => $content->id,
        'team_id' => $team->id,
        'referrer' => 'https://twitter.com/laravelphp',
    ]);
});

test('subsequent views on the same day from same ip are deduplicated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $content = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
    ]);

    // First visit
    $this->postJson('/api/v1/telemetry/view', ['content_id' => $content->id])->assertOk();

    // Second visit immediately after
    $this->postJson('/api/v1/telemetry/view', ['content_id' => $content->id])->assertOk();

    // Total view records in database should remain 1
    expect(ContentView::where('content_id', $content->id)->count())->toBe(1);
});

test('team analytics overview endpoint aggregates views', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $content = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'title' => 'Trending Article',
    ]);

    ContentView::create([
        'content_id' => $content->id,
        'team_id' => $team->id,
        'ip_hash' => 'hash1',
        'view_date' => today(),
    ]);

    ContentView::create([
        'content_id' => $content->id,
        'team_id' => $team->id,
        'ip_hash' => 'hash2',
        'view_date' => today(),
    ]);

    $response = $this->actingAs($user)->getJson("/{$team->slug}/analytics");

    $response->assertOk();
    $response->assertJsonStructure([
        'totalViews',
        'dailyViews',
        'topContent',
    ]);

    expect($response->json('totalViews'))->toBe(2);
    expect($response->json('topContent.0.title'))->toBe('Trending Article');
});
