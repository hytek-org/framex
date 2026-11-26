import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    CreditCard,
    FileText,
    KeyRound,
    Minus,
    Plus,
    ShieldCheck,
    Terminal,
    Users,
    Webhook,
} from 'lucide-react';
import { useState } from 'react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard, register } from '@/routes';

const features = [
    {
        icon: Users,
        title: 'Workspaces & Team RBAC',
        description:
            'Multi-tenant team workspaces with role-based permissions, email invitations, and instant team switching.',
    },
    {
        icon: ShieldCheck,
        title: 'Enterprise Identity & 2FA',
        description:
            'Laravel Fortify authentication with TOTP two-factor authentication, passkeys, and active session control.',
    },
    {
        icon: FileText,
        title: 'Content Studio & Media',
        description:
            'TipTap rich-text editor with revision diffs, SEO metadata panels, taxonomies, and a media library.',
    },
    {
        icon: Webhook,
        title: 'Forms & Webhooks',
        description:
            'Dynamic form builder with public submission routes, CSV exports, and HMAC-signed outbound webhooks.',
    },
    {
        icon: CreditCard,
        title: 'Subscriptions & Billing',
        description:
            'Laravel Cashier Stripe integration with plan upgrades, scheduled downgrades, and Demo Billing Mode.',
    },
    {
        icon: KeyRound,
        title: 'API Tokens & Real-Time',
        description:
            'Team-scoped Sanctum API tokens with activity logging, plus Laravel Reverb WebSockets.',
    },
];

const faqs = [
    {
        q: 'What is included in FrameX out of the box?',
        a: 'FrameX ships with Laravel 13, React 19, Inertia.js v3, Wayfinder typed routes, Fortify authentication (2FA & passkeys), multi-tenant teams, Content Studio, Forms & Webhooks, Billing (Stripe + Demo Mode), and Reverb WebSockets.',
    },
    {
        q: 'How does the interactive installer work?',
        a: 'Run `laravel new my-app --using=hytek/framex` and the `framex:install` wizard configures your .env, database (SQLite, MySQL, or PostgreSQL), application key, migrations, and storage link.',
    },
    {
        q: 'Can I preview billing without live Stripe keys?',
        a: 'Yes. FrameX includes a built-in Demo Billing Mode (`BILLING_MOCK=true`) that simulates upgrades, scheduled downgrades, cancellations, and downloadable invoices locally.',
    },
];

