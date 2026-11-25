import { Head, Link } from "@inertiajs/react";
import {
    ArrowRight,
    BookOpen,
    Box,
    Clock,
    Compass,
    Cpu,
    FileText,
    Home,
    Layers,
    Monitor,
    Moon,
    RotateCcw,
    Search,
    Sparkles,
    Sun,
    Terminal,
    X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AppLogo from "@/components/app-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppearance } from "@/hooks/use-appearance";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSectionSlug, setActiveSectionSlug] = useState<string>("all");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { appearance, updateAppearance } = useAppearance();
    const cycleAppearance = () => {
        const appearances = ["light", "dark", "system"] as const;
        const currentIndex = appearances.indexOf(appearance);
        const nextIndex = (currentIndex + 1) % appearances.length;
        updateAppearance(appearances[nextIndex]);
    };

    const getAppearanceIcon = () => {
        switch (appearance) {
            case "light":
                return <Sun className="h-4 w-4" />;
            case "dark":
                return <Moon className="h-4 w-4" />;
            case "system":
                return <Monitor className="h-4 w-4" />;
        }
    };

    const getAppearanceLabel = () => {
        switch (appearance) {
            case "light":
                return "Light";
            case "dark":
                return "Dark";
            case "system":
                return "System";
        }
    };
    // Keyboard shortcut: "/" or Cmd/Ctrl + K focuses the search bar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.key === "/" ||
                    ((e.metaKey || e.ctrlKey) &&
                        e.key.toLowerCase() === "k")) &&
                document.activeElement?.tagName !== "INPUT" &&
                document.activeElement?.tagName !== "TEXTAREA"
            ) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const getSectionMeta = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes("getting")) {
            return {
                icon: Compass,
                accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
            };
        }
        if (lower.includes("architecture")) {
            return {
                icon: Layers,
                accent: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
            };
        }
        if (lower.includes("content")) {
            return {
                icon: FileText,
                accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            };
        }
        if (lower.includes("business")) {
            return {
                icon: Cpu,
                accent: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
            };
        }
        if (lower.includes("extension")) {
            return {
                icon: Box,
                accent: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
            };
        }
        if (lower.includes("api")) {
            return {
                icon: Terminal,
                accent: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            };
        }
        return {
            icon: BookOpen,
            accent: "text-primary bg-primary/10 border-primary/20",
        };
    };

    const filteredSections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return sections
            .filter(
                (section) =>
                    activeSectionSlug === "all" ||
                    section.slug === activeSectionSlug,
            )
            .map((section) => ({
                ...section,
                docs: section.docs.filter(
                    (doc) =>
                        !query ||
                        doc.title.toLowerCase().includes(query) ||
                        (doc.description &&
                            doc.description.toLowerCase().includes(query)) ||
                        (doc.badge && doc.badge.toLowerCase().includes(query)),
                ),
            }))
            .filter((section) => section.docs.length > 0);
    }, [sections, searchQuery, activeSectionSlug]);

    const visibleDocsCount = useMemo(
        () =>
            filteredSections.reduce(
                (sum, section) => sum + section.docs.length,
                0,
            ),
        [filteredSections],
    );

    const isFiltered =
        searchQuery.trim().length > 0 || activeSectionSlug !== "all";

    const resetFilters = () => {
        setSearchQuery("");
        setActiveSectionSlug("all");
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/15 selection:text-primary">
            <Head title="Developer Documentation — FrameX" />

            {/* Clean Google-style Sticky Top Bar */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="flex items-center transition-opacity hover:opacity-90"
                        >
                            <AppLogo />
                        </Link>
                        <span className="h-4 w-px bg-border" />
                        <Link
                            href="/docs"
                            className="text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Developers
                        </Link>
                        <Badge
                            variant="secondary"
                            className="hidden border border-border/60 bg-muted/60 font-mono text-[10px] font-medium sm:inline-flex"
                        >
                            v1.0
                        </Badge>
                    </div>

                    <nav className="flex items-center gap-2 sm:gap-5">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        >
                            <Home className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link
                            href="/blogs"
                            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        >
                            Blog
                        </Link>
                          <Button
                        variant="ghost"
                        size="icon"
                        onClick={cycleAppearance}
                        className="h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        title={`Current: ${getAppearanceLabel()}`}
                    >
                        {getAppearanceIcon()}
                    </Button>
                        <Button
                            asChild
                            size="sm"
                            className="h-9 rounded-full px-4 text-xs font-medium shadow-xs"
                        >
                            <Link href="/docs/quickstart-installation-setup">
                                Quickstart
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Google-inspired Airy Search Hero */}
            <section className="relative overflow-hidden border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background">
                {/* Subtle Architectural Dot Grid */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[20px_20px] opacity-45 mask-[radial-gradient(ellipse_65%_65%_at_50%_20%,#000_45%,transparent_100%)]"
                />

                <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-20 sm:pb-14 lg:px-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>FrameX Developer Documentation</span>
                        <span className="text-border">•</span>
                        <span className="font-mono text-[11px] text-foreground">
                            {totalDocs} Guides
                        </span>
                    </div>

                    <h1 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.12]">
                        Build with FrameX
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Explore architecture blueprints, module guides, and API
                        references designed to help you ship faster.
                    </p>

                    {/* Google-style Pill Search Input */}
                    <div className="mx-auto mt-8 max-w-2xl">
                        <div className="group relative flex items-center">
                            <Search className="pointer-events-none absolute left-5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search documentation, modules, commands, or APIs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 w-full rounded-full border-border/80 bg-card pr-20 pl-13 text-base shadow-md ring-1 ring-black/3 transition-all placeholder:text-muted-foreground/75 hover:border-border hover:shadow-lg focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 dark:ring-white/4"
                            />

                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                    className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : (
                                <kbd className="pointer-events-none absolute right-5 hidden rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground sm:inline-block">
                                    /
                                </kbd>
                            )}
                        </div>

                        {/* Quick Topic Filter Pills */}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveSectionSlug("all")}
                                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                                    activeSectionSlug === "all"
                                        ? "border-foreground bg-foreground text-background shadow-2xs"
                                        : "border-border/70 bg-card/80 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                                }`}
                            >
                                All Topics
                            </button>

                            {sections.map((section) => {
                                const isActive =
                                    activeSectionSlug === section.slug;
                                return (
                                    <button
                                        key={section.slug}
                                        type="button"
                                        onClick={() =>
                                            setActiveSectionSlug(section.slug)
                                        }
                                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                                            isActive
                                                ? "border-foreground bg-foreground text-background shadow-2xs"
                                                : "border-border/70 bg-card/80 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                                        }`}
                                    >
                                        {section.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Documentation Directory */}
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Active Filter Status Strip */}
                {isFiltered && (
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>
                                Showing{" "}
                                <strong className="font-semibold tabular-nums text-foreground">
                                    {visibleDocsCount}
                                </strong>{" "}
                                {visibleDocsCount === 1 ? "result" : "results"}
                            </span>
                            {searchQuery && (
                                <span>
                                    for{" "}
                                    <strong className="font-medium text-foreground">
                                        “{searchQuery}”
                                    </strong>
                                </span>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="h-7 gap-1.5 rounded-full text-xs"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset filters
                        </Button>
                    </div>
                )}

                {filteredSections.length === 0 ? (
                    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border/80 bg-card/50 px-6 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-muted/60 text-muted-foreground shadow-2xs">
                            <Search className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-foreground">
                            No matching guides found
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            We couldn’t find any documentation matching{" "}
                            <span className="font-medium text-foreground">
                                “{searchQuery}”
                            </span>
                            . Try a broader keyword or browse all topics.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            className="mt-5 rounded-full px-4"
                        >
                            Clear Search &amp; Filters
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-14">
                        {filteredSections.map((section) => {
                            const { icon: SectionIcon, accent } =
                                getSectionMeta(section.name);

                            return (
                                <section
                                    key={section.slug || section.name}
                                    className="space-y-5"
                                >
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${accent}`}
                                            >
                                                <SectionIcon className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                                    {section.name}
                                                </h2>
                                            </div>
                                        </div>

                                        <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                                            {section.docs.length}{" "}
                                            {section.docs.length === 1
                                                ? "guide"
                                                : "guides"}
                                        </span>
                                    </div>

                                    {/* Google Material-inspired Rounded Cards */}
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {section.docs.map((doc) => (
                                            <Link
                                                key={doc.slug}
                                                href={`/docs/${doc.slug}`}
                                                className="group relative flex flex-col justify-between rounded-2xl border border-border/75 bg-card p-6 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                                                            {doc.title}
                                                        </h3>
                                                        {doc.badge && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="shrink-0 rounded-full border border-border/60 bg-muted/70 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
                                                            >
                                                                {doc.badge}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {doc.description && (
                                                        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                                            {doc.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-3.5 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 opacity-65" />
                                                        {doc.reading_time ||
                                                            "3 min read"}
                                                    </span>

                                                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                                                        <span>Read</span>
                                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Clean Google Developers Footer */}
            <footer className="mt-12 border-t border-border/60 bg-muted/20">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <AppLogo />
                        <span>·</span>
                        <span>Developer Documentation</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link
                            href="/docs/quickstart-installation-setup"
                            className="transition-colors hover:text-foreground"
                        >
                            Quickstart
                        </Link>
                        <Link
                            href="/blogs"
                            className="transition-colors hover:text-foreground"
                        >
                            Engineering Blog
                        </Link>
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground"
                        >
                            Home
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
