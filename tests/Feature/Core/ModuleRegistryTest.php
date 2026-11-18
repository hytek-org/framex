<?php

use App\Enums\TeamRole;
use App\FrameX\Core\Registries\ModuleRegistry;
use App\FrameX\Core\Registries\NavigationRegistry;
use App\Models\User;
use Tests\Fixtures\Modules\TestBaseModule;
use Tests\Fixtures\Modules\TestDependentModule;
use Tests\Fixtures\Modules\TestMissingDepModule;

test('module registry registers modules and triggers register hook', function () {
    $registry = new ModuleRegistry;
    $module = new TestBaseModule;

    $registry->register($module);

    expect($registry->has('base-module'))->toBeTrue();
    expect($registry->get('base-module'))->toBe($module);
    expect($module->isRegistered)->toBeTrue();
    expect($module->isBooted)->toBeFalse();
});

test('module registry boots modules when all dependencies are satisfied', function () {
    $registry = new ModuleRegistry;
    $base = new TestBaseModule;
    $dependent = new TestDependentModule;

    $registry->register($base);
    $registry->register($dependent);

    expect($registry->dependenciesMet('dependent-module'))->toBeTrue();

    $registry->boot();

    expect($base->isBooted)->toBeTrue();
    expect($dependent->isBooted)->toBeTrue();
});

test('module registry throws exception on boot if dependencies are missing', function () {
    $registry = new ModuleRegistry;
    $orphan = new TestMissingDepModule;

    $registry->register($orphan);

    expect($registry->dependenciesMet('orphan-module'))->toBeFalse();
    expect($registry->missingDependencies('orphan-module'))->toBe(['non-existent-module']);

    expect(fn () => $registry->boot())->toThrow(
        RuntimeException::class,
        'FrameX Module [Orphan Module] is missing required dependencies: [non-existent-module].'
    );
});

test('module registry produces complete diagnostic health report', function () {
    $registry = new ModuleRegistry;
    $base = new TestBaseModule;
    $orphan = new TestMissingDepModule;

    $registry->register($base);
    $registry->register($orphan);

    $health = $registry->healthCheck();

    expect($health['base-module']['healthy'])->toBeTrue();
    expect($health['base-module']['missing_dependencies'])->toBeEmpty();

    expect($health['orphan-module']['healthy'])->toBeFalse();
    expect($health['orphan-module']['missing_dependencies'])->toBe(['non-existent-module']);
});

test('navigation registry stores, orders, and filters items by section', function () {
    $nav = new NavigationRegistry;

    $nav->add(['label' => 'Settings', 'route' => 'settings.index', 'order' => 100, 'section' => 'system']);
    $nav->add(['label' => 'Dashboard', 'route' => 'dashboard', 'order' => 10, 'section' => 'main']);
    $nav->add(['label' => 'Content', 'route' => 'content.index', 'order' => 20, 'section' => 'main']);

    $mainItems = $nav->items('main');
    expect($mainItems)->toHaveCount(2);
    expect($mainItems[0]['label'])->toBe('Dashboard');
    expect($mainItems[1]['label'])->toBe('Content');

    $systemItems = $nav->items('system');
    expect($systemItems)->toHaveCount(1);
    expect($systemItems[0]['label'])->toBe('Settings');

    expect($nav->sections())->toEqualCanonicalizing(['system', 'main']);
});

test('navigation registry filters items based on user team permissions', function () {
    $nav = new NavigationRegistry;

    $nav->add([
        'label' => 'Manage Blogs',
        'route' => 'manage.blogs.index',
        'order' => 10,
        'permission' => 'blog:manage',
    ]);

    $owner = User::factory()->create();
    $team = $owner->currentTeam;

    // Owner has all permissions
    $ownerItems = $nav->items(null, $owner, $team);
    expect($ownerItems)->toHaveCount(1);

    // Regular member without blog:manage permission
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value, 'permissions' => []]);

    $memberItems = $nav->items(null, $member, $team);
    expect($memberItems)->toHaveCount(0);
});
