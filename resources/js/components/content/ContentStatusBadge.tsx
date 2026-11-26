import { Archive, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ContentStatusValue } from './types';

const STATUS_META: Record<
    ContentStatusValue,
    { label: string; className: string; icon: typeof FileText }
> = {
    draft: {
        label: 'Draft',
        className: 'border-border bg-muted/60 text-muted-foreground',
        icon: FileText,
    },
    in_review: {
        label: 'In Review',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        icon: Clock,
    },
    approved: {
        label: 'Approved',
        className: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
        icon: CheckCircle2,
    },
    published: {
        label: 'Published',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        icon: CheckCircle2,
    },
    scheduled: {
        label: 'Scheduled',
        className: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
        icon: Clock,
    },
    archived: {
        label: 'Archived',
        className: 'border-zinc-400/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
        icon: Archive,
    },
};

export function ContentStatusBadge({ status }: { status: ContentStatusValue }) {
    const meta = STATUS_META[status] ?? STATUS_META.draft;
    const Icon = meta.icon;

    return (
        <Badge variant="outline" className={`gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>
            <Icon className="h-3 w-3" />
            {meta.label}
        </Badge>
    );
}
