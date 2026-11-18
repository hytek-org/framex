<?php

namespace Tests\Fixtures\Modules;

use App\FrameX\Core\Contracts\ModuleInterface;

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
