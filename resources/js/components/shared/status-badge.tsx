import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
    {
        variants: {
            variant: {
                success:
                    'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
                warning:
                    'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
                error:
                    'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400',
                info:
                    'bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
                neutral:
                    'bg-muted text-muted-foreground',
            },
        },
        defaultVariants: {
            variant: 'neutral',
        },
    },
);

type StatusBadgeProps = React.ComponentProps<'span'> &
    VariantProps<typeof statusBadgeVariants> & {
        dot?: boolean;
    };

export function StatusBadge({
    className,
    variant,
    dot = true,
    children,
    ...props
}: StatusBadgeProps) {
    return (
        <span
            className={cn(statusBadgeVariants({ variant }), className)}
            {...props}
        >
            {dot && (
                <span
                    className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        variant === 'success' && 'bg-emerald-500',
                        variant === 'warning' && 'bg-amber-500',
                        variant === 'error' && 'bg-red-500',
                        variant === 'info' && 'bg-blue-500',
                        variant === 'neutral' && 'bg-muted-foreground',
                    )}
                />
            )}
            {children}
        </span>
    );
}
