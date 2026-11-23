import { Head, router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    Filter,
    Globe,
    KeyRound,
    Lock,
    LogOut,
    Mail,
    Shield,
    User,
    UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { FadeIn } from '@/components/shared/motion';

type ActivityItem = {
    id: number;
    action: string;
    description: string;
    ip_address: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    created_at_human: string;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    activities: PaginatedData<ActivityItem>;
    filters: {
        action?: string;
    };
    actionTypes: string[];
};

export default function AccountActivity({ activities, filters, actionTypes }: Props) {
    const handleFilterChange = (actionValue: string) => {
        router.get(
            '/account/activity',
            actionValue === 'all' ? {} : { action: actionValue },
            { preserveState: true, preserveScroll: true }
        );
    };

    const getActionBadge = (action: string) => {
        if (action.startsWith('login') || action.startsWith('session')) {
            return (
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <LogOut className="mr-1 h-3 w-3" /> {action}
                </Badge>
            );
        }
        if (action.startsWith('password') || action.startsWith('2fa') || action.startsWith('security')) {
            return (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <KeyRound className="mr-1 h-3 w-3" /> {action}
                </Badge>
            );
        }
        if (action.startsWith('profile')) {
            return (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <User className="mr-1 h-3 w-3" /> {action}
                </Badge>
            );
        }
        if (action.startsWith('email')) {
            return (
                <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Mail className="mr-1 h-3 w-3" /> {action}
                </Badge>
            );
        }

        return (
            <Badge variant="secondary">
                <Activity className="mr-1 h-3 w-3" /> {action}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Account Activity Log" />

            <div className="space-y-8">
                <FadeIn>
                    <Card className="rounded-2xl border shadow-xs">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-semibold">Account Audit & Activity</CardTitle>
                                    <CardDescription className="text-sm">
                                        Comprehensive timeline of all security events, credentials updates, profile edits, and authentication history.
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <Select
                                        value={filters.action || 'all'}
                                        onValueChange={handleFilterChange}
                                    >
                                        <SelectTrigger className="w-48 h-8 text-xs">
                                            <SelectValue placeholder="Filter by event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Events ({activities.total})</SelectItem>
                                            {actionTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            {activities.data.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="divide-y rounded-xl border bg-card">
                                        {activities.data.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2.5 flex-wrap">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            {item.description}
                                                        </span>
                                                        {getActionBadge(item.action)}
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                        <span>{item.created_at_human}</span>
                                                        <span>•</span>
                                                        <span>{new Date(item.created_at).toLocaleString('en-US')}</span>
                                                        {item.ip_address && (
                                                            <>
                                                                <span>•</span>
                                                                <span>IP: {item.ip_address}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {activities.last_page > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <p className="text-xs text-muted-foreground">
                                                Page {activities.current_page} of {activities.last_page} ({activities.total} total events)
                                            </p>

                                            <div className="flex items-center gap-1.5">
                                                {activities.links.map((link, idx) => (
                                                    <Button
                                                        key={idx}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                        className="h-8 min-w-8 text-xs px-2.5"
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Activity}
                                    title="No audit events found"
                                    description={filters.action ? `No activities found matching "${filters.action}".` : 'Your account activity log is currently empty.'}
                                />
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </>
    );
}

AccountActivity.layout = {
    breadcrumbs: [
        { title: 'Account', href: '/account' },
        { title: 'Activity Log', href: '/account/activity' },
    ],
};
