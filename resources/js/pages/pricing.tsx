import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    Sparkles, 
    Plus, 
    Minus, 
    ArrowRight, 
    Building2,
    ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   TYPES & INTERFACES
   ────────────────────────────────────────────────────────── */
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

interface ComparisonFeature {
    feature: string;
    free: string | boolean;
    pro: string | boolean;
    scale: string | boolean;
}

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    plan: string;
    image: string;
}

interface FAQItem {
    q: string;
    a: string;
}

interface PageProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            [key: string]: unknown;
        };
    };
    [key: string]: unknown;
}

/* ──────────────────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────────────────── */
const plans: Plan[] = [
    {
        name: 'Free',
        priceMonthly: '$0',
        priceAnnually: '$0',
        description: 'Start with core SaaS essentials for prototypes and early validation.',
        features: [
            'Up to 3 team members',
            '1 workspace',
            '100MB file storage',
            'Community support',
            'Core analytics dashboard',
        ],
        cta: 'Start Free',
        href: register().url,
        highlighted: false,
    },
    {
        name: 'Pro',
        priceMonthly: '$29',
        priceAnnually: '$24',
        description: 'For growing teams that need more power and advanced capabilities.',
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
        href: register().url,
        highlighted: true,
    },
    {
        name: 'Scale',
        priceMonthly: '$99',
        priceAnnually: '$79',
        description: 'For enterprise teams that require advanced controls and SLA guarantees.',
        features: [
            'Unlimited team members',
            'Unlimited workspaces',
            '100GB file storage',
            'Dedicated support',
            'Advanced analytics',
            'SSO / SAML authentication',
            'Custom data retention',
            'SLA guarantee',
        ],
        cta: 'Contact Sales',
        href: '#',
        highlighted: false,
    },
];

const comparisonFeatures: ComparisonFeature[] = [
    { feature: 'Team Members', free: '3', pro: '25', scale: 'Unlimited' },
    { feature: 'Workspaces', free: '1', pro: 'Unlimited', scale: 'Unlimited' },
    { feature: 'File Storage', free: '100MB', pro: '10GB', scale: '100GB' },
    { feature: 'API Access', free: false, pro: true, scale: true },
    { feature: 'Custom Integrations', free: false, pro: true, scale: true },
    { feature: 'Priority Support', free: false, pro: true, scale: true },
    { feature: 'SSO / SAML', free: false, pro: false, scale: true },
    { feature: 'Dedicated Support', free: false, pro: false, scale: true },
    { feature: 'SLA Guarantee', free: false, pro: false, scale: true },
];

