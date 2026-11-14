<?php

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\Models\Team;
use App\Models\User;

test('user can bulk publish multiple content items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $items = Content::factory()->count(3)->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'status' => ContentStatus::Draft->value,
    ]);

    $response = $this->actingAs($user)->post("/{$team->slug}/content/bulk-action", [
        'ids' => $items->pluck('id')->toArray(),
        'action' => 'publish',
    ]);

    $response->assertRedirect();

    foreach ($items as $item) {
        expect($item->fresh()->status)->toBe(ContentStatus::Published)
            ->and($item->fresh()->published_at)->not->toBeNull();
    }
});

test('user can bulk unpublish and archive content items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $publishedItems = Content::factory()->count(2)->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'status' => ContentStatus::Published->value,
    ]);

    // Unpublish to draft
    $this->actingAs($user)->post("/{$team->slug}/content/bulk-action", [
        'ids' => $publishedItems->pluck('id')->toArray(),
        'action' => 'unpublish',
    ])->assertRedirect();

    foreach ($publishedItems as $item) {
        expect($item->fresh()->status)->toBe(ContentStatus::Draft);
    }

    // Archive
    $this->actingAs($user)->post("/{$team->slug}/content/bulk-action", [
        'ids' => $publishedItems->pluck('id')->toArray(),
        'action' => 'archive',
    ])->assertRedirect();

    foreach ($publishedItems as $item) {
        expect($item->fresh()->status)->toBe(ContentStatus::Archived);
    }
});

test('user can bulk delete content items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $items = Content::factory()->count(2)->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
    ]);

    $ids = $items->pluck('id')->toArray();

    $response = $this->actingAs($user)->post("/{$team->slug}/content/bulk-action", [
        'ids' => $ids,
        'action' => 'delete',
    ]);

    $response->assertRedirect();

    foreach ($ids as $id) {
        $this->assertSoftDeleted('contents', ['id' => $id]);
    }
});

test('user can export selected content as json', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $items = Content::factory()->count(2)->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'title' => 'Exportable Item',
    ]);

    $response = $this->actingAs($user)->postJson("/{$team->slug}/content/bulk-action", [
        'ids' => $items->pluck('id')->toArray(),
        'action' => 'export_json',
    ]);

    $response->assertOk();
    $response->assertJsonStructure([
        'exported_at',
        'count',
        'contents',
    ]);

    expect($response->json('count'))->toBe(2);
    expect($response->json('contents.0.title'))->toBe('Exportable Item');
});

test('bulk operations isolate and protect content belonging to other teams', function () {
    $userA = User::factory()->create();
    $teamA = $userA->currentTeam;

    $userB = User::factory()->create();
    $teamB = $userB->currentTeam;

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $itemTeamB = Content::factory()->create([
        'team_id' => $teamB->id,
        'author_id' => $userB->id,
        'content_type_id' => $postType->id,
        'status' => ContentStatus::Draft->value,
    ]);

    // Team A attempts to bulk delete or publish Team B's content
    $response = $this->actingAs($userA)->post("/{$teamA->slug}/content/bulk-action", [
        'ids' => [$itemTeamB->id],
        'action' => 'delete',
    ]);

    $response->assertRedirect();

    // Item must still exist unaffected
    $this->assertDatabaseHas('contents', [
        'id' => $itemTeamB->id,
        'team_id' => $teamB->id,
    ]);
});
