<?php

namespace App\FrameX\Modules\Analytics\Controllers;

use App\FrameX\Modules\Analytics\Models\ContentView;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsTelemetryController extends Controller
{
    /**
     * Public telemetry beacon to track content page views.
     */
    public function recordView(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content_id' => 'required|integer|exists:contents,id',
            'referrer' => 'nullable|string|max:500',
        ]);

        $content = Content::findOrFail($validated['content_id']);

        $ipHash = hash('sha256', ($request->ip() ?? '127.0.0.1').config('app.key'));
        $today = now()->toDateString();

        $view = ContentView::where('content_id', $content->id)
            ->where('ip_hash', $ipHash)
            ->whereDate('view_date', $today)
            ->first();

        if (! $view) {
            $view = ContentView::create([
                'content_id' => $content->id,
                'team_id' => $content->team_id,
                'ip_hash' => $ipHash,
                'referrer' => $validated['referrer'] ?? null,
                'view_date' => $today,
            ]);
        }

        return response()->json([
            'recorded' => true,
            'view_id' => $view->id,
        ]);
    }

    /**
     * Team analytics dashboard view.
     */
    public function overview(Request $request): JsonResponse|Response
    {
        $slug = $request->route('current_team');
        $team = $slug ? Team::where('slug', $slug)->firstOrFail() : Auth::user()->currentTeam;

        $totalViews = ContentView::where('team_id', $team->id)->count();

        $dailyViews = ContentView::where('team_id', $team->id)
            ->where('view_date', '>=', now()->subDays(30)->toDateString())
            ->selectRaw('view_date, count(*) as count')
            ->groupBy('view_date')
            ->orderBy('view_date')
            ->get();

        $topContent = ContentView::where('content_views.team_id', $team->id)
            ->join('contents', 'contents.id', '=', 'content_views.content_id')
            ->selectRaw('contents.id, contents.title, contents.slug, count(*) as views_count')
            ->groupBy('contents.id', 'contents.title', 'contents.slug')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'totalViews' => $totalViews,
                'dailyViews' => $dailyViews,
                'topContent' => $topContent,
            ]);
        }

        return Inertia::render('manage/analytics/index', [
            'totalViews' => $totalViews,
            'dailyViews' => $dailyViews,
            'topContent' => $topContent,
        ]);
    }
}