const testimonials: Testimonial[] = [
    {
        quote: "FrameX's pricing is incredibly fair. We started free, grew to Pro, and now Scale. The transition was seamless and the value is unmatched in the industry.",
        author: "David Park",
        role: "CEO, StartupCo",
        plan: "Scale",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
    },
    {
        quote: "The free tier got us started, and the upgrade process was instant. Best investment we've made for our engineering velocity and team composure.",
        author: "Lisa Chen",
        role: "CTO, TechCorp",
        plan: "Pro",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
];

const faqs: FAQItem[] = [
    {
        q: 'Can I upgrade or downgrade at any time?',
        a: 'Yes. You can change your plan at any time. Changes take effect immediately and billing is automatically prorated for your convenience, ensuring you only pay for what you use.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards and debit cards via our secure Stripe integration. Annual billing is available on Pro and Scale plans with an automatic 20% discount applied.',
    },
    {
        q: 'Is there a free trial for paid plans?',
        a: 'Absolutely. All paid plans come with a 14-day free trial. No credit card is required to start your trial, giving you complete freedom to evaluate the platform.',
    },
    {
        q: 'Do you offer discounts for startups?',
        a: 'We do. We offer a 50% discount for the first year to eligible early-stage startups. Contact our support team with your incorporation details to apply.',
    },
    {
        q: 'What happens when I exceed my storage limit?',
        a: "We believe in soft limits. We will gently notify you when you reach 80% of your storage. Your service won't be interrupted, giving you ample time to upgrade or clean up files.",
    },
];

/* ──────────────────────────────────────────────────────────
   COMPONENTS
   ────────────────────────────────────────────────────────── */
interface AccordionItemProps {
    question: string;
    answer: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <div className="border-b border-black/5 dark:border-white/5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-6 text-left outline-none"
                aria-expanded={isOpen}
            >
                <span className="text-lg font-medium tracking-tight text-zinc-900 transition-colors hover:text-zinc-600 dark:text-white dark:hover:text-white/70">
                    {question}
                </span>
                <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-zinc-500 transition-transform duration-300 dark:bg-white/5 dark:text-white/50">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-base leading-relaxed text-zinc-500 dark:text-white/50">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Pricing() {
    const { auth } = usePage<PageProps>().props;
    const [isAnnual, setIsAnnual] = useState<boolean>(true);

    return (
        <>
            <Head title="Pricing - FrameX" />

            <div className="relative min-h-screen bg-white text-zinc-950 selection:bg-black/10 selection:text-black dark:bg-[#050505] dark:text-[#FAFAFA] dark:selection:bg-white/20 dark:selection:text-white overflow-hidden font-sans transition-colors duration-300">
                
                {/* ── AMBIENT BACKGROUND SYSTEM ── */}
                <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
                    <div className="absolute top-[-20%] left-[10%] h-[600px] w-[600px] rounded-[100%] bg-blue-500/5 blur-[120px] dark:bg-blue-500/10" />
                    <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-[100%] bg-indigo-500/5 blur-[120px] dark:bg-indigo-500/10" />
                    {/* Ultra-soft noise texture overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 space-y-0 pb-24">
                    
                    {/* ── HERO & TOGGLE ─────────────────────────────── */}
                    <section className="pt-36 pb-16 md:pt-48 md:pb-24">
                        <div className="mx-auto max-w-5xl px-6 text-center">
                            <FadeIn delay={0.1}>
                                <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-zinc-600 shadow-[0_2px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:shadow-[0_2px_20px_rgba(255,255,255,0.02)]">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                    <span>Transparent Pricing</span>
                                </div>
                            </FadeIn>
                            
                            <FadeIn delay={0.2}>
                                <h1 className="text-5xl font-medium leading-[0.95] tracking-tighter text-zinc-900 sm:text-7xl md:text-8xl lg:text-[7.5rem] dark:text-white">
                                    Pricing designed to <br className="hidden md:block" />
                                    <span className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-400 bg-clip-text text-transparent dark:from-white dark:via-white/90 dark:to-white/30">
                                        scale with ambition.
                                    </span>
                                </h1>
                            </FadeIn>
                            
                            <FadeIn delay={0.3}>
                                <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed tracking-tight text-zinc-500 sm:text-xl dark:text-white/50">
                                    Choose the plan that fits your growth stage. No hidden fees, clear upgrade paths, and enterprise-grade controls exactly when you need them.
                                </p>
                            </FadeIn>

                            {/* ── PREMIUM PRICING TOGGLE ── */}
                            <FadeIn delay={0.4}>
                                <div className="mt-16 flex justify-center">
                                    <div className="relative inline-flex items-center rounded-full border border-black/5 bg-zinc-50/80 p-1.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#111]/80">
                                        <button
                                            onClick={() => setIsAnnual(false)}
                                            className={cn(
                                                "relative z-10 rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-300",
                                                !isAnnual ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
                                            )}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            onClick={() => setIsAnnual(true)}
                                            className={cn(
                                                "relative z-10 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-300",
                                                isAnnual ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
                                            )}
                                        >
                                            Annually
                                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                                                Save 20%
                                            </span>
                                        </button>
                                        
                                        {/* Animated Pill Background */}
                                        <div 
                                            className={cn(
                                                "absolute bottom-1.5 top-1.5 z-0 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-white/10 dark:shadow-none",
                                                isAnnual ? "left-[98px] w-[142px]" : "left-1.5 w-[90px]"
                                            )}
                                        />
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── TRUST LOGOS ─────────────────────────────── */}
                    <section className="relative z-10 pb-16">
                        <div className="mx-auto max-w-7xl px-6 text-center">
                            <FadeIn delay={0.5}>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                                    Trusted by engineering teams at
                                </p>
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-40 grayscale transition-all duration-700 hover:grayscale-0 hover:opacity-80">
                                    {['VERCEL', 'LINEAR', 'STRIPE', 'RAYCAST', 'GITHUB'].map((brand) => (
                                        <span key={brand} className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                                            {brand}
                                        </span>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── BENTO PLANS GRID ─────────────────────────────── */}
                    <section className="relative z-20 pb-32 md:pb-40">
                        <div className="mx-auto max-w-7xl px-6">
                            <StaggerChildren className="grid gap-6 lg:grid-cols-3 lg:items-center" staggerDelay={0.1}>
                                {plans.map((plan) => (
                                    <StaggerItem key={plan.name} className={cn("relative h-full", plan.highlighted ? "lg:-mx-2 lg:z-30" : "lg:z-10")}>
                                        <div
                                            className={cn(
                                                'relative flex h-full flex-col overflow-hidden rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 ease-out hover:-translate-y-1',
                                                plan.highlighted
                                                    ? 'bg-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1)] ring-1 ring-blue-500/20 scale-[1.02] dark:bg-[#111] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] dark:ring-white/10'
                                                    : 'bg-zinc-50/50 border border-black/5 shadow-sm hover:shadow-md dark:bg-white/[0.02] dark:border-white/5 dark:shadow-none'
                                            )}
                                        >
                                            {/* Glow for highlighted card */}
                                            {plan.highlighted && (
                                                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent opacity-100 dark:from-white/[0.03]" />
                                            )}

                                            {/* Mini UI Header (Bento Style) */}
                                            <div className="relative z-10 mb-8 flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-[#0A0A0A]/50">
                                                {plan.name === 'Free' && (
                                                    <div className="flex -space-x-3">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-zinc-400 shadow-sm dark:border-[#0A0A0A] dark:bg-white/5 dark:text-white/30">
                                                                <Building2 className="h-5 w-5" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {plan.name === 'Pro' && (
                                                    <div className="flex h-full w-full items-end justify-center gap-2 px-6">
                                                        {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                                                            <div key={i} className="w-full rounded-t bg-blue-500/20 dark:bg-white/20" style={{ height: `${h}%` }} />
                                                        ))}
                                                    </div>
                                                )}
                                                {plan.name === 'Scale' && (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <ShieldCheck className="h-10 w-10 text-zinc-900 dark:text-white" />
                                                        <div className="h-1.5 w-16 rounded-full bg-black/10 dark:bg-white/10" />
                                                        <div className="h-1.5 w-10 rounded-full bg-black/10 dark:bg-white/10" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-white">
                                                        {plan.name}
                                                    </h3>
                                                    {plan.highlighted && (
                                                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:bg-white/10 dark:text-white">
                                                            Most Popular
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-6 flex items-baseline gap-1">
                                                    <span className="tabular-nums text-5xl font-medium tracking-tighter text-zinc-900 dark:text-white">
                                                        {isAnnual ? plan.priceAnnually : plan.priceMonthly}
                                                    </span>
                                                    <span className="text-sm font-medium text-zinc-500 dark:text-white/50">
                                                        /month
                                                    </span>
                                                </div>
                                                {isAnnual && plan.priceAnnually !== '$0' && (
                                                    <div className="mt-1 text-xs text-zinc-400 dark:text-white/40">
                                                        Billed annually
                                                    </div>
                                                )}
                                                
                                                <p className="mt-6 text-sm leading-relaxed text-zinc-500 dark:text-white/50">
                                                    {plan.description}
                                                </p>
                                            </div>

                                            <div className="relative z-10 mt-8 mb-10 flex-1">
                                                <div className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                                                    What's included
                                                </div>
                                                <ul className="space-y-4 text-sm">
                                                    {plan.features.map((feature) => (
                                                        <li key={feature} className="flex items-start gap-3">
                                                            <div className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", plan.highlighted ? "bg-blue-500/10 text-blue-600 dark:bg-white/10 dark:text-white" : "bg-black/5 text-zinc-400 dark:bg-white/5 dark:text-white/30")}>
                                                                <Check className="h-2.5 w-2.5" />
                                                            </div>
                                                            <span className="text-zinc-600 dark:text-white/70">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="relative z-10 mt-auto">
                                                <Button
                                                    asChild
                                                    className={cn(
                                                        "w-full h-12 rounded-full text-sm font-medium transition-all duration-300",
                                                        plan.highlighted 
                                                            ? "bg-zinc-900 text-white shadow-md hover:bg-zinc-800 hover:scale-[1.02] dark:bg-white dark:text-black dark:hover:bg-white/90" 
                                                            : "bg-transparent border border-black/10 text-zinc-900 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                                                    )}
                                    
                                                >
                                                    <Link href={auth?.user ? '/billing' : plan.href}>
                                                        {auth?.user ? 'Upgrade now' : plan.cta}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* ── COMPARISON TABLE (Editorial Layout) ─────────────────────────────── */}
                    <section id="compare" className="py-24 md:py-32 bg-zinc-50/50 border-y border-black/5 dark:bg-[#0A0A0A] dark:border-white/5">
                        <div className="mx-auto max-w-5xl px-6">
                            <FadeIn>
                                <div className="mb-16 text-center md:text-left">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">
                                        Compare features deeply.
                                    </h2>
                                    <p className="mt-4 text-lg text-zinc-500 tracking-tight dark:text-white/50">
                                        A detailed breakdown of everything included in each tier, designed for transparency.
                                    </p>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <div className="overflow-x-auto pb-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="sticky top-0 z-10 border-b border-black/10 bg-zinc-50/90 py-6 pr-6 text-sm font-medium text-zinc-500 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0A0A]/90 dark:text-white/50">
                                                    Overview
                                                </th>
                                                <th className="sticky top-0 z-10 border-b border-black/10 bg-zinc-50/90 py-6 px-6 text-center text-sm font-medium text-zinc-900 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0A0A]/90 dark:text-white">
                                                    Free
                                                </th>
                                                <th className="sticky top-0 z-10 border-b border-black/10 bg-zinc-50/90 py-6 px-6 text-center text-sm font-medium text-zinc-900 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0A0A]/90 dark:text-white">
                                                    <div className="flex items-center justify-center gap-2">
                                                        Pro
                                                        <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-white"></span>
                                                    </div>
                                                </th>
                                                <th className="sticky top-0 z-10 border-b border-black/10 bg-zinc-50/90 py-6 pl-6 text-center text-sm font-medium text-zinc-900 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0A0A]/90 dark:text-white">
                                                    Scale
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                            {comparisonFeatures.map((item) => (
                                                <tr key={item.feature} className="group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                                                    <td className="py-5 pr-6 text-sm font-medium text-zinc-700 dark:text-white/70">
                                                        {item.feature}
                                                    </td>
                                                    <td className="py-5 px-6 text-center">
                                                        {typeof item.free === 'boolean' ? (
                                                            item.free ? <Check className="mx-auto h-4 w-4 text-zinc-900 dark:text-white" /> : <span className="mx-auto block h-px w-3 bg-zinc-300 dark:bg-white/20" />
                                                        ) : (
                                                            <span className="text-sm text-zinc-500 dark:text-white/50">{item.free}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-5 px-6 text-center bg-blue-50/30 dark:bg-white/[0.02]">
                                                        {typeof item.pro === 'boolean' ? (
                                                            item.pro ? <Check className="mx-auto h-4 w-4 text-blue-600 dark:text-white" /> : <span className="mx-auto block h-px w-3 bg-zinc-300 dark:bg-white/20" />
                                                        ) : (
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">{item.pro}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-5 pl-6 text-center">
                                                        {typeof item.scale === 'boolean' ? (
                                                            item.scale ? <Check className="mx-auto h-4 w-4 text-zinc-900 dark:text-white" /> : <span className="mx-auto block h-px w-3 bg-zinc-300 dark:bg-white/20" />
                                                        ) : (
                                                            <span className="text-sm text-zinc-500 dark:text-white/50">{item.scale}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── TESTIMONIALS (Editorial) ─────────────────────────────── */}
                    <section className="py-32 md:py-40">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="grid gap-20 md:grid-cols-2 md:items-start">
                                {testimonials.map((testimonial, idx) => (
                                    <FadeIn key={testimonial.author} delay={idx * 0.15}>
                                        <div className={cn("flex flex-col", idx === 1 ? "md:mt-32" : "")}>
                                            <div className="mb-8">
                                                <svg className="h-8 w-8 text-black/10 dark:text-white/10" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                                                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                                </svg>
                                            </div>
                                            <blockquote className="text-2xl font-medium leading-snug tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                                                {testimonial.quote}
                                            </blockquote>
                                            
                                            <div className="mt-10 flex items-center gap-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-black/5 dark:ring-white/10">
                                                    <img src={testimonial.image} alt={testimonial.author} className="h-full w-full object-cover filter grayscale transition-all duration-500 hover:grayscale-0" />
                                                </div>
                                                <div>
                                                    <div className="text-base font-medium text-zinc-900 dark:text-white">
                                                        {testimonial.author}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 dark:text-white/50">
                                                        {testimonial.role}
                                                    </div>
                                                </div>
                                                <div className="ml-auto">
                                                    <Badge variant="outline" className="rounded-full border-black/10 bg-transparent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-white/10 dark:text-white/40">
                                                        {testimonial.plan} Plan
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── FAQ ─────────────────────────────── */}
                    <section className="py-24 md:py-32">
                        <div className="mx-auto max-w-3xl px-6">
                            <FadeIn>
                                <div className="mb-16 text-center">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                        Common questions.
                                    </h2>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <div className="border-t border-black/5 dark:border-white/5">
                                    {faqs.map((faq) => (
                                        <AccordionItem key={faq.q} question={faq.q} answer={faq.a} />
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── FINAL CTA (Cinematic Dark Block) ─────────────────────────────── */}
                    <section className="py-24 md:py-32">
                        <div className="mx-auto max-w-5xl px-6">
                            <FadeIn>
                                <div className="group relative overflow-hidden rounded-[40px] border border-black/10 bg-zinc-50 px-6 py-24 text-center shadow-lg sm:px-16 sm:py-32 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-[0_0_100px_rgba(255,255,255,0.02)]">
                                    
                                    {/* Ambient Glows */}
                                    <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/[0.03] blur-[80px] dark:bg-white/[0.03]" />
                                    <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/[0.03] blur-[80px] dark:bg-blue-500/[0.02]" />

                                    <div className="relative z-10 mx-auto max-w-2xl">
                                        <h2 className="text-4xl font-medium tracking-tighter text-zinc-900 sm:text-6xl dark:text-white">
                                            Start building today.
                                        </h2>
                                        <p className="mx-auto mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                            Experience the power of a premium foundation. Free to start, scales infinitely.
                                        </p>
                                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                            <Button size="lg" asChild className="h-12 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90">
                                                <Link href={register()}>
                                                    Get Started for Free
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
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