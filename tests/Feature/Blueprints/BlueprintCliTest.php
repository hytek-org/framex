<?php

use App\Models\Team;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->team = Team::factory()->create();
    $this->user->teams()->attach($this->team->id, ['role' => 'admin']);
});

test('it lists all registered application blueprints', function () {
    $this->artisan('framex:blueprint:list')
        ->expectsOutputToContain('corporate')
        ->expectsOutputToContain('publishing')
        ->expectsOutputToContain('saas')
        ->expectsOutputToContain('docs')
        ->assertSuccessful();
});

test('it installs corporate website blueprint into team workspace', function () {
    $this->artisan('framex:blueprint:install', [
        'preset' => 'corporate',
        '--team' => $this->team->slug,
        '--user' => $this->user->email,
    ])
        ->expectsOutputToContain('successfully installed!')
        ->assertSuccessful();

    $this->assertDatabaseHas('categories', [
        'slug' => 'case-studies',
    ]);

    $this->assertDatabaseHas('contents', [
        'team_id' => $this->team->id,
        'slug' => 'about-our-company',
    ]);

    $this->assertDatabaseHas('forms', [
        'team_id' => $this->team->id,
        'slug' => 'contact-quote',
    ]);
});

test('it installs publishing platform blueprint into team workspace', function () {
    $this->artisan('framex:blueprint:install', [
        'preset' => 'publishing',
        '--team' => $this->team->slug,
        '--user' => $this->user->email,
    ])
        ->expectsOutputToContain('successfully installed!')
        ->assertSuccessful();

    $this->assertDatabaseHas('categories', [
        'slug' => 'technology',
    ]);

    $this->assertDatabaseHas('contents', [
        'team_id' => $this->team->id,
        'slug' => 'the-future-of-modular-monoliths',
    ]);

    $this->assertDatabaseHas('forms', [
        'team_id' => $this->team->id,
        'slug' => 'newsletter-subscription',
    ]);
});

test('it installs saas application blueprint into team workspace', function () {
    $this->artisan('framex:blueprint:install', [
        'preset' => 'saas',
        '--team' => $this->team->slug,
        '--user' => $this->user->email,
    ])
        ->expectsOutputToContain('successfully installed!')
        ->assertSuccessful();

    $this->assertDatabaseHas('content_types', [
        'slug' => 'changelog',
    ]);

    $this->assertDatabaseHas('contents', [
        'team_id' => $this->team->id,
        'slug' => 'workspace-onboarding-guide',
    ]);

    $this->assertDatabaseHas('forms', [
        'team_id' => $this->team->id,
        'slug' => 'saas-feedback',
    ]);
});

test('it installs documentation hub blueprint into team workspace', function () {
    $this->artisan('framex:blueprint:install', [
        'preset' => 'docs',
        '--team' => $this->team->slug,
        '--user' => $this->user->email,
    ])
        ->expectsOutputToContain('successfully installed!')
        ->assertSuccessful();

    $this->assertDatabaseHas('content_types', [
        'slug' => 'doc',
    ]);

    $this->assertDatabaseHas('categories', [
        'slug' => 'getting-started',
    ]);

    $this->assertDatabaseHas('contents', [
        'team_id' => $this->team->id,
        'slug' => 'quickstart-installation-setup',
    ]);

    $this->assertDatabaseHas('forms', [
        'team_id' => $this->team->id,
        'slug' => 'doc-feedback',
    ]);
});

test('it fails gracefully when installing unknown blueprint preset', function () {
    $this->artisan('framex:blueprint:install', [
        'preset' => 'unknown-solution',
        '--team' => $this->team->slug,
    ])
        ->expectsOutputToContain('Blueprint [unknown-solution] not found')
        ->assertFailed();
});
