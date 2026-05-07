import { Head } from '@inertiajs/react';
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
    CheckCircle,
    Star,
    TrendingUp,
    Globe,
    Smartphone,
    Cloud,
    Database,
    Code,
    Settings,
    Activity,
} from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   FEATURES DATA
   ────────────────────────────────────────────────────────── */
const coreFeatures = [
    {
        icon: Users,
        title: 'Multi-Tenant Teams',
        description: 'Advanced team management with role-based permissions, invitations, and seamless switching between workspaces.',
        benefits: ['Unlimited teams', 'Granular permissions', 'Team analytics', 'Activity tracking'],
        category: 'Collaboration',
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'Bank-grade security with 2FA, SSO, encrypted data, and comprehensive audit logs.',
        benefits: ['End-to-end encryption', 'SSO/SAML ready', 'GDPR compliant', 'Security audits'],
        category: 'Security',
    },
    {
        icon: CreditCard,
        title: 'Flexible Billing',
        description: 'Stripe-powered subscriptions with proration, coupons, invoices, and customer portal.',
        benefits: ['Multiple currencies', 'Usage-based billing', 'Custom plans', 'Revenue analytics'],
        category: 'Billing',
    },
    {
        icon: BarChart3,
        title: 'Advanced Analytics',
        description: 'Real-time dashboards with custom metrics, charts, and exportable reports.',
        benefits: ['Real-time data', 'Custom dashboards', 'Data export', 'API access'],
        category: 'Analytics',
    },
    {
        icon: Bell,
        title: 'Smart Notifications',
        description: 'Intelligent notification system with email, in-app, and webhook integrations.',
        benefits: ['Custom triggers', 'Multi-channel', 'Webhook support', 'Notification history'],
        category: 'Communication',
    },
    {
        icon: Key,
        title: 'API Management',
        description: 'Full-featured API with token management, rate limiting, and developer documentation.',
        benefits: ['RESTful API', 'Token management', 'Rate limiting', 'Auto-generated docs'],
        category: 'Developer',
    },
];

const additionalFeatures = [
    { icon: Globe, title: 'Global CDN', description: 'Fast content delivery worldwide' },
    { icon: Smartphone, title: 'Mobile Apps', description: 'Native iOS and Android apps' },
    { icon: Cloud, title: 'Cloud Storage', description: 'Scalable file storage with backups' },
    { icon: Database, title: 'Database Tools', description: 'Advanced database management' },
    { icon: Code, title: 'Developer Tools', description: 'CLI tools and SDKs' },
    { icon: Settings, title: 'Automation', description: 'Workflow automation and integrations' },
    { icon: Activity, title: 'Monitoring', description: 'System health and performance monitoring' },
    { icon: Lock, title: 'Compliance', description: 'SOC 2, HIPAA, and ISO certifications' },
];

const testimonials = [
    {
        quote: "FrameX transformed our development workflow. We went from idea to production in weeks, not months.",
        author: "Sarah Chen",
        role: "CTO, TechFlow",
        avatar: "SC",
        rating: 5,
    },
    {
        quote: "The team features are incredible. Managing multiple clients has never been easier.",
        author: "Marcus Rodriguez",
        role: "Founder, DevStudio",
        avatar: "MR",
        rating: 5,
    },
    {
        quote: "Enterprise-grade security out of the box. Our compliance team is finally happy.",
        author: "Emily Watson",
        role: "Security Lead, DataCorp",
        avatar: "EW",
        rating: 5,
    },
];

/* ──────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────── */
export default function Features() {
    return (
        <>
            <Head title="Features - Enterprise SaaS Platform" />

            <div className="space-y-0">
                {/* ── HERO ─────────────────────────────── */}
                <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                    <div className="gradient-mesh pointer-events-none absolute inset-0" />
                    <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />

                    <div className="relative mx-auto max-w-4xl px-6 text-center">
                        <FadeIn delay={0.1}>
                            <Badge variant="secondary" className="mb-4">
                                <Zap className="mr-1 h-3 w-3" />
                                Enterprise Features
                            </Badge>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                                Everything you need to
                                <br />
                                <span className="text-gradient-brand">scale globally</span>
                            </h1>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                From startup to enterprise, FrameX provides the tools and infrastructure
                                to build, launch, and scale world-class SaaS products.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.4}>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button size="lg" asChild className="min-w-40">
                                    <a href={register()}>
                                        Start Building
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    asChild
                                    className="min-w-40"
                                >
                                    <a href="/pricing">View Pricing</a>
                                </Button>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── CORE FEATURES ────────────────────── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Core Features
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Powerful features designed for modern SaaS applications
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
                            {coreFeatures.map((feature) => (
                                <StaggerItem key={feature.title}>
                                    <Card className="group relative h-full transition-all duration-200 hover:shadow-lg dark:hover:shadow-black/20">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                                    <feature.icon className="h-5 w-5" />
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {feature.category}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                                            <CardDescription className="text-sm leading-relaxed">
                                                {feature.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {feature.benefits.map((benefit) => (
                                                    <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                                                        {benefit}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </section>

                {/* ── ADDITIONAL FEATURES ──────────────── */}
                <section className="border-y bg-muted/30 py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Additional Capabilities
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Everything else you need to run a successful SaaS business
                                </p>
                            </div>
                        </FadeIn>

                        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
                            {additionalFeatures.map((feature) => (
                                <FadeIn key={feature.title} delay={0.1}>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-3 text-sm font-semibold text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ─────────────────────── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Trusted by developers worldwide
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    See what our customers say about building with FrameX
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
                            {testimonials.map((testimonial) => (
                                <StaggerItem key={testimonial.author}>
                                    <Card className="h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex gap-1">
                                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                                ))}
                                            </div>
                                            <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                                                "{testimonial.quote}"
                                            </blockquote>
                                            <div className="mt-4 flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                    {testimonial.avatar}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-foreground">
                                                        {testimonial.author}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {testimonial.role}
                                                    </div>
                                                </div>
                                            </div>
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
                                        Ready to build something amazing?
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
                                        Join thousands of developers who trust FrameX to power their SaaS products.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Button size="lg" asChild>
                                            <a href={register()}>
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