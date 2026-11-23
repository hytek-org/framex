import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    Activity,
    CreditCard,
    KeyRound,
    Monitor,
    Shield,
    Sliders,
    User,
    Users,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

const accountNavItems: NavItem[] = [
    {
        title: 'Overview',
        href: '/account',
        icon: User,
    },
    {
        title: 'Personal Info',
        href: '/account/profile',
        icon: Sliders,
    },
    {
        title: 'Preferences',
        href: '/account/preferences',
        icon: Monitor,
    },
    {
        title: 'Security & Auth',
        href: '/account/security',
        icon: KeyRound,
    },
    {
        title: 'Active Sessions',
        href: '/account/sessions',
        icon: Shield,
    },
    {
        title: 'Account Activity',
        href: '/account/activity',
        icon: Activity,
    },
    {
        title: 'Teams & Workspaces',
        href: '/account/teams',
        icon: Users,
    },
    {
        title: 'Billing & Plan',
        href: '/billing',
        icon: CreditCard,
    },
];

export default function AccountLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <>
            <div className="mb-6 sm:pl-4 sm:pt-6">
                <Heading
                    title="Account Center"
                    description="Manage your enterprise profile, security, connected sessions, preferences, and workspace access."
                />
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-10 items-start">
                <aside className="w-full lg:w-64 shrink-0 mb-6 lg:mb-0 lg:pl-2">
                    <div className="rounded-xl border bg-card p-2 shadow-xs">
                        <nav
                            className="flex flex-col space-y-1"
                            aria-label="Account Management"
                        >
                            {accountNavItems.map((item, index) => {
                                const active = isCurrentOrParentUrl(item.href);

                                return (
                                    <Button
                                        key={`${toUrl(item.href)}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'w-full justify-start text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-primary-foreground font-semibold'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && (
                                                <item.icon className={cn('mr-2.5 h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <div className="flex-1 min-w-0 w-full max-w-4xl">
                    <section className="space-y-8">
                        {children}
                    </section>
                </div>
            </div>
        </>
    );
}
