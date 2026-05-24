import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Heart,
    Target,
    Zap,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   ABOUT DATA
   ────────────────────────────────────────────────────────── */
const stats = [
    { label: 'Active Developers', value: 50, suffix: 'K+' },
    { label: 'Projects Built', value: 100, suffix: 'K+' },
    { label: 'Countries', value: 120, suffix: '+' },
    { label: 'Platform Uptime', value: 99.99, suffix: '%', decimals: 2 },
];

const values = [
    {
        icon: Target,
        title: 'Mission-Driven',
        description: 'We exist to empower developers to build better software faster, creating tools that make a real difference in how teams work and products are built.',
        className: 'md:col-span-2 lg:col-span-2',
    },
    {
        icon: Heart,
        title: 'Developer-First',
        description: 'Every decision starts with the developer experience. We build tools we want to use ourselves.',
        className: 'md:col-span-1 lg:col-span-1',
    },
    {
        icon: Award,
        title: 'Quality Obsessed',
        description: 'We maintain the highest standards in everything we do, ensuring enterprise-grade reliability.',
        className: 'md:col-span-1 lg:col-span-1',
    },
    {
        icon: Zap,
        title: 'Innovation Focused',
        description: 'We continuously push the boundaries of what is possible, adopting cutting-edge methodologies.',
        className: 'md:col-span-2 lg:col-span-2',
    },
];

