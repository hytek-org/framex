import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronRight,
    CreditCard,
    Fingerprint,
    Key,
    LayoutGrid,
    Lock,
    Search,
    Shield,
    Terminal,
    Users,
    Zap,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   STATS & STEPS
   ────────────────────────────────────────────────────────── */
const stats = [
    { label: 'Organizations', value: 12500, suffix: '+' },
    { label: 'API Requests', value: 950, suffix: 'M+' },
    { label: 'Uptime SLA', value: 99.99, suffix: '%', decimals: 2 },
    { label: 'Global Edge Nodes', value: 145, suffix: '' },
];

const steps = [
    {
        step: '01',
        title: 'Clone & Configure',
        description: 'Pull the repository, run the setup command, and let FrameX scaffold your complete authentication, billing, and team infrastructure.',
    },
    {
        step: '02',
        title: 'Build Your Logic',
        description: 'Stop wrestling with boilerplate. Focus entirely on your unique business logic inside a perfectly structured Laravel and React monolith.',
    },
    {
        step: '03',
        title: 'Deploy to Edge',
        description: 'Push to production with absolute confidence. Integrated CI/CD pipelines and highly optimized assets ensure sub-second global load times.',
    },
];

/* ──────────────────────────────────────────────────────────
   PAGE COMPONENT
   ────────────────────────────────────────────────────────── */
