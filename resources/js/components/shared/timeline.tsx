import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type TimelineItem = {
    id: string | number;
    event: string;
    description: string;
    user?: {
        name: string;
        email: string;
    } | null;
    created_at: string;
};

type TimelineProps = {
    items: TimelineItem[];
    className?: string;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function Timeline({ items, className }: TimelineProps) {
    return (
        <div className={cn('space-y-0', className)}>
            {items.map((item, index) => (
                <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Vertical line */}
                    {index < items.length - 1 && (
                        <div className="absolute left-[17px] top-10 h-[calc(100%-24px)] w-px bg-border" />
                    )}

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-[34px] w-[34px] border-2 border-background">
                            <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                                {item.user ? getInitials(item.user.name) : '?'}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-foreground">
                            {item.user && (
                                <span className="font-medium">
                                    {item.user.name}
                                </span>
                            )}{' '}
                            <span className="text-muted-foreground">
                                {item.description}
                            </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground/70">
                            {item.created_at}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
