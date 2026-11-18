<?php

namespace App\FrameX\Modules\Forms;

use App\FrameX\Core\Contracts\ModuleInterface;
use App\FrameX\Modules\Forms\Services\FormService;

class FormsModule implements ModuleInterface
{
    public function id(): string
    {
        return 'forms';
    }

    public function name(): string
    {
        return 'Forms Engine';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function description(): string
    {
        return 'Embeddable dynamic form builder, validation pipeline, and submission management.';
    }

    public function dependencies(): array
    {
        return [];
    }

    public function navigation(): array
    {
        return [
            [
                'label' => 'Forms Builder',
                'route' => 'forms.index',
                'icon' => 'ClipboardList',
                'section' => 'business',
                'order' => 25,
            ],
        ];
    }

    public function permissions(): array
    {
        return [
            'forms.view',
            'forms.create',
            'forms.update',
            'forms.delete',
            'forms.export',
        ];
    }

    public function settingsSchema(): array
    {
        return [
            'spam_protection' => [
                'type' => 'boolean',
                'default' => true,
            ],
        ];
    }

    public function register(): void
    {
        app()->singleton(FormService::class);
    }

    public function boot(): void
    {
        // Module booted
    }
}
