<?php

namespace App\FrameX\Modules\Analytics\Controllers;

use App\FrameX\Modules\Analytics\Models\ContentView;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Carbon\CarbonInterface;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsTelemetryController extends Controller
{
    /**
     * Public telemetry beacon for published content.
     */
    public function recordView(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content_id' => 'required|integer|exists:contents,id',
            'referrer' => 'nullable|string|max:500',
        ]);

        // Only track published content.
        $content = Content::published()
            ->findOrFail($validated['content_id']);

        $ipHash = hash(
            'sha256',
            ($request->ip() ?? '127.0.0.1') . config('app.key')
        );

        $today = now()->toDateString();

        $view = ContentView::query()
            ->where('content_id', $content->id)
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
     * Workspace analytics dashboard.
     *
     * Real workspace telemetry and illustrative demo data
     * are maintained separately.
     */
    public function overview(Request $request): JsonResponse|Response
    {
        $user = $request->user();

        abort_unless($user, 401);

        $team = $this->resolveTeam($request);

        // Last 30 calendar days, including today.
        $endDate = now()->startOfDay();
        $startDate = $endDate->copy()->subDays(29);

        // All-time workspace reads.
        $totalViews = ContentView::query()
            ->where('team_id', $team->id)
            ->count();

        // Actual daily workspace telemetry.
        $dailyCounts = ContentView::query()
            ->where('team_id', $team->id)
            ->whereBetween('view_date', [
                $startDate->toDateString(),
                $endDate->toDateString(),
            ])
            ->selectRaw('view_date, COUNT(*) as view_count')
            ->groupBy('view_date')
            ->pluck('view_count', 'view_date');

        // Generate all 30 calendar dates.
        $dailyViews = $this->buildDailyViews(
            $startDate,
            $endDate,
            $dailyCounts
        );

        $periodViews = (int) $dailyViews->sum('count');

        $activeDays = $dailyViews
            ->where('count', '>', 0)
            ->count();

        $averageDailyViews = round(
            $periodViews / max($dailyViews->count(), 1),
            1
        );

        // Top-performing actual content.
        $topContent = $this->getTopContent($team);

        // Independent, non-persistent demonstration dataset.
        $demoAnalytics = $this->buildDemoAnalytics(
            $startDate,
            $endDate
        );

        $data = [
            // Actual workspace analytics.
            'totalViews' => $totalViews,
            'periodViews' => $periodViews,
            'activeDays' => $activeDays,
            'averageDailyViews' => $averageDailyViews,
            'dailyViews' => $dailyViews,
            'topContent' => $topContent,

            // Illustrative demonstration analytics.
            'demoAnalytics' => $demoAnalytics,
        ];

        if ($request->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render(
            'manage/analytics/index',
            $data
        );
    }

    /**
     * Resolve the current team and verify membership.
     */
    private function resolveTeam(Request $request): Team
    {
        $user = $request->user();

        $routeTeam = $request->route('current_team');

        $query = Team::query()
            ->whereHas('members', function (Builder $builder) use ($user) {
                $builder->whereKey($user->getKey());
            });

        if ($routeTeam instanceof Team) {
            $query->whereKey($routeTeam->getKey());
        } elseif (
            is_string($routeTeam) &&
            $routeTeam !== ''
        ) {
            $query->where('slug', $routeTeam);
        } else {
            $currentTeamId = $user->currentTeam?->getKey();

            abort_unless($currentTeamId, 404);

            $query->whereKey($currentTeamId);
        }

        return $query->firstOrFail();
    }

    /**
     * Build the actual workspace daily analytics collection.
     *
     * Missing dates are filled with zero.
     *
     * @param Collection<string, int|string> $dailyCounts
     * @return Collection<int, array{view_date: string, count: int}>
     */
    private function buildDailyViews(
        CarbonInterface $startDate,
        CarbonInterface $endDate,
        Collection $dailyCounts
    ): Collection {
        return collect(
            CarbonPeriod::create(
                $startDate->toDateString(),
                $endDate->toDateString()
            )
        )
            ->map(function (CarbonInterface $date) use ($dailyCounts) {
                $dateString = $date->toDateString();

                return [
                    'view_date' => $dateString,
                    'count' => (int) $dailyCounts->get($dateString, 0),
                ];
            })
            ->values();
    }

    /**
     * Get the five highest-performing content items.
     *
     * @return Collection<int, array{
     *     id: int,
     *     title: string,
     *     slug: string,
     *     views_count: int
     * }>
     */
    private function getTopContent(Team $team): Collection
    {
        return ContentView::query()
            ->where('content_views.team_id', $team->id)
            ->join(
                'contents',
                'contents.id',
                '=',
                'content_views.content_id'
            )
            ->whereNull('contents.deleted_at')
            ->select([
                'contents.id',
                'contents.title',
                'contents.slug',
            ])
            ->selectRaw(
                'COUNT(content_views.id) as views_count'
            )
            ->groupBy(
                'contents.id',
                'contents.title',
                'contents.slug'
            )
            ->orderByDesc('views_count')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'id' => (int) $item->id,
                'title' => $item->title,
                'slug' => $item->slug,
                'views_count' => (int) $item->views_count,
            ])
            ->values();
    }

    /**
     * Generate illustrative FrameX demonstration analytics.
     *
     * These values are never saved to the database.
     */
    private function buildDemoAnalytics(
        CarbonInterface $startDate,
        CarbonInterface $endDate
    ): array {
        $sampleCounts = [
            112, 126, 119, 138, 145,
            132, 158, 167, 154, 181,
            176, 192, 205, 198, 217,
            223, 211, 236, 249, 241,
            258, 266, 253, 279, 291,
            284, 306, 318, 309, 337,
        ];

        $dailyViews = collect(
            CarbonPeriod::create(
                $startDate->toDateString(),
                $endDate->toDateString()
            )
        )
            ->values()
            ->map(fn (CarbonInterface $date, int $index) => [
                'view_date' => $date->toDateString(),
                'count' => $sampleCounts[$index] ?? 0,
            ])
            ->values();

        $periodViews = (int) $dailyViews->sum('count');

        return [
            'isDemo' => true,

            'totalViews' => 28640,

            'periodViews' => $periodViews,

            'activeDays' => $dailyViews
                ->where('count', '>', 0)
                ->count(),

            'averageDailyViews' => round(
                $periodViews / max($dailyViews->count(), 1),
                1
            ),

            'dailyViews' => $dailyViews,

            'topContent' => [
                [
                    'title' => 'Introduction to FrameX',
                    'views_count' => 4820,
                ],
                [
                    'title' => 'Building a Modular Laravel Platform',
                    'views_count' => 3610,
                ],
                [
                    'title' => 'Content Studio: Revision History',
                    'views_count' => 2940,
                ],
                [
                    'title' => 'Multi-Tenant Workspaces',
                    'views_count' => 2275,
                ],
                [
                    'title' => 'Privacy-Friendly Analytics',
                    'views_count' => 1940,
                ],
            ],
        ];
    }
}
