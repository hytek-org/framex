import { Head, router } from '@inertiajs/react';
import { Bell, BellOff, Check } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { FadeIn } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Notification = {
    id: string;
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
};

type Props = { notifications: Notification[] };

export default function NotificationsIndex({ notifications }: Props) {
    const unread = notifications.filter((n) => !n.read_at);

    return (
        <>
            <Head title="Notifications" />
            <div className="space-y-6 p-6">
                <FadeIn>
                    <PageHeader title="Notifications" description={`${unread.length} unread`}>
                        {unread.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => router.post('/notifications/read')}>
                                <Check className="mr-2 h-4 w-4" />Mark all read
                            </Button>
                        )}
                    </PageHeader>
                </FadeIn>
                <FadeIn delay={0.15}>
                    {notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map((n) => (
                                <div key={n.id} className={cn('flex items-start gap-4 rounded-xl border p-4', n.read_at ? 'bg-card opacity-70' : 'border-primary/10 bg-primary/[0.02]')}>
                                    <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', n.read_at ? 'bg-muted' : 'bg-primary/10')}>
                                        <Bell className={cn('h-4 w-4', n.read_at ? 'text-muted-foreground' : 'text-primary')} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-medium">{n.title}</h3>
                                            {!n.read_at && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                        </div>
                                        {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                                        <p className="mt-1 text-xs text-muted-foreground/70">{n.created_at}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={BellOff} title="All caught up" description="No notifications yet." />
                    )}
                </FadeIn>
            </div>
        </>
    );
}

NotificationsIndex.layout = { breadcrumbs: [{ title: 'Notifications', href: '/notifications' }] };
