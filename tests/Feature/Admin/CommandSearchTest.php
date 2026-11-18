<?php

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Models\Media;
use App\Models\User;

test('command search returns recent entities when query is empty', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $content = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'title' => 'Alpha Roadmap 2027',
        'slug' => 'alpha-roadmap-2027',
    ]);

    $media = Media::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'filename' => 'hero-banner.png',
    ]);

    $response = $this->actingAs($user)->getJson("/{$team->slug}/search-api");

    $response->assertOk();
    $response->assertJsonStructure([
        'contents',
        'media',
        'blogs',
        'files',
        'categories',
        'tags',
        'members',
        'quickActions',
    ]);

    expect(collect($response->json('contents'))->pluck('title'))->toContain('Alpha Roadmap 2027');
    expect(collect($response->json('media'))->pluck('filename'))->toContain('hero-banner.png');
    expect(count($response->json('quickActions')))->toBeGreaterThan(0);
});

test('command search filters content and media by search query', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $targetContent = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'title' => 'Quantum Architecture Design',
        'slug' => 'quantum-architecture-design',
    ]);

    $otherContent = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $user->id,
        'content_type_id' => $postType->id,
        'title' => 'Standard Cooking Tips',
        'slug' => 'standard-cooking-tips',
    ]);

    $targetMedia = Media::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'filename' => 'quantum-diagram.png',
    ]);

    $response = $this->actingAs($user)->getJson("/{$team->slug}/search-api?q=Quantum");

    $response->assertOk();

    $contentTitles = collect($response->json('contents'))->pluck('title');
    expect($contentTitles)->toContain('Quantum Architecture Design');
    expect($contentTitles)->not->toContain('Standard Cooking Tips');

    $mediaNames = collect($response->json('media'))->pluck('filename');
    expect($mediaNames)->toContain('quantum-diagram.png');
});

test('command search isolates contents across different teams', function () {
    $user = User::factory()->create();
    $teamA = $user->currentTeam;

    $otherUser = User::factory()->create();
    $teamB = $otherUser->currentTeam;

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    Content::factory()->create([
        'team_id' => $teamB->id,
        'author_id' => $otherUser->id,
        'content_type_id' => $postType->id,
        'title' => 'Secret Team B Manifesto',
        'slug' => 'secret-team-b-manifesto',
    ]);

    $response = $this->actingAs($user)->getJson("/{$teamA->slug}/search-api?q=Secret");

    $response->assertOk();
    expect($response->json('contents'))->toBeEmpty();
});
