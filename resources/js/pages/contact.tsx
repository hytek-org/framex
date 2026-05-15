
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Mail,
    MessageSquare,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle,
    Sparkles,
    Plus,
    Minus
} from 'lucide-react';
import React, { useState } from 'react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   TYPES & INTERFACES
   ────────────────────────────────────────────────────────── */
interface ContactMethod {
    icon: React.ElementType;
    title: string;
    description: string;
    contact: string;
    availability: string;
}

interface Office {
    city: string;
    address: string;
    phone: string;
}

interface FAQItem {
    q: string;
    a: string;
}

interface FormData {
    name: string;
    email: string;
    company: string;
    subject: string;
    message: string;
}

/* ──────────────────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────────────────── */
const contactMethods: ContactMethod[] = [
    {
        icon: Mail,
        title: 'Email Support',
        description: 'Get help from our dedicated support team.',
        contact: 'support@framex.dev',
        availability: '24/7 Response time',
    },
    {
        icon: MessageSquare,
        title: 'Live Chat',
        description: 'Chat with our engineering experts in real-time.',
        contact: 'Available in dashboard',
        availability: 'Mon-Fri 9AM-6PM EST',
    },
    {
        icon: Phone,
        title: 'Phone Support',
        description: 'Speak directly with an enterprise specialist.',
        contact: '+1 (555) 123-4567',
        availability: 'Mon-Fri 9AM-6PM EST',
    },
];

const offices: Office[] = [
    {
        city: 'San Francisco',
        address: '123 Tech Street, Suite 456\nSan Francisco, CA 94105',
        phone: '+1 (555) 123-4567',
    },
    {
        city: 'New York',
        address: '456 Innovation Ave, Floor 12\nNew York, NY 10001',
        phone: '+1 (555) 987-6543',
    },
    {
        city: 'London',
        address: '789 Developer Lane\nLondon, EC2A 4DP',
        phone: '+44 20 7946 0123',
    },
];

