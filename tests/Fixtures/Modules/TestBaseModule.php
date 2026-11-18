<?php

namespace Tests\Fixtures\Modules;

use App\FrameX\Core\Contracts\ModuleInterface;

class TestBaseModule implements ModuleInterface
{
    public bool $isRegistered = false;

    public bool $isBooted = false;

    public function id(): string
    {
        return 'base-module';
    }

    public function name(): string
    {
        return 'Base Module';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function description(): string
    {
        return 'Foundational test module.';
    }

    public function dependencies(): array
    {
        return [];
    }

    public function register(): void
    {
        $this->isRegistered = true;
    }

    public function boot(): void
    {
        $this->isBooted = true;
    }

    public function navigation(): array
    {
        return [
            ['label' => 'Base Home', 'route' => 'base.index', 'order' => 10, 'section' => 'main'],
        ];
    }

    public function permissions(): array
    {
        return [];
    }
}
