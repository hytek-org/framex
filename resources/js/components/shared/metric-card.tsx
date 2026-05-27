import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type MetricCardProps = {
    label: string;
    value: string;
    change?: string;
    tone?: 'positive' | 'negative' | 'neutral';
    className?: string;
};

export function MetricCard({
    label,
    value,
    change,
    tone = 'neutral',
    className,
}: MetricCardProps) {
    const TrendIcon =
        tone === 'positive' ? ArrowUp : tone === 'negative' ? ArrowDown : Minus;

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md dark:hover:shadow-black/20',
                className,
            )}
        >
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">
                    {label}
                </span>
                {change && (
                    <span
                        className={cn(
                            'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                            tone === 'positive' &&
                                'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
                            tone === 'negative' &&
                                'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400',
                            tone === 'neutral' &&
                                'bg-muted text-muted-foreground',
                        )}
                    >
                        <TrendIcon className="h-3 w-3" />
                        {change}
                    </span>
                )}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {value}
            </div>
        </div>
    );
}