const team = [
    {
        name: 'Alex Chen',
        role: 'CEO & Founder',
        bio: 'Former engineering lead at Stripe, obsessed with crafting the ultimate developer experience.',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Sarah Johnson',
        role: 'Chief Technology Officer',
        bio: 'Ex-Google engineer with a decade of expertise in designing hyper-scalable systems architecture.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Marcus Kim',
        role: 'Head of Product',
        bio: 'Product veteran from Slack and Figma, relentlessly focused on intuitive user interfaces.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Emma Rodriguez',
        role: 'VP of Engineering',
        bio: 'Open source champion and engineering leader bridging the gap between design and robust code.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    },
];

/* ──────────────────────────────────────────────────────────
   PAGE COMPONENT
   ────────────────────────────────────────────────────────── */
export default function About() {
    return (
        <>
            <Head title="About Us - FrameX" />

            <div className="relative min-h-screen overflow-hidden bg-white font-sans text-zinc-950 selection:bg-black/10 selection:text-black transition-colors duration-300 dark:bg-[#050505] dark:text-[#FAFAFA] dark:selection:bg-white/20 dark:selection:text-white">
                
                {/* ── AMBIENT LIGHTING & NOISE TEXTURE ── */}
                <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
                    <div className="absolute left-1/2 top-[-20%] h-[800px] w-[1200px] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-black/[0.02] to-transparent blur-[120px] dark:from-white/[0.04]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10">
                    
                    {/* ── UNIFIED HERO + IMAGE + STATS COMPOSITION ─────────────────────────────── */}
                    <section className="relative pt-32 md:pt-48 pb-20">
                        <div className="mx-auto max-w-[1200px] px-6 text-center">
                            
                            {/* Huge Typography */}
                            <FadeIn direction="down">
                                <h1 className="mx-auto max-w-5xl text-6xl font-medium leading-[0.95] tracking-tighter  sm:text-7xl md:text-8xl">
                                    Crafting the <br className="hidden sm:block" />
                                    <span className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-400 bg-clip-text text-transparent dark:from-white dark:via-white/90 dark:to-white/30">
                                        modern standard.
                                    </span>
                                </h1>
                                <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed tracking-tight text-zinc-500 sm:text-xl dark:text-white/50">
                                    We are a collective of engineers and designers building the ultimate foundation for the next generation of SaaS products.
                                </p>
                            </FadeIn>
                        </div>

                        {/* Cinematic Image with Floating Stats */}
                        <div className="relative mx-auto mt-20 max-w-[1400px] px-4 sm:px-6">
                            <FadeIn delay={0.3}>
                                <div className="group relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-zinc-100 dark:bg-zinc-900 shadow-2xl">
                                    <img 
                                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80" 
                                        alt="FrameX Team" 
                                        className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                                    />
                                    {/* Vignette/Glow overlays */}
                                    <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-black/5 dark:ring-white/10" />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-50 dark:from-black/60" />
                                </div>
                            </FadeIn>

                            {/* Floating Stats Panel overlapping the bottom of the image */}
                            <FadeIn delay={0.5}>
                                <div className="absolute -bottom-12 left-1/2 w-[90%] max-w-5xl -translate-x-1/2 overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#111]/80 dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] md:-bottom-16 md:p-10">
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/[0.01] via-transparent to-black/[0.01] opacity-50 dark:from-white/[0.02] dark:to-white/[0.02]" />
                                    <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4 md:divide-x md:divide-black/5 dark:md:divide-white/10">
                                        {stats.map((stat) => (
                                            <div key={stat.label} className="flex flex-col items-center justify-center text-center">
                                                <div className="tabular-nums text-4xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                                    <AnimatedCounter
                                                        value={stat.value}
                                                        suffix={stat.suffix}
                                                        decimals={stat.decimals || 0}
                                                    />
                                                </div>
                                                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── THE MANIFESTO (Replacing the cluttered 2-column story) ───────────────────────── */}
                    <section className="py-32 md:py-48 px-6">
                        <div className="mx-auto max-w-4xl text-center">
                            <FadeIn>
                                <p className="text-2xl sm:text-3xl md:text-4xl font-medium leading-snug tracking-tight text-zinc-900 dark:text-white">
                                    "Modern startups shouldn't have to choose between shipping fast and shipping quality. We built FrameX to effortlessly blend thoughtful design, raw performance, and enterprise-ready controls right out of the box."
                                </p>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── OUR VALUES (Hardware-Accelerated Bento Grid) ──────────────────────── */}
                    <section className="relative border-y border-black/5 bg-zinc-50/50 py-32 md:py-48 dark:border-white/5 dark:bg-[#0A0A0A]">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-2xl text-center">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                        Our core principles.
                                    </h2>
                                    <p className="mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                        The uncompromising values behind every line of code we write, every pixel we design, and every decision we make.
                                    </p>
                                </div>
                            </FadeIn>

                            <StaggerChildren className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4" staggerDelay={0.1}>
                                {values.map((value) => (
                                    <StaggerItem key={value.title} className={value.className}>
                                        <div className="group relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[32px] border border-black/5 bg-white p-10 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-[#111]/50 dark:shadow-none dark:hover:bg-[#111]">
                                            
                                            {/* Top right subtle accent */}
                                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/5 blur-[50px] transition-all duration-700 group-hover:scale-150 group-hover:bg-blue-500/10 dark:bg-white/5 dark:group-hover:bg-white/10" />
                                            
                                            <div className="relative z-10">
                                                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-black/5 bg-zinc-50 shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 dark:border-white/10 dark:bg-white/[0.05]">
                                                    <value.icon className="h-6 w-6 text-zinc-700 dark:text-white/80" />
                                                </div>
                                                <h3 className="mb-3 text-2xl font-medium tracking-tight text-zinc-900 dark:text-white">
                                                    {value.title}
                                                </h3>
                                                <p className="text-base leading-relaxed text-zinc-500 dark:text-white/50">
                                                    {value.description}
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* ── TEAM ────────────────────────────── */}
                    <section className="py-32 md:py-48">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-2xl text-center">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                        Meet the team.
                                    </h2>
                                    <p className="mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                        A dedicated group of industry veterans obsessed with developer experience and beautiful, highly functional interfaces.
                                    </p>
                                </div>
                            </FadeIn>

                            <StaggerChildren className="mt-24 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
                                {team.map((member) => (
                                    <StaggerItem key={member.name}>
                                        <div className="group flex flex-col text-center sm:text-left">
                                            {/* Premium Grayscale to Color Hover effect */}
                                            <div className="relative mb-6 aspect-square overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900">
                                                <img 
                                                    src={member.image} 
                                                    alt={member.name}
                                                    className="h-full w-full object-cover filter grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-black/5 dark:ring-white/10" />
                                            </div>
                                            <h3 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-white">
                                                {member.name}
                                            </h3>
                                            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                                                {member.role}
                                            </p>
                                            <p className="mt-4 text-base leading-relaxed text-zinc-500 dark:text-white/50">
                                                {member.bio}
                                            </p>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* ── CINEMATIC CTA ──────────────────────────────── */}
                    <section className="py-24 pb-32">
                        <div className="mx-auto max-w-5xl px-6">
                            <FadeIn>
                                <div className="group relative overflow-hidden rounded-[40px] border border-black/10 bg-zinc-50 px-6 py-24 text-center shadow-lg sm:px-16 sm:py-32 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-[0_0_100px_rgba(255,255,255,0.02)]">
                                    
                                    {/* Ambient Glows */}
                                    <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/[0.03] blur-[80px] dark:bg-white/[0.03]" />
                                    <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/[0.03] blur-[80px] dark:bg-blue-500/[0.02]" />

                                    <div className="relative z-10 mx-auto max-w-2xl">
                                        <h2 className="text-4xl font-medium tracking-tighter text-zinc-900 sm:text-6xl dark:text-white">
                                            Ready to build the future?
                                        </h2>
                                        <p className="mx-auto mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                            Be part of the community shaping the next generation of SaaS products. Start building with FrameX today.
                                        </p>
                                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                            <Button size="lg" asChild className="h-12 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90">
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