import { Link, usePage } from '@inertiajs/react';
import { Menu, X, Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export function Navbar() {
    const { auth, currentTeam } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    const cycleAppearance = () => {
        const appearances = ['light', 'dark', 'system'] as const;
        const currentIndex = appearances.indexOf(appearance);
        const nextIndex = (currentIndex + 1) % appearances.length;
        updateAppearance(appearances[nextIndex]);
    };

    const getAppearanceIcon = () => {
        switch (appearance) {
            case 'light':
                return <Sun className="h-4 w-4" />;
            case 'dark':
                return <Moon className="h-4 w-4" />;
            case 'system':
                return <Monitor className="h-4 w-4" />;
        }
    };

    const getAppearanceLabel = () => {
        switch (appearance) {
            case 'light':
                return 'Light';
            case 'dark':
                return 'Dark';
            case 'system':
                return 'System';
        }
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <div className="mx-auto max-w-6xl px-6">
                <nav className="flex h-16 items-center justify-between bg-background/80 backdrop-blur-xl border-b">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <AppLogoIcon className="h-7 w-7 fill-current text-foreground" />
                        <span className="text-lg font-semibold tracking-tight text-foreground">
                            FrameX
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden items-center gap-2 md:flex">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={cycleAppearance}
                            className="h-8 w-8 p-0"
                            title={`Current: ${getAppearanceLabel()}`}
                        >
                            {getAppearanceIcon()}
                        </Button>
                        {auth.user ? (
                            <Button asChild size="sm">
                                <Link href={dashboardUrl}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="text-muted-foreground"
                                >
                                    <Link href={login()}>Sign in</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href={register()}>
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="rounded-lg p-2 text-muted-foreground md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </nav>
            </div>

            {/* Mobile menu */}
            <div
                className={cn(
                    'overflow-hidden border-b bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden',
                    mobileOpen ? 'max-h-64' : 'max-h-0 border-transparent',
                )}
            >
                <div className="space-y-1 px-6 pb-4 pt-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={cycleAppearance}
                            className="flex-1"
                        >
                            {getAppearanceIcon()}
                            <span className="ml-2">{getAppearanceLabel()}</span>
                        </Button>
                        {auth.user ? (
                            <Button asChild size="sm" className="w-full">
                                <Link href={dashboardUrl}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" asChild className="flex-1">
                                    <Link href={login()}>Sign in</Link>
                                </Button>
                                <Button size="sm" asChild className="flex-1">
                                    <Link href={register()}>Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