export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="FrameX | Enterprise SaaS Foundation" />

            <div className="relative min-h-screen bg-white text-zinc-950 dark:bg-[#050505] dark:text-[#FAFAFA] selection:bg-black/10 selection:text-black dark:selection:bg-white/20 dark:selection:text-white overflow-hidden font-sans transition-colors duration-300">
                
                {/* ── AMBIENT LIGHTING & NOISE TEXTURE ── */}
                <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
                    <div className="absolute top-[-20%] left-1/2 h-[800px] w-[1200px] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-black/[0.02] to-transparent blur-[120px] dark:from-white/[0.04]" />
                    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-black/[0.01] to-transparent dark:from-white/[0.02]" />
                    {/* Ultra-subtle noise overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10">
                    
                    {/* ── HERO ─────────────────────────────── */}
                    <section className="relative pt-36 pb-20 md:pt-48 md:pb-32">
                        <div className="mx-auto max-w-[1200px] px-6 text-center">
                            
                            <FadeIn delay={0.1} direction="down">
                                <div className="mx-auto mb-8 inline-flex items-center gap-3 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-zinc-600 shadow-[0_2px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:shadow-[0_2px_20px_rgba(255,255,255,0.02)] dark:hover:bg-white/10">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75 dark:bg-blue-400"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500"></span>
                                    </span>
                                    <span>FrameX 2.0 is now available</span>
                                    <ChevronRight className="h-3 w-3 text-zinc-400 dark:text-white/40" />
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <h1 className="mx-auto max-w-5xl text-5xl font-medium tracking-tighter sm:text-7xl md:text-8xl lg:text-[7.5rem] leading-[0.95]">
                                    The foundation for <br className="hidden sm:block" />
                                    <span className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-400 bg-clip-text text-transparent dark:from-white dark:via-white/90 dark:to-white/30">
                                        your life's work.
                                    </span>
                                </h1>
                            </FadeIn>

                            <FadeIn delay={0.3}>
                                <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed text-zinc-500 tracking-tight sm:text-xl dark:text-white/50">
                                    A world-class Laravel and React framework engineered for scale. Bypass months of boilerplate and launch enterprise-grade SaaS this weekend.
                                </p>
                            </FadeIn>

                            <FadeIn delay={0.4}>
                                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    {auth?.user ? (
                                        <Button size="lg" asChild className="group h-12 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-zinc-800 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                                            <Link href="/dashboard">
                                                Enter Workspace
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="lg" asChild className="group h-12 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-zinc-800 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                                                <Link href={register()}>
                                                    Start Building
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </Link>
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                asChild
                                                className="h-12 rounded-full border-black/10 bg-black/5 px-8 text-sm font-medium text-zinc-900 backdrop-blur-xl transition-all hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                            >
                                                <a href="/docs">Read Documentation</a>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </FadeIn>

                            {/* ── 3D DASHBOARD COMPOSITION ──────────────── */}
                            <FadeIn delay={0.6}>
                                <div className="relative mx-auto mt-24 max-w-[1000px] perspective-[2000px]">
                                    {/* Command Palette Floating Element (Depth Layer 3) */}
                                    <div className="absolute -top-6 left-1/2 z-30 flex w-[400px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-black/10 bg-white/90 px-4 py-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-transform duration-700 hover:scale-105 hover:-translate-y-2 dark:border-white/10 dark:bg-[#111]/90 dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]">
                                        <Search className="h-4 w-4 text-zinc-400 dark:text-white/40" />
                                        <div className="text-sm font-medium text-zinc-500 dark:text-white/40">Search commands, users, or settings...</div>
                                        <div className="ml-auto flex gap-1">
                                            <kbd className="rounded bg-black/5 px-1.5 py-0.5 font-sans text-[10px] font-medium text-zinc-400 dark:bg-white/10 dark:text-white/60">⌘</kbd>
                                            <kbd className="rounded bg-black/5 px-1.5 py-0.5 font-sans text-[10px] font-medium text-zinc-400 dark:bg-white/10 dark:text-white/60">K</kbd>
                                        </div>
                                    </div>

                                    {/* Main App Window (Depth Layer 1) */}
                                    <div 
                                        className="relative z-10 overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-transform duration-1000 ease-out hover:rotate-x-0 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_60px_rgba(0,0,0,0.6)]"
                                        style={{ transform: 'rotateX(5deg)' }}
                                    >
                                        {/* macOS Header */}
                                        <div className="flex h-12 items-center border-b border-black/5 bg-black/[0.02] px-4 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.02]">
                                            <div className="flex gap-2">
                                                <div className="h-3 w-3 rounded-full bg-black/20 transition-colors hover:bg-[#FF5F56] dark:bg-white/20" />
                                                <div className="h-3 w-3 rounded-full bg-black/20 transition-colors hover:bg-[#FFBD2E] dark:bg-white/20" />
                                                <div className="h-3 w-3 rounded-full bg-black/20 transition-colors hover:bg-[#27C93F] dark:bg-white/20" />
                                            </div>
                                            <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-black/5 text-[11px] font-medium tracking-wide text-zinc-500 ring-1 ring-black/5 dark:bg-white/5 dark:text-white/40 dark:ring-white/5">
                                                <Lock className="mr-1.5 h-3 w-3 text-zinc-400 dark:text-white/30" />
                                                framex.dev/workspace
                                            </div>
                                        </div>

                                        {/* App Body */}
                                        <div className="grid h-[600px] grid-cols-12 bg-white dark:bg-[#050505]">
                                            {/* Sidebar */}
                                            <div className="col-span-3 hidden border-r border-black/5 bg-zinc-50 p-5 md:block dark:border-white/5 dark:bg-[#0A0A0A]">
                                                <div className="mb-8 flex items-center gap-3 px-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:bg-white dark:text-black dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                                        <Zap className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">Acme Corp</span>
                                                </div>
                                                <div className="space-y-0.5 text-sm font-medium">
                                                    <div className="flex items-center gap-3 rounded-lg bg-black/5 px-3 py-2 text-zinc-900 dark:bg-white/10 dark:text-white">
                                                        <LayoutGrid className="h-4 w-4" /> Dashboard
                                                    </div>
                                                    {['Customers', 'Revenue', 'Analytics', 'Settings'].map((item) => (
                                                        <div key={item} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white">
                                                            <div className="h-4 w-4 rounded border border-black/10 dark:border-white/20" /> {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="col-span-12 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:100px_100px] p-8 opacity-[0.98] md:col-span-9">
                                                <div className="mb-8 flex items-end justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-white">Revenue Overview</h3>
                                                        <p className="mt-1 text-sm text-zinc-500 dark:text-white/40">Metrics for the last 30 days.</p>
                                                    </div>
                                                </div>

                                                {/* Mini Metric Grid */}
                                                <div className="mb-8 grid grid-cols-3 gap-4">
                                                    {['Total MRR', 'Active Users', 'Conversion'].map((label, i) => (
                                                        <div key={label} className="rounded-xl border border-black/5 bg-black/[0.02] p-5 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.02]">
                                                            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-white/40">{label}</div>
                                                            <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                                                                {i === 0 ? '$124.5k' : i === 1 ? '1,024' : '4.2%'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Chart Skeleton */}
                                                <div className="flex h-64 w-full items-end gap-3 rounded-xl border border-black/5 bg-black/[0.02] p-6 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.02]">
                                                    {[40, 55, 45, 70, 65, 85, 75, 90, 80, 100].map((h, i) => (
                                                        <div key={i} className="group relative flex flex-1 items-end">
                                                            <div 
                                                                className={`w-full rounded-t-sm transition-colors duration-500 ${i === 9 ? 'bg-zinc-900 dark:bg-white' : 'bg-black/10 group-hover:bg-black/20 dark:bg-white/10 dark:group-hover:bg-white/20'}`} 
                                                                style={{ height: `${h}%` }} 
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Notification (Depth Layer 2) */}
                                    <div className="absolute -right-8 -bottom-8 z-20 flex items-start gap-4 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-transform duration-700 hover:-translate-x-2 hover:-translate-y-2 dark:border-white/10 dark:bg-[#111]/90 dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-900 dark:text-white">New Enterprise Plan</div>
                                            <div className="text-xs text-zinc-500 dark:text-white/50">Stripe payment successful • Just now</div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── LOGO CLOUD (Trust Section) ──────── */}
                    <section className="border-y border-black/5 bg-black/[0.01] py-16 backdrop-blur-sm dark:border-white/5 dark:bg-white/[0.01]">
                        <div className="mx-auto max-w-7xl px-6 text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-white/40">Trusted by engineering teams at</p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-40 transition-opacity duration-700 hover:opacity-80">
                                {/* Simulated premium typographic logos */}
                                {['VERCEL', 'LINEAR', 'STRIPE', 'RAYCAST', 'GITHUB'].map((name) => (
                                    <div key={name} className="flex items-center text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                                        {name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── FEATURES (Bento Grid) ───────────────────── */}
                    <section id="features" className="relative py-32 md:py-48">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-2xl text-center">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                        Everything you need to scale.
                                    </h2>
                                    <p className="mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                        A cohesive ecosystem of primitives designed by experts. Stop writing boilerplate and start shipping actual business logic.
                                    </p>
                                </div>
                            </FadeIn>

                            <StaggerChildren className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-3" staggerDelay={0.1}>
                                
                                {/* BENTO CARD 1: Authentication */}
                                <StaggerItem className="md:col-span-2">
                                    <div className="group relative flex h-[400px] flex-col justify-between overflow-hidden rounded-[32px] border border-black/5 bg-white p-8 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none dark:hover:bg-[#111]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] to-transparent dark:from-white/[0.02]" />
                                        <div className="relative z-10 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-zinc-50/50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
                                            {/* Abstract Auth Visual */}
                                            <div className="relative flex flex-col items-center gap-4">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                                    <Fingerprint className="h-8 w-8 text-zinc-600 dark:text-white/70" />
                                                </div>
                                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                                                    <div className="h-full w-1/2 animate-pulse rounded-full bg-zinc-900 dark:bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative z-10 mt-6">
                                            <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-white/50">
                                                <Shield className="h-4 w-4" /> Authentication
                                            </div>
                                            <h3 className="mb-2 text-xl font-medium tracking-tight text-zinc-900 dark:text-white">Secure by default</h3>
                                            <p className="text-sm leading-relaxed text-zinc-500 dark:text-white/50">Complete auth flow with 2FA, biometric support, and social logins natively integrated out of the box.</p>
                                        </div>
                                    </div>
                                </StaggerItem>

                                {/* BENTO CARD 2: API Tokens */}
                                <StaggerItem className="md:col-span-1">
                                    <div className="group relative flex h-[400px] flex-col justify-between overflow-hidden rounded-[32px] border border-black/5 bg-white p-8 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none dark:hover:bg-[#111]">
                                        <div className="relative z-10 flex h-48 w-full flex-col gap-2 overflow-hidden rounded-2xl border border-black/5 bg-zinc-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                            {/* Mock Code Block */}
                                            <div className="mb-2 flex items-center gap-2">
                                                <Terminal className="h-3 w-3 text-zinc-400 dark:text-white/30" />
                                                <span className="font-mono text-[10px] text-zinc-400 dark:text-white/30">api_keys.ts</span>
                                            </div>
                                            <div className="font-mono text-[10px] leading-loose text-zinc-500 dark:text-white/50">
                                                <span className="text-blue-600 dark:text-blue-400">const</span> token = <span className="text-yellow-600 dark:text-yellow-200">generate</span>();<br/>
                                                <span className="text-emerald-600 dark:text-emerald-400">"frmx_live_9a8b7c6..."</span><br/>
                                                <span className="text-blue-600 dark:text-blue-400">await</span> db.keys.save(token);
                                            </div>
                                        </div>
                                        <div className="relative z-10 mt-6">
                                            <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-white/50">
                                                <Key className="h-4 w-4" /> Developer APIs
                                            </div>
                                            <h3 className="mb-2 text-xl font-medium tracking-tight text-zinc-900 dark:text-white">Sanctum Tokens</h3>
                                            <p className="text-sm leading-relaxed text-zinc-500 dark:text-white/50">API token management with granular scoped permissions.</p>
                                        </div>
                                    </div>
                                </StaggerItem>

                                {/* BENTO CARD 3: Billing */}
                                <StaggerItem className="md:col-span-1">
                                    <div className="group relative flex h-[400px] flex-col justify-between overflow-hidden rounded-[32px] border border-black/5 bg-white p-8 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none dark:hover:bg-[#111]">
                                        <div className="relative z-10 flex h-48 w-full flex-col justify-center gap-3 overflow-hidden rounded-2xl border border-black/5 bg-zinc-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                            <div className="flex items-center justify-between rounded-lg border border-black/5 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-white/[0.03] dark:shadow-none">
                                                <div className="text-[11px] font-medium text-zinc-600 dark:text-white/60">Pro Plan</div>
                                                <div className="text-[11px] font-medium text-zinc-900 dark:text-white">$49/mo</div>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border border-black/5 bg-white p-3 opacity-50 shadow-sm dark:border-white/5 dark:bg-white/[0.03] dark:shadow-none">
                                                <div className="text-[11px] font-medium text-zinc-600 dark:text-white/60">Enterprise</div>
                                                <div className="text-[11px] font-medium text-zinc-900 dark:text-white">Custom</div>
                                            </div>
                                        </div>
                                        <div className="relative z-10 mt-6">
                                            <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-white/50">
                                                <CreditCard className="h-4 w-4" /> Subscription Billing
                                            </div>
                                            <h3 className="mb-2 text-xl font-medium tracking-tight text-zinc-900 dark:text-white">Stripe Integration</h3>
                                            <p className="text-sm leading-relaxed text-zinc-500 dark:text-white/50">Automated plan management and secure customer portals.</p>
                                        </div>
                                    </div>
                                </StaggerItem>

                                {/* BENTO CARD 4: Real-time & Teams */}
                                <StaggerItem className="md:col-span-2">
                                    <div className="group relative flex h-[400px] flex-col justify-between overflow-hidden rounded-[32px] border border-black/5 bg-white p-8 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-none dark:hover:bg-[#111]">
                                        <div className="absolute inset-0 bg-gradient-to-tl from-black/[0.02] to-transparent dark:from-white/[0.02]" />
                                        <div className="relative z-10 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-zinc-50/50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
                                            {/* RBAC Visual */}
                                            <div className="flex w-full max-w-sm flex-col gap-2">
                                                {[
                                                    { email: 'admin@acme.com', role: 'Owner' },
                                                    { email: 'dev@acme.com', role: 'Developer' },
                                                    { email: 'viewer@acme.com', role: 'Read-only' },
                                                ].map((user, i) => (
                                                    <div key={i} className="flex items-center justify-between rounded-lg border border-black/5 bg-white px-4 py-3 shadow-sm dark:border-white/5 dark:bg-white/[0.02] dark:shadow-none">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-6 w-6 rounded-full bg-black/10 dark:bg-white/10" />
                                                            <span className="text-[11px] font-medium text-zinc-700 dark:text-white/70">{user.email}</span>
                                                        </div>
                                                        <span className="rounded bg-black/5 px-2 py-1 text-[10px] text-zinc-500 dark:bg-white/5 dark:text-white/40">{user.role}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="relative z-10 mt-6">
                                            <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-white/50">
                                                <Users className="h-4 w-4" /> Teams & Operations
                                            </div>
                                            <h3 className="mb-2 text-xl font-medium tracking-tight text-zinc-900 dark:text-white">Multi-tenant Architecture</h3>
                                            <p className="text-sm leading-relaxed text-zinc-500 dark:text-white/50">Workspace system with role-based access control and WebSocket live updates via Laravel Reverb.</p>
                                        </div>
                                    </div>
                                </StaggerItem>
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* ── STATS SECTION ──────────────── */}
                    <section className="border-y border-black/5 bg-zinc-50/50 py-24 dark:border-white/5 dark:bg-[#0A0A0A]">
                        <div className="mx-auto max-w-6xl px-6">
                            <FadeIn>
                                <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:divide-x md:divide-black/10 dark:md:divide-white/10">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="flex flex-col items-center px-4 text-center">
                                            <div className="tabular-nums text-4xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                                <AnimatedCounter
                                                    value={stat.value}
                                                    suffix={stat.suffix}
                                                    decimals={stat.decimals || 0}
                                                />
                                            </div>
                                            <p className="mt-3 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-white/40">
                                                {stat.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── HOW IT WORKS (Pipeline) ─────────────────────── */}
                    <section className="py-32 md:py-48">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-2xl text-center">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                        From clone to production.
                                    </h2>
                                    <p className="mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                        An elegant workflow designed for speed. Deploy robust infrastructure in exactly three steps.
                                    </p>
                                </div>
                            </FadeIn>

                            <div className="relative mt-24">
                                {/* Connection Line */}
                                <div className="absolute bottom-0 left-[38px] top-0 w-px bg-black/10 md:left-1/2 md:-translate-x-1/2 dark:bg-white/5" />
                                
                                <StaggerChildren className="space-y-16 md:space-y-24" staggerDelay={0.2}>
                                    {steps.map((step, index) => (
                                        <StaggerItem key={step.step}>
                                            <div className={`relative flex flex-col items-center gap-8 md:flex-row md:gap-16 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                                                
                                                {/* Number Node */}
                                                <div className="absolute left-0 z-10 flex h-[76px] w-[76px] -translate-x-[19px] items-center justify-center rounded-full border border-black/10 bg-white shadow-sm md:left-1/2 md:-translate-x-1/2 dark:border-white/10 dark:bg-[#050505] dark:shadow-[0_0_30px_rgba(255,255,255,0.03)]">
                                                    <span className="text-xl font-medium text-zinc-800 dark:text-white/80">{step.step}</span>
                                                </div>

                                                {/* Content - Left or Right */}
                                                <div className="ml-24 flex flex-col justify-center text-left md:ml-0 md:w-1/2 md:px-16">
                                                    <h3 className="mb-3 text-2xl font-medium tracking-tight text-zinc-900 dark:text-white">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-base leading-relaxed text-zinc-500 dark:text-white/50">
                                                        {step.description}
                                                    </p>
                                                </div>
                                                
                                                {/* Empty half for alignment */}
                                                <div className="hidden md:block md:w-1/2" />
                                            </div>
                                        </StaggerItem>
                                    ))}
                                </StaggerChildren>
                            </div>
                        </div>
                    </section>

                    {/* ── CINEMATIC CTA ──────────────────────────────── */}
                    <section className="py-24 md:py-32">
                        <div className="mx-auto max-w-5xl px-6">
                            <FadeIn>
                                <div className="group relative overflow-hidden rounded-[40px] border border-black/10 bg-zinc-50 px-6 py-24 text-center shadow-lg sm:px-16 sm:py-32 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-[0_0_100px_rgba(255,255,255,0.02)]">
                                    
                                    {/* Ambient Glows */}
                                    <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/[0.03] blur-[80px] dark:bg-white/[0.03]" />
                                    <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/[0.03] blur-[80px] dark:bg-blue-500/[0.02]" />

                                    <div className="relative z-10 mx-auto max-w-2xl">
                                        <h2 className="text-4xl font-medium tracking-tighter text-zinc-900 sm:text-6xl dark:text-white">
                                            Ready to deploy?
                                        </h2>
                                        <p className="mx-auto mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                            Join the top-tier developers building the next generation of software with FrameX. Free and open source.
                                        </p>
                                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                            <Button size="lg" asChild className="h-12 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90">
                                                <Link href={register()}>
                                                    Start Building Now
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button size="lg" variant="outline" asChild className="h-12 rounded-full border-black/10 bg-black/5 px-8 text-sm font-medium text-zinc-900 transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                                                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                                    View GitHub Repository
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