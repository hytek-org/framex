import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Users,
    Target,
    Heart,
    Award,
    TrendingUp,
    Globe,
    Code,
    Zap,
    Sparkles,
} from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   ABOUT DATA
   ────────────────────────────────────────────────────────── */
const stats = [
    { label: 'Active Developers', value: '50K+', icon: Users },
    { label: 'Projects Built', value: '100K+', icon: Code },
    { label: 'Countries', value: '120+', icon: Globe },
    { label: 'Platform Uptime', value: '99.99%', icon: TrendingUp },
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
   PAGE
   ────────────────────────────────────────────────────────── */
export default function About() {
    return (
        <>
            <Head title="About Us - FrameX" />

            <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
                
                {/* ── SUBTLE BACKGROUND EFFECTS ── */}
                <div className="pointer-events-none fixed inset-0 flex justify-center bg-background">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                    <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
                </div>

                <div className="relative z-10 space-y-0 pb-20">
                    
                    {/* ── HERO ─────────────────────────────── */}
                    <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32">
                        <div className="relative mx-auto max-w-300 px-6 text-center">
                            <FadeIn delay={0.1}>
                                <div className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/50 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-xl transition-all hover:bg-background/80">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="text-foreground">Our Story</span>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <h1 className="text-5xl font-semibold tracking-tighter sm:text-7xl md:text-8xl">
                                    Where elegant design
                                    <br className="hidden sm:block" />
                                    <span className="bg-linear-to-br from-foreground to-foreground/40 bg-clip-text text-transparent"> meets enterprise scale.</span>
                                </h1>
                            </FadeIn>

                            <FadeIn delay={0.3}>
                                <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
                                    FrameX is the foundation chosen by ambitious teams that demand premium UX, rapid delivery, and a platform they can scale with absolute confidence.
                                </p>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── STATS FLOATING PANEL ──────────────── */}
                    <section className="relative z-10 pb-24">
                        <div className="mx-auto max-w-6xl px-6">
                            <FadeIn delay={0.4}>
                                <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-background/60 p-10 shadow-2xl backdrop-blur-3xl sm:p-16">
                                    <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent opacity-50" />
                                    <div className="relative grid grid-cols-2 gap-10 divide-border/50 md:grid-cols-4 md:divide-x">
                                        {stats.map((stat, i) => (
                                            <div key={stat.label} className={`flex flex-col items-center justify-center text-center ${i % 2 === 0 ? 'border-none' : ''}`}>
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg">
                                                    <stat.icon className="h-5 w-5" />
                                                </div>
                                                <div className="text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl">
                                                    {stat.value}
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

                    {/* ── OUR STORY (Editorial Layout) ───────────────────────── */}
                    <section className="py-24 md:py-32">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
                                <FadeIn>
                                    <div className="relative overflow-hidden rounded-[2.5rem] aspect-4/3 bg-muted/30">
                                        <img 
                                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
                                            alt="Team collaborating" 
                                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                        />
                                        <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.2}>
                                    <div className="max-w-xl">
                                        <h2 className="text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl">
                                            Built for builders.
                                        </h2>
                                        <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
                                            <p>
                                                FrameX began with a singular, clear mission: remove the repetitive, mundane work from SaaS development and give engineering teams a polished, beautiful foundation they could instantly trust.
                                            </p>
                                            <p>
                                                We realized that modern startups shouldn't have to choose between shipping fast and shipping quality. We built a product that seamlessly blends thoughtful design, modern performance, and enterprise-ready controls right out of the box.
                                            </p>
                                            <p className="font-medium text-foreground">
                                                Today, FrameX is used by ambitious teams worldwide to build better products, faster — with confidence and composure.
                                            </p>
                                        </div>
                                    </div>
                                </FadeIn>
                            </div>
                        </div>
                    </section>

                    {/* ── OUR VALUES (Apple-style Bento) ──────────────────────── */}
                    <section className="relative border-y border-border/40 bg-muted/20 py-24 md:py-40 backdrop-blur-sm">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-2xl text-center">
                                    <h2 className="text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
                                        Our core values.
                                    </h2>
                                    <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                                        The guiding principles behind every line of code we write and every pixel we design.
                                    </p>
                                </div>
                            </FadeIn>

                            <StaggerChildren className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4" staggerDelay={0.08}>
                                {values.map((value) => (
                                    <StaggerItem key={value.title} className={value.className}>
                                        <div className="group relative flex h-full min-h-70 flex-col justify-between overflow-hidden rounded-[2.5rem] border border-border/50 bg-background/60 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
                                            
                                            <div>
                                                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg transition-transform duration-500 group-hover:scale-110">
                                                    <value.icon className="h-6 w-6" />
                                                </div>
                                                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                                    {value.title}
                                                </h3>
                                                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
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
                    <section className="py-24 md:py-40">
                        <div className="mx-auto max-w-7xl px-6">
                            <FadeIn>
                                <div className="mx-auto max-w-2xl text-center">
                                    <h2 className="text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
                                        Meet the minds behind it.
                                    </h2>
                                    <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                                        A dedicated team of industry veterans obsessed with developer experience and beautiful interfaces.
                                    </p>
                                </div>
                            </FadeIn>

                            <StaggerChildren className="mt-24 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
                                {team.map((member) => (
                                    <StaggerItem key={member.name}>
                                        <div className="group flex flex-col text-center sm:text-left">
                                            <div className="relative mb-6 aspect-square overflow-hidden rounded-4xl bg-muted/30">
                                                <img 
                                                    src={member.image} 
                                                    alt={member.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 rounded-4xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                                            </div>
                                            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                                {member.name}
                                            </h3>
                                            <p className="mt-1 text-sm font-medium uppercase tracking-widest text-primary">
                                                {member.role}
                                            </p>
                                            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                                                {member.bio}
                                            </p>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* ── CTA (Massive Dark Mode Contrast Block) ──────────────────────────────── */}
                    <section className="py-24 md:py-32">
                        <div className="mx-auto max-w-6xl px-6">
                            <FadeIn>
                                <div className="relative overflow-hidden rounded-[3rem] bg-foreground px-6 py-20 text-center shadow-2xl sm:px-16 sm:py-32">
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
                                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-77.5 w-77.5 rounded-full bg-primary opacity-20 blur-[100px]" />

                                    <div className="relative z-10 mx-auto max-w-3xl">
                                        <h2 className="text-4xl font-semibold tracking-tighter text-background sm:text-6xl md:text-7xl">
                                            Ready to build the future?
                                        </h2>
                                        <p className="mx-auto mt-8 max-w-2xl text-xl text-background/70 leading-relaxed">
                                            Be part of the community shaping the next generation of SaaS products. Start building with FrameX today.
                                        </p>
                                        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
                                            <Button size="lg" asChild className="h-14 rounded-full bg-background text-foreground hover:bg-background/90 px-8 text-lg font-medium transition-transform hover:scale-105">
                                                <Link href={register()}>
                                                    Get Started for Free
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Link>
                                            </Button>
                                            <Button size="lg" variant="outline" asChild className="h-14 rounded-full border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background px-8 text-lg font-medium transition-colors">
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