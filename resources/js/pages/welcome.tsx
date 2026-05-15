import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Bell,
    CreditCard,
    Key,
    LayoutGrid,
    Shield,
    Users,
    Zap,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   FEATURES DATA
   ────────────────────────────────────────────────────────── */
const features = [
    {
        icon: Users,
        title: 'Teams & Organizations',
        description: 'Multi-tenant workspace system with role-based access control, granular permissions, and seamless team switching built right into the core.',
        className: 'md:col-span-2 lg:col-span-2',
    },
    {
        icon: Shield,
        title: 'Authentication',
        description: 'Complete auth flow with 2FA, biometric support, and social logins.',
        className: 'md:col-span-1 lg:col-span-1',
    },
    {
        icon: CreditCard,
        title: 'Subscription Billing',
        description: 'Stripe-powered billing with plan management and customer portals.',
        className: 'md:col-span-1 lg:col-span-1',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        description: 'Beautiful charts, realtime metrics, and activity feeds to monitor your product health at a glance.',
        className: 'md:col-span-2 lg:col-span-2',
    },
    {
        icon: Key,
        title: 'API Tokens',
        description: 'Sanctum-powered API token management with scoped permissions for developer integrations.',
        className: 'md:col-span-1 lg:col-span-1',
    },
    {
        icon: Bell,
        title: 'Real-time Operations',
        description: 'WebSocket-powered live updates via Laravel Reverb with a fully integrated in-app notification center.',
        className: 'md:col-span-1 lg:col-span-1',
    },
];

const stats = [
    { label: 'Trusted Teams', value: 5200, suffix: '+' },
    { label: 'Launches', value: 2800, suffix: '+' },
    { label: 'API Requests', value: 120, suffix: 'M+' },
    { label: 'Uptime', value: 99.95, suffix: '%', decimals: 2 },
];

const steps = [
    {
        step: '01',
        title: 'Design the Experience',
        description: 'Start with a polished, premium UI that makes first impressions count and converts visitors into active users.',
    },
    {
        step: '02',
        title: 'Deploy Modern Stack',
        description: 'Laravel 12, React 19, Inertia, and highly optimized front-end assets, instantly ready for production environments.',
    },
    {
        step: '03',
        title: 'Scale Confidently',
        description: 'Built-in billing, robust teams, and real-time analytics designed specifically for high-growth SaaS applications.',
    },
];

