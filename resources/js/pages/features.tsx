import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BarChart3,
    Bell,
    CheckCircle,
    Cloud,
    Code,
    CreditCard,
    Database,
    Globe,
    Key,
    Lock,
    Settings,
    Shield,
    Smartphone,
    Sparkles,
    Star,
    Users,
} from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   FEATURES DATA
   ────────────────────────────────────────────────────────── */
const coreFeatures = [
    {
        icon: Users,
        title: 'Multi-Tenant Teams',
        description: 'Advanced team management with role-based permissions, secure invitations, and seamless switching between distinct workspaces.',
        benefits: ['Unlimited teams', 'Granular permissions', 'Team analytics', 'Activity tracking'],
        category: 'Collaboration',
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'Bank-grade security posture with 2FA, SSO, end-to-end encrypted data at rest, and comprehensive audit logs.',
        benefits: ['End-to-end encryption', 'SSO / SAML ready', 'GDPR compliant', 'Security audits'],
        category: 'Security',
    },
    {
        icon: CreditCard,
        title: 'Flexible Billing',
        description: 'Stripe-powered subscription infrastructure featuring automatic proration, coupon handling, and a zero-code customer portal.',
        benefits: ['Multiple currencies', 'Usage-based billing', 'Custom plans', 'Revenue analytics'],
        category: 'Billing',
    },
    {
        icon: BarChart3,
        title: 'Advanced Analytics',
        description: 'Real-time telemetry dashboards with customizable metrics, gorgeous charts, and fully exportable enterprise reports.',
        benefits: ['Real-time data', 'Custom dashboards', 'Data export', 'API access'],
        category: 'Analytics',
    },
    {
        icon: Bell,
        title: 'Smart Notifications',
        description: 'Intelligent, multi-channel notification routing system with email, in-app bells, and extensible webhook integrations.',
        benefits: ['Custom triggers', 'Multi-channel routing', 'Webhook support', 'Audit history'],
        category: 'Communication',
    },
    {
        icon: Key,
        title: 'API Management',
        description: 'Full-featured RESTful API suite with granular token management, dynamic rate limiting, and auto-generated developer docs.',
        benefits: ['RESTful API architecture', 'Token lifecycle', 'Rate limiting', 'Swagger docs'],
        category: 'Developer',
    },
];

const additionalFeatures = [
    { icon: Globe, title: 'Global CDN', description: 'Sub-second content delivery worldwide' },
    { icon: Smartphone, title: 'Mobile Native', description: 'Optimized for iOS and Android web views' },
    { icon: Cloud, title: 'Cloud Storage', description: 'Infinitely scalable S3-backed storage' },
    { icon: Database, title: 'DB Tooling', description: 'Advanced query management & pooling' },
    { icon: Code, title: 'SDKs & CLI', description: 'First-party tools for developer velocity' },
    { icon: Settings, title: 'Automation', description: 'No-code workflow automation engine' },
    { icon: Activity, title: 'Monitoring', description: 'Real-time health and performance alerts' },
    { icon: Lock, title: 'Compliance', description: 'SOC 2, HIPAA, and ISO 27001 ready' },
];

const testimonials = [
    {
        quote: "FrameX completely transformed our engineering velocity. We bypassed months of infrastructure setup and went from initial idea to production in under three weeks.",
        author: "Sarah Chen",
        role: "CTO, TechFlow",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        rating: 5,
    },
    {
        quote: "The multi-tenant architecture is incredibly robust. Managing dozens of enterprise clients has never been easier, and the security defaults let us sleep at night.",
        author: "Marcus Rodriguez",
        role: "Founder, DevStudio",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
        rating: 5,
    },
    {
        quote: "True enterprise-grade security right out of the box. Our rigorous internal compliance team reviewed the architecture and was thoroughly impressed.",
        author: "Emily Watson",
        role: "Security Lead, DataCorp",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
        rating: 5,
    },
];

/* ──────────────────────────────────────────────────────────
   PAGE COMPONENT
   ────────────────────────────────────────────────────────── */
