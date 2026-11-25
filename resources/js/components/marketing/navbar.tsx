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
    { label: 'Docs', href: '/docs' },
    { label: 'Blog', href: '/blogs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export function Navbar() {
    const { auth, currentTeam } = usePage().props as {
        auth: { user?: unknown };
        currentTeam?: { slug: string } | null;
    };
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 12);
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

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-all duration-300',
                scrolled
                    ? 'border-b border-border/60 bg-background/90 shadow-xs backdrop-blur-xl'
                    : 'border-b border-transparent bg-background/0',
            )}
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#8AB4F8]/15 dark:text-[#8AB4F8]">
                        <AppLogoIcon className="h-5 w-5 fill-current" />
                    </div>
                    <span className="text-lg font-medium tracking-tight text-foreground">
                        FrameX
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-2.5 md:flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={cycleAppearance}
                        className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        title={`Theme: ${appearance}`}
                    >
                        {getAppearanceIcon()}
                    </Button>

                    {auth?.user ? (
                        <Button
                            asChild
                            size="sm"
                            className="h-9 rounded-full bg-[#1A73E8] px-5 font-medium text-white hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49] dark:hover:bg-[#A8C7FA]"
                        >
                            <Link href={dashboardUrl}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-9 rounded-full px-4 font-medium text-foreground hover:bg-muted/70"
                            >
                                <Link href={login()}>Sign in</Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                className="h-9 rounded-full bg-[#1A73E8] px-5 font-medium text-white shadow-xs hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49] dark:hover:bg-[#A8C7FA]"
                            >
                                <Link href={register()}>Get started</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={cycleAppearance}
                        className="h-9 w-9 rounded-full text-muted-foreground"
                        aria-label="Toggle theme"
                    >
                        {getAppearanceIcon()}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="h-9 w-9 rounded-full"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </nav>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="border-b border-border/60 bg-background/95 px-6 pb-6 pt-2 backdrop-blur-xl md:hidden">
                    <div className="flex flex-col space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
                        {auth?.user ? (
                            <Button asChild className="w-full rounded-full bg-[#1A73E8] text-white">
                                <Link href={dashboardUrl}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="outline" className="w-full rounded-full">
                                    <Link href={login()}>Sign in</Link>
                                </Button>
                                <Button asChild className="w-full rounded-full bg-[#1A73E8] text-white">
                                    <Link href={register()}>Get started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
