<?php

use App\FrameX\Core\Registries\ModuleRegistry;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::forget('framex:disabled_modules');
});

test('it lists registered modules and their health', function () {
    $this->artisan('framex:modules:list')
        ->expectsOutputToContain('content-studio')
        ->expectsOutputToContain('forms')
        ->expectsOutputToContain('webhooks')
        ->expectsOutputToContain('Summary:')
        ->assertSuccessful();
});

test('it cannot disable the core content-studio module', function () {
    $this->artisan('framex:module:disable', ['id' => 'content-studio'])
        ->expectsOutputToContain('Core module [content-studio] cannot be disabled.')
        ->assertFailed();

    $registry = app(ModuleRegistry::class);
    expect($registry->isEnabled('content-studio'))->toBeTrue();
});

test('it can disable and re-enable an optional module', function () {
    $registry = app(ModuleRegistry::class);

    $this->artisan('framex:module:disable', ['id' => 'forms'])
        ->expectsOutputToContain('disabled successfully')
        ->assertSuccessful();

    expect($registry->isEnabled('forms'))->toBeFalse();

    $this->artisan('framex:module:enable', ['id' => 'forms'])
        ->expectsOutputToContain('enabled successfully')
        ->assertSuccessful();

    expect($registry->isEnabled('forms'))->toBeTrue();
});

test('it fails gracefully when attempting to toggle a non-existent module', function () {
    $this->artisan('framex:module:enable', ['id' => 'ghost-module'])
        ->expectsOutputToContain('not registered in the platform')
        ->assertFailed();

    $this->artisan('framex:module:disable', ['id' => 'ghost-module'])
        ->expectsOutputToContain('not registered in the platform')
        ->assertFailed();
});