/* ──────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────── */
export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Build SaaS Products Faster | FrameX" />

            <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
                
                {/* ── SUBTLE BACKGROUND EFFECTS (Apple-like purity) ── */}
                <div className="pointer-events-none fixed inset-0 flex justify-center bg-background">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
                </div>

                <div className="relative z-10 space-y-0 pb-20">
                    
                    {/* ── HERO ─────────────────────────────── */}
                    <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32">
                        <div className="relative mx-auto max-w-300 px-6 text-center">
                            
                            <FadeIn delay={0.1}>
                                <div className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-xl transition-all hover:bg-background/80 hover:shadow-md">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                                    </span>
                                    <span className="text-foreground">Laravel 13 + React 19 + Inertia.js</span>
                                    <ChevronRight className="ml-1 h-3.5 w-3.5 text-muted-foreground/60" />
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <h1 className="text-5xl font-semibold tracking-tighter sm:text-7xl md:text-8xl">
                                    Launch premium SaaS
                                    <br className="hidden sm:block" />
                                    <span className="bg-linear-to-br from-foreground to-foreground/50 bg-clip-text text-transparent"> at lightspeed.</span>
                                </h1>
                            </FadeIn>

                            <FadeIn delay={0.3}>
                                <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
                                    FrameX is a world-class Laravel + React starter kit engineered for performance, reliability, and scale. Ship an enterprise-grade platform this weekend.
                                </p>
                            </FadeIn>

                            <FadeIn delay={0.4}>
                                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    {auth?.user ? (
                                        <Button size="lg" asChild className="h-14 rounded-full bg-foreground px-8 text-base font-medium text-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:scale-[1.02] hover:bg-foreground/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)]">
                                            <Link href="/dashboard">
                                                Go to Dashboard
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="lg" asChild className="h-14 rounded-full bg-foreground px-8 text-base font-medium text-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:scale-[1.02] hover:bg-foreground/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)]">
                                                <Link href={register()}>
                                                    Start Your Free Trial
                                                </Link>
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                asChild
                                                className="h-14 rounded-full border-border bg-background/50 px-8 text-base font-medium backdrop-blur-xl transition-all hover:bg-muted"
                                            >
                                                <a href="/pricing">
                                                    Explore Pricing
                                                </a>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </FadeIn>

                            {/* ── DASHBOARD PREVIEW (Premium macOS Style) ──────────────── */}
                            <FadeIn delay={0.6}>
                                <div className="relative mx-auto mt-28 max-w-250 perspective-[2000px]">
                                    <div className="absolute -inset-2 rounded-[2.5rem] bg-linear-to-b from-primary/10 via-transparent to-transparent opacity-50 blur-2xl" />
                                    
                                    <div className="relative overflow-hidden rounded-4xl border border-border/60 bg-background/80 shadow-[0_20px_50px_rgba(8,112,184,0.07)] backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/5 transition-transform duration-700 hover:rotate-x-0 hover:scale-[1.01]" style={{ transform: 'rotateX(2deg)' }}>
                                        
                                        {/* Browser / macOS Header */}
                                        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-4 backdrop-blur-md">
                                            <div className="flex gap-2">
                                                <div className="h-3 w-3 rounded-full bg-[#FF5F56] shadow-sm" />
                                                <div className="h-3 w-3 rounded-full bg-[#FFBD2E] shadow-sm" />
                                                <div className="h-3 w-3 rounded-full bg-[#27C93F] shadow-sm" />
                                            </div>
                                            <div className="flex h-8 w-full max-w-md items-center justify-center gap-2 rounded-md bg-background/60 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border/50 backdrop-blur-xl">
                                                <Shield className="h-3.5 w-3.5 text-foreground/40" />
                                                <span className="opacity-80">app.framex.dev</span>
                                            </div>
                                            <div className="w-13" /> {/* Spacer */}
                                        </div>

                                        {/* App UI */}
                                        <div className="grid grid-cols-12 bg-background/40">
                                            {/* Mini sidebar */}
                                            <div className="col-span-3 hidden border-r border-border/40 bg-background/50 p-6 md:block">
                                                <div className="mb-8 flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-b from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
                                                        <Zap className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-base font-semibold tracking-tight">FrameX</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3 rounded-lg bg-foreground px-3 py-2.5 text-sm font-medium text-background transition-colors">
                                                        <LayoutGrid className="h-4 w-4" />
                                                        Dashboard
                                                    </div>
                                                    {['Analytics', 'Customers', 'Billing', 'Settings'].map((item) => (
                                                        <div key={item} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground">
                                                            <div className="h-4 w-4 rounded-md border border-muted-foreground/30" />
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dashboard Content */}
                                            <div className="col-span-12 space-y-6 p-6 md:col-span-9 lg:p-10">
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-2xl font-semibold tracking-tight">Overview</h3>
                                                    <p className="text-sm text-muted-foreground">Your business metrics for the last 30 days.</p>
                                                </div>

                                                {/* Metric cards */}
                                                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                                    {[
                                                        { label: 'Revenue', value: '$24,892', change: '+12.5%', isUp: true },
                                                        { label: 'Active Users', value: '2,418', change: '+8.2%', isUp: true },
                                                        { label: 'Conversion', value: '7.2%', change: '+2.4%', isUp: true },
                                                        { label: 'Churn Rate', value: '1.9%', change: '-0.6%', isUp: false },
                                                    ].map((m) => (
                                                        <div key={m.label} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-background/50 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-background/80 hover:shadow-md">
                                                            <div className="text-sm font-medium text-muted-foreground">{m.label}</div>
                                                            <div className="mt-4 flex items-baseline gap-2">
                                                                <div className="text-2xl font-semibold tracking-tight text-foreground">{m.value}</div>
                                                            </div>
                                                            <div className="mt-2 flex items-center gap-1">
                                                                <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${m.isUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                                    {m.change}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">vs last month</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Clean Chart Area */}
                                                <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-background/50 p-6 shadow-sm backdrop-blur-xl">
                                                    <div className="mb-8 flex items-center justify-between">
                                                        <div className="text-base font-semibold tracking-tight">Revenue Growth</div>
                                                        <div className="h-6 w-24 rounded-full bg-muted/50" />
                                                    </div>
                                                    <div className="flex h-40 items-end gap-2 sm:gap-3">
                                                        {[35, 45, 40, 60, 50, 75, 65, 80, 70, 85, 80, 100].map((h, i) => (
                                                            <div key={i} className="group relative flex flex-1 items-end">
                                                                <div 
                                                                    className={`w-full rounded-t-sm transition-all duration-500 group-hover:bg-primary/80 ${i === 11 ? 'bg-primary' : 'bg-primary/20'}`} 
                                                                    style={{ height: `${h}%` }} 
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── LOGO CLOUD ──────── */}
                    <section className="border-y border-border/30 bg-muted/20 py-12 backdrop-blur-sm">
                        <div className="mx-auto max-w-7xl px-6 text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">Trusted by innovative teams</p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-40 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                                {/* Simulated premium logos */}
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground transition-colors">
                                        <div className="h-7 w-7 rounded-lg bg-foreground" /> Acme Corp
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── FEATURES BENTO (Apple-tier grid) ───────────────────── */}
                    <section id="features" className="relative py-24 md:py-40">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-2xl text-center">
                                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-md">
                                        <Sparkles className="h-3.5 w-3.5" /> Core Capabilities
                                    </div>
                                    <h2 className="text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
                                        Everything you need to scale.
                                    </h2>
                                    <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                                        A complete, production-grade foundation designed by industry experts, so you can focus entirely on your unique business logic.
                                    </p>
                                </div>
                            </FadeIn>

                            <StaggerChildren className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4" staggerDelay={0.08}>
                                {features.map((feature) => (
                                    <StaggerItem key={feature.title} className={feature.className}>
                                        <div className="group relative flex h-full min-h-70 flex-col justify-between overflow-hidden rounded-[2.5rem] border border-border/50 bg-background/40 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:bg-neutral-900/40">
                                            
                                            {/* Top right subtle accent */}
                                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
                                            
                                            <div>
                                                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg transition-transform duration-500 group-hover:scale-110">
                                                    <feature.icon className="h-6 w-6" />
                                                </div>
                                                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                                    {feature.title}
                                                </h3>
                                                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                            </div>
                                            
                                            <div className="mt-8 flex items-center text-sm font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                Explore feature <ArrowRight className="ml-1 h-4 w-4" />
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* ── STATS FLOATING PANEL (Clean & integrated) ──────────────── */}
                    <section className="py-12 relative z-10">
                        <div className="mx-auto max-w-6xl px-6">
                            <FadeIn>
                                <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-background/60 p-10 shadow-2xl backdrop-blur-3xl sm:p-16">
                                    <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5" />
                                    <div className="relative grid grid-cols-2 gap-10 divide-border/50 md:grid-cols-4 md:divide-x">
                                        {stats.map((stat, i) => (
                                            <div key={stat.label} className={`flex flex-col items-center justify-center text-center ${i % 2 === 0 ? 'border-none' : ''}`}>
                                                <div className="text-5xl font-semibold tracking-tighter text-foreground sm:text-6xl">
                                                    <AnimatedCounter
                                                        value={stat.value}
                                                        suffix={stat.suffix}
                                                        decimals={stat.decimals || 0}
                                                    />
                                                </div>
                                                <p className="mt-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── HOW IT WORKS ─────────────────────── */}
                    <section className="py-24 md:py-40">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-3xl text-center">
                                    <h2 className="text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
                                        Up and running in minutes.
                                    </h2>
                                    <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
                                        Skip the tedious boilerplate. From repository clone to production deployment in three incredibly simple steps.
                                    </p>
                                </div>
                            </FadeIn>

                            <div className="relative mt-24">
                                {/* Desktop connecting line */}
                                <div className="absolute left-1/2 top-10 hidden w-[80%] -translate-x-1/2 border-t border-dashed border-border md:block" />
                                
                                <StaggerChildren className="grid gap-16 md:grid-cols-3 md:gap-12" staggerDelay={0.15}>
                                    {steps.map((step) => (
                                        <StaggerItem key={step.step}>
                                            <div className="relative flex flex-col items-center text-center">
                                                <div className="relative z-10 mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-[0_0_0_8px_rgba(var(--background))] border border-border/50 backdrop-blur-xl">
                                                    <span className="bg-linear-to-br from-foreground to-foreground/40 bg-clip-text text-2xl font-bold text-transparent">
                                                        {step.step}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                                    {step.title}
                                                </h3>
                                                <p className="mt-4 text-base leading-relaxed text-muted-foreground px-4">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </StaggerItem>
                                    ))}
                                </StaggerChildren>
                            </div>
                        </div>
                    </section>

                    {/* ── CTA (Massive Dark Mode Contrast Block) ──────────────────────────────── */}
                    <section className="py-24 md:py-32">
                        <div className="mx-auto max-w-6xl px-6">
                            <FadeIn>
                                <div className="relative overflow-hidden rounded-[3rem] bg-foreground px-6 py-20 text-center shadow-2xl sm:px-16 sm:py-32">
                                    {/* Pure Apple dark block aesthetic */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
                                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-77.5 w-77.5 rounded-full bg-primary opacity-20 blur-[100px]" />

                                    <div className="relative z-10 mx-auto max-w-3xl">
                                        <h2 className="text-4xl font-semibold tracking-tighter text-background sm:text-6xl md:text-7xl">
                                            Ready to ship your next big idea?
                                        </h2>
                                        <p className="mx-auto mt-8 max-w-2xl text-xl text-background/70 leading-relaxed">
                                            Join thousands of elite developers who build faster and scale smarter with FrameX. The foundation is free and open source.
                                        </p>
                                        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
                                            <Button size="lg" asChild className="h-14 rounded-full bg-background text-foreground hover:bg-background/90 px-8 text-lg font-medium transition-transform hover:scale-105">
                                                <Link href={register()}>
                                                    Get Started for Free
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Link>
                                            </Button>
                                            <Button size="lg" variant="outline" asChild className="h-14 rounded-full border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background px-8 text-lg font-medium transition-colors">
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
            </div>
        </>
    );
}