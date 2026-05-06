import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Bell,
    CreditCard,
    Key,
    LayoutGrid,
    Lock,
    Shield,
    Users,
    Zap,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   FEATURES DATA
   ────────────────────────────────────────────────────────── */
const features = [
    {
        icon: Users,
        title: 'Teams & Organizations',
        description:
            'Multi-tenant workspace system with role-based access control and seamless team switching.',
    },
    {
        icon: Shield,
        title: 'Authentication',
        description:
            'Complete auth flow including 2FA, email verification, password resets, and social login ready.',
    },
    {
        icon: CreditCard,
        title: 'Subscription Billing',
        description:
            'Stripe-powered billing with plan management, invoices, and customer portal integration.',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        description:
            'Beautiful charts, metrics, and activity feeds to monitor your product health at a glance.',
    },
    {
        icon: Key,
        title: 'API Tokens',
        description:
            'Sanctum-powered API token management with scoped permissions for developer integrations.',
    },
    {
        icon: Bell,
        title: 'Real-time Notifications',
        description:
            'WebSocket-powered live updates via Laravel Reverb with in-app notification center.',
    },
];

const stats = [
    { label: 'Active Users', value: 12400, suffix: '+' },
    { label: 'Teams Created', value: 3200, suffix: '+' },
    { label: 'API Requests', value: 98, suffix: 'M+' },
    { label: 'Uptime', value: 99.9, suffix: '%', decimals: 1 },
];

const steps = [
    {
        step: '01',
        title: 'Clone & Install',
        description: 'One command to scaffold a production-ready Laravel + React application.',
    },
    {
        step: '02',
        title: 'Configure & Customize',
        description: 'Set your brand, enable features, and configure billing plans.',
    },
    {
        step: '03',
        title: 'Ship to Production',
        description: 'Deploy with confidence. Docker-ready, CI/CD configured, and battle-tested.',
    },
];

/* ──────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────── */
export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Build SaaS Products Faster" />

            <div className="space-y-0">
                {/* ── HERO ─────────────────────────────── */}
                <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                    {/* Background gradient mesh */}
                    <div className="gradient-mesh pointer-events-none absolute inset-0" />
                    <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />

                    <div className="relative mx-auto max-w-4xl px-6 text-center">
                        <FadeIn delay={0.1}>
                            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                                <Zap className="h-3.5 w-3.5 text-primary" />
                                Laravel 12 + React 19 + Inertia.js
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                                Build SaaS products
                                <br />
                                <span className="text-gradient-brand">faster.</span>
                            </h1>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                A production-ready starter kit with authentication, teams,
                                billing, and a premium dashboard. Everything you need to
                                launch your next SaaS — beautifully crafted.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.4}>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                {auth.user ? (
                                    <Button size="lg" asChild className="min-w-40">
                                        <Link href="/dashboard">
                                            Go to Dashboard
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button size="lg" asChild className="min-w-40">
                                            <Link href={register()}>
                                                Get Started Free
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            asChild
                                            className="min-w-40"
                                        >
                                            <a
                                                href="https://github.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View on GitHub
                                            </a>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </FadeIn>

                        {/* Dashboard preview */}
                        <FadeIn delay={0.6}>
                            <div className="relative mx-auto mt-16 max-w-5xl">
                                <div className="surface-elevated overflow-hidden rounded-2xl">
                                    <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                                        </div>
                                        <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-muted/50 text-[10px] text-muted-foreground">
                                            app.framex.dev/dashboard
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-12 bg-card">
                                        {/* Mini sidebar */}
                                        <div className="col-span-3 hidden border-r bg-muted/20 p-4 md:block">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                                                    <LayoutGrid className="h-3.5 w-3.5" />
                                                    Dashboard
                                                </div>
                                                {['Activity', 'Files', 'Billing', 'Settings'].map(
                                                    (item) => (
                                                        <div
                                                            key={item}
                                                            className="px-3 py-2 text-xs text-muted-foreground"
                                                        >
                                                            {item}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                        {/* Dashboard content */}
                                        <div className="col-span-12 space-y-4 p-5 md:col-span-9">
                                            {/* Metric cards */}
                                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                                {[
                                                    { label: 'Revenue', value: '$24.8K', change: '+12%' },
                                                    { label: 'Users', value: '2,418', change: '+8%' },
                                                    { label: 'Conversion', value: '7.2%', change: '+2%' },
                                                    { label: 'Churn', value: '1.9%', change: '-0.6%' },
                                                ].map((m) => (
                                                    <div
                                                        key={m.label}
                                                        className="rounded-xl border p-3"
                                                    >
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {m.label}
                                                        </div>
                                                        <div className="mt-1 text-sm font-semibold">
                                                            {m.value}
                                                        </div>
                                                        <div className="mt-0.5 text-[10px] text-emerald-500">
                                                            {m.change}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Chart area */}
                                            <div className="rounded-xl border p-4">
                                                <div className="mb-3 text-xs font-medium">
                                                    Revenue Overview
                                                </div>
                                                <div className="flex h-28 items-end gap-1.5">
                                                    {[40, 55, 45, 65, 50, 75, 60, 80, 70, 90, 85, 95].map(
                                                        (h, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex-1 rounded-t bg-primary/20 transition-all hover:bg-primary/40"
                                                                style={{ height: `${h}%` }}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Glow effect */}
                                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/5 to-transparent" />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── FEATURES BENTO ───────────────────── */}
                <section id="features" className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Everything you need to ship
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    A complete foundation with production-grade features,
                                    so you can focus on what makes your product unique.
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
                            {features.map((feature) => (
                                <StaggerItem key={feature.title}>
                                    <div className="group relative rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg dark:hover:shadow-black/20">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                            <feature.icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-4 text-base font-semibold text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </section>

                {/* ── STATS ────────────────────────────── */}
                <section className="border-y py-16 md:py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                            <AnimatedCounter
                                                value={stat.value}
                                                suffix={stat.suffix}
                                                decimals={stat.decimals || 0}
                                            />
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── HOW IT WORKS ─────────────────────── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Up and running in minutes
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    From clone to production in three simple steps.
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-8 md:grid-cols-3" staggerDelay={0.1}>
                            {steps.map((step) => (
                                <StaggerItem key={step.step}>
                                    <div className="relative">
                                        <span className="text-5xl font-bold text-muted/60 dark:text-muted/30">
                                            {step.step}
                                        </span>
                                        <h3 className="mt-3 text-lg font-semibold text-foreground">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </section>

                {/* ── CTA ──────────────────────────────── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="relative overflow-hidden rounded-3xl border bg-card p-10 text-center md:p-16">
                                <div className="gradient-mesh pointer-events-none absolute inset-0 opacity-50" />
                                <div className="relative">
                                    <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                        Start building today
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
                                        Join thousands of developers who ship faster with
                                        FrameX. Free and open source.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Button size="lg" asChild>
                                            <Link href={register()}>
                                                Get Started Free
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button size="lg" variant="outline" asChild>
                                            <a
                                                href="https://github.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Star on GitHub
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>
            </div>
        </>
    );
}
