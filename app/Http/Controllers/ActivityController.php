<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function __invoke(Request $request, Team $current_team): Response
    {
        return Inertia::render('activity/index', [
            'activities' => $current_team->activityLogs()
                ->with('user:id,name,email')
                ->latest()
                ->paginate(15)
                ->through(fn ($activity) => [
                    'id' => $activity->id,
                    'event' => $activity->event,
                    'description' => $activity->description,
                    'metadata' => $activity->metadata,
                    'user' => $activity->user?->only(['id', 'name', 'email']),
                    'created_at' => $activity->created_at->toFormattedDateString(),
                ]),
        ]);
    }
}
