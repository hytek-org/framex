import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function DashboardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-6 p-6', className)}>
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
            </div>

            {/* Metric cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border p-5">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="mt-3 h-7 w-28" />
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="rounded-2xl border p-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-4 h-64 w-full rounded-xl" />
            </div>

            {/* Two columns */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border p-5">
                    <Skeleton className="h-5 w-32" />
                    <div className="mt-4 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3.5 w-48" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border p-5">
                    <Skeleton className="h-5 w-32" />
                    <div className="mt-4 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TableSkeleton({
    rows = 5,
    columns = 4,
    className,
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div className={cn('space-y-3', className)}>
            {/* Header row */}
            <div className="flex gap-4 px-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Data rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4 rounded-lg border px-4 py-3">
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton key={colIdx} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-2xl border p-5', className)}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
            <Skeleton className="mt-4 h-32 w-full rounded-xl" />
        </div>
    );
}
