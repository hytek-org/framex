<?php

namespace App\Http\Controllers;

use App\Enums\TeamRole;
use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\Media;
use App\Models\Team;
use App\Models\TeamInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, Team $current_team): Response
    {
        $current_team->loadCount(['members', 'invitations', 'files']);

        $pendingInvitations = TeamInvitation::query()
            ->where('email', $request->user()->email)
            ->whereNull('accepted_at')
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->with(['team', 'inviter'])
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'email' => $invitation->email,
                'role' => $invitation->role instanceof TeamRole ? $invitation->role->value : $invitation->role,
                'inviterName' => $invitation->inviter?->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        // FrameX Content Studio Telemetry & Analytics
        $totalPublished = Content::where('team_id', $current_team->id)
            ->where('status', ContentStatus::Published->value)
            ->count();

        $draftOrReview = Content::where('team_id', $current_team->id)
            ->whereIn('status', [ContentStatus::Draft->value, ContentStatus::InReview->value])
            ->count();

        $scheduledReleases = Content::where('team_id', $current_team->id)
            ->where('status', ContentStatus::Scheduled->value)
            ->count();

        $totalMedia = Media::where('team_id', $current_team->id)->count();
        $mediaStorageBytes = (int) Media::where('team_id', $current_team->id)->sum('size');

        $mediaStorageFormatted = match (true) {
            $mediaStorageBytes >= 1024 * 1024 * 1024 => number_format($mediaStorageBytes / (1024 * 1024 * 1024), 2).' GB',
            $mediaStorageBytes >= 1024 * 1024 => number_format($mediaStorageBytes / (1024 * 1024), 1).' MB',
            $mediaStorageBytes >= 1024 => number_format($mediaStorageBytes / 1024, 0).' KB',
            default => $mediaStorageBytes.' B',
        };

        $upcomingReleases = Content::where('team_id', $current_team->id)
            ->where('status', ContentStatus::Scheduled->value)
            ->with('contentType:id,name,slug')
            ->orderBy('scheduled_for')
            ->limit(4)
            ->get(['id', 'title', 'slug', 'content_type_id', 'status', 'scheduled_for'])
            ->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'slug' => $item->slug,
                'contentType' => $item->contentType ? ['name' => $item->contentType->name, 'slug' => $item->contentType->slug] : null,
                'scheduled_for' => $item->scheduled_for?->diffForHumans() ?? 'Scheduled',
                'scheduled_at' => $item->scheduled_for?->toIso8601String(),
            ]);

        $recentContent = Content::where('team_id', $current_team->id)
            ->with(['contentType:id,name,slug', 'author:id,name'])
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'slug', 'content_type_id', 'author_id', 'status', 'updated_at'])
            ->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'slug' => $item->slug,
                'status' => $item->status,
                'contentType' => $item->contentType ? ['name' => $item->contentType->name] : null,
                'author' => $item->author ? ['name' => $item->author->name] : null,
                'updated_at' => $item->updated_at?->diffForHumans(),
            ]);

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
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
            'contentStudio' => [
                'totalPublished' => $totalPublished,
                'draftOrReview' => $draftOrReview,
                'scheduledReleases' => $scheduledReleases,
                'totalMedia' => $totalMedia,
                'mediaStorageBytes' => $mediaStorageBytes,
                'mediaStorageFormatted' => $mediaStorageFormatted,
                'upcomingReleases' => $upcomingReleases,
                'recentContent' => $recentContent,
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