const faqs: FAQItem[] = [
    {
        q: 'How quickly do you respond to support requests?',
        a: 'We typically respond within 2 hours during business hours, and within 24 hours on weekends. Enterprise customers on the Scale plan receive a guaranteed 1-hour SLA.',
    },
    {
        q: 'Do you offer enterprise support?',
        a: 'Yes, our Scale plan includes dedicated support with SLA guarantees, a dedicated technical account manager, and priority engineering response times.',
    },
    {
        q: 'Can I schedule a technical demo?',
        a: 'Absolutely! Contact our sales team using the form above, and we\'ll arrange a personalized architectural overview and demo for your engineering team.',
    },
    {
        q: 'Do you offer onboarding training?',
        a: 'Yes, we provide comprehensive documentation, video tutorials, and can arrange custom guided training sessions tailored to your stack.',
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

export default function Contact() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <>
            <Head title="Contact Us - FrameX" />

            <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
                
                {/* ── AMBIENT BACKGROUND SYSTEM ── */}
                <div className="pointer-events-none fixed inset-0 z-0 flex justify-center bg-background">
                    <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-[100%] bg-primary/5 blur-[120px] mix-blend-normal" />
                    <div className="absolute bottom-[20%] right-[-10%] h-[40%] w-[40%] rounded-[100%] bg-blue-500/5 blur-[120px] mix-blend-normal" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay" />
                </div>

                <div className="relative z-10 space-y-0 pb-24">
                    
                    {/* ── HERO ─────────────────────────────── */}
                    <section className="pt-40 pb-24 md:pt-56 md:pb-32">
                        <div className="mx-auto max-w-5xl px-6 text-center">
                            <FadeIn delay={0.1}>
                                <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/50 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-xl">
                                    <Sparkles className="h-4 w-4 text-primary/80" />
                                    <span className="text-foreground/80">Here to help</span>
                                </div>
                            </FadeIn>
                            
                            <FadeIn delay={0.2}>
                                <h1 className="text-6xl font-semibold leading-[0.9] tracking-[-0.04em] text-foreground sm:text-7xl md:text-8xl">
                                    Connect with our <br className="hidden md:block" />
                                    <span className="bg-linear-to-br from-foreground via-foreground/90 to-foreground/40 bg-clip-text text-transparent">
                                        product specialists.
                                    </span>
                                </h1>
                            </FadeIn>
                            
                            <FadeIn delay={0.3}>
                                <p className="mx-auto mt-8 max-w-2xl text-xl font-light leading-relaxed text-muted-foreground">
                                    Whether you need architectural guidance, enterprise support, or a custom integration, our engineering team is ready to help you scale.
                                </p>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── CONTACT METHODS ─────────────────── */}
                    <section className="relative z-20 pb-24 md:pb-32">
                        <div className="mx-auto max-w-7xl px-6">
                            <StaggerChildren className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
                                {contactMethods.map((method) => (
                                    <StaggerItem key={method.title}>
                                        <div className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-border/40 bg-background/40 p-10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-background/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg transition-transform duration-500 group-hover:scale-110">
                                                <method.icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                                {method.title}
                                            </h3>
                                            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                                                {method.description}
                                            </p>
                                            
                                            <div className="mt-8 pt-8 border-t border-border/30">
                                                <div className="text-sm font-medium text-foreground">
                                                    {method.contact}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {method.availability}
                                                </div>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerChildren>
                        </div>
                    </section>

                    {/* ── CONTACT FORM & OFFICES ──────────── */}
                    <section className="border-y border-border/30 bg-muted/10 py-24 md:py-32 backdrop-blur-sm">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="grid gap-20 lg:grid-cols-5">
                                
                                {/* Contact Form */}
                                <div className="lg:col-span-3">
                                    <FadeIn>
                                        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-background/60 p-8 shadow-2xl backdrop-blur-3xl sm:p-12">
                                            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                                            
                                            <div className="relative z-10">
                                                <h2 className="text-3xl font-semibold tracking-tighter text-foreground sm:text-4xl">
                                                    Send us a message
                                                </h2>
                                                <p className="mt-3 text-lg text-muted-foreground">
                                                    We typically reply within a few hours.
                                                </p>

                                                {isSubmitted ? (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 backdrop-blur-sm"
                                                    >
                                                        <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-400">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                                                                <CheckCircle className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-semibold">Message sent securely.</h3>
                                                                <p className="mt-1 text-emerald-600/80 dark:text-emerald-400/80">
                                                                    Our team is reviewing your inquiry and will reach out shortly.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                                                        <div className="grid gap-6 sm:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="name" className="text-sm font-medium text-foreground/80">Full Name</Label>
                                                                <Input
                                                                    id="name"
                                                                    name="name"
                                                                    value={formData.name}
                                                                    onChange={handleChange}
                                                                    required
                                                                    className="h-12 rounded-xl border-border/50 bg-background/50 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                                    placeholder="Jane Doe"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Work Email</Label>
                                                                <Input
                                                                    id="email"
                                                                    name="email"
                                                                    type="email"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    required
                                                                    className="h-12 rounded-xl border-border/50 bg-background/50 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                                    placeholder="jane@company.com"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid gap-6 sm:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="company" className="text-sm font-medium text-foreground/80">Company</Label>
                                                                <Input
                                                                    id="company"
                                                                    name="company"
                                                                    value={formData.company}
                                                                    onChange={handleChange}
                                                                    className="h-12 rounded-xl border-border/50 bg-background/50 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                                    placeholder="Acme Inc."
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="subject" className="text-sm font-medium text-foreground/80">Subject</Label>
                                                                <Input
                                                                    id="subject"
                                                                    name="subject"
                                                                    value={formData.subject}
                                                                    onChange={handleChange}
                                                                    required
                                                                    className="h-12 rounded-xl border-border/50 bg-background/50 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                                    placeholder="How can we help?"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="message" className="text-sm font-medium text-foreground/80">Message</Label>
                                                            <Textarea
                                                                id="message"
                                                                name="message"
                                                                value={formData.message}
                                                                onChange={handleChange}
                                                                required
                                                                rows={6}
                                                                className="resize-none rounded-xl border-border/50 bg-background/50 p-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                                placeholder="Tell us about your project..."
                                                            />
                                                        </div>
                                                        <div className="pt-2">
                                                            <Button
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                                className="h-14 w-full rounded-full bg-foreground text-base font-medium text-background transition-transform hover:scale-[1.02] sm:w-auto sm:px-10"
                                                            >
                                                                {isSubmitting ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                                        Sending...
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        Send Message
                                                                        <Send className="ml-2 h-4 w-4" />
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    </FadeIn>
                                </div>

                                {/* Offices */}
                                <div className="lg:col-span-2">
                                    <FadeIn delay={0.2}>
                                        <h2 className="text-3xl font-semibold tracking-tighter text-foreground sm:text-4xl">
                                            Global presence.
                                        </h2>
                                        <p className="mt-4 text-lg text-muted-foreground">
                                            We operate globally to support engineering teams around the clock.
                                        </p>

                                        <div className="mt-12 space-y-8">
                                            {offices.map((office) => (
                                                <div key={office.city} className="group flex items-start gap-6">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-background/50 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-foreground">
                                                            {office.city}
                                                        </h3>
                                                        <div className="mt-2 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                                                            {office.address}
                                                        </div>
                                                        <div className="mt-3 text-sm font-medium text-foreground/80">
                                                            {office.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </FadeIn>
                                </div>
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
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
                                    <div className="absolute left-1/2 top-1/2 -z-10 h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-primary opacity-[0.15] blur-[120px]" />

                                    <div className="relative z-10 mx-auto max-w-3xl">
                                        <h2 className="text-5xl font-semibold tracking-tighter text-background sm:text-6xl md:text-7xl">
                                            Ready to build the future?
                                        </h2>
                                        <p className="mx-auto mt-8 max-w-xl text-xl font-light text-background/60 leading-relaxed">
                                            Experience the power of a premium foundation. Join thousands of developers building with FrameX.
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