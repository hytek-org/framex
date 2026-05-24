import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    MessageSquare,
    Minus,
    Phone,
    Plus,
    Send,
    Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
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
        a: "Absolutely! Contact our sales team using the form above, and we'll arrange a personalized architectural overview and demo for your engineering team.",
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

            <div className="relative min-h-screen overflow-hidden bg-white font-sans text-zinc-950 selection:bg-black/10 selection:text-black transition-colors duration-300 dark:bg-[#050505] dark:text-[#FAFAFA] dark:selection:bg-white/20 dark:selection:text-white">
                
                {/* ── AMBIENT BACKGROUND SYSTEM ── */}
                <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
                    <div className="absolute left-[10%] top-[-20%] h-[600px] w-[600px] rounded-[100%] bg-blue-500/5 blur-[120px] dark:bg-blue-500/10" />
                    <div className="absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-[100%] bg-indigo-500/5 blur-[120px] dark:bg-indigo-500/10" />
                    {/* Ultra-soft noise texture overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 space-y-0 pb-24">
                    
                    {/* ── HERO ─────────────────────────────── */}
                    <section className="pb-16 pt-36 md:pb-24 md:pt-48">
                        <div className="mx-auto max-w-5xl px-6 text-center">
                            <FadeIn delay={0.1}>
                                <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-zinc-600 shadow-[0_2px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:shadow-[0_2px_20px_rgba(255,255,255,0.02)]">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                    <span>Here to help</span>
                                </div>
                            </FadeIn>
                            
                            <FadeIn delay={0.2}>
                                <h1 className="text-5xl font-medium leading-[0.95] tracking-tighter text-zinc-900 sm:text-7xl md:text-8xl dark:text-white">
                                    Connect with our <br className="hidden md:block" />
                                    <span className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-400 bg-clip-text text-transparent dark:from-white dark:via-white/90 dark:to-white/30">
                                        product specialists.
                                    </span>
                                </h1>
                            </FadeIn>
                            
                            <FadeIn delay={0.3}>
                                <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed tracking-tight text-zinc-500 sm:text-xl dark:text-white/50">
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
                                        <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2.5rem] border border-black/5 bg-zinc-50/50 p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-md dark:border-white/5 dark:bg-[#0A0A0A] dark:shadow-none dark:hover:bg-[#111]">
                                            <div className="relative z-10">
                                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm transition-transform duration-500 group-hover:scale-110 dark:border-white/10 dark:bg-white/[0.05]">
                                                    <method.icon className="h-5 w-5 text-zinc-700 dark:text-white/80" />
                                                </div>
                                                <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
                                                    {method.title}
                                                </h3>
                                                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-white/50">
                                                    {method.description}
                                                </p>
                                            </div>
                                            
                                            <div className="relative z-10 mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                                                <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    {method.contact}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                                                    <Clock className="h-3 w-3" />
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
                    <section className="border-y border-black/5 bg-zinc-50/50 py-24 backdrop-blur-sm md:py-32 dark:border-white/5 dark:bg-[#0A0A0A]">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="grid gap-20 lg:grid-cols-5">
                                
                                {/* Contact Form */}
                                <div className="lg:col-span-3">
                                    <FadeIn>
                                        <div className="relative overflow-hidden rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)] sm:p-12 dark:border-white/10 dark:bg-[#111]/50 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-50 dark:from-white/[0.02]" />
                                            
                                            <div className="relative z-10">
                                                <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">
                                                    Send us a message
                                                </h2>
                                                <p className="mt-3 text-base text-zinc-500 dark:text-white/50">
                                                    We typically reply within a few hours.
                                                </p>

                                                {isSubmitted ? (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-10 rounded-[2rem] border border-emerald-500/20 bg-emerald-50/50 p-8 backdrop-blur-sm dark:border-emerald-500/10 dark:bg-emerald-500/[0.02]"
                                                    >
                                                        <div className="flex items-center gap-5 text-emerald-600 dark:text-emerald-400">
                                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/20">
                                                                <CheckCircle className="h-7 w-7" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">Message sent securely.</h3>
                                                                <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                                    Our team is reviewing your inquiry and will reach out shortly.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                                                        <div className="grid gap-6 sm:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-white/50">Full Name</label>
                                                                <input
                                                                    id="name"
                                                                    name="name"
                                                                    value={formData.name}
                                                                    onChange={handleChange}
                                                                    required
                                                                    className="h-12 w-full rounded-xl border border-black/10 bg-zinc-50/50 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400/50 dark:focus:bg-[#111] dark:focus:ring-blue-400/10"
                                                                    placeholder="Jane Doe"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-white/50">Work Email</label>
                                                                <input
                                                                    id="email"
                                                                    name="email"
                                                                    type="email"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    required
                                                                    className="h-12 w-full rounded-xl border border-black/10 bg-zinc-50/50 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400/50 dark:focus:bg-[#111] dark:focus:ring-blue-400/10"
                                                                    placeholder="jane@company.com"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid gap-6 sm:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <label htmlFor="company" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-white/50">Company</label>
                                                                <input
                                                                    id="company"
                                                                    name="company"
                                                                    value={formData.company}
                                                                    onChange={handleChange}
                                                                    className="h-12 w-full rounded-xl border border-black/10 bg-zinc-50/50 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400/50 dark:focus:bg-[#111] dark:focus:ring-blue-400/10"
                                                                    placeholder="Acme Inc."
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-white/50">Subject</label>
                                                                <input
                                                                    id="subject"
                                                                    name="subject"
                                                                    value={formData.subject}
                                                                    onChange={handleChange}
                                                                    required
                                                                    className="h-12 w-full rounded-xl border border-black/10 bg-zinc-50/50 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400/50 dark:focus:bg-[#111] dark:focus:ring-blue-400/10"
                                                                    placeholder="How can we help?"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label htmlFor="message" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-white/50">Message</label>
                                                            <textarea
                                                                id="message"
                                                                name="message"
                                                                value={formData.message}
                                                                onChange={handleChange}
                                                                required
                                                                rows={6}
                                                                className="w-full resize-none rounded-xl border border-black/10 bg-zinc-50/50 p-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400/50 dark:focus:bg-[#111] dark:focus:ring-blue-400/10"
                                                                placeholder="Tell us about your project or inquiry..."
                                                            />
                                                        </div>
                                                        <div className="pt-4">
                                                            <Button
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                                className="h-12 w-full rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-zinc-800 sm:w-auto dark:bg-white dark:text-black dark:hover:bg-white/90"
                                                            >
                                                                {isSubmitting ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                                                                        Sending securely...
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
                                        <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">
                                            Global presence.
                                        </h2>
                                        <p className="mt-4 text-base leading-relaxed text-zinc-500 dark:text-white/50">
                                            We operate globally to support engineering teams around the clock.
                                        </p>

                                        <div className="mt-12 space-y-8 border-t border-black/5 pt-8 dark:border-white/5">
                                            {offices.map((office) => (
                                                <div key={office.city} className="group flex items-start gap-6">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-500 shadow-sm transition-colors group-hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:group-hover:bg-white/10">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                                            {office.city}
                                                        </h3>
                                                        <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-500 dark:text-white/50">
                                                            {office.address}
                                                        </div>
                                                        <div className="mt-3 text-xs font-semibold tracking-widest text-zinc-900 dark:text-white/80">
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
                    <section className="py-24 md:py-32">
                        <div className="mx-auto max-w-3xl px-6">
                            <FadeIn>
                                <div className="mb-16 text-center">
                                    <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
                                        Frequently asked.
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
                    <section className="py-24 pb-32">
                        <div className="mx-auto max-w-6xl px-6">
                            <FadeIn>
                                <div className="group relative overflow-hidden rounded-[40px] border border-black/10 bg-zinc-50 px-6 py-24 text-center shadow-lg sm:px-16 sm:py-32 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-[0_0_100px_rgba(255,255,255,0.02)]">
                                    
                                    {/* Ambient Glows */}
                                    <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/[0.03] blur-[80px] dark:bg-white/[0.03]" />
                                    <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/[0.03] blur-[80px] dark:bg-blue-500/[0.02]" />

                                    <div className="relative z-10 mx-auto max-w-2xl">
                                        <h2 className="text-4xl font-medium tracking-tighter text-zinc-900 sm:text-6xl dark:text-white">
                                            Ready to build the future?
                                        </h2>
                                        <p className="mx-auto mt-6 text-lg leading-relaxed tracking-tight text-zinc-500 dark:text-white/50">
                                            Experience the power of a premium foundation. Join thousands of developers building with FrameX.
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