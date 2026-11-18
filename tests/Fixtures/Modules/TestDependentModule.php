<?php

namespace Tests\Fixtures\Modules;

use App\FrameX\Core\Contracts\ModuleInterface;

class TestDependentModule implements ModuleInterface
{
    public bool $isBooted = false;

    public function id(): string
    {
        return 'dependent-module';
    }

    public function name(): string
    {
        return 'Dependent Module';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function description(): string
    {
        return 'Module that depends on base-module.';
    }

    public function dependencies(): array
    {
        return ['base-module'];
    }

    public function register(): void {}

    public function boot(): void
    {
        $this->isBooted = true;
    }

    public function navigation(): array
    {
        return [
            ['label' => 'Dependent View', 'route' => 'dep.index', 'order' => 20, 'section' => 'main'],
        ];
    }

    public function permissions(): array
    {
        return [];
    }
}
