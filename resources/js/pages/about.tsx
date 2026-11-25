import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Blocks, Code2, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

const principles = [
    {
        icon: Blocks,
        title: 'Modular Monolith',
        description:
            'FrameX organizes domain capabilities into clean, self-contained modules under app/FrameX/Modules without the operational overhead of microservices.',
    },
    {
        icon: Code2,
        title: 'End-to-End Type Safety',
        description:
            'Laravel Wayfinder generates typed TypeScript functions for controllers and routes, bridging Laravel 13 and React 19 seamlessly.',
    },
    {
        icon: ShieldCheck,
        title: 'Security by Default',
        description:
            'Fortify authentication, TOTP 2FA, passkeys, Sanctum API tokens, and strict team-scoped policies are built into the foundation.',
    },
    {
        icon: Terminal,
        title: 'Developer Velocity',
        description:
            'An interactive CLI installer (framex:install), diagnostic checks (framex:doctor), and Pest tests let teams ship features immediately.',
    },
];

export default function About() {
    return (
        <>
            <Head title="About — FrameX" />

            <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

                <div className="relative z-10 px-6 pt-32 pb-24 md:pt-44">
                    <div className="mx-auto max-w-5xl">
                        {/* Hero */}
                        <FadeIn>
                            <div className="mx-auto max-w-3xl text-center">
                                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                                    <Zap className="h-3.5 w-3.5 text-primary" />
                                    About FrameX
                                </span>
                                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                                    Engineered to eliminate SaaS boilerplate
                                </h1>
                                <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    FrameX is an open-source Laravel 13 and React 19 starter platform designed by HYTEK to give engineering teams a production-grade foundation for multi-tenant workspaces, content, forms, billing, and real-time collaboration.
                                </p>
                            </div>
                        </FadeIn>

                        {/* Principles Grid */}
                        <StaggerChildren className="mt-16 grid gap-6 md:grid-cols-2" staggerDelay={0.05}>
                            {principles.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <StaggerItem key={item.title}>
                                        <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-7 shadow-xs">
                                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                                                <Icon className="h-5 w-5 text-foreground" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    </StaggerItem>
                                );
                            })}
                        </StaggerChildren>

                        {/* CTA */}
                        <FadeIn delay={0.15}>
                            <div className="mt-20 rounded-2xl border border-border/60 bg-card p-8 text-center shadow-xs sm:p-12">
                                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    Explore the architecture
                                </h2>
                                <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                                    Read the technical documentation or create an account to explore the workspace.
                                </p>
                                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <Button asChild size="lg" className="h-11 rounded-full px-7 font-medium">
                                        <Link href={register()}>
                                            Get Started
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="h-11 rounded-full px-7 font-medium">
                                        <Link href="/docs">Read Documentation</Link>
                                    </Button>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </>
    );
}
