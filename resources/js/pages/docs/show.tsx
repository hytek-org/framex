import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    ChevronRight,
    Clock,
    Copy,
    Check,
    FileText,
    Home,
    Layers,
    ListTree,
    Share2,
    ArrowUpRight,
    ArrowRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TocItem {
    id: string;
    title: string;
    level: number;
}

interface DocNavigationItem {
    title: string;
    slug: string;
    description?: string;
    badge?: string;
}

interface Section {
    name: string;
    slug: string;
    docs: DocNavigationItem[];
}

interface DocData {
    title: string;
    slug: string;
    description?: string;
    category: string;
    badge?: string;
    reading_time: string;
    body_html: string;
}

interface FeedbackFormProps {
    id: number;
    slug: string;
    name: string;
    fields: any[];
    submit_button_text?: string;
    success_message?: string;
}

interface Props {
    doc: DocData;
    sections: Section[];
    siblings: DocNavigationItem[];
    toc: TocItem[];
    prev?: DocNavigationItem | null;
    next?: DocNavigationItem | null;
    feedbackForm?: FeedbackFormProps | null;
}

export default function DocsShow({ doc, sections, toc, prev, next, feedbackForm }: Props) {
    const [copied, setCopied] = useState(false);
    const [activeHeading, setActiveHeading] = useState<string>('');

    // Highlight active heading on scroll
    useEffect(() => {
        const handleScroll = () => {
            const headingElements = toc.map((item) => document.getElementById(item.id)).filter(Boolean);
            const scrollPos = window.scrollY + 120;

            for (let i = headingElements.length - 1; i >= 0; i--) {
                const el = headingElements[i];
                if (el && el.offsetTop <= scrollPos) {
                    setActiveHeading(el.id);
                    return;
                }
            }
            if (headingElements.length > 0 && headingElements[0]) {
                setActiveHeading(headingElements[0].id);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [toc]);

    const copyUrl = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title={`${doc.title} — FrameX Documentation`} />

            {/* Top Navigation Header */}
            <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2.5 text-sm">
                        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-80">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs shadow-sm">
                                FX
                            </span>
                            <span className="font-extrabold tracking-tight">FrameX</span>
                        </Link>
                        <span className="text-muted-foreground/40">/</span>
                        <Link href="/docs" className="text-muted-foreground transition-colors hover:text-foreground">
                            Docs
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <span className="font-medium text-foreground">{doc.category}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyUrl}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
                            <span>{copied ? 'Link Copied' : 'Share'}</span>
                        </Button>

                        <Link
                            href="/docs"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            All Guides
                        </Link>
                    </div>
                </div>
            </header>

            {/* 3-Column Enterprise Documentation Layout */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex gap-10">
                    
                    {/* 1. Left Sidebar: Collapsible Category Navigation Tree */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-3 space-y-6">
                            {sections.map((section) => (
                                <div key={section.name} className="space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 px-2.5">
                                        {section.name}
                                    </h4>
                                    <nav className="space-y-0.5">
                                        {section.docs.map((item) => {
                                            const isActive = item.slug === doc.slug;
                                            return (
                                                <Link
                                                    key={item.slug}
                                                    href={`/docs/${item.slug}`}
                                                    className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                                        isActive
                                                            ? 'bg-primary/10 text-primary font-semibold'
                                                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                                                    }`}
                                                >
                                                    <span className="truncate">{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase font-bold text-muted-foreground">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* 2. Center Column: Main Article Body */}
                    <main className="flex-1 min-w-0 max-w-3xl space-y-10 pb-16">
                        {/* Article Header */}
                        <div className="space-y-3.5 border-b pb-6">
                            <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className="font-semibold text-primary border-primary/20 bg-primary/5">
                                    {doc.category}
                                </Badge>
                                {doc.badge && (
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                                        {doc.badge}
                                    </Badge>
                                )}
                                <span className="text-muted-foreground/40">•</span>
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {doc.reading_time}
                                </span>
                            </div>

                            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">
                                {doc.title}
                            </h1>

                            {doc.description && (
                                <p className="text-base text-muted-foreground leading-relaxed">
                                    {doc.description}
                                </p>
                            )}
                        </div>

                        {/* Prose Markdown HTML Content */}
                        <article
                            className="prose prose-neutral dark:prose-invert max-w-none 
                                prose-headings:font-bold prose-headings:tracking-tight 
                                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2
                                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 
                                prose-p:leading-relaxed prose-p:text-muted-foreground
                                prose-code:rounded prose-code:bg-muted/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-xs prose-code:text-primary
                                prose-pre:rounded-xl prose-pre:border prose-pre:bg-muted/40 prose-pre:p-4
                                prose-table:border prose-table:rounded-lg
                                prose-th:bg-muted/50 prose-th:p-2.5 prose-th:text-xs prose-th:font-semibold
                                prose-td:p-2.5 prose-td:text-xs
                                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic"
                            dangerouslySetInnerHTML={{ __html: doc.body_html }}
                        />

                        {/* Pagination Footer: Previous / Next Guides */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-8">
                            {prev ? (
                                <Link
                                    href={`/docs/${prev.slug}`}
                                    className="group flex flex-col items-start rounded-xl border p-4 transition-all hover:border-primary/40 hover:bg-muted/30"
                                >
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                                        Previous Guide
                                    </span>
                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {prev.title}
                                    </span>
                                </Link>
                            ) : <div />}

                            {next ? (
                                <Link
                                    href={`/docs/${next.slug}`}
                                    className="group flex flex-col items-end text-right rounded-xl border p-4 transition-all hover:border-primary/40 hover:bg-muted/30"
                                >
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        Next Guide
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {next.title}
                                    </span>
                                </Link>
                            ) : <div />}
                        </div>

                        {/* Interactive Helpfulness Feedback Form */}
                        {feedbackForm && (
                            <Card className="mt-10 border-dashed bg-muted/10">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        Was this article helpful?
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Help us enhance the FrameX documentation by sharing your feedback.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DynamicForm
                                        slug={feedbackForm.slug}
                                        fields={feedbackForm.fields}
                                        submitButtonText={feedbackForm.submit_button_text}
                                        successMessage={feedbackForm.success_message}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </main>

                    {/* 3. Right Sidebar: "On This Page" Table of Contents */}
                    <aside className="hidden xl:block w-56 shrink-0">
                        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pl-2 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                                <ListTree className="h-3.5 w-3.5" />
                                On this page
                            </h4>

                            {toc.length === 0 ? (
                                <p className="text-xs text-muted-foreground/60 italic">Overview</p>
                            ) : (
                                <nav className="space-y-1">
                                    {toc.map((item) => {
                                        const isH3 = item.level === 3;
                                        const isActive = activeHeading === item.id;
                                        return (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                className={`block text-xs transition-colors hover:text-primary ${
                                                    isH3 ? 'pl-3 text-[11px]' : ''
                                                } ${
                                                    isActive
                                                        ? 'font-bold text-primary'
                                                        : 'text-muted-foreground/80'
                                                }`}
                                            >
                                                {item.title}
                                            </a>
                                        );
                                    })}
                                </nav>
                            )}

                            <div className="border-t pt-4 space-y-2 text-xs">
                                <a
                                    href="#top"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="block text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    &uarr; Back to top
                                </a>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}
