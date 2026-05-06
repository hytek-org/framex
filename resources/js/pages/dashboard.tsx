import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    CreditCard,
    FileText,
    Users,
} from 'lucide-react';
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
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Timeline } from '@/components/shared/timeline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type Metric = {
    label: string;
    value: string;
    change: string;
    tone: 'positive' | 'negative' | 'neutral';
};

type ChartPoint = {
    month: string;
    revenue: number;
    users: number;
};

type ActivityItem = {
    id: number;
    event: string;
    description: string;
    user: { id: number; name: string; email: string } | null;
    created_at: string;
};

type TeamHealth = {
    members: number;
    pendingInvites: number;
    files: number;
    plan: string;
};

type Props = {
    metrics: Metric[];
    chart: ChartPoint[];
    teamHealth: TeamHealth;
    activity: ActivityItem[];
};

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

function CustomTooltip({ active, payload, label }: Record<string, unknown>) {
    if (!active || !payload) return null;
    const items = payload as Array<{ value: number; name: string; color: string }>;
    return (
        <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-lg">
            <p className="mb-1 font-medium text-popover-foreground">{label as string}</p>
            {items.map((entry) => (
                <p key={entry.name} className="text-muted-foreground">
                    {entry.name === 'revenue'
                        ? `Revenue: $${entry.value.toLocaleString()}`
                        : `Users: ${entry.value.toLocaleString()}`}
                </p>
            ))}
        </div>
    );
}

export default function Dashboard({
    metrics,
    chart,
    teamHealth,
    activity,
}: Props) {
    const page = usePage();
    const { auth, currentTeam } = page.props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Greeting */}
                <FadeIn>
                    <PageHeader
                        title={`${getGreeting()}, ${auth.user.name.split(' ')[0]}`}
                        description={new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    />
                </FadeIn>

                {/* Metric Cards */}
                <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.06}>
                    {metrics.map((metric) => (
                        <StaggerItem key={metric.label}>
                            <MetricCard
                                label={metric.label}
                                value={metric.value}
                                change={metric.change}
                                tone={metric.tone}
                            />
                        </StaggerItem>
                    ))}
                </StaggerChildren>

                {/* Chart */}
                <FadeIn delay={0.3}>
                    <div className="rounded-2xl border bg-card p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-foreground">
                                Revenue Overview
                            </h2>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    Revenue
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-primary/30" />
                                    Users
                                </div>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chart}
                                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="revenueGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="oklch(0.55 0.22 275)"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="oklch(0.55 0.22 275)"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="oklch(0.90 0 0 / 0.3)"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: 'oklch(0.55 0.02 265)' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: 'oklch(0.55 0.02 265)' }}
                                        tickFormatter={(v: number) =>
                                            `$${(v / 1000).toFixed(0)}K`
                                        }
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="oklch(0.55 0.22 275)"
                                        strokeWidth={2}
                                        fill="url(#revenueGradient)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="oklch(0.55 0.22 275 / 0.3)"
                                        strokeWidth={1.5}
                                        fill="none"
                                        strokeDasharray="4 4"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </FadeIn>

                {/* Two-column grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Recent Activity */}
                    <FadeIn delay={0.4}>
                        <div className="rounded-2xl border bg-card p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-foreground">
                                    Recent Activity
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground"
                                    asChild
                                >
                                    <a href={currentTeam ? `/${currentTeam.slug}/activity` : '#'}>
                                        View all
                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </a>
                                </Button>
                            </div>
                            {activity.length > 0 ? (
                                <Timeline items={activity} />
                            ) : (
                                <div className="py-8 text-center">
                                    <Activity className="mx-auto h-8 w-8 text-muted-foreground/40" />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        No activity yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </FadeIn>

                    {/* Team Health */}
                    <FadeIn delay={0.5}>
                        <div className="rounded-2xl border bg-card p-5">
                            <h2 className="mb-4 text-sm font-semibold text-foreground">
                                Team Overview
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                            <Users className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            Members
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums text-foreground">
                                        {teamHealth.members}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                            <ArrowUpRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            Pending Invites
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums text-foreground">
                                        {teamHealth.pendingInvites}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            Files
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums text-foreground">
                                        {teamHealth.files}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            Current Plan
                                        </span>
                                    </div>
                                    <StatusBadge
                                        variant={
                                            teamHealth.plan === 'Pro'
                                                ? 'success'
                                                : 'neutral'
                                        }
                                    >
                                        {teamHealth.plan}
                                    </StatusBadge>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
