import { Calendar, Info, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

export interface ActivityItem {
    id: number;
    event: string;
    category: string;
    description: string;
    metadata: Record<string, unknown> | null;
    actor_type: 'user' | 'system_or_deleted';
    user: { id: number; name: string } | null;
    created_at: string;
    created_at_formatted: string;
}

interface ActivityDetailSheetProps {
    activity: ActivityItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ActivityDetailSheet({
    activity,
    open,
    onOpenChange,
}: ActivityDetailSheetProps) {
    if (!activity) {
        return null;
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full text-[11px] uppercase">
                            {activity.category}
                        </Badge>
                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {activity.event}
                        </code>
                    </div>
                    <SheetTitle className="pt-2 text-base font-semibold leading-snug">
                        {activity.description}
                    </SheetTitle>
                    <SheetDescription>
                        Structured event context and sanitized change details.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-5 px-4 pb-6">
                    <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs">
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                Actor
                            </span>
                            <span className="font-medium text-foreground">
                                {activity.user?.name ?? 'System / Removed User'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Timestamp
                            </span>
                            <span className="font-medium text-foreground">
                                {activity.created_at_formatted}
                            </span>
                        </div>
                    </div>

                    {activity.metadata ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Info className="h-3.5 w-3.5" />
                                Event Metadata
                            </div>
                            <pre className="max-h-[360px] overflow-auto rounded-xl border border-border/60 bg-muted/30 p-4 font-mono text-xs leading-relaxed text-foreground">
                                {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <p className="text-xs italic text-muted-foreground">
                            No additional metadata was recorded for this event.
                        </p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
