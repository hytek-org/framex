import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Eye,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    BookOpen,
} from 'lucide-react';
import React from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { MetricCard } from '@/components/shared/metric-card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Props {
    totalViews: number;
    dailyViews: Array<{ view_date: string; count: number }>;
    topContent: Array<{
        id: number;
        title: string;
        slug: string;
        views_count: number;
    }>;
}

export default function AnalyticsIndex({ totalViews, dailyViews, topContent }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    return (
        <>
            <Head title="Content & Telemetry Analytics" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Telemetry & Reader Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Privacy-friendly, cookieless reading telemetry and engagement insights.
                    </p>
                </div>

                {/* Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                        label="Total Content Views"
                        value={totalViews.toLocaleString()}
                        change="All-time verified reads"
                        tone="positive"
                    />
                    <MetricCard
                        label="Active Unique Days"
                        value={dailyViews.length.toString()}
                        change="With recorded activity"
                        tone="neutral"
                    />
                    <MetricCard
                        label="Top Performing Asset"
                        value={topContent[0]?.views_count?.toString() || '0'}
                        change={topContent[0]?.title || 'No data yet'}
                        tone="positive"
                    />
                </div>

                {/* Daily Views Area Chart */}
                <div className="rounded-2xl border bg-card p-5">
                    <h2 className="text-sm font-semibold text-foreground mb-4">
                        30-Day Reader Engagement Trend
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={dailyViews}
                                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="oklch(0.55 0.22 275)" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="oklch(0.55 0.22 275)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.90 0 0 / 0.3)" />
                                <XAxis dataKey="view_date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="oklch(0.55 0.22 275)"
                                    strokeWidth={2}
                                    fill="url(#viewsGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Viewed Content Table */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Top Performing Content</h2>
                    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Content Title</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead className="text-right">Total Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topContent.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                                            No content reads recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    topContent.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/40">
                                            <TableCell className="font-semibold text-foreground text-sm">
                                                <Link
                                                    href={`/${teamSlug}/content/${item.slug}/edit`}
                                                    className="hover:underline flex items-center gap-1.5"
                                                >
                                                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                                                    {item.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                /{item.slug}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                {item.views_count.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}

AnalyticsIndex.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Analytics', href: `/${teamSlug}/analytics` },
        ],
    };
};
