import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

const footerLinks = {
    Product: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Sign in', href: '/login' },
        { label: 'Get started', href: '/register' },
    ],
    Resources: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/docs/api-reference/content-rest-api' },
        { label: 'Architecture', href: '/docs/architecture/modular-monolith' },
        { label: 'Blog', href: '/blogs' },
    ],
    Company: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'GitHub', href: 'https://github.com/hytek-org/framex' },
    ],
};

export function Footer() {
    return (
        <footer className="border-t border-border/60 bg-muted/20">
            <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="sm:col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#8AB4F8]/15 dark:text-[#8AB4F8]">
                                <AppLogoIcon className="h-5 w-5 fill-current" />
                            </div>
                            <span className="text-lg font-medium tracking-tight text-foreground">
                                FrameX
                            </span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            The modular Laravel 13 and React 19 starter platform for modern multi-tenant workspaces, content, and SaaS infrastructure.
                        </p>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                                {category}
                            </h4>
                            <ul className="mt-4 space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        {link.href.startsWith('http') ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} FrameX. Open-source under the MIT License.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <Link href="/docs" className="transition-colors hover:text-foreground">
                            Docs
                        </Link>
                        <Link href="/contact" className="transition-colors hover:text-foreground">
                            Support
                        </Link>
                        <a
                            href="https://github.com/hytek-org/framex"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-foreground"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
