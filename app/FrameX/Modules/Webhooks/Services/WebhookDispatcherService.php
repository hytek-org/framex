<?php

namespace App\FrameX\Modules\Webhooks\Services;

use App\FrameX\Modules\Webhooks\Jobs\DispatchWebhookJob;
use App\FrameX\Modules\Webhooks\Models\WebhookEndpoint;
use App\Models\Team;

class WebhookDispatcherService
{
    /**
     * Dispatch an outbound webhook event to all subscribed endpoints in the team.
     */
    public function dispatch(Team $team, string $event, array $payload): int
    {
        $endpoints = WebhookEndpoint::where('team_id', $team->id)
            ->where('is_active', true)
            ->get()
            ->filter(fn (WebhookEndpoint $endpoint) => $endpoint->listensTo($event));

        foreach ($endpoints as $endpoint) {
            DispatchWebhookJob::dispatch($endpoint, $event, $payload);
        }

        return $endpoints->count();
    }
}
