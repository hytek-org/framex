import { Head } from '@inertiajs/react';
import { Activity as ActivityIcon } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { FadeIn } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { Timeline } from '@/components/shared/timeline';
import { Button } from '@/components/ui/button';

type ActivityItem = {
    id: number;
    event: string;
    description: string;
    metadata: Record<string, unknown> | null;
    user: { id: number; name: string; email: string } | null;
    created_at: string;
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
};

export default function ActivityIndex({ activities }: Props) {

    return (
        <>
            <Head title="Activity" />

            <div className="space-y-6 p-6">
                <FadeIn>
                    <PageHeader
                        title="Activity"
                        description="A timeline of everything that happened in your workspace."
                    />
                </FadeIn>

                <FadeIn delay={0.15}>
                    {activities.data.length > 0 ? (
                        <div className="rounded-2xl border bg-card p-6">
                            <Timeline items={activities.data} />

                            {/* Pagination */}
                            {activities.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2 border-t pt-4">
                                    {activities.links.map((link, idx) => (
                                        <Button
                                            key={idx}
                                            variant={link.active ? 'default' : 'ghost'}
                                            size="sm"
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                            className="h-8 min-w-8 text-xs"
                                        >
                                            {link.url ? (
                                                <a
                                                    href={link.url}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            icon={ActivityIcon}
                            title="No activity yet"
                            description="When team members perform actions, they will appear here."
                        />
                    )}
                </FadeIn>
            </div>
        </>
    );
}

