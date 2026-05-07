import { Head } from '@inertiajs/react';
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
} from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   ABOUT DATA
   ────────────────────────────────────────────────────────── */
const stats = [
    { label: 'Active Developers', value: '50K+', icon: Users },
    { label: 'Projects Built', value: '100K+', icon: Code },
    { label: 'Countries', value: '120+', icon: Globe },
    { label: 'Uptime', value: '99.9%', icon: TrendingUp },
];

const values = [
    {
        icon: Target,
        title: 'Mission-Driven',
        description: 'We exist to empower developers to build better software faster, creating tools that make a real difference in how teams work and products are built.',
    },
    {
        icon: Heart,
        title: 'Developer-First',
        description: 'Every decision we make starts with the developer experience. We build tools we would want to use ourselves, prioritizing simplicity and power.',
    },
    {
        icon: Award,
        title: 'Quality Obsessed',
        description: 'We maintain the highest standards in everything we do, from code quality to customer support, ensuring reliability and excellence.',
    },
    {
        icon: Zap,
        title: 'Innovation Focused',
        description: 'We continuously push the boundaries of what\'s possible, adopting new technologies and methodologies to stay ahead of the curve.',
    },
];

const team = [
    {
        name: 'Alex Chen',
        role: 'CEO & Founder',
        bio: 'Former engineering lead at Stripe, passionate about developer tools.',
        avatar: 'AC',
    },
    {
        name: 'Sarah Johnson',
        role: 'CTO',
        bio: 'Ex-Google engineer with 10+ years in scalable systems architecture.',
        avatar: 'SJ',
    },
    {
        name: 'Marcus Kim',
        role: 'Head of Product',
        bio: 'Product veteran from Slack and Figma, focused on user experience.',
        avatar: 'MK',
    },
    {
        name: 'Emma Rodriguez',
        role: 'VP Engineering',
        bio: 'Open source contributor and engineering leader from GitHub.',
        avatar: 'ER',
    },
];

const milestones = [
    { year: '2020', event: 'FrameX founded with a vision to simplify SaaS development' },
    { year: '2021', event: 'Launched first version with core authentication and billing' },
    { year: '2022', event: 'Reached 10,000+ active developers and added team features' },
    { year: '2023', event: 'Expanded to enterprise features and global infrastructure' },
    { year: '2024', event: 'Open sourced the platform and grew to 50,000+ developers' },
];

/* ──────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────── */
export default function About() {
    return (
        <>
            <Head title="About Us - FrameX" />

            <div className="space-y-0">
                {/* ── HERO ─────────────────────────────── */}
                <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                    <div className="gradient-mesh pointer-events-none absolute inset-0" />
                    <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />

                    <div className="relative mx-auto max-w-4xl px-6 text-center">
                        <FadeIn delay={0.1}>
                            <Badge variant="secondary" className="mb-4">
                                <Users className="mr-1 h-3 w-3" />
                                Our Story
                            </Badge>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                                Building the future of
                                <br />
                                <span className="text-gradient-brand">SaaS development</span>
                            </h1>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                We're on a mission to democratize SaaS development, providing developers
                                with the tools and infrastructure they need to build world-class products.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* ── STATS ────────────────────────────── */}
                <section className="border-y py-16 md:py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <div className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                            {stat.value}
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

                {/* ── OUR STORY ───────────────────────── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
                            <FadeIn>
                                <div>
                                    <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                        Our Story
                                    </h2>
                                    <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                                        <p>
                                            FrameX was born from frustration. As developers building SaaS products,
                                            we found ourselves rebuilding the same features over and over: authentication,
                                            billing, team management, notifications.
                                        </p>
                                        <p>
                                            We realized that every SaaS company faces the same challenges. So we decided
                                            to build once, and let everyone benefit. What started as a simple authentication
                                            library has grown into a comprehensive platform that powers thousands of SaaS products.
                                        </p>
                                        <p>
                                            Today, FrameX is trusted by developers worldwide to build faster, scale easier,
                                            and focus on what matters most: their unique product vision.
                                        </p>
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <div className="space-y-6">
                                    {milestones.map((milestone, index) => (
                                        <div key={milestone.year} className="flex gap-4">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-foreground">
                                                    {milestone.year}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {milestone.event}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* ── OUR VALUES ──────────────────────── */}
                <section className="border-y bg-muted/30 py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Our Values
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    The principles that guide everything we do
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-8 md:grid-cols-2" staggerDelay={0.1}>
                            {values.map((value) => (
                                <StaggerItem key={value.title}>
                                    <Card className="h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <value.icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="mt-4 text-lg font-semibold text-foreground">
                                                {value.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {value.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </section>

                {/* ── TEAM ────────────────────────────── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Meet the Team
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    The people behind FrameX, dedicated to your success
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
                            {team.map((member) => (
                                <StaggerItem key={member.name}>
                                    <Card className="text-center">
                                        <CardContent className="pt-6">
                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                                                {member.avatar}
                                            </div>
                                            <h3 className="mt-4 text-base font-semibold text-foreground">
                                                {member.name}
                                            </h3>
                                            <p className="text-sm text-primary">{member.role}</p>
                                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                                {member.bio}
                                            </p>
                                        </CardContent>
                                    </Card>
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
                                        Join our community
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
                                        Be part of the future of SaaS development. Start building with FrameX today.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Button size="lg" asChild>
                                            <a href={String(register())}>
                                                Get Started Free
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button size="lg" variant="outline" asChild>
                                            <a href="/pricing">View Pricing</a>
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