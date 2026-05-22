import { Head } from '@inertiajs/react';
import { MetricCard } from '@/components/shared/metric-card';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Metric = { label: string; value: number };
type UserItem = { id: number; name: string; email: string; created_at: string };
type TeamItem = { id: number; name: string; slug: string; created_at: string };
type Props = { metrics: Metric[]; latestUsers: UserItem[]; latestTeams: TeamItem[] };

export default function AdminIndex({ metrics, latestUsers, latestTeams }: Props) {
    return (
        <>
            <Head title="Admin" />
            <div className="space-y-6 p-6">
                <FadeIn>
                    <PageHeader title="Admin Dashboard" description="System overview and management." />
                </FadeIn>
                <StaggerChildren className="grid gap-4 sm:grid-cols-3" staggerDelay={0.06}>
                    {metrics.map((m) => (
                        <StaggerItem key={m.label}>
                            <MetricCard label={m.label} value={m.value.toLocaleString()} />
                        </StaggerItem>
                    ))}
                </StaggerChildren>
                <div className="grid gap-4 lg:grid-cols-2">
                    <FadeIn delay={0.2}>
                        <div className="rounded-2xl border bg-card p-5">
                            <h2 className="mb-4 text-sm font-semibold">Recent Users</h2>
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {latestUsers.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                            <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                        <div className="rounded-2xl border bg-card p-5">
                            <h2 className="mb-4 text-sm font-semibold">Recent Teams</h2>
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {latestTeams.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{t.slug}</TableCell>
                                            <TableCell className="text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </>
    );
}

