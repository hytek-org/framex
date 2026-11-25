import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    BookOpen,
    CalendarDays,
    Eye,
    FileText,
    Layers,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DailyView {
    view_date: string;
    count: number;
}

interface ContentItem {
    id: number;
    title: string;
    slug: string;
    views_count: number;
}

interface DemoContentItem {
    title: string;
    views_count: number;
}

interface DemoAnalytics {
    isDemo: boolean;
    totalViews: number;
    periodViews: number;
    activeDays: number;
    averageDailyViews: number;
    dailyViews: DailyView[];
    topContent: DemoContentItem[];
}

interface Props {
    totalViews: number;
    periodViews: number;
    activeDays: number;
    averageDailyViews: number;
    dailyViews: DailyView[];
    topContent: ContentItem[];
    demoAnalytics: DemoAnalytics;
}

interface NormalizedContentItem {
    key: string;
    title: string;
    slug?: string;
    views_count: number;
}

const numberFormat = (value: number) => value.toLocaleString();

const formatShortDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });

const formatFullDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

/*
|--------------------------------------------------------------------------
| Custom Recharts Tooltip
|--------------------------------------------------------------------------
*/

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    const count = Number(payload[0].value || 0);

    return (
        <div className="rounded-xl border border-border/80 bg-popover/95 px-3.5 py-2.5 text-xs shadow-lg backdrop-blur-md">
            <p className="font-medium text-muted-foreground">
                {formatFullDate(label)}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary ring-4 ring-primary/15" />
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {numberFormat(count)}
                </span>
                <span className="text-muted-foreground">
                    {count === 1 ? 'read' : 'reads'}
                </span>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| KPI Metric Card
|--------------------------------------------------------------------------
*/

function MetricCard({
    label,
    value,
    sublabel,
    icon,
    badge,
}: {
    label: string;
    value: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: string;
}) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-border/75 bg-linear-to-b from-card to-muted/20 p-5 shadow-xs transition-all hover:border-border">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                    {label}
                </span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/80 text-muted-foreground shadow-2xs transition-colors group-hover:border-primary/25 group-hover:text-primary">
                    {icon}
                </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
                    {value}
                </span>
                {badge && (
                    <Badge
                        variant="secondary"
                        className="rounded-md border border-border/50 px-1.5 py-0 font-mono text-[10px] font-medium"
                    >
                        {badge}
                    </Badge>
                )}
            </div>

            <p className="mt-2 truncate text-xs text-muted-foreground">
                {sublabel}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Engagement Area Chart
|--------------------------------------------------------------------------
*/

function EngagementAreaChart({
    data,
    gradientId,
}: {
    data: DailyView[];
    gradientId: string;
}) {
    return (
        <div className="h-77.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 14, right: 12, left: -16, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="var(--primary)"
                                stopOpacity={0.22}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--primary)"
                                stopOpacity={0.0}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--border)"
                        strokeOpacity={0.65}
                    />

                    <XAxis
                        dataKey="view_date"
                        tickFormatter={formatShortDate}
                        tick={{
                            fontSize: 11,
                            fill: 'var(--muted-foreground)',
                        }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={28}
                        dy={6}
                    />

                    <YAxis
                        allowDecimals={false}
                        tick={{
                            fontSize: 11,
                            fill: 'var(--muted-foreground)',
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={42}
                    />

                    <Tooltip
                        content={<ChartTooltip />}
                        cursor={{
                            stroke: 'var(--border)',
                            strokeWidth: 1,
                            strokeDasharray: '4 4',
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        activeDot={{
                            r: 5,
                            fill: 'var(--primary)',
                            stroke: 'var(--background)',
                            strokeWidth: 2,
                        }}
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Ranked Content Leaderboard
|--------------------------------------------------------------------------
*/

function ContentLeaderboard({
    items,
    totalPeriodViews,
    teamSlug,
    isDemo = false,
}: {
    items: NormalizedContentItem[];
    totalPeriodViews: number;
    teamSlug: string;
    isDemo?: boolean;
}) {
    const maxViews = Math.max(...items.map((item) => item.views_count), 1);

    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-xl border-border/80 bg-card shadow-xs">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60 bg-muted/25 px-5 py-4">
                <div>
                    <CardTitle className="text-sm font-semibold">
                        Top Performing Content
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                        {isDemo
                            ? 'Sample publication leaderboard'
                            : 'Ranked by deduplicated reads'}
                    </CardDescription>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground shadow-2xs">
                    <BookOpen className="h-4 w-4" />
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-5">
                {items.length === 0 ? (
                    <div className="flex h-full min-h-62.5ex-col items-center justify-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-muted/60 text-muted-foreground shadow-2xs">
                            <FileText className="h-5 w-5" />
                        </div>
                        <p className="mt-3.5 text-sm font-medium text-foreground">
                            No ranked content yet
                        </p>
                        <p className="mt-1 max-w-57.5 text-xs leading-relaxed text-muted-foreground">
                            Publish an article or guide to start tracking
                            individual page performance.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item, index) => {
                            const share =
                                totalPeriodViews > 0
                                    ? Math.round(
                                          (item.views_count /
                                              totalPeriodViews) *
                                              100
                                      )
                                    : 0;
                            const barWidth =
                                (item.views_count / maxViews) * 100;

                            return (
                                <div
                                    key={item.key}
                                    className="group rounded-lg border border-transparent p-2.5 transition-colors hover:border-border/60 hover:bg-muted/30"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-2.5">
                                            <span
                                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold ${
                                                    index === 0
                                                        ? 'border border-primary/25 bg-primary/10 text-primary'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                {item.slug && !isDemo ? (
                                                    <Link
                                                        href={`/${teamSlug}/content/${item.slug}/edit`}
                                                        className="inline-flex items-center gap-1 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary"
                                                    >
                                                        <span className="line-clamp-1">
                                                            {item.title}
                                                        </span>
                                                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                                                    </Link>
                                                ) : (
                                                    <p className="line-clamp-1 text-sm font-medium leading-snug text-foreground">
                                                        {item.title}
                                                    </p>
                                                )}

                                                {item.slug && (
                                                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                                                        /{item.slug}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                                                {numberFormat(item.views_count)}
                                            </span>
                                            {share > 0 && (
                                                <span className="ml-1.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                                                    ({share}%)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2.5 ml-7.5 h-1.5 overflow-hidden rounded-full bg-muted/80">
                                        <div
                                            className="h-full rounded-full bg-primary/85 transition-all duration-500"
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t border-border/60 bg-muted/15 px-5 py-3 text-[11px] text-muted-foreground">
                {isDemo
                    ? 'Illustrative figures for template preview'
                    : 'Click any item to open in the content editor'}
            </CardFooter>
        </Card>
    );
}

/*
|--------------------------------------------------------------------------
| Main Analytics Dashboard View
|--------------------------------------------------------------------------
*/

export default function AnalyticsIndex({
    totalViews,
    periodViews,
    activeDays,
    averageDailyViews,
    dailyViews,
    topContent,
    demoAnalytics,
}: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const hasWorkspaceData = totalViews > 0;
    const hasPeriodData = periodViews > 0;

    // Default to live telemetry; let users switch cleanly to demo preview when enabled
    const [activeTab, setActiveTab] = useState<'live' | 'demo'>('live');

    const peakDay = useMemo(() => {
        if (!dailyViews?.length) return null;
        return dailyViews.reduce(
            (max, cur) => (cur.count > max.count ? cur : max),
            dailyViews[0]
        );
    }, [dailyViews]);

    const demoPeakDay = useMemo(() => {
        if (!demoAnalytics?.dailyViews?.length) return null;
        return demoAnalytics.dailyViews.reduce(
            (max, cur) => (cur.count > max.count ? cur : max),
            demoAnalytics.dailyViews[0]
        );
    }, [demoAnalytics]);

    const normalizedLiveContent: NormalizedContentItem[] = useMemo(
        () =>
            topContent.map((item) => ({
                key: String(item.id),
                title: item.title,
                slug: item.slug,
                views_count: item.views_count,
            })),
        [topContent]
    );

    const normalizedDemoContent: NormalizedContentItem[] = useMemo(
        () =>
            demoAnalytics.topContent.map((item, idx) => ({
                key: `demo-${idx}`,
                title: item.title,
                views_count: item.views_count,
            })),
        [demoAnalytics]
    );

    const renderTelemetryPanel = ({
        isDemo,
        metrics,
        series,
        peak,
        leaderboardItems,
        gradientId,
    }: {
        isDemo: boolean;
        metrics: {
            total: number;
            period: number;
            days: number;
            average: number;
        };
        series: DailyView[];
        peak: DailyView | null;
        leaderboardItems: NormalizedContentItem[];
        gradientId: string;
    }) => {
        const showChart = isDemo ? series.length > 0 : hasPeriodData;

        return (
            <div className="space-y-6">
                {isDemo && (
                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-primary/25 bg-linear-to-r from-primary/6 via-primary/3 to-transparent px-4 py-3.5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground">
                                    Interactive Demo Dataset Active
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Previewing simulated 30-day readership
                                    telemetry. Switch back to Live Workspace at
                                    any time.
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className="w-fit border-primary/30 bg-background/80 font-mono text-[10px] font-semibold text-primary"
                        >
                            SAMPLE PREVIEW
                        </Badge>
                    </div>
                )}

                {/* KPI Strip */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="All-Time Reads"
                        value={numberFormat(metrics.total)}
                        sublabel="Unique visitor reads deduplicated daily"
                        icon={<Eye className="h-4 w-4" />}
                    />

                    <MetricCard
                        label="30-Day Volume"
                        value={numberFormat(metrics.period)}
                        sublabel="Total recorded reads in rolling window"
                        badge="30D"
                        icon={<Activity className="h-4 w-4" />}
                    />

                    <MetricCard
                        label="Active Read Days"
                        value={`${metrics.days} / 30`}
                        sublabel={`${Math.round((metrics.days / 30) * 100)}% consistency across window`}
                        icon={<CalendarDays className="h-4 w-4" />}
                    />

                    <MetricCard
                        label="Daily Average"
                        value={numberFormat(metrics.average)}
                        sublabel={
                            peak && peak.count > 0
                                ? `Peak: ${numberFormat(peak.count)} on ${formatShortDate(peak.view_date)}`
                                : 'Mean reads per calendar day'
                        }
                        icon={<TrendingUp className="h-4 w-4" />}
                    />
                </div>

                {/* Main Split: Chart + Leaderboard */}
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,1fr)]">
                    <Card className="flex flex-col overflow-hidden rounded-xl border-border/80 bg-card shadow-xs">
                        <CardHeader className="flex-col justify-between gap-2 space-y-0 border-b border-border/60 bg-muted/25 px-5 py-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    Reader Engagement Velocity
                                </CardTitle>
                                <CardDescription className="mt-0.5 text-xs">
                                    Daily deduplicated reads across the trailing
                                    30-day window
                                </CardDescription>
                            </div>

                            <div className="flex items-center gap-3">
                                {peak && peak.count > 0 && (
                                    <span className="hidden rounded-md border border-border/60 bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground sm:inline-block">
                                        Peak:{' '}
                                        <strong className="font-semibold text-foreground">
                                            {numberFormat(peak.count)}
                                        </strong>
                                    </span>
                                )}
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    Reads
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-5 pt-6">
                            {showChart ? (
                                <EngagementAreaChart
                                    data={series}
                                    gradientId={gradientId}
                                />
                            ) : (
                                <div className="flex h-77.5 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 p-6 text-center">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground shadow-2xs">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <p className="mt-3.5 text-sm font-medium text-foreground">
                                        No reading activity in the last 30 days
                                    </p>
                                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                                        Once your published content receives
                                        traffic, daily read trends will populate
                                        here automatically.
                                    </p>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/15 px-5 py-3 text-[11px] text-muted-foreground">
                            <span>
                                Source:{' '}
                                {isDemo
                                    ? 'FrameX Synthetic Dataset'
                                    : 'ContentView Edge Telemetry'}
                            </span>
                            <span className="font-mono">UTC Normalized</span>
                        </CardFooter>
                    </Card>

                    <ContentLeaderboard
                        items={leaderboardItems}
                        totalPeriodViews={metrics.total}
                        teamSlug={teamSlug}
                        isDemo={isDemo}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Analytics & Telemetry" />

            <div className=" space-y-8 p-6 lg:p-8">
                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-linear-to-b from-primary/15 to-primary/5 text-primary shadow-2xs">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                    Analytics &amp; Telemetry
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 border border-border/60 bg-muted/60 font-mono text-[11px] font-medium"
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            hasWorkspaceData
                                                ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                                                : 'bg-amber-500'
                                        }`}
                                    />
                                    {hasWorkspaceData
                                        ? 'Live Telemetry'
                                        : 'Awaiting Traffic'}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Privacy-first readership metrics, engagement
                                velocity, and top-performing publications across
                                your workspace.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-card px-3 text-xs font-medium text-muted-foreground shadow-2xs">
                            <CalendarDays className="h-3.5 w-3.5 text-foreground/70" />
                            <span>Last 30 days</span>
                        </div>
                    </div>
                </div>

                {/* Unified Workspace / Demo Switcher */}
                {demoAnalytics.isDemo ? (
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) =>
                            setActiveTab(v as 'live' | 'demo')
                        }
                        className="space-y-6"
                    >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <TabsList className="h-9 bg-muted/60 p-1">
                                <TabsTrigger
                                    value="live"
                                    className="gap-1.5 px-3 text-xs"
                                >
                                    <Layers className="h-3.5 w-3.5" />
                                    Live Workspace
                                </TabsTrigger>
                                <TabsTrigger
                                    value="demo"
                                    className="gap-1.5 px-3 text-xs"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    Demo Preview
                                </TabsTrigger>
                            </TabsList>

                            <p className="text-xs text-muted-foreground">
                                {activeTab === 'live'
                                    ? 'Showing real deduplicated reads recorded on your workspace.'
                                    : 'Showing simulated metrics to preview full dashboard density.'}
                            </p>
                        </div>

                        <TabsContent value="live" className="mt-0">
                            {renderTelemetryPanel({
                                isDemo: false,
                                metrics: {
                                    total: totalViews,
                                    period: periodViews,
                                    days: activeDays,
                                    average: averageDailyViews,
                                },
                                series: dailyViews,
                                peak: peakDay,
                                leaderboardItems: normalizedLiveContent,
                                gradientId: 'workspaceViewsGradient',
                            })}
                        </TabsContent>

                        <TabsContent value="demo" className="mt-0">
                            {renderTelemetryPanel({
                                isDemo: true,
                                metrics: {
                                    total: demoAnalytics.totalViews,
                                    period: demoAnalytics.periodViews,
                                    days: demoAnalytics.activeDays,
                                    average: demoAnalytics.averageDailyViews,
                                },
                                series: demoAnalytics.dailyViews,
                                peak: demoPeakDay,
                                leaderboardItems: normalizedDemoContent,
                                gradientId: 'demoViewsGradient',
                            })}
                        </TabsContent>
                    </Tabs>
                ) : (
                    renderTelemetryPanel({
                        isDemo: false,
                        metrics: {
                            total: totalViews,
                            period: periodViews,
                            days: activeDays,
                            average: averageDailyViews,
                        },
                        series: dailyViews,
                        peak: peakDay,
                        leaderboardItems: normalizedLiveContent,
                        gradientId: 'workspaceViewsGradient',
                    })
                )}
            </div>
        </>
    );
}

AnalyticsIndex.layout = (props: {
    currentTeam?: {
        slug?: string;
    };
}) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: `/${teamSlug}/dashboard`,
            },
            {
                title: 'Analytics',
                href: `/${teamSlug}/analytics`,
            },
        ],
    };
};