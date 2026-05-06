import { router, usePage } from '@inertiajs/react';
import {
    CreditCard,
    FileText,
    Key,
    LayoutGrid,
    LogOut,
    Moon,
    Search,
    Settings,
    Sun,
    Users,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import { useAppearance } from '@/hooks/use-appearance';
import { toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const { props } = usePage();
    const { auth, currentTeam, teams } = props;
    const { appearance, updateAppearance } = useAppearance();

    if (!auth?.user) return null;

    const dashboardUrl = currentTeam ? toUrl(dashboard(currentTeam.slug)) : '/';

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const navigate = useCallback(
        (href: string) => {
            setOpen(false);
            router.visit(href);
        },
        [],
    );

    const toggleTheme = useCallback(() => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
        setOpen(false);
    }, [appearance, updateAppearance]);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search…" />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => navigate(dashboardUrl)}>
                        <LayoutGrid className="mr-2" />
                        Dashboard
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/billing')}>
                        <CreditCard className="mr-2" />
                        Billing
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/api-tokens')}>
                        <Key className="mr-2" />
                        API Tokens
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/notifications')}>
                        <Zap className="mr-2" />
                        Notifications
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => navigate('/settings/profile')}>
                        <Settings className="mr-2" />
                        Profile Settings
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/settings/security')}>
                        <Key className="mr-2" />
                        Security
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/settings/teams')}>
                        <Users className="mr-2" />
                        Teams
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/settings/appearance')}>
                        <Sun className="mr-2" />
                        Appearance
                    </CommandItem>
                </CommandGroup>

                {teams && teams.length > 1 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Switch Team">
                            {teams.map((team) => (
                                <CommandItem
                                    key={team.id}
                                    onSelect={() =>
                                        navigate(
                                            `/settings/teams/${team.slug}/switch`,
                                        )
                                    }
                                >
                                    <Users className="mr-2" />
                                    {team.name}
                                    {team.isCurrent && (
                                        <CommandShortcut>Current</CommandShortcut>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />

                <CommandGroup heading="Actions">
                    <CommandItem onSelect={toggleTheme}>
                        {appearance === 'dark' ? (
                            <Sun className="mr-2" />
                        ) : (
                            <Moon className="mr-2" />
                        )}
                        Toggle {appearance === 'dark' ? 'Light' : 'Dark'} Mode
                        <CommandShortcut>⌘T</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => {
                            setOpen(false);
                            router.post('/logout');
                        }}
                    >
                        <LogOut className="mr-2" />
                        Sign Out
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
