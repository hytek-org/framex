<?php

namespace App\FrameX\Modules\Webhooks\Controllers;

use App\FrameX\Modules\Webhooks\Jobs\DispatchWebhookJob;
use App\FrameX\Modules\Webhooks\Models\WebhookEndpoint;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WebhookController extends Controller
{
    protected function getTeam(Request $request): Team
    {
        $slug = $request->route('current_team');
        if ($slug) {
            $team = Team::where('slug', $slug)->first();
            if ($team) {
                return $team;
            }
        }

        return Auth::user()->currentTeam;
    }

    /**
     * Display list of webhook endpoints and recent deliveries.
     */
    public function index(Request $request): Response
    {
        $team = $this->getTeam($request);

        $endpoints = WebhookEndpoint::where('team_id', $team->id)
            ->withCount('deliveries')
            ->latest()
            ->get();

        $recentDeliveries = $team->webhookDeliveries()
            ->with('endpoint:id,name,url')
            ->latest()
            ->limit(15)
            ->get();

        return Inertia::render('manage/webhooks/index', [
            'endpoints' => $endpoints,
            'recentDeliveries' => $recentDeliveries,
            'availableEvents' => [
                'content.published' => 'When a post, article, or page is published',
                'content.archived' => 'When content is archived',
                'form.submitted' => 'When a new dynamic form response is captured',
                'member.invited' => 'When a new team member is invited',
                'media.uploaded' => 'When a new asset is uploaded to Media Studio',
            ],
        ]);
    }

    /**
     * Store newly created webhook endpoint.
     */
    public function store(Request $request): RedirectResponse
    {
        $team = $this->getTeam($request);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'url' => 'required|url',
            'events' => 'required|array|min:1',
            'events.*' => 'string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $endpoint = WebhookEndpoint::create([
            'team_id' => $team->id,
            'name' => $validated['name'] ?? null,
            'url' => $validated['url'],
            'secret' => WebhookEndpoint::generateSecret(),
            'events' => $validated['events'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect("/{$team->slug}/webhooks")->with('success', 'Webhook endpoint registered successfully.');
    }

    /**
     * Update an existing webhook endpoint.
     */
    public function update(Request $request, string $current_team, WebhookEndpoint $endpoint): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($endpoint->team_id === $team->id, 403);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'url' => 'required|url',
            'events' => 'required|array|min:1',
            'events.*' => 'string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $endpoint->update([
            'name' => $validated['name'] ?? $endpoint->name,
            'url' => $validated['url'],
            'events' => $validated['events'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect("/{$team->slug}/webhooks")->with('success', 'Webhook endpoint updated successfully.');
    }

    /**
     * Delete a webhook endpoint.
     */
    public function destroy(Request $request, string $current_team, WebhookEndpoint $endpoint): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($endpoint->team_id === $team->id, 403);

        $endpoint->delete();

        return redirect("/{$team->slug}/webhooks")->with('success', 'Webhook endpoint deleted successfully.');
    }

    /**
     * Trigger a test ping event delivery.
     */
    public function ping(Request $request, string $current_team, WebhookEndpoint $endpoint): JsonResponse|RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($endpoint->team_id === $team->id, 403);

        DispatchWebhookJob::dispatchSync($endpoint, 'ping', [
            'message' => 'Test ping from FrameX Webhook Engine',
            'team' => $team->name,
            'pinged_at' => now()->toIso8601String(),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Ping event dispatched successfully.',
            ]);
        }

        return back()->with('success', 'Ping event dispatched successfully.');
    }
}
