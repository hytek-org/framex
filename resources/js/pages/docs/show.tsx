import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    Link2,
    ListTree,
    Menu,
    MessageSquare,
    Monitor,
    Moon,
    Search,
    Sun,
    X,
} from "lucide-react";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { toast } from "sonner";
import AppLogo from "@/components/app-logo";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppearanceToggleTab from "@/components/appearance-tabs";
import { useAppearance } from "@/hooks/use-appearance";

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

const LANGUAGE_LABELS: Record<string, string> = {
    tsx: "tsx",
    ts: "typescript",
    typescript: "typescript",
    jsx: "jsx",
    js: "javascript",
    javascript: "javascript",
    bash: "bash",
    sh: "shell",
    shell: "shell",
    zsh: "zsh",
    php: "php",
    json: "json",
    html: "html",
    css: "css",
    sql: "sql",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    markdown: "markdown",
    text: "text",
    plaintext: "text",
};

/*
|--------------------------------------------------------------------------
| Sidebar Navigation Tree
|--------------------------------------------------------------------------
*/

function SidebarNavigation({
    sections,
    activeSlug,
    filter,
    onFilterChange,
    onNavigate,
    inputRef,
}: {
    sections: Section[];
    activeSlug: string;
    filter: string;
    onFilterChange: (value: string) => void;
    onNavigate?: () => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
    const filteredSections = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return sections;
        return sections
            .map((section) => ({
                ...section,
                docs: section.docs.filter(
                    (d) =>
                        d.title.toLowerCase().includes(q) ||
                        section.name.toLowerCase().includes(q) ||
                        (d.badge && d.badge.toLowerCase().includes(q)),
                ),
            }))
            .filter((s) => s.docs.length > 0);
    }, [sections, filter]);

    return (
        <div className="flex flex-col gap-5">
            {/* Sidebar identity and search */}
            <div className="px-2.5">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/65 uppercase">
                    Documentation
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Browse guides and references
                </p>
            </div>

            <div className="relative px-0.5">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/65" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    placeholder="Filter guides..."
                    aria-label="Filter documentation guides"
                    className="h-9 rounded-lg border-border/70 bg-muted/25 pr-8 pl-9 text-[12px] shadow-none transition-all placeholder:text-muted-foreground/60 hover:border-border hover:bg-muted/40 focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/10"
                />
                {filter && (
                    <button
                        type="button"
                        onClick={() => onFilterChange("")}
                        aria-label="Clear filter"
                        className="absolute top-1/2 right-2.5 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Section Groups */}
            {filteredSections.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        No guides match{" "}
                        <span className="font-medium text-foreground">
                            “{filter}”
                        </span>
                    </p>
                    <button
                        type="button"
                        onClick={() => onFilterChange("")}
                        className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                        Clear filter
                    </button>
                </div>
            ) : (
                <nav
                    aria-label="Documentation sections"
                    className="space-y-5 pb-6"
                >
                    {filteredSections.map((section) => (
                        <div
                            key={section.slug || section.name}
                            className="space-y-1"
                        >
                            <h4 className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/65 uppercase">
                                {section.name}
                            </h4>
                            <ul className="space-y-0.5">
                                {section.docs.map((item) => {
                                    const isActive = item.slug === activeSlug;
                                    return (
                                        <li key={item.slug}>
                                            <Link
                                                href={`/docs/${item.slug}`}
                                                onClick={onNavigate}
                                                aria-current={
                                                    isActive
                                                        ? "page"
                                                        : undefined
                                                }
                                                className={`group relative flex min-h-8 items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[12px] leading-5 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                                                    isActive
                                                        ? "bg-primary/[0.075] font-medium text-foreground ring-1 ring-inset ring-primary/10"
                                                        : "text-muted-foreground hover:bg-muted/55 hover:text-foreground"
                                                }`}
                                            >
                                                {/* Refined Left Accent Bar */}
                                                {isActive && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-primary"
                                                    />
                                                )}

                                                <span className="min-w-0 flex-1 truncate">
                                                    {item.title}
                                                </span>

                                                {item.badge && (
                                                    <span
                                                        className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] leading-none font-medium tracking-tight ${
                                                            isActive
                                                                ? "bg-primary/12 text-primary"
                                                                : "bg-muted text-muted-foreground/80"
                                                        }`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Mobile Slide-In Drawer
|--------------------------------------------------------------------------
*/

function MobileNavDrawer({
    open,
    onClose,
    sections,
    activeSlug,
    filter,
    onFilterChange,
}: {
    open: boolean;
    onClose: () => void;
    sections: Section[];
    activeSlug: string;
    filter: string;
    onFilterChange: (value: string) => void;
}) {
    // Lock body scroll and listen for Escape when drawer is open
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    return (
        <div
            aria-hidden={!open}
            className={`fixed inset-0 z-50 lg:hidden ${
                open ? "pointer-events-auto" : "pointer-events-none"
            }`}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-background/70 backdrop-blur-xs transition-opacity duration-200 ${
                    open ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Slide-In Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Documentation navigation"
                className={`fixed inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col border-r border-border/80 bg-background shadow-2xl transition-transform duration-200 ease-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4">
                    <Link
                        href="/"
                        onClick={onClose}
                        className="flex items-center gap-2"
                    >
                        <AppLogo />
                    </Link>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Close navigation menu"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                    <SidebarNavigation
                        sections={sections}
                        activeSlug={activeSlug}
                        filter={filter}
                        onFilterChange={onFilterChange}
                        onNavigate={onClose}
                    />
                </div>
            </aside>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Mobile Table of Contents Accordion
|--------------------------------------------------------------------------
*/

function MobileTocAccordion({
    toc,
    activeHeading,
}: {
    toc: TocItem[];
    activeHeading: string;
}) {
    const [open, setOpen] = useState(false);

    if (toc.length === 0) return null;

    const currentTitle =
        toc.find((item) => item.id === activeHeading)?.title || "On this page";

    return (
        <div className="mb-6 rounded-lg border border-border/70 bg-muted/20 xl:hidden">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-muted/35"
            >
                <span className="flex min-w-0 items-center gap-2">
                    <ListTree className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="shrink-0 font-medium text-foreground">
                        On this page
                    </span>
                    {!open && currentTitle !== "On this page" && (
                        <>
                            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                            <span className="truncate text-muted-foreground">
                                {currentTitle}
                            </span>
                        </>
                    )}
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <nav
                    aria-label="On this page"
                    className="border-t border-border/60 px-3.5 py-2.5"
                >
                    <ul className="space-y-0.5">
                        {toc.map((item) => {
                            const isActive = activeHeading === item.id;
                            return (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        onClick={() => setOpen(false)}
                                        className={`block rounded-md py-1.5 text-xs transition-colors ${
                                            item.level === 3
                                                ? "pl-5 pr-2"
                                                : "px-2"
                                        } ${
                                            isActive
                                                ? "bg-muted/70 font-medium text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {item.title}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Main DocsShow Page
|--------------------------------------------------------------------------
*/

export default function DocsShow({
    doc,
    sections,
    toc,
    prev,
    next,
    feedbackForm,
}: Props) {
    const [copied, setCopied] = useState(false);
    const [activeHeading, setActiveHeading] = useState<string>("");
    const [readProgress, setReadProgress] = useState(0);
    const [sidebarFilter, setSidebarFilter] = useState("");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const articleRef = useRef<HTMLElement>(null);
    const { appearance, updateAppearance } = useAppearance();
    const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

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

    // High-performance scroll tracking via requestAnimationFrame
    useEffect(() => {
        let rafId: number | null = null;

        const updateScrollState = () => {
            rafId = null;
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            setReadProgress(
                docHeight > 0
                    ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
                    : 0,
            );

            if (toc.length === 0) return;

            const scrollPos = scrollTop + 116;
            let currentId = toc[0]?.id || "";

            for (let i = 0; i < toc.length; i++) {
                const el = document.getElementById(toc[i].id);
                if (el && el.offsetTop <= scrollPos) {
                    currentId = toc[i].id;
                } else if (el && el.offsetTop > scrollPos) {
                    break;
                }
            }
            setActiveHeading(currentId);
        };

        const onScroll = () => {
            if (rafId === null) {
                rafId = window.requestAnimationFrame(updateScrollState);
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        updateScrollState();

        return () => {
            window.removeEventListener("scroll", onScroll);
            if (rafId !== null) window.cancelAnimationFrame(rafId);
        };
    }, [toc]);

    // Enhance <pre> code blocks and wrap wide <table> elements for mobile safety
    useEffect(() => {
        const container = articleRef.current;
        if (!container) return;

        const cleanups: Array<() => void> = [];

        // 1. Wrap tables in horizontal scroll containers to prevent page overflow on 320px+
        const tables = Array.from(container.querySelectorAll("table"));
        tables.forEach((table) => {
            if (table.parentElement?.dataset.tableWrapper === "true") return;
            const wrapper = document.createElement("div");
            wrapper.dataset.tableWrapper = "true";
            wrapper.className =
                "not-prose my-4 w-full overflow-x-auto rounded-lg border border-border/75";
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
            table.className =
                "w-full border-collapse text-left text-[13px] leading-6";

            cleanups.push(() => {
                if (wrapper.parentNode) {
                    wrapper.parentNode.insertBefore(table, wrapper);
                    wrapper.remove();
                }
            });
        });

        // 2. Upgrade <pre> blocks into minimal, high-contrast dark code editors
        const preBlocks = Array.from(container.querySelectorAll("pre"));
        preBlocks.forEach((pre) => {
            if (pre.dataset.enhanced === "true") return;
            pre.dataset.enhanced = "true";

            const codeEl = pre.querySelector("code");
            const rawClass = `${pre.className} ${codeEl?.className || ""}`;
            const langMatch = rawClass.match(
                /(?:language-|lang-)([a-zA-Z0-9_-]+)/,
            );
            const rawLang = langMatch?.[1]?.toLowerCase() || "";
            const displayLang =
                LANGUAGE_LABELS[rawLang] || (rawLang ? rawLang : "code");

            const wrapper = document.createElement("div");
            wrapper.className =
                "not-prose my-4 max-w-full overflow-hidden rounded-lg border border-zinc-800/90 bg-[#0c0e12] text-zinc-100";

            const header = document.createElement("div");
            header.className =
                "flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-2";

            const langLabel = document.createElement("span");
            langLabel.className =
                "font-mono text-[11px] font-medium tracking-wide text-zinc-400 lowercase";
            langLabel.textContent = displayLang;

            const copyBtn = document.createElement("button");
            copyBtn.type = "button";
            copyBtn.setAttribute("aria-label", "Copy code snippet");
            copyBtn.className =
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-sans text-[11px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:outline-none";

            const copyIdleHtml =
                '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>';
            const copyDoneHtml =
                '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>Copied</span>';

            copyBtn.innerHTML = copyIdleHtml;

            let resetTimer: number | null = null;
            const onCopy = async () => {
                const textToCopy = codeEl?.innerText || pre.innerText;
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    copyBtn.innerHTML = copyDoneHtml;
                    copyBtn.classList.add("text-emerald-400");
                    copyBtn.classList.remove("text-zinc-400");
                    if (resetTimer) window.clearTimeout(resetTimer);
                    resetTimer = window.setTimeout(() => {
                        copyBtn.innerHTML = copyIdleHtml;
                        copyBtn.classList.remove("text-emerald-400");
                        copyBtn.classList.add("text-zinc-400");
                    }, 1800);
                } catch {
                    toast.error("Failed to copy code");
                }
            };

            copyBtn.addEventListener("click", onCopy);
            header.appendChild(langLabel);
            header.appendChild(copyBtn);

            pre.className =
                "m-0 max-w-full overflow-x-auto bg-transparent p-4 font-mono text-[13px] leading-[1.65] text-zinc-100 antialiased selection:bg-zinc-700/70";
            if (codeEl) {
                codeEl.className = "bg-transparent p-0 text-zinc-100";
            }

            if (pre.parentNode) {
                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(header);
                wrapper.appendChild(pre);
            }

            cleanups.push(() => {
                copyBtn.removeEventListener("click", onCopy);
                if (resetTimer) window.clearTimeout(resetTimer);
                delete pre.dataset.enhanced;
                if (wrapper.parentNode) {
                    wrapper.parentNode.insertBefore(pre, wrapper);
                    wrapper.remove();
                }
            });
        });

        return () => {
            cleanups.forEach((fn) => fn());
        };
    }, [doc.body_html]);

    const copyUrl = async () => {
        if (typeof window === "undefined") return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy link");
        }
    };

    return (
        <div className="min-h-screen overflow-x-clip bg-background pt-14 text-foreground antialiased selection:bg-primary/15 selection:text-primary">
            <Head title={`${doc.title} — FrameX Documentation`} />

            {/* Fixed application header */}
            <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border/70 bg-background/95 backdrop-blur-md">
                <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileNavOpen(true)}
                            aria-label="Open documentation navigation"
                            className="-ml-1.5 h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground lg:hidden"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>

                        <Link
                            href="/"
                            className="flex shrink-0 items-center transition-opacity hover:opacity-85"
                        >
                            <AppLogo />
                        </Link>

                        <span className="h-4 w-px shrink-0 bg-border/80" />

                        <nav
                            aria-label="Breadcrumb"
                            className="flex min-w-0 items-center gap-1.5 text-[13px]"
                        >
                            <Link
                                href="/docs"
                                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Docs
                            </Link>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/45" />
                            <span className="truncate font-medium text-foreground">
                                {doc.category}
                            </span>
                        </nav>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
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
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={copyUrl}
                            className="h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                            {copied ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                                <Link2 className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline">
                                {copied ? "Copied" : "Copy link"}
                            </span>
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="hidden h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground md:inline-flex"
                        >
                            <Link href="/docs">
                                <ArrowLeft className="h-3.5 w-3.5" />
                                All guides
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Slide-In Navigation Drawer */}
            <MobileNavDrawer
                open={mobileNavOpen}
                onClose={closeMobileNav}
                sections={sections}
                activeSlug={doc.slug}
                filter={sidebarFilter}
                onFilterChange={setSidebarFilter}
            />

            {/* Documentation workspace: fixed navigation + focused reading canvas */}
            <aside className="fixed inset-y-14 left-0 z-30 hidden w-[260px] border-r border-border/70 bg-background/98 lg:block">
                <div className="h-full overflow-y-auto px-5 pt-6 pb-8 scrollbar-thin">
                    <SidebarNavigation
                        sections={sections}
                        activeSlug={doc.slug}
                        filter={sidebarFilter}
                        onFilterChange={setSidebarFilter}
                    />
                </div>
            </aside>

            {/* Reading canvas sits between two independently fixed navigation rails. */}
            <div className="min-h-[calc(100vh-3.5rem)] lg:pl-[260px] xl:pr-[224px]">
                <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-7 xl:px-6">
                    {/* Main article */}
                    <main className="min-w-0 py-7 sm:py-8 lg:py-9">
                        <div className="mx-auto w-full max-w-[740px]">
                            {/* Mobile / tablet table of contents */}
                            <MobileTocAccordion
                                toc={toc}
                                activeHeading={activeHeading}
                            />

                            {/* Article heading */}
                            <header className="mb-7 space-y-3 border-b border-border/60 pb-6">
                                <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                                    <span className="font-medium text-primary">
                                        {doc.category}
                                    </span>
                                    {doc.badge && (
                                        <>
                                            <span className="text-border">
                                                /
                                            </span>
                                            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground/80">
                                                {doc.badge}
                                            </span>
                                        </>
                                    )}
                                    <span className="text-border">/</span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 opacity-70" />
                                        {doc.reading_time}
                                    </span>
                                </div>

                                <h1 className="max-w-3xl text-[29px] leading-[1.16] font-semibold tracking-[-0.035em] text-foreground sm:text-[34px] lg:text-[38px]">
                                    {doc.title}
                                </h1>

                                {doc.description && (
                                    <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">
                                        {doc.description}
                                    </p>
                                )}
                            </header>

                            {/* Documentation body: tighter rhythm and readable type scale */}
                            <article
                                ref={articleRef}
                                className="prose prose-neutral dark:prose-invert max-w-none
                                    [&>h1:first-child]:hidden [&>h1:first-child+hr]:hidden
                                    prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-[-0.025em] prose-headings:text-foreground
                                    prose-h2:mt-9 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-2 prose-h2:text-[21px]
                                    prose-h3:mt-7 prose-h3:mb-2 prose-h3:text-[17px]
                                    prose-p:my-3 prose-p:text-[15px] prose-p:leading-[1.7] prose-p:text-foreground/85
                                    prose-li:my-1 prose-li:text-[15px] prose-li:leading-[1.65] prose-li:text-foreground/85
                                    prose-ul:my-3 prose-ol:my-3 prose-li:marker:text-muted-foreground/60
                                    prose-hr:my-7 prose-hr:border-border/60
                                    prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:decoration-primary/30 prose-a:underline-offset-4 hover:prose-a:decoration-primary
                                    prose-strong:font-semibold prose-strong:text-foreground
                                    prose-code:rounded prose-code:border prose-code:border-border/60 prose-code:bg-muted/65 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[12px] prose-code:font-normal prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
                                    prose-pre:my-4 prose-pre:bg-[#0c0e12] prose-pre:text-zinc-100
                                    [&_th]:border-b [&_th]:border-border/70 [&_th]:bg-muted/40 [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-foreground
                                    [&_td]:border-b [&_td]:border-border/50 [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-[13px] [&_td]:text-foreground/85
                                    [&_tr:last-child_td]:border-b-0
                                    prose-blockquote:my-5 prose-blockquote:border-l-2 prose-blockquote:border-primary/60 prose-blockquote:bg-muted/30 prose-blockquote:py-2.5 prose-blockquote:pr-4 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-foreground/85"
                                dangerouslySetInnerHTML={{
                                    __html: doc.body_html,
                                }}
                            />

                            {/* Previous / next article navigation */}
                            {(prev || next) && (
                                <nav
                                    aria-label="Guide pagination"
                                    className="mt-10 grid gap-3 border-t border-border/60 pt-6 sm:grid-cols-2"
                                >
                                    {prev ? (
                                        <Link
                                            href={`/docs/${prev.slug}`}
                                            className="group flex min-h-[76px] flex-col justify-center rounded-lg border border-border/70 bg-background px-4 py-3 transition-colors hover:border-border hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        >
                                            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
                                                Previous
                                            </span>
                                            <span className="mt-1 line-clamp-1 text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
                                                {prev.title}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div className="hidden sm:block" />
                                    )}

                                    {next ? (
                                        <Link
                                            href={`/docs/${next.slug}`}
                                            className="group flex min-h-[76px] flex-col items-end justify-center rounded-lg border border-border/70 bg-background px-4 py-3 text-right transition-colors hover:border-border hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        >
                                            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                Next
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                                            </span>
                                            <span className="mt-1 line-clamp-1 text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
                                                {next.title}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div className="hidden sm:block" />
                                    )}
                                </nav>
                            )}

                            {/* Documentation feedback */}
                            {feedbackForm && (
                                <section className="mt-9 rounded-lg border border-border/70 bg-muted/20 p-4 sm:p-5">
                                    <div className="mb-4 flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Was this page helpful?
                                            </h3>
                                            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                                Send feedback to help improve
                                                the FrameX documentation.
                                            </p>
                                        </div>
                                    </div>

                                    <DynamicForm
                                        slug={feedbackForm.slug}
                                        fields={feedbackForm.fields}
                                        submitButtonText={
                                            feedbackForm.submit_button_text
                                        }
                                        successMessage={
                                            feedbackForm.success_message
                                        }
                                    />
                                </section>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Fixed right-side table of contents: scrolls independently from the article. */}
            <aside className="fixed inset-y-14 right-0 z-30 hidden w-[224px] border-l border-border/70 bg-background/98 xl:block">
                <div className="h-full overflow-y-auto px-5 py-7 scrollbar-thin">
                    <div className="mb-4 flex items-center gap-2 px-1">
                        <ListTree className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase">
                            On this page
                        </span>
                    </div>

                    {toc.length === 0 ? (
                        <p className="px-1 text-xs text-muted-foreground/65">
                            Overview
                        </p>
                    ) : (
                        <nav
                            aria-label="Table of contents"
                            className="relative border-l border-border/60"
                        >
                            {toc.map((item) => {
                                const isH3 = item.level === 3;
                                const isActive = activeHeading === item.id;

                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`-ml-px block border-l-2 py-2 text-[11px] leading-[1.5] transition-colors duration-150 ${
                                            isH3 ? "pl-5 pr-2" : "pl-3 pr-2"
                                        } ${
                                            isActive
                                                ? "border-primary font-medium text-foreground"
                                                : "border-transparent text-muted-foreground/80 hover:border-border hover:text-foreground"
                                        }`}
                                    >
                                        {item.title}
                                    </a>
                                );
                            })}
                        </nav>
                    )}

                    {readProgress > 12 && (
                        <div className="mt-6 border-t border-border/50 pt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    })
                                }
                                className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowUp className="h-3.5 w-3.5" />
                                Back to top
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
