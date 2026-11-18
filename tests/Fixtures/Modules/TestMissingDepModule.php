<?php

namespace Tests\Fixtures\Modules;

use App\FrameX\Core\Contracts\ModuleInterface;

class TestMissingDepModule implements ModuleInterface
{
    public function id(): string
    {
        return 'orphan-module';
    }

    public function name(): string
    {
        return 'Orphan Module';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function description(): string
    {
        return 'Module missing dependency.';
    }

    public function dependencies(): array
    {
        return ['non-existent-module'];
    }

    public function register(): void {}

    public function boot(): void {}

    public function navigation(): array
    {
        return [];
    }

    public function permissions(): array
    {
        return [];
    }
}
