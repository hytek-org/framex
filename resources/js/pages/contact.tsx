import { Head, Link } from '@inertiajs/react';
import { BookOpen, Github, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';

const channels = [
    {
        icon: Mail,
        title: 'Email Support',
        description: 'Reach the maintainers directly for technical questions, licensing, or security inquiries.',
        actionLabel: 'support@hytek.org.in',
        href: 'mailto:support@hytek.org.in',
        external: true,
    },
    {
        icon: Github,
        title: 'GitHub Repository',
        description: 'Report bugs, request features, or contribute pull requests to the open-source codebase.',
        actionLabel: 'hytek-org/framex',
        href: 'https://github.com/hytek-org/framex',
        external: true,
    },
    {
        icon: BookOpen,
        title: 'Documentation',
        description: 'Browse installation guides, module architecture references, and REST API documentation.',
        actionLabel: 'Browse Docs',
        href: '/docs',
        external: false,
    },
];

export default function Contact() {
    return (
        <>
            <Head title="Contact — FrameX" />

            <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

                <div className="relative z-10 px-6 pt-32 pb-24 md:pt-44">
                    <div className="mx-auto max-w-5xl">
                        {/* Header */}
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                    Get in Touch
                                </span>
                                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                                    Contact &amp; Support
                                </h1>
                                <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                                    Have questions about FrameX, modular extensions, or deploying in production? Connect with us through our official channels.
                                </p>
                            </div>
                        </FadeIn>

                        {/* Channels */}
                        <StaggerChildren className="mt-16 grid gap-6 md:grid-cols-3" staggerDelay={0.05}>
                            {channels.map((channel) => {
                                const Icon = channel.icon;
                                return (
                                    <StaggerItem key={channel.title}>
                                        <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
                                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                                                <Icon className="h-5 w-5 text-foreground" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-foreground">{channel.title}</h2>
                                            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                                                {channel.description}
                                            </p>
                                            <div className="mt-6">
                                                {channel.external ? (
                                                    <Button asChild variant="outline" className="w-full rounded-full">
                                                        <a href={channel.href} target="_blank" rel="noopener noreferrer">
                                                            {channel.actionLabel}
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <Button asChild variant="outline" className="w-full rounded-full">
                                                        <Link href={channel.href}>{channel.actionLabel}</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </StaggerItem>
                                );
                            })}
                        </StaggerChildren>

                        {/* Security Notice */}
                        <FadeIn delay={0.15}>
                            <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-xs sm:flex-row sm:items-center">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Responsible Security Disclosure
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Please do not open public GitHub issues for security vulnerabilities. Email{' '}
                                            <a
                                                href="mailto:support@hytek.org.in"
                                                className="font-medium text-foreground underline underline-offset-4"
                                            >
                                                support@hytek.org.in
                                            </a>{' '}
                                            directly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </>
    );
}
