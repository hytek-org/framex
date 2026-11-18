<?php

use App\FrameX\Modules\Webhooks\Jobs\DispatchWebhookJob;
use App\FrameX\Modules\Webhooks\Models\WebhookDelivery;
use App\FrameX\Modules\Webhooks\Models\WebhookEndpoint;
use App\FrameX\Modules\Webhooks\Services\WebhookDispatcherService;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

test('user can register an outbound webhook endpoint', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this->actingAs($user)->post("/{$team->slug}/webhooks", [
        'name' => 'Slack Notifications',
        'url' => 'https://hooks.slack.com/services/T00/B00/X00',
        'events' => ['content.published', 'form.submitted'],
        'description' => 'Publishing notifications to Slack channel',
    ]);

    $response->assertRedirect("/{$team->slug}/webhooks");

    $this->assertDatabaseHas('webhook_endpoints', [
        'team_id' => $team->id,
        'name' => 'Slack Notifications',
        'url' => 'https://hooks.slack.com/services/T00/B00/X00',
    ]);

    $endpoint = WebhookEndpoint::where('name', 'Slack Notifications')->first();
    expect($endpoint->secret)->toStartWith('whsec_')
        ->and($endpoint->listensTo('content.published'))->toBeTrue()
        ->and($endpoint->listensTo('member.invited'))->toBeFalse();
});

test('webhook dispatcher service queues jobs for subscribed endpoints', function () {
    Queue::fake();

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $endpoint1 = WebhookEndpoint::factory()->create([
        'team_id' => $team->id,
        'events' => ['content.published'],
        'is_active' => true,
    ]);

    $endpoint2 = WebhookEndpoint::factory()->create([
        'team_id' => $team->id,
        'events' => ['form.submitted'], // Not listening to content.published
        'is_active' => true,
    ]);

    $service = new WebhookDispatcherService;
    $count = $service->dispatch($team, 'content.published', [
        'post_id' => 42,
        'title' => 'Launched FrameX v1',
    ]);

    expect($count)->toBe(1);

    Queue::assertPushed(DispatchWebhookJob::class, function ($job) use ($endpoint1) {
        return $job->endpoint->id === $endpoint1->id && $job->event === 'content.published';
    });

    Queue::assertNotPushed(DispatchWebhookJob::class, function ($job) use ($endpoint2) {
        return $job->endpoint->id === $endpoint2->id;
    });
});

test('dispatch webhook job sends signed hmac payload and records delivery log', function () {
    Http::fake([
        'https://external-api.test/webhook' => Http::response(['received' => true], 200),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $endpoint = WebhookEndpoint::factory()->create([
        'team_id' => $team->id,
        'url' => 'https://external-api.test/webhook',
        'secret' => 'whsec_testsecret1234567890',
        'events' => ['*'],
    ]);

    $job = new DispatchWebhookJob($endpoint, 'content.published', [
        'title' => 'Deep Dive Architecture',
    ]);

    $job->handle();

    Http::assertSent(function ($request) use ($endpoint) {
        $hasEvent = $request->header('X-FrameX-Event')[0] === 'content.published';
        $signatureHeader = $request->header('X-FrameX-Signature')[0] ?? '';
        $expectedSignature = 'sha256='.hash_hmac('sha256', $request->body(), $endpoint->secret);

        return $hasEvent && $signatureHeader === $expectedSignature;
    });

    $this->assertDatabaseHas('webhook_deliveries', [
        'endpoint_id' => $endpoint->id,
        'team_id' => $team->id,
        'event' => 'content.published',
        'response_status' => 200,
    ]);

    $delivery = WebhookDelivery::where('endpoint_id', $endpoint->id)->first();
    expect($delivery->isSuccess())->toBeTrue()
        ->and($delivery->duration_ms)->not->toBeNull();
});

test('user can trigger test ping webhook delivery', function () {
    Http::fake([
        'https://external-api.test/webhook' => Http::response('OK', 200),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $endpoint = WebhookEndpoint::factory()->create([
        'team_id' => $team->id,
        'url' => 'https://external-api.test/webhook',
    ]);

    $response = $this->actingAs($user)->postJson("/{$team->slug}/webhooks/{$endpoint->id}/ping");

    $response->assertOk();
    $response->assertJson([
        'success' => true,
    ]);

    $this->assertDatabaseHas('webhook_deliveries', [
        'endpoint_id' => $endpoint->id,
        'event' => 'ping',
        'response_status' => 200,
    ]);
});
