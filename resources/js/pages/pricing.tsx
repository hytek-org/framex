import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Minus, Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { register } from '@/routes';

interface Plan {
    name: string;
    priceMonthly: string;
    priceAnnually: string;
    description: string;
    features: string[];
    cta: string;
    href: string;
    highlighted: boolean;
}

const plans: Plan[] = [
    {
        name: 'Free',
        priceMonthly: '$0',
        priceAnnually: '$0',
        description: 'For solo builders validating an idea.',
        features: ['1 team', '1,000 API calls', 'Community support', 'Core workspace & auth'],
        cta: 'Get Started',
        href: register().url,
        highlighted: false,
    },
    {
        name: 'Pro',
        priceMonthly: '$29',
        priceAnnually: '$24',
        description: 'For teams shipping a real SaaS product.',
        features: [
            'Unlimited teams',
            'Realtime notifications',
            'Priority support',
            'Content Studio & Media',
            'Forms & Webhooks',
        ],
        cta: 'Start with Pro',
        href: register().url,
        highlighted: true,
    },
    {
        name: 'Scale',
        priceMonthly: '$99',
        priceAnnually: '$79',
        description: 'For serious teams with operational needs.',
        features: [
            'Everything in Pro',
            'Advanced admin controls',
            'Full audit activity logs',
            'Custom rate limits',
        ],
        cta: 'Choose Scale',
        href: register().url,
        highlighted: false,
    },
];

const faqs = [
    {
        q: 'How does billing work in FrameX?',
        a: 'FrameX integrates with Laravel Cashier (Stripe) for live subscriptions and also includes a built-in Demo Billing Mode (BILLING_MOCK=true) so you can preview upgrades, downgrades, and invoices without live Stripe keys.',
    },
    {
        q: 'Can I upgrade or downgrade plans later?',
        a: 'Yes. Upgrades take effect immediately, and downgrades are scheduled for the end of your current billing cycle so you keep your active tier until renewal.',
    },
    {
        q: 'Is FrameX open-source?',
        a: 'Yes. FrameX is an open-source Laravel 13 & React starter platform licensed under the MIT License.',
    },
];

export default function Pricing() {
    const { auth } = usePage().props as { auth?: { user?: unknown } };
    const [annual, setAnnual] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <>
            <Head title="Pricing — FrameX" />

            <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

                <div className="relative z-10 px-6 pt-32 pb-24 md:pt-44">
                    <div className="mx-auto max-w-6xl">
                        {/* Header */}
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    Transparent Tier Structure
                                </span>
                                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                                    Simple, predictable plans
                                </h1>
                                <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                                    Start free and scale your workspace as your team grows. Configured out of the box with Stripe Cashier and Demo Billing Mode.
                                </p>

                                {/* Billing Toggle */}
                                <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card p-1">
                                    <button
                                        type="button"
                                        onClick={() => setAnnual(false)}
                                        className={cn(
                                            'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                                            !annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAnnual(true)}
                                        className={cn(
                                            'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                                            annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        Annual (Save 20%)
                                    </button>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Plans Grid */}
                        <StaggerChildren className="mt-14 grid gap-6 lg:grid-cols-3" staggerDelay={0.05}>
                            {plans.map((plan) => (
                                <StaggerItem key={plan.name}>
                                    <div
                                        className={cn(
                                            'relative flex h-full flex-col rounded-2xl border bg-card p-7 shadow-xs',
                                            plan.highlighted ? 'border-primary ring-1 ring-primary/20' : 'border-border/60',
                                        )}
                                    >
                                        {plan.highlighted && (
                                            <Badge className="absolute -top-3 right-6 rounded-full px-3 py-0.5 text-[11px]">
                                                Most Popular
                                            </Badge>
                                        )}
                                        <div>
                                            <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
                                            <div className="mt-3 flex items-baseline gap-1">
                                                <span className="text-4xl font-bold tracking-tight text-foreground">
                                                    {annual ? plan.priceAnnually : plan.priceMonthly}
                                                </span>
                                                <span className="text-sm text-muted-foreground">/mo</span>
                                            </div>
                                            <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
                                        </div>

                                        <div className="my-6 h-px w-full bg-border/60" />

                                        <ul className="mb-8 flex-1 space-y-3">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground/90">
                                                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            asChild
                                            variant={plan.highlighted ? 'default' : 'outline'}
                                            className="w-full rounded-full"
                                            size="lg"
                                        >
                                            <Link href={auth?.user ? '/billing' : plan.href}>
                                                {auth?.user ? 'Manage in Billing' : plan.cta}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>

                        {/* FAQ */}
                        <div className="mx-auto mt-24 max-w-3xl">
                            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">
                                Frequently Asked Questions
                            </h2>
                            <div className="mt-8 space-y-3">
                                {faqs.map((faq, idx) => {
                                    const isOpen = openFaq === idx;
                                    return (
                                        <div key={faq.q} className="rounded-xl border border-border/60 bg-card">
                                            <button
                                                type="button"
                                                onClick={() => setOpenFaq(isOpen ? null : idx)}
                                                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground"
                                            >
                                                <span>{faq.q}</span>
                                                {isOpen ? (
                                                    <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                ) : (
                                                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
