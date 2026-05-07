import { Head, Link, usePage } from '@inertiajs/react';
import { Check, X, Star } from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { register } from '@/routes';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for side projects and experimentation.',
        features: [
            'Up to 3 team members',
            '1 workspace',
            '100MB file storage',
            'Community support',
            'Basic analytics',
        ],
        cta: 'Get Started',
        href: register(),
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '$29',
        period: '/month',
        description: 'For growing teams that need more power.',
        features: [
            'Up to 25 team members',
            'Unlimited workspaces',
            '10GB file storage',
            'Priority support',
            'Advanced analytics',
            'API access',
            'Custom integrations',
            'Audit logs',
        ],
        cta: 'Start Free Trial',
        href: register(),
        highlighted: true,
    },
    {
        name: 'Scale',
        price: '$99',
        period: '/month',
        description: 'For organizations that need enterprise features.',
        features: [
            'Unlimited team members',
            'Unlimited workspaces',
            '100GB file storage',
            'Dedicated support',
            'Advanced analytics',
            'API access',
            'Custom integrations',
            'Audit logs',
            'SSO / SAML',
            'SLA guarantee',
        ],
        cta: 'Contact Sales',
        href: '#',
        highlighted: false,
    },
];

const comparisonFeatures = [
    { feature: 'Team Members', free: '3', pro: '25', scale: 'Unlimited' },
    { feature: 'Workspaces', free: '1', pro: 'Unlimited', scale: 'Unlimited' },
    { feature: 'File Storage', free: '100MB', pro: '10GB', scale: '100GB' },
    { feature: 'API Access', free: false, pro: true, scale: true },
    { feature: 'Custom Integrations', free: false, pro: true, scale: true },
    { feature: 'Priority Support', free: false, pro: true, scale: true },
    { feature: 'SSO/SAML', free: false, pro: false, scale: true },
    { feature: 'Dedicated Support', free: false, pro: false, scale: true },
    { feature: 'SLA Guarantee', free: false, pro: false, scale: true },
];

const testimonials = [
    {
        quote: "FrameX's pricing is incredibly fair. We started free, grew to Pro, and now Scale. Perfect for our journey.",
        author: "David Park",
        role: "CEO, StartupCo",
        plan: "Scale",
    },
    {
        quote: "The free tier got us started, and the upgrade process was seamless. Best investment we've made.",
        author: "Lisa Chen",
        role: "CTO, TechCorp",
        plan: "Pro",
    },
];

const faqs = [
    {
        q: 'Can I upgrade or downgrade at any time?',
        a: 'Yes. You can change your plan at any time. Changes take effect immediately and billing is prorated.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards and debit cards via Stripe. Annual billing is available on Pro and Scale plans.',
    },
    {
        q: 'Is there a free trial for paid plans?',
        a: 'Yes. All paid plans come with a 14-day free trial. No credit card required to start.',
    },
    {
        q: 'Do you offer discounts for startups?',
        a: 'Yes. We offer 50% off for the first year for early-stage startups. Contact us to apply.',
    },
    {
        q: 'What happens when I exceed my storage limit?',
        a: 'We will notify you when you reach 80% of your storage. You can upgrade your plan or remove files at any time.',
    },
    {
        q: 'Can I self-host FrameX?',
        a: 'Absolutely. FrameX is fully open source. You can self-host on your own infrastructure with Docker.',
    },
];

export default function Pricing() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Pricing" />

            <div className="space-y-0">
                {/* Hero */}
                <section className="pt-32 pb-16 md:pt-40">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <FadeIn>
                            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                Simple, transparent pricing
                            </h1>
                            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                                Start free and scale as you grow. No hidden fees,
                                no surprises, no lock-in.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* Plans */}
                <section className="pb-20 md:pb-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <StaggerChildren className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
                            {plans.map((plan) => (
                                <StaggerItem key={plan.name}>
                                    <div
                                        className={cn(
                                            'relative flex h-full flex-col rounded-2xl border p-7 transition-all',
                                            plan.highlighted
                                                ? 'border-primary/40 bg-card shadow-xl shadow-primary/5 dark:shadow-primary/10'
                                                : 'bg-card hover:shadow-lg dark:hover:shadow-black/20',
                                        )}
                                    >
                                        {plan.highlighted && (
                                            <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                                                Most popular
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {plan.name}
                                            </h3>
                                            <div className="mt-3 flex items-baseline gap-1">
                                                <span className="text-4xl font-semibold tracking-tight text-foreground">
                                                    {plan.price}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {plan.period}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm text-muted-foreground">
                                                {plan.description}
                                            </p>
                                        </div>

                                        <ul className="mt-6 flex-1 space-y-3">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-start gap-2.5 text-sm text-foreground"
                                                >
                                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            asChild
                                            className="mt-8 w-full"
                                            variant={
                                                plan.highlighted
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="lg"
                                        >
                                            <Link href={auth?.user ? '/billing' : plan.href}>
                                                {auth?.user ? 'Upgrade now' : plan.cta}
                                            </Link>
                                        </Button>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </section>

                {/* Comparison Table */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Compare Plans
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Detailed breakdown of what's included in each plan
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <Card className="mt-14 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4 font-semibold">Features</th>
                                                <th className="text-center p-4 font-semibold">Free</th>
                                                <th className="text-center p-4 font-semibold">
                                                    Pro
                                                    <Badge className="ml-2">Popular</Badge>
                                                </th>
                                                <th className="text-center p-4 font-semibold">Scale</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonFeatures.map((item, index) => (
                                                <tr key={item.feature} className={cn("border-b", index % 2 === 0 ? "bg-muted/30" : "")}>
                                                    <td className="p-4 font-medium">{item.feature}</td>
                                                    <td className="p-4 text-center">
                                                        {typeof item.free === 'boolean' ? (
                                                            item.free ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <X className="mx-auto h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <span className="text-sm">{item.free}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {typeof item.pro === 'boolean' ? (
                                                            item.pro ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <X className="mx-auto h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <span className="text-sm">{item.pro}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {typeof item.scale === 'boolean' ? (
                                                            item.scale ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <X className="mx-auto h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <span className="text-sm">{item.scale}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </FadeIn>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="border-y bg-muted/30 py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    What our customers say
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Trusted by developers at companies of all sizes
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-2" staggerDelay={0.1}>
                            {testimonials.map((testimonial) => (
                                <StaggerItem key={testimonial.author}>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex gap-1 mb-4">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                                ))}
                                            </div>
                                            <blockquote className="text-sm leading-relaxed text-foreground mb-4">
                                                "{testimonial.quote}"
                                            </blockquote>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-foreground">
                                                        {testimonial.author}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {testimonial.role}
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{testimonial.plan}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </section>

                {/* FAQ */}
                <section className="border-t py-20 md:py-28">
                    <div className="mx-auto max-w-3xl px-6">
                        <FadeIn>
                            <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground">
                                Frequently asked questions
                            </h2>
                        </FadeIn>

                        <StaggerChildren className="mt-12 space-y-6" staggerDelay={0.06}>
                            {faqs.map((faq) => (
                                <StaggerItem key={faq.q}>
                                    <div className="rounded-xl border bg-card p-5">
                                        <h3 className="text-sm font-semibold text-foreground">
                                            {faq.q}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {faq.a}
                                        </p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </section>
            </div>
        </>
    );
}
