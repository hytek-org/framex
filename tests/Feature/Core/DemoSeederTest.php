<?php

use App\Models\Team;
use App\Models\User;

test('it seeds complete interactive demo workspace with users, content, forms, and telemetry', function () {
    $this->artisan('framex:demo:seed')
        ->expectsOutputToContain('FrameX Showcase Workspace successfully seeded!')
        ->assertSuccessful();

    $this->assertDatabaseHas('users', [
        'email' => 'demo@framex.dev',
    ]);

    $this->assertDatabaseHas('teams', [
        'slug' => 'framex-demo',
    ]);

    $this->assertDatabaseHas('contents', [
        'slug' => 'quickstart-installation-setup',
    ]);

    $this->assertDatabaseHas('forms', [
        'slug' => 'contact-quote',
    ]);

    $this->assertDatabaseHas('webhook_endpoints', [
        'url' => 'https://api.acmecorp.com/webhooks/framex',
    ]);
});

test('demo seed command is idempotent and can be run repeatedly', function () {
    $this->artisan('framex:demo:seed')->assertSuccessful();
    $this->artisan('framex:demo:seed')->assertSuccessful();

    expect(User::where('email', 'demo@framex.dev')->count())->toBe(1)
        ->and(Team::where('slug', 'framex-demo')->count())->toBe(1);
});
