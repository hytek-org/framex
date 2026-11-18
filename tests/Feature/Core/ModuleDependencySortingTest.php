<?php

use App\FrameX\Core\Contracts\ModuleInterface;
use App\FrameX\Core\Registries\ModuleRegistry;

class MockDependencyModule implements ModuleInterface
{
    public function __construct(
        protected string $id,
        protected array $dependencies = [],
        protected string $name = 'Mock Module'
    ) {}

    public function id(): string
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function description(): string
    {
        return 'Mock description';
    }

    public function dependencies(): array
    {
        return $this->dependencies;
    }

    public function navigation(): array
    {
        return [];
    }

    public function permissions(): array
    {
        return [];
    }

    public function settingsSchema(): array
    {
        return [];
    }

    public function register(): void {}

    public function boot(): void {}
}

test('it boots modules in topological dependency order', function () {
    $registry = new ModuleRegistry;

    // A depends on B; B depends on C; C has no dependencies
    $moduleC = new MockDependencyModule('module-c', [], 'Module C');
    $moduleB = new MockDependencyModule('module-b', ['module-c'], 'Module B');
    $moduleA = new MockDependencyModule('module-a', ['module-b'], 'Module A');

    // Register out of order
    $registry->register($moduleA);
    $registry->register($moduleC);
    $registry->register($moduleB);

    $bootOrder = $registry->getBootOrder();
    $bootOrderIds = array_map(fn (ModuleInterface $m) => $m->id(), $bootOrder);

    // C must boot before B, and B before A
    expect($bootOrderIds)->toBe(['module-c', 'module-b', 'module-a']);
});

test('it throws RuntimeException on circular module dependencies', function () {
    $registry = new ModuleRegistry;

    // A depends on B, B depends on C, C depends on A
    $moduleA = new MockDependencyModule('module-a', ['module-b']);
    $moduleB = new MockDependencyModule('module-b', ['module-c']);
    $moduleC = new MockDependencyModule('module-c', ['module-a']);

    $registry->register($moduleA);
    $registry->register($moduleB);
    $registry->register($moduleC);

    expect(fn () => $registry->getBootOrder())
        ->toThrow(RuntimeException::class, 'Circular dependency detected in FrameX modules');
});

test('it throws RuntimeException when booting with missing dependencies', function () {
    $registry = new ModuleRegistry;

    $moduleA = new MockDependencyModule('module-a', ['non-existent-module']);
    $registry->register($moduleA);

    expect($registry->missingDependencies('module-a'))->toBe(['non-existent-module']);
    expect(fn () => $registry->boot())
        ->toThrow(RuntimeException::class, 'missing required dependencies: [non-existent-module]');
});

test('it detects disabled modules as unsatisfied dependencies', function () {
    $registry = new ModuleRegistry;

    $moduleB = new MockDependencyModule('module-b', []);
    $moduleA = new MockDependencyModule('module-a', ['module-b']);

    $registry->register($moduleB);
    $registry->register($moduleA);

    $registry->disable('module-b');

    expect($registry->dependenciesMet('module-a'))->toBeFalse()
        ->and($registry->missingDependencies('module-a'))->toBe(['module-b']);
});
