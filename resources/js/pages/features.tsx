import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Code2,
    CreditCard,
    FileText,
    FolderKanban,
    HardDrive,
    KeyRound,
    Layers,
    Lock,
    Radio,
    Search,
    ShieldCheck,
    Terminal,
    Users,
    Webhook,
} from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

const coreFeatures = [
    {
        icon: Users,
        title: 'Multi-Tenant Workspaces & RBAC',
        description:
            'Create and switch between isolated team workspaces with role-based permissions, email invitations, and member management.',
        benefits: ['Personal & shared teams', 'Owner, Admin & Member roles', 'Email invitations', 'Team switching'],
        category: 'Workspaces',
    },
    {
        icon: ShieldCheck,
        title: 'Enterprise Identity & 2FA',
        description:
            'Built on Laravel Fortify with TOTP two-factor authentication, passkeys, active session revocation, and security audit logs.',
        benefits: ['TOTP 2FA & recovery codes', 'Passkey / WebAuthn support', 'Session management', 'Security audit trail'],
        category: 'Security',
    },
    {
        icon: FileText,
        title: 'Content Studio & Media Library',
        description:
            'Author rich content with TipTap, track revisions with diffs, manage SEO metadata, and organize assets in a centralized media library.',
        benefits: ['TipTap rich-text editor', 'Revision history & diffs', 'Categories & tags', 'SEO metadata panel'],
        category: 'Content',
    },
    {
        icon: Webhook,
        title: 'Dynamic Forms & Webhooks',
        description:
            'Build custom forms with public submission endpoints, export responses to CSV, and dispatch HMAC-signed outbound webhooks.',
        benefits: ['Visual form builder', 'Public form routes', 'CSV submission export', 'HMAC-signed webhooks'],
        category: 'Automation',
    },
    {
        icon: CreditCard,
        title: 'Subscription Billing',
        description:
            'Laravel Cashier Stripe integration supporting upgrades, scheduled downgrades, invoices, and a built-in Demo Billing Mode.',
        benefits: ['Stripe Cashier integration', 'Plan swaps & grace periods', 'Invoice downloads', 'Demo Billing Mode'],
        category: 'Billing',
    },
    {
        icon: KeyRound,
        title: 'API Tokens & Real-Time',
        description:
            'Issue team-scoped Sanctum API tokens with activity logging, and broadcast live workspace updates over Laravel Reverb.',
        benefits: ['Team-scoped Sanctum tokens', 'Token rotation & logs', 'RESTful v1 API', 'Laravel Reverb WebSockets'],
        category: 'Developer',
    },
];

const additionalFeatures = [
    { icon: HardDrive, title: 'Team Drive', description: 'Folder organization, file previews, and sharing' },
    { icon: Search, title: 'Command Palette', description: 'Global keyboard search across workspace resources' },
    { icon: Activity, title: 'Activity Telemetry', description: 'Track workspace events and content views' },
    { icon: Code2, title: 'Wayfinder Routes', description: 'Auto-generated TypeScript route & action bindings' },
    { icon: Terminal, title: 'CLI Installer', description: 'Interactive setup via php artisan framex:install' },
    { icon: Layers, title: 'Modular Core', description: 'Clean domain separation under app/FrameX/Modules' },
    { icon: Radio, title: 'Echo React Hooks', description: 'Real-time event listeners in React components' },
    { icon: Lock, title: 'Policy Enforcement', description: 'Strict authorization policies on every resource' },
];

export default function Features() {
    return (
        <>
            <Head title="Features — FrameX" />

            <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

                <div className="relative z-10">
                    {/* Hero */}
                    <section className="px-6 pt-32 pb-16 md:pt-44 md:pb-24">
                        <div className="mx-auto max-w-4xl text-center">
                            <FadeIn delay={0.05} direction="down">
                                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                                    <FolderKanban className="h-3.5 w-3.5 text-primary" />
                                    Verified Platform Capabilities
                                </span>
                            </FadeIn>

                            <FadeIn delay={0.1}>
                                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                                    Built for production workspaces from day one
                                </h1>
                            </FadeIn>

                            <FadeIn delay={0.15}>
                                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    Every feature in FrameX is implemented end-to-end across Laravel 13, Inertia.js v3, React 19, and TypeScript—ready to run locally or deploy to production.
                                </p>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <Button asChild size="lg" className="h-11 rounded-full px-7 font-medium">
                                        <Link href={register()}>
                                            Get Started
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="h-11 rounded-full px-7 font-medium">
                                        <Link href="/docs">Explore Documentation</Link>
                                    </Button>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* Core Features */}
                    <section className="border-t border-border/50 bg-muted/20 px-6 py-20">
                        <div className="mx-auto max-w-6xl">
                            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.05}>
                                {coreFeatures.map((feature) => {
                                    const Icon = feature.icon;
                                    return (
                                        <StaggerItem key={feature.title}>
                                            <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                                                        <Icon className="h-5 w-5 text-foreground" />
                                                    </div>
                                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                        {feature.category}
                                                    </span>
                                                </div>
                                                <h2 className="text-lg font-semibold text-foreground">{feature.title}</h2>
                                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                                <ul className="mt-5 space-y-2 border-t border-border/50 pt-4">
                                                    {feature.benefits.map((benefit) => (
                                                        <li key={benefit} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                            <span>{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </StaggerItem>
                                    );
                                })}
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* Additional Capabilities */}
                    <section className="border-t border-border/50 px-6 py-20">
                        <div className="mx-auto max-w-6xl">
                            <FadeIn>
                                <div className="mb-12 text-center">
                                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                        Included Infrastructure &amp; Tooling
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Built-in developer and operational utilities that ship with every FrameX installation.
                                    </p>
                                </div>
                            </FadeIn>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {additionalFeatures.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.title}
                                            className="rounded-xl border border-border/60 bg-card p-5 shadow-xs"
                                        >
                                            <Icon className="mb-3 h-5 w-5 text-primary" />
                                            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
