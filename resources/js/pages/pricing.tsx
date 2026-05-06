import { Head, Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
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
                                                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
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
