import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

const footerLinks = {
    Product: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Dashboard', href: '#' },
        { label: 'API Reference', href: '#' },
    ],
    Company: [
        { label: 'About Us', href: '/about' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '/contact' },
    ],
    Resources: [
        { label: 'Documentation', href: '#' },
        { label: 'Changelog', href: '#' },
        { label: 'System Status', href: '#' },
        { label: 'GitHub', href: 'https://github.com' },
    ],
    Legal: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'License', href: '#' },
    ],
};

export function Footer() {
    return (
        <footer className="relative border-t border-black/5 bg-white transition-colors duration-300 dark:border-white/5 dark:bg-[#050505]">
            {/* Ultra-subtle noise overlay for physical texture */}
            <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-20">
                {/* ── TOP GRID ────────────────────────────── */}
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
                    
                    {/* Brand Column */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80">
                            <AppLogoIcon className="h-6 w-6 fill-current text-zinc-900 dark:text-white" />
                            <span className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white">
                                FrameX
                            </span>
                        </Link>
                        <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-white/50">
                            The production-ready SaaS foundation. Bypass months of boilerplate and launch enterprise-grade software this weekend.
                        </p>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="lg:col-span-1">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white/80">
                                {category}
                            </h4>
                            <ul className="mt-6 space-y-3.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        {link.href.startsWith('http') ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
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

                {/* ── BOTTOM BAR ──────────────────────────── */}
                <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-black/5 pt-8 md:flex-row dark:border-white/5">
                    <p className="text-sm font-medium text-zinc-400 dark:text-white/40">
                        © {new Date().getFullYear()} FrameX Inc. All rights reserved.
                    </p>
                    
                    <div className="flex items-center gap-4">
                        {/* GitHub Icon */}
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-black/5 hover:text-zinc-900 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label="GitHub"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        
                        {/* X / Twitter Icon */}
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-black/5 hover:text-zinc-900 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label="X (formerly Twitter)"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}