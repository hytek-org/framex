<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, Team $current_team): Response
    {
        $current_team->loadCount(['members', 'invitations', 'files']);

        return Inertia::render('dashboard', [
            'metrics' => [
                ['label' => 'Revenue', 'value' => '$24.8K', 'change' => '+12.4%', 'tone' => 'positive'],
                ['label' => 'Active users', 'value' => '2,418', 'change' => '+8.1%', 'tone' => 'positive'],
                ['label' => 'Conversion', 'value' => '7.2%', 'change' => '+1.8%', 'tone' => 'positive'],
                ['label' => 'Churn risk', 'value' => '1.9%', 'change' => '-0.6%', 'tone' => 'positive'],
            ],
            'chart' => [
                ['month' => 'Jan', 'revenue' => 12000, 'users' => 820],
                ['month' => 'Feb', 'revenue' => 14800, 'users' => 1040],
                ['month' => 'Mar', 'revenue' => 17100, 'users' => 1280],
                ['month' => 'Apr', 'revenue' => 19300, 'users' => 1620],
                ['month' => 'May', 'revenue' => 24800, 'users' => 2418],
            ],
            'teamHealth' => [
                'members' => $current_team->members_count,
                'pendingInvites' => $current_team->invitations_count,
                'files' => $current_team->files_count,
                'plan' => $request->user()->subscribed('default') ? 'Pro' : 'Free',
            ],
            'activity' => $current_team->activityLogs()
                ->with('user:id,name,email')
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn ($activity) => [
                    'id' => $activity->id,
                    'event' => $activity->event,
                    'description' => $activity->description,
                    'user' => $activity->user?->only(['id', 'name', 'email']),
                    'created_at' => $activity->created_at->diffForHumans(),
                ]),
        ]);
    }
}