export default function Features() {
    return (
        <>
            <Head title="Features - FrameX Enterprise SaaS" />

            <div className="relative min-h-screen overflow-hidden bg-white font-sans text-zinc-950 selection:bg-black/10 selection:text-black transition-colors duration-300 dark:bg-[#050505] dark:text-[#FAFAFA] dark:selection:bg-white/20 dark:selection:text-white">
                
                {/* ── AMBIENT BACKGROUND SYSTEM ── */}
                <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
                    <div className="absolute left-[10%] top-[-20%] h-[600px] w-[600px] rounded-[100%] bg-blue-500/5 blur-[120px] dark:bg-blue-500/10" />
                    <div className="absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-[100%] bg-indigo-500/5 blur-[120px] dark:bg-indigo-500/10" />
                    {/* Ultra-soft noise texture overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 space-y-0 pb-24">
                    
                    {/* ── HERO ─────────────────────────────── */}
                    <section className="pb-20 pt-36 md:pb-28 md:pt-48">
                        <div className="mx-auto max-w-5xl px-6 text-center">
                            <FadeIn delay={0.1}>
                                <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-zinc-600 shadow-[0_2px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:shadow-[0_2px_20px_rgba(255,255,255,0.02)]">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                    <span>Enterprise Capabilities</span>
                                </div>
                            </FadeIn>
                            
                            <FadeIn delay={0.2}>
                                <h1 className="text-5xl font-medium leading-[0.95] tracking-tighter text-zinc-900 sm:text-7xl md:text-8xl lg:text-[7.5rem] dark:text-white">
                                    Built for growth, <br className="hidden md:block" />
                                    <span className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-400 bg-clip-text text-transparent dark:from-white dark:via-white/90 dark:to-white/30">
                                        designed to scale.
                                    </span>
                                </h1>
                            </FadeIn>
                            
                            <FadeIn delay={0.3}>
                                <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed tracking-tight text-zinc-500 sm:text-xl dark:text-white/50">
                                    FrameX combines modern serverless architecture, premium user experience, and robust enterprise controls so your product launches faster and stays performant at every stage.
                                </p>
                            </FadeIn>

                            <FadeIn delay={0.4}>
                                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Button size="lg" asChild className="group h-12 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-zinc-800 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                                        <Link href={register()}>
                                            Start Your Free Trial
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                        className="h-12 rounded-full border-black/10 bg-black/5 px-8 text-sm font-medium text-zinc-900 backdrop-blur-xl transition-all hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                    >
                                        <a href="/pricing">Explore Pricing</a>
                                    </Button>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── CORE FEATURES (BENTO GRID) ────────────────────── */}
                    <section className="relative z-20 py-24 md:py-32">
                        <div className="mx-auto max-w-7xl px-6">
                            <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
                                {coreFeatures.map((feature) => (
                                    <StaggerItem key={feature.title} className="h-full">
                                        <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg dark:border-white/5 dark:bg-[#0A0A0A] dark:shadow-none dark:hover:bg-[#111]">
                                            
                                            {/* Subtle Inner Glow */}
                                            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-500/5 blur-[50px] transition-all duration-700 group-hover:scale-150 group-hover:bg-blue-500/10 dark:bg-white/[0.03] dark:group-hover:bg-white/[0.08]" />

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between">
                                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/5 bg-zinc-50 shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 dark:border-white/10 dark:bg-white/[0.05]">
                                                        <feature.icon className="h-6 w-6 text-zinc-700 dark:text-white/80" />
                                                    </div>
                                                    <div className="rounded-full border border-black/5 bg-black/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-white/5 dark:bg-white/5 dark:text-white/40">
                                                        {feature.category}
                                                    </div>
                                                </div>
                                                
                                                <h3 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-white">
                                                    {feature.title}
                                                </h3>
                                                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-white/50">
                                                    {feature.description}
                                                </p>
                                            </div>

                                            <div className="relative z-10 mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                                                <ul className="grid grid-cols-2 gap-3">
                                                    {feature.benefits.map((benefit) => (
                                                        <li key={benefit} className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-white/70">
                                                            <CheckCircle className="h-3.5 w-3.5 text-blue-500 dark:text-white/40" />
                                                            {benefit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* ── ADDITIONAL CAPABILITIES ──────────────── */}
                    <section className="border-y border-black/5 bg-zinc-50/50 py-24 backdrop-blur-sm md:py-32 dark:border-white/5 dark:bg-[#0A0A0A]">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-2xl text-center">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                        The complete toolkit.
                                    </h2>
                                    <p className="mt-4 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                        Everything else you need to run, scale, and maintain a highly successful SaaS business without the operational headache.
                                    </p>
                                </div>
                            </FadeIn>

                            <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 lg:grid-cols-4">
                                {additionalFeatures.map((feature, idx) => (
                                    <FadeIn key={feature.title} delay={idx * 0.05}>
                                        <div className="group flex flex-col items-center text-center">
                                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-black/5 bg-white text-zinc-600 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md dark:border-white/10 dark:bg-[#111] dark:text-white/70 dark:shadow-none">
                                                <feature.icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-base font-medium text-zinc-900 dark:text-white">
                                                {feature.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-white/50">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── TESTIMONIALS (Editorial Style) ─────────────────────── */}
                    <section className="py-32 md:py-40">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mb-20 text-center">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                        Trusted by elite teams.
                                    </h2>
                                </div>
                            </FadeIn>

                            <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
                                {testimonials.map((testimonial, idx) => (
                                    <FadeIn key={testimonial.author} delay={idx * 0.15}>
                                        <div className="flex h-full flex-col">
                                            <div className="mb-6 flex gap-1">
                                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-zinc-900 text-zinc-900 dark:fill-white dark:text-white" />
                                                ))}
                                            </div>
                                            <blockquote className="text-xl font-medium leading-relaxed tracking-tight text-zinc-900 dark:text-white">
                                                "{testimonial.quote}"
                                            </blockquote>
                                            
                                            <div className="mt-auto pt-8 flex items-center gap-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-black/5 dark:ring-white/10">
                                                    <img 
                                                        src={testimonial.avatar} 
                                                        alt={testimonial.author} 
                                                        className="h-full w-full object-cover filter grayscale transition-all duration-500 hover:grayscale-0" 
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-base font-medium text-zinc-900 dark:text-white">
                                                        {testimonial.author}
                                                    </div>
                                                    <div className="text-sm text-zinc-500 dark:text-white/50">
                                                        {testimonial.role}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── FINAL CTA (Cinematic Dark Block) ──────────────────────────────── */}
                    <section className="py-24 pb-32">
                        <div className="mx-auto max-w-6xl px-6">
                            <FadeIn>
                                <div className="group relative overflow-hidden rounded-[40px] border border-black/10 bg-zinc-50 px-6 py-24 text-center shadow-lg sm:px-16 sm:py-32 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-[0_0_100px_rgba(255,255,255,0.02)]">
                                    
                                    {/* Ambient Glows */}
                                    <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/[0.03] blur-[80px] dark:bg-white/[0.03]" />
                                    <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/[0.03] blur-[80px] dark:bg-blue-500/[0.02]" />

                                    <div className="relative z-10 mx-auto max-w-3xl">
                                        <h2 className="text-4xl font-medium tracking-tighter text-zinc-900 sm:text-6xl dark:text-white">
                                            Ready to build something amazing?
                                        </h2>
                                        <p className="mx-auto mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                            Join thousands of elite developers who trust FrameX to power their products.
                                        </p>
                                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                            <Button size="lg" asChild className="h-12 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90">
                                                <Link href={register()}>
                                                    Get Started for Free
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button size="lg" variant="outline" asChild className="h-12 rounded-full border-black/10 bg-black/5 px-8 text-sm font-medium text-zinc-900 transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                                                <a href="/pricing">
                                                    View Pricing
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