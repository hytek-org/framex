import { Head, Link } from '@inertiajs/react';
import { BookOpen, Search, ArrowRight, FileText, Sparkles, Home, Layers, Cpu, Box, ShieldCheck, Terminal, Compass } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DocItem {
    title: string;
    slug: string;
    description?: string;
    badge?: string;
    reading_time?: string;
}

interface Section {
    name: string;
    slug: string;
    docs: DocItem[];
}

interface Props {
    sections: Section[];
    totalDocs: number;
}

export default function DocsIndex({ sections, totalDocs }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSections = sections
        .map((section) => ({
            ...section,
            docs: section.docs.filter(
                (doc) =>
                    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
            ),
        }))
        .filter((section) => section.docs.length > 0);

    const getSectionIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('getting')) return Compass;
        if (lower.includes('architecture')) return Layers;
        if (lower.includes('content')) return FileText;
        if (lower.includes('business')) return Cpu;
        if (lower.includes('extension')) return Box;
        if (lower.includes('api')) return Terminal;
        return BookOpen;
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Enterprise Documentation & Developer Hub — FrameX" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-85">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs shadow-sm">
                                FX
                            </span>
                            <span className="font-extrabold tracking-tight">FrameX</span>
                        </Link>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-sm font-semibold text-muted-foreground">Documentation Hub</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                        <Link
                            href="/blogs"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Blog
                        </Link>
                        <Link
                            href="/docs/quickstart-installation-setup"
                            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                        >
                            Quickstart &rarr;
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/30 to-background py-20">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                        Static Markdown Architecture · Enterprise Platform Docs
                    </div>
                    
                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl text-foreground">
                        FrameX Documentation
                    </h1>
                    
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                        Complete technical references, architecture blueprints, module guides, and REST API documentation to build scalable web platforms.
                    </p>

                    {/* Instant Search Bar */}
                    <div className="mx-auto max-w-xl pt-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search guides, modules, commands, API endpoints..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 pl-12 pr-4 text-base shadow-sm rounded-xl border-muted-foreground/20 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted-foreground">
                            <span>Showing {totalDocs} total technical guides</span>
                            <span className="font-mono">v1.0.0 Enterprise</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Documentation Sections Grid */}
            <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {filteredSections.length === 0 ? (
                    <div className="mx-auto max-w-md text-center py-16">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted shadow-inner">
                            <FileText className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold">No documentation found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            No articles matched your search query "{searchQuery}".
                        </p>
                    </div>
                ) : (
                    <div className="space-y-14">
                        {filteredSections.map((section) => {
                            const SectionIcon = getSectionIcon(section.name);
                            return (
                                <div key={section.name} className="space-y-5">
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <SectionIcon className="h-4 w-4" />
                                            </div>
                                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                                {section.name}
                                            </h2>
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {section.docs.length} {section.docs.length === 1 ? 'guide' : 'guides'}
                                        </span>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {section.docs.map((doc) => (
                                            <Link
                                                key={doc.slug}
                                                href={`/docs/${doc.slug}`}
                                                className="group transition-transform hover:-translate-y-0.5"
                                            >
                                                <Card className="h-full border border-border/70 transition-all hover:border-primary/40 hover:shadow-md">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                                                {doc.title}
                                                            </CardTitle>
                                                            {doc.badge && (
                                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold shrink-0">
                                                                    {doc.badge}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {doc.description && (
                                                            <CardDescription className="line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed pt-1">
                                                                {doc.description}
                                                            </CardDescription>
                                                        )}
                                                    </CardHeader>
                                                    <CardContent className="pt-0 flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>{doc.reading_time || '3 min read'}</span>
                                                        <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:underline">
                                                            Read guide
                                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                                        </span>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
