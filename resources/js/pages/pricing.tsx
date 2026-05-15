
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    Sparkles, 
    Plus, 
    Minus, 
    ArrowRight 
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
    price: string;
    period: string;
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
        price: '$0',
        period: 'forever',
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
        price: '$29',
        period: '/month',
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
        price: '$99',
        period: '/month',
        description: 'For enterprise teams that require advanced controls and SLA guarantees.',
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
        a: 'We believe in soft limits. We will gently notify you when you reach 80% of your storage. Your service won\'t be interrupted, giving you ample time to upgrade or clean up files.',
    },
    {
        q: 'Can I self-host FrameX?',
        a: 'Yes. The core of FrameX is fully open source. You can self-host on your own infrastructure using our provided Docker containers at absolutely no cost.',
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
        <div className="border-b border-border/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-6 text-left outline-none"
                aria-expanded={isOpen}
            >
                <span className="text-xl font-medium tracking-tight text-foreground/90 transition-colors hover:text-foreground">
                    {question}
                </span>
                <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-transform duration-300">
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
                        <p className="pb-6 text-lg leading-relaxed text-muted-foreground">
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

    return (
        <>
            <Head title="Pricing - FrameX" />

            <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
                
                {/* ── AMBIENT BACKGROUND SYSTEM ── */}
                <div className="pointer-events-none fixed inset-0 z-0 flex justify-center bg-background">
                    <div className="absolute top-[-20%] left-[10%] h-[60%] w-[60%] rounded-[100%] bg-primary/5 blur-[120px] mix-blend-normal" />
                    <div className="absolute top-[20%] right-[-10%] h-[50%] w-[50%] rounded-[100%] bg-blue-500/5 blur-[120px] mix-blend-normal" />
                    {/* Ultra-soft noise texture overlay for physical feel */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay" />
                </div>

                <div className="relative z-10 space-y-0 pb-24">
                    
                    {/* ── HERO ─────────────────────────────── */}
                    <section className="pt-40 pb-24 md:pt-56 md:pb-32">
                        <div className="mx-auto max-w-5xl px-6 text-center">
                            <FadeIn delay={0.1}>
                                <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/50 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-xl">
                                    <Sparkles className="h-4 w-4 text-primary/80" />
                                    <span className="text-foreground/80">Transparent, predictable pricing</span>
                                </div>
                            </FadeIn>
                            
                            <FadeIn delay={0.2}>
                                <h1 className="text-6xl font-semibold leading-[0.9] tracking-[-0.04em] text-foreground sm:text-7xl md:text-8xl">
                                    Pricing designed to <br className="hidden md:block" />
                                    <span className="bg-linear-to-br from-foreground via-foreground/90 to-foreground/40 bg-clip-text text-transparent">
                                        scale with ambition.
                                    </span>
                                </h1>
                            </FadeIn>
                            
                            <FadeIn delay={0.3}>
                                <p className="mx-auto mt-8 max-w-2xl text-xl font-light leading-relaxed text-muted-foreground">
                                    Choose the plan that fits your growth stage. No hidden fees, clear upgrade paths, and enterprise-grade controls exactly when you need them.
                                </p>
                            </FadeIn>
                            
                            <FadeIn delay={0.4}>
                                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Button size="lg" asChild className="h-14 rounded-full bg-foreground px-8 text-base font-medium text-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:scale-[1.02] hover:bg-foreground/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)]">
                                        <Link href={register()}>
                                            Start building for free
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="ghost" asChild className="h-14 rounded-full px-8 text-base font-medium text-foreground transition-colors hover:bg-muted/50">
                                        <a href="#compare">
                                            Compare features
                                        </a>
                                    </Button>
                                </div>
                                <p className="mt-6 text-sm font-medium text-muted-foreground/60">
                                    Free forever • No credit card required • Cancel anytime
                                </p>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── PLANS GRID ─────────────────────────────── */}
                    <section className="relative z-20 pb-32 md:pb-40">
                        <div className="mx-auto max-w-7xl px-6">
                            <StaggerChildren className="grid gap-8 lg:grid-cols-3 lg:items-center" staggerDelay={0.1}>
                                {plans.map((plan) => (
                                    <StaggerItem key={plan.name} className={cn("relative h-full", plan.highlighted ? "lg:-mx-4 lg:z-30" : "lg:z-10")}>
                                        <div
                                            className={cn(
                                                'relative flex h-full flex-col overflow-hidden rounded-[2.5rem] p-10 md:p-12 transition-all duration-500 hover:-translate-y-2',
                                                plan.highlighted
                                                    ? 'bg-background/80 backdrop-blur-3xl shadow-[0_0_80px_-20px_rgba(var(--primary-rgb,0,0,0),0.15)] ring-1 ring-primary/30 dark:ring-primary/20 scale-[1.02]'
                                                    : 'bg-background/40 backdrop-blur-xl border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                                            )}
                                        >
                                            {/* Subsurface glow for highlighted card */}
                                            {plan.highlighted && (
                                                <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/10 via-transparent to-transparent opacity-70" />
                                            )}

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                                        {plan.name}
                                                    </h3>
                                                    {plan.highlighted && (
                                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
                                                            Most Popular
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-8 flex items-baseline gap-1">
                                                    <span className="text-6xl font-semibold tracking-[-0.04em] text-foreground">
                                                        {plan.price}
                                                    </span>
                                                    <span className="text-lg font-medium text-muted-foreground/80">
                                                        {plan.period}
                                                    </span>
                                                </div>
                                                
                                                <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                                                    {plan.description}
                                                </p>
                                            </div>

                                            <div className="relative z-10 mt-10 mb-12 flex-1">
                                                <div className="mb-6 text-sm font-semibold uppercase tracking-widest text-foreground/40">
                                                    What's included
                                                </div>
                                                <ul className="space-y-5">
                                                    {plan.features.map((feature) => (
                                                        <li key={feature} className="flex items-start gap-4">
                                                            <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", plan.highlighted ? "bg-primary/20 text-primary" : "bg-muted text-foreground/60")}>
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                            <span className="text-base font-medium text-foreground/80">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="relative z-10 mt-auto">
                                                <Button
                                                    asChild
                                                    className="w-full h-14 rounded-full text-base font-medium transition-all duration-300"
                                                    variant={plan.highlighted ? 'default' : 'outline'}
                                                >
                                                    <Link 
                                                        href={auth?.user ? '/billing' : plan.href}
                                                        className={cn(
                                                            plan.highlighted 
                                                                ? "bg-foreground text-background shadow-lg hover:bg-foreground/90 hover:scale-[1.02]" 
                                                                : "bg-transparent border-border/60 hover:bg-muted/50"
                                                        )}
                                                    >
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

                    {/* ── ENTERPRISE TRUST STRIP ─────────────────────────────── */}
                    <section className="border-y border-border/30 bg-muted/20 py-16 backdrop-blur-sm">
                        <div className="mx-auto max-w-7xl px-6 text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">
                                Powering engineering teams at scale
                            </p>
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-10 opacity-40 grayscale transition-all duration-700 hover:grayscale-0 hover:opacity-100">
                                {['Acme Corp', 'Quantum', 'Nexus', 'Horizon', 'Vanguard'].map((brand) => (
                                    <span key={brand} className="text-2xl font-bold tracking-tight text-foreground transition-colors">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── COMPARISON TABLE ─────────────────────────────── */}
                    <section id="compare" className="py-32 md:py-40">
                        <div className="mx-auto max-w-5xl px-6">
                            <FadeIn>
                                <div className="mb-16">
                                    <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                        Compare all features.
                                    </h2>
                                    <p className="mt-6 text-xl text-muted-foreground font-light">
                                        A detailed breakdown of everything included in each tier, designed for transparency.
                                    </p>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <div className="overflow-x-auto pb-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="sticky top-0 z-10 border-b border-border/40 bg-background/80 py-6 pr-6 text-lg font-medium text-foreground backdrop-blur-xl">
                                                    Features
                                                </th>
                                                <th className="sticky top-0 z-10 border-b border-border/40 bg-background/80 py-6 px-6 text-center text-lg font-medium text-foreground backdrop-blur-xl">
                                                    Free
                                                </th>
                                                <th className="sticky top-0 z-10 border-b border-border/40 bg-background/80 py-6 px-6 text-center text-lg font-medium text-foreground backdrop-blur-xl">
                                                    <div className="flex items-center justify-center gap-2">
                                                        Pro
                                                        <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                                                    </div>
                                                </th>
                                                <th className="sticky top-0 z-10 border-b border-border/40 bg-background/80 py-6 pl-6 text-center text-lg font-medium text-foreground backdrop-blur-xl">
                                                    Scale
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/20">
                                            {comparisonFeatures.map((item) => (
                                                <tr key={item.feature} className="group transition-colors hover:bg-muted/20">
                                                    <td className="py-6 pr-6 text-base font-medium text-foreground/80">
                                                        {item.feature}
                                                    </td>
                                                    <td className="py-6 px-6 text-center">
                                                        {typeof item.free === 'boolean' ? (
                                                            item.free ? <Check className="mx-auto h-5 w-5 text-foreground" /> : <span className="mx-auto block h-px w-4 bg-muted-foreground/30" />
                                                        ) : (
                                                            <span className="text-base text-muted-foreground">{item.free}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-6 px-6 text-center bg-primary/1.5">
                                                        {typeof item.pro === 'boolean' ? (
                                                            item.pro ? <Check className="mx-auto h-5 w-5 text-primary" /> : <span className="mx-auto block h-px w-4 bg-muted-foreground/30" />
                                                        ) : (
                                                            <span className="text-base font-medium text-foreground">{item.pro}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-6 pl-6 text-center">
                                                        {typeof item.scale === 'boolean' ? (
                                                            item.scale ? <Check className="mx-auto h-5 w-5 text-foreground" /> : <span className="mx-auto block h-px w-4 bg-muted-foreground/30" />
                                                        ) : (
                                                            <span className="text-base text-muted-foreground">{item.scale}</span>
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
                                                <svg className="h-10 w-10 text-primary/20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                                                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                                </svg>
                                            </div>
                                            <blockquote className="text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:leading-[1.15]">
                                                {testimonial.quote}
                                            </blockquote>
                                            
                                            <div className="mt-10 flex items-center gap-5">
                                                <div className="h-14 w-14 overflow-hidden rounded-full ring-1 ring-border/50">
                                                    <img src={testimonial.image} alt={testimonial.author} className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold text-foreground">
                                                        {testimonial.author}
                                                    </div>
                                                    <div className="text-sm font-medium text-muted-foreground/80">
                                                        {testimonial.role}
                                                    </div>
                                                </div>
                                                <div className="ml-auto flex">
                                                    <Badge variant="outline" className="rounded-full px-3 text-xs font-medium text-muted-foreground border-border/50">
                                                        {testimonial.plan}
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
                    <section className="py-32 md:py-40">
                        <div className="mx-auto max-w-3xl px-6">
                            <FadeIn>
                                <div className="mb-16">
                                    <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                        Frequently asked.
                                    </h2>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <div className="border-t border-border/30">
                                    {faqs.map((faq) => (
                                        <AccordionItem key={faq.q} question={faq.q} answer={faq.a} />
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── FINAL CTA (Cinematic Dark Block) ─────────────────────────────── */}
                    <section className="py-24 md:py-32">
                        <div className="mx-auto max-w-6xl px-6">
                            <FadeIn>
                                <div className="relative overflow-hidden rounded-[3rem] bg-foreground px-6 py-24 text-center shadow-2xl sm:px-16 sm:py-32">
                                    {/* Pure cinematic background styling */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
                                    <div className="absolute left-1/2 top-1/2 -z-10 h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-primary opacity-[0.15] blur-[120px]" />

                                    <div className="relative z-10 mx-auto max-w-3xl">
                                        <h2 className="text-5xl font-semibold tracking-tighter text-background sm:text-6xl md:text-7xl">
                                            Start building today.
                                        </h2>
                                        <p className="mx-auto mt-8 max-w-xl text-xl font-light text-background/60 leading-relaxed">
                                            Experience the power of a premium foundation. Free to start, scales infinitely.
                                        </p>
                                        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
                                            <Button size="lg" asChild className="h-14 rounded-full bg-background text-foreground hover:bg-background/90 px-8 text-lg font-medium transition-transform hover:scale-105">
                                                <Link href={register()}>
                                                    Get Started for Free
                                                    <ArrowRight className="ml-2 h-5 w-5" />
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