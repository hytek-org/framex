import { Link, usePage } from '@inertiajs/react';
import { Menu, Monitor, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    const { auth, currentTeam } = usePage().props as any;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    // Premium scroll effect: Transparent at top, frosted glass on scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                scrolled
                    ? 'border-b border-border/40 bg-background/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
                    : 'border-b border-transparent bg-background/0'
            )}
        >
            <nav className="flex h-16 w-full items-center justify-between px-6 md:px-8 lg:px-12">
                
                {/* Logo - Left Aligned */}
                <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                    <AppLogoIcon className="h-7 w-7 fill-current text-foreground" />
                    <span className="text-lg font-medium tracking-tight text-foreground">
                        FrameX
                    </span>
                </Link>

                {/* Desktop Nav - Absolute Centered (Vercel/Linear style) */}
                <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-muted/60 hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side Actions */}
                <div className="hidden items-center gap-3 md:flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={cycleAppearance}
                        className="h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        title={`Current: ${getAppearanceLabel()}`}
                    >
                        {getAppearanceIcon()}
                    </Button>
                    
                    {auth.user ? (
                        <Button asChild size="sm" className="h-9 rounded-full px-6 font-medium transition-transform hover:scale-105">
                            <Link href={dashboardUrl}>Dashboard</Link>
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-9 rounded-full px-4 font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            >
                                <Link href={login()}>Sign in</Link>
                            </Button>
                            <Button asChild size="sm" className="h-9 rounded-full px-6 font-medium transition-transform hover:scale-105">
                                <Link href={register()}>Get Started</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            <div
                className={cn(
                    'overflow-hidden border-b bg-background/95 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden',
                    mobileOpen ? 'max-h-80 border-border/40 shadow-lg' : 'max-h-0 border-transparent'
                )}
            >
                <div className="space-y-1 px-6 pb-6 pt-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    <div className="mt-4 flex flex-col gap-3 border-t border-border/30 pt-5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={cycleAppearance}
                            className="h-10 w-full justify-center rounded-xl bg-transparent"
                        >
                            {getAppearanceIcon()}
                            <span className="ml-2">{getAppearanceLabel()} Theme</span>
                        </Button>
                        
                        {auth.user ? (
                            <Button asChild size="sm" className="h-10 w-full rounded-xl font-medium">
                                <Link href={dashboardUrl}>Dashboard</Link>
                            </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" size="sm" asChild className="h-10 rounded-xl bg-transparent font-medium">
                                    <Link href={login()}>Sign in</Link>
                                </Button>
                                <Button size="sm" asChild className="h-10 rounded-xl font-medium">
                                    <Link href={register()}>Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}