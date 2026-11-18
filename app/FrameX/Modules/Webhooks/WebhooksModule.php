<?php

namespace App\FrameX\Modules\Webhooks;

use App\FrameX\Core\Contracts\ModuleInterface;
use App\FrameX\Modules\Webhooks\Services\WebhookDispatcherService;

class WebhooksModule implements ModuleInterface
{
    public function id(): string
    {
        return 'webhooks';
    }

    public function name(): string
    {
        return 'Webhooks Engine';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function description(): string
    {
        return 'Outbound webhooks delivery pipeline with HMAC-SHA256 signatures, retry backoff, and delivery logs.';
    }

    public function dependencies(): array
    {
        return [];
    }

    public function navigation(): array
    {
        return [
            [
                'label' => 'Webhooks',
                'route' => 'webhooks.index',
                'icon' => 'Webhook',
                'section' => 'developer',
                'order' => 30,
            ],
        ];
    }

    public function permissions(): array
    {
        return [
            'webhooks.view',
            'webhooks.manage',
        ];
    }

    public function settingsSchema(): array
    {
        return [
            'timeout_seconds' => [
                'type' => 'integer',
                'default' => 10,
            ],
            'max_retries' => [
                'type' => 'integer',
                'default' => 3,
            ],
        ];
    }

    public function register(): void
    {
        app()->singleton(WebhookDispatcherService::class);
    }

    public function boot(): void
    {
        // Module booted
    }
}
