import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    Mail,
    MessageSquare,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { register } from '@/routes';

/* ──────────────────────────────────────────────────────────
   CONTACT DATA
   ────────────────────────────────────────────────────────── */
const contactMethods = [
    {
        icon: Mail,
        title: 'Email Support',
        description: 'Get help from our support team',
        contact: 'support@framex.dev',
        availability: '24/7',
    },
    {
        icon: MessageSquare,
        title: 'Live Chat',
        description: 'Chat with our team in real-time',
        contact: 'Available in dashboard',
        availability: 'Mon-Fri 9AM-6PM EST',
    },
    {
        icon: Phone,
        title: 'Phone Support',
        description: 'Speak directly with an expert',
        contact: '+1 (555) 123-4567',
        availability: 'Mon-Fri 9AM-6PM EST',
    },
];

const offices = [
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

const faqs = [
    {
        q: 'How quickly do you respond to support requests?',
        a: 'We typically respond within 2 hours during business hours, and within 24 hours on weekends.',
    },
    {
        q: 'Do you offer enterprise support?',
        a: 'Yes, our Scale plan includes dedicated support with SLA guarantees and priority response times.',
    },
    {
        q: 'Can I schedule a demo?',
        a: 'Absolutely! Contact our sales team and we\'ll arrange a personalized demo for your team.',
    },
    {
        q: 'Do you offer training?',
        a: 'Yes, we provide comprehensive documentation, video tutorials, and can arrange custom training sessions.',
    },
];

/* ──────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────── */
export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <>
            <Head title="Contact Us - FrameX" />

            <div className="space-y-0">
                {/* ── HERO ─────────────────────────────── */}
                <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                    <div className="gradient-mesh pointer-events-none absolute inset-0" />
                    <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />

                    <div className="relative mx-auto max-w-4xl px-6 text-center">
                        <FadeIn delay={0.1}>
                            <Badge variant="secondary" className="mb-4">
                                <MessageSquare className="mr-1 h-3 w-3" />
                                Get in Touch
                            </Badge>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                                Connect with our
                                <br />
                                <span className="text-gradient-brand">product specialists</span>
                            </h1>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                Whether you need onboarding guidance, enterprise support, or an integration partner,
                                our team is ready to help you launch faster and scale smarter.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* ── CONTACT METHODS ─────────────────── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <FadeIn>
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Contact Methods
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Choose the best way to reach us
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
                            {contactMethods.map((method) => (
                                <StaggerItem key={method.title}>
                                    <Card className="text-center">
                                        <CardHeader>
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <method.icon className="h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-lg">{method.title}</CardTitle>
                                            <CardDescription>{method.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium text-foreground">
                                                    {method.contact}
                                                </div>
                                                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {method.availability}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </section>

                {/* ── CONTACT FORM & OFFICES ──────────── */}
                <section className="border-y bg-muted/30 py-20 md:py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid gap-16 lg:grid-cols-2">
                            {/* Contact Form */}
                            <FadeIn>
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                        Send us a message
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Fill out the form below and we'll get back to you within 24 hours.
                                    </p>

                                    {isSubmitted ? (
                                        <Card className="mt-6">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3 text-green-600">
                                                    <CheckCircle className="h-5 w-5" />
                                                    <span className="font-medium">Message sent successfully!</span>
                                                </div>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Thank you for contacting us. We'll respond to your inquiry shortly.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="name">Name *</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="email">Email *</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="company">Company</Label>
                                                    <Input
                                                        id="company"
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="subject">Subject *</Label>
                                                    <Input
                                                        id="subject"
                                                        name="subject"
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                        required
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="message">Message *</Label>
                                                <Textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                    rows={5}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto"
                                            >
                                                {isSubmitting ? (
                                                    'Sending...'
                                                ) : (
                                                    <>
                                                        Send Message
                                                        <Send className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </FadeIn>

                            {/* Offices */}
                            <FadeIn delay={0.2}>
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                        Our Offices
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Visit us at one of our global locations.
                                    </p>

                                    <div className="mt-6 space-y-6">
                                        {offices.map((office) => (
                                            <Card key={office.city}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">
                                                                {office.city}
                                                            </h3>
                                                            <div className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                                                                {office.address}
                                                            </div>
                                                            <div className="mt-2 text-sm text-muted-foreground">
                                                                {office.phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ─────────────────────────────── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-3xl px-6">
                        <FadeIn>
                            <div className="text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                                    Frequently Asked Questions
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Quick answers to common questions
                                </p>
                            </div>
                        </FadeIn>

                        <StaggerChildren className="mt-12 space-y-6" staggerDelay={0.06}>
                            {faqs.map((faq) => (
                                <StaggerItem key={faq.q}>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {faq.q}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {faq.a}
                                            </p>
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
                                        Ready to get started?
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
                                        Join thousands of developers building with FrameX. Start your free trial today.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Button size="lg" asChild>
                                            <Link href={String(register())}>
                                                Get Started Free
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
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