export default function Welcome() {
    const { auth, currentTeam } = usePage().props as {
        auth: { user?: unknown };
        currentTeam?: { slug: string } | null;
    };
    const [activeTab, setActiveTab] = useState<'workspace' | 'cli'>('workspace');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const dashboardHref = currentTeam ? dashboard(currentTeam.slug) : '/dashboard';

    return (
        <>
            <Head title="FrameX — Modern Enterprise Workspace Platform" />

            <div className="min-h-screen bg-background text-foreground">
                {/* ── HERO SECTION (Material Design 3) ─────────────────── */}
                <section className="relative overflow-hidden px-6 pt-28 pb-20 md:pt-40 md:pb-28">
                    {/* Subtle Google-inspired radial wash */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_at_top,rgba(26,115,232,0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(138,180,248,0.10),transparent_65%)]" />

                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto max-w-3xl text-center">
                            <FadeIn delay={0.05} direction="down">
                                <Link
                                    href="/docs"
                                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs transition-colors hover:border-[#1A73E8]/40 hover:text-foreground"
                                >
                                    <span className="h-2 w-2 rounded-full bg-[#1A73E8] dark:bg-[#8AB4F8]" />
                                    <span>Laravel 13 · React 19 · Inertia v3</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </FadeIn>

                            <FadeIn delay={0.1}>
                                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:leading-[1.08]">
                                    Build, manage, and scale your digital workspace.
                                </h1>
                            </FadeIn>

                            <FadeIn delay={0.15}>
                                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    FrameX unifies multi-tenant teams, enterprise authentication, content studio, dynamic forms, webhooks, and billing in one cohesive, type-safe platform.
                                </p>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    {auth?.user ? (
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-11 rounded-full bg-[#1A73E8] px-7 font-medium text-white shadow-sm hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49] dark:hover:bg-[#A8C7FA]"
                                        >
                                            <Link href={dashboardHref}>
                                                Open Workspace
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                asChild
                                                size="lg"
                                                className="h-11 rounded-full bg-[#1A73E8] px-7 font-medium text-white shadow-sm hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49] dark:hover:bg-[#A8C7FA]"
                                            >
                                                <Link href={register()}>
                                                    Get started free
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="lg"
                                                className="h-11 rounded-full px-7 font-medium"
                                            >
                                                <Link href="/docs">Read documentation</Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </FadeIn>
                        </div>

                        {/* Interactive Product Preview */}
                        <FadeIn delay={0.25}>
                            <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-3xl border border-border/70 bg-card shadow-lg">
                                <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                                    </div>
                                    <div className="inline-flex rounded-full border border-border/60 bg-background p-0.5 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('workspace')}
                                            className={cn(
                                                'rounded-full px-3 py-1 font-medium transition-colors',
                                                activeTab === 'workspace'
                                                    ? 'bg-[#1A73E8] text-white dark:bg-[#8AB4F8] dark:text-[#041E49]'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Workspace UI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('cli')}
                                            className={cn(
                                                'rounded-full px-3 py-1 font-medium transition-colors',
                                                activeTab === 'cli'
                                                    ? 'bg-[#1A73E8] text-white dark:bg-[#8AB4F8] dark:text-[#041E49]'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            CLI Installer
                                        </button>
                                    </div>
                                </div>

                                {activeTab === 'workspace' ? (
                                    <div className="grid gap-4 p-6 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                                            <p className="text-xs font-medium text-muted-foreground">Active Modules</p>
                                            <p className="mt-1 text-2xl font-semibold text-foreground">6 Core</p>
                                            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                Teams, Studio, Forms, Billing
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                                            <p className="text-xs font-medium text-muted-foreground">Security Posture</p>
                                            <p className="mt-1 text-2xl font-semibold text-foreground">2FA + Passkeys</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Fortify + Sanctum Scoped Tokens
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                                            <p className="text-xs font-medium text-muted-foreground">Type Safety</p>
                                            <p className="mt-1 text-2xl font-semibold text-foreground">Wayfinder</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Typed Laravel &amp; React Routes
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 font-mono text-xs leading-relaxed text-foreground">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Terminal className="h-4 w-4 text-[#1A73E8] dark:text-[#8AB4F8]" />
                                            <span>$ laravel new my-app --using=hytek/framex</span>
                                        </div>
                                        <p className="mt-3 text-emerald-600 dark:text-emerald-400">
                                            ✓ Configured SQLite/MySQL/PostgreSQL &amp; generated APP_KEY
                                        </p>
                                        <p className="text-emerald-600 dark:text-emerald-400">
                                            ✓ Ran database migrations &amp; linked public storage
                                        </p>
                                        <p className="text-emerald-600 dark:text-emerald-400">
                                            ✓ Built Vite + Wayfinder TypeScript routes
                                        </p>
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── PRODUCT FEATURES ─────────────────────────────────── */}
                <section className="border-t border-border/50 bg-muted/20 px-6 py-24">
                    <div className="mx-auto max-w-6xl">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-xs font-semibold uppercase tracking-widest text-[#1A73E8] dark:text-[#8AB4F8]">
                                    Features
                                </p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Designed for clarity, built for scale
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Every capability is implemented end-to-end and ready for production.
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.05}>
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <StaggerItem key={feature.title}>
                                        <div className="flex h-full flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md">
                                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#8AB4F8]/15 dark:text-[#8AB4F8]">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </StaggerItem>
                                );
                            })}
                        </StaggerChildren>
                    </div>
                </section>

                {/* ── PRICING PREVIEW ──────────────────────────────────── */}
                <section className="border-t border-border/50 px-6 py-24">
                    <div className="mx-auto max-w-5xl text-center">
                        <FadeIn>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#1A73E8] dark:text-[#8AB4F8]">
                                Pricing
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                Simple tiers for every stage
                            </h2>
                            <p className="mt-3 text-base text-muted-foreground">
                                Free ($0), Pro ($29/mo), and Scale ($99/mo) with built-in Demo Billing Mode.
                            </p>
                        </FadeIn>

                        <div className="mt-12 grid gap-6 md:grid-cols-3 text-left">
                            {[
                                { name: 'Free', price: '$0', desc: '1 team · 1,000 API calls', highlight: false },
                                { name: 'Pro', price: '$29/mo', desc: 'Unlimited teams · Realtime · Studio', highlight: true },
                                { name: 'Scale', price: '$99/mo', desc: 'Advanced admin · Full audit logs', highlight: false },
                            ].map((tier) => (
                                <div
                                    key={tier.name}
                                    className={cn(
                                        'rounded-3xl border bg-card p-6',
                                        tier.highlight
                                            ? 'border-[#1A73E8] ring-1 ring-[#1A73E8]/20 dark:border-[#8AB4F8]'
                                            : 'border-border/60',
                                    )}
                                >
                                    <h3 className="text-base font-semibold text-foreground">{tier.name}</h3>
                                    <p className="mt-2 text-3xl font-bold text-foreground">{tier.price}</p>
                                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        {tier.desc}
                                    </p>
                                    <Button
                                        asChild
                                        variant={tier.highlight ? 'default' : 'outline'}
                                        className={cn(
                                            'mt-6 w-full rounded-full',
                                            tier.highlight && 'bg-[#1A73E8] text-white hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49]',
                                        )}
                                    >
                                        <Link href="/pricing">View plan details</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ACCORDION ────────────────────────────────────── */}
                <section className="border-t border-border/50 bg-muted/20 px-6 py-24">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            Frequently asked questions
                        </h2>
                        <div className="mt-10 space-y-3">
                            {faqs.map((faq, idx) => {
                                const isOpen = openFaq === idx;
                                return (
                                    <div key={faq.q} className="rounded-2xl border border-border/60 bg-card">
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                                            className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-foreground"
                                        >
                                            <span>{faq.q}</span>
                                            {isOpen ? (
                                                <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            ) : (
                                                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="border-t border-border/50 px-6 py-4 text-sm leading-relaxed text-muted-foreground">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
