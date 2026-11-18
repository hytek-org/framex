<?php

namespace App\FrameX\Modules\Webhooks\Jobs;

use App\FrameX\Modules\Webhooks\Models\WebhookDelivery;
use App\FrameX\Modules\Webhooks\Models\WebhookEndpoint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class DispatchWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 10;

    public function __construct(
        public WebhookEndpoint $endpoint,
        public string $event,
        public array $payload,
        public ?int $deliveryId = null
    ) {}

    public function handle(): void
    {
        $deliveryUuid = (string) Str::uuid();
        $payloadWithMetadata = array_merge([
            'event' => $this->event,
            'timestamp' => now()->toIso8601String(),
            'delivery_id' => $deliveryUuid,
        ], $this->payload);

        $jsonPayload = json_encode($payloadWithMetadata);
        $signature = hash_hmac('sha256', $jsonPayload, $this->endpoint->secret);

        $startTime = microtime(true);
        $statusCode = 0;
        $responseBody = null;

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'FrameX-Webhook-Engine/1.0',
                    'X-FrameX-Event' => $this->event,
                    'X-FrameX-Signature' => "sha256={$signature}",
                    'X-FrameX-Delivery' => $deliveryUuid,
                ])
                ->withBody($jsonPayload, 'application/json')
                ->post($this->endpoint->url);

            $statusCode = $response->status();
            $responseBody = Str::limit($response->body(), 2000);
        } catch (Throwable $e) {
            $statusCode = 500;
            $responseBody = $e->getMessage();
        }

        $durationMs = (int) round((microtime(true) - $startTime) * 1000);

        WebhookDelivery::create([
            'endpoint_id' => $this->endpoint->id,
            'team_id' => $this->endpoint->team_id,
            'event' => $this->event,
            'payload' => $payloadWithMetadata,
            'response_status' => $statusCode,
            'response_body' => $responseBody,
            'attempts' => $this->attempts(),
            'duration_ms' => $durationMs,
            'delivered_at' => now(),
        ]);
    }
}
