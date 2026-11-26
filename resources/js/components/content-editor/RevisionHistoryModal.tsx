import React, { useEffect, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import DOMPurify from "isomorphic-dompurify";
import {
    AlertCircle,
    ArrowLeftRight,
    ArrowRight,
    Check,
    CheckCircle2,
    Clock3,
    FileClock,
    GitCommitHorizontal,
    History,
    Loader2,
    RotateCcw,
    UserRound,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Revision {
    id: number;
    title: string;
    excerpt?: string | null;
    change_summary: string;
    created_at: string;
    is_current: boolean;
    author?: {
        id: number;
        name: string;
    } | null;
}

interface DiffField {
    from: string | null;
    to: string | null;
    changed: boolean;
}

interface RevisionDiff {
    title: DiffField;
    excerpt: DiffField;
    body_html: DiffField;
}

interface RevisionHistoryModalProps {
    open: boolean;
    onClose: () => void;
    contentSlug: string;
    currentRevisionId?: number | null;
}

type MobileTab = "snapshots" | "compare";

function formatRevisionDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function EmptyValue() {
    return <span className="italic text-muted-foreground/70">No content</span>;
}

function DiffStatus({ changed }: { changed: boolean }) {
    return changed ? (
        <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        >
            <AlertCircle className="size-3" /> Changed
        </Badge>
    ) : (
        <Badge variant="secondary" className="gap-1 text-muted-foreground">
            <Check className="size-3" /> Unchanged
        </Badge>
    );
}

function DiffText({ value }: { value: string | null | undefined }) {
    return value?.trim() ? (
        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-foreground">
            {value}
        </p>
    ) : (
        <EmptyValue />
    );
}

function DiffHtml({ value }: { value: string | null | undefined }) {
    if (!value?.trim()) {
        return <EmptyValue />;
    }

    const safeHtml = DOMPurify.sanitize(value, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: [
            "style",
            "script",
            "iframe",
            "form",
            "input",
            "button",
            "object",
            "embed",
        ],
        FORBID_ATTR: ["style"],
    });

    return (
        <div
            className="revision-diff-prose max-w-none overflow-x-auto wrap-break-word text-sm leading-6 text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_img]:h-auto [&_img]:max-w-full [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_table]:w-full [&_table]:min-w-105 [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
    );
}

function ComparePanel({
    label,
    changed,
    previousLabel,
    currentLabel,
    previous,
    current,
    html = false,
}: {
    label: string;
    changed: boolean;
    previousLabel: string;
    currentLabel: string;
    previous: string | null | undefined;
    current: string | null | undefined;
    html?: boolean;
}) {
    const Value = html ? DiffHtml : DiffText;

    return (
        <section className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-2 border-b px-3.5 py-2.5 sm:px-4 sm:py-3">
                <h3 className="text-sm font-semibold tracking-tight">
                    {label}
                </h3>
                <DiffStatus changed={changed} />
            </div>
            <div className="grid min-w-0 grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
                <div className="min-w-0 p-3.5 sm:p-4">
                    <div className="mb-2.5 flex items-center gap-2">
                        <span className="size-2 shrink-0 rounded-full bg-rose-500" />
                        <p className="text-xs font-medium text-muted-foreground">
                            {previousLabel}
                        </p>
                    </div>
                    <div className="max-h-56 overflow-auto pr-1 md:max-h-64">
                        <Value value={previous} />
                    </div>
                </div>
                <div className="min-w-0 bg-muted/20 p-3.5 sm:p-4">
                    <div className="mb-2.5 flex items-center gap-2">
                        <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
                        <p className="text-xs font-medium text-muted-foreground">
                            {currentLabel}
                        </p>
                    </div>
                    <div className="max-h-56 overflow-auto pr-1 md:max-h-64">
                        <Value value={current} />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function RevisionHistoryModal({
    open,
    onClose,
    contentSlug,
    currentRevisionId,
}: RevisionHistoryModalProps) {
    const { currentTeam } = usePage().props as {
        currentTeam?: { slug?: string };
    };
    const teamSlug = currentTeam?.slug || "";

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [selectedRevision, setSelectedRevision] = useState<Revision | null>(
        null,
    );
    const [mobileTab, setMobileTab] = useState<MobileTab>("snapshots");
    const [diff, setDiff] = useState<RevisionDiff | null>(null);
    const [diffLoading, setDiffLoading] = useState(false);
    const [diffError, setDiffError] = useState<string | null>(null);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        if (!open || !teamSlug || !contentSlug) {
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setLoadError(null);
        setDiff(null);
        setDiffError(null);
        setSelectedRevision(null);
        setMobileTab("snapshots");

        fetch(
            `/${teamSlug}/content/${encodeURIComponent(contentSlug)}/revisions`,
            {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                signal: controller.signal,
            },
        )
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(
                        `Unable to load revision history (${response.status}).`,
                    );
                }
                return response.json();
            })
            .then((responseData) => {
                const items = Array.isArray(responseData?.revisions)
                    ? (responseData.revisions as Revision[])
                    : [];
                setRevisions(items);

                if (items.length > 0) {
                    const preferred =
                        items.find(
                            (revision) => revision.id === currentRevisionId,
                        ) ?? items[0];
                    setSelectedRevision(preferred);
                }
            })
            .catch((error: unknown) => {
                if (error instanceof Error && error.name === "AbortError")
                    return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong while loading revisions.",
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [open, teamSlug, contentSlug, currentRevisionId]);

    useEffect(() => {
        if (!open || !selectedRevision || !teamSlug || !contentSlug) {
            setDiff(null);
            setDiffError(null);
            setDiffLoading(false);
            return;
        }

        const controller = new AbortController();
        setDiffLoading(true);
        setDiff(null);
        setDiffError(null);

        fetch(
            `/${teamSlug}/content/${encodeURIComponent(contentSlug)}/revisions/${selectedRevision.id}/diff`,
            {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                signal: controller.signal,
            },
        )
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(
                        `Unable to compare this revision (${response.status}).`,
                    );
                }
                return response.json();
            })
            .then((responseData) => {
                if (responseData?.diff) {
                    setDiff(responseData.diff as RevisionDiff);
                } else {
                    setDiffError(
                        "The server did not return comparison data for this revision.",
                    );
                }
            })
            .catch((error: unknown) => {
                if (error instanceof Error && error.name === "AbortError")
                    return;
                setDiffError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong while comparing revisions.",
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) setDiffLoading(false);
            });

        return () => controller.abort();
    }, [open, selectedRevision, teamSlug, contentSlug]);

    const changedFields = useMemo(() => {
        if (!diff) return 0;
        return [diff.title, diff.excerpt, diff.body_html].filter(
            (field) => field?.changed,
        ).length;
    }, [diff]);

    const handleSelectRevision = (revision: Revision) => {
        setSelectedRevision(revision);
        setMobileTab("compare");
    };

    const handleRestore = () => {
        if (!selectedRevision || restoring) return;

        const confirmed = window.confirm(
            `Restore revision #${selectedRevision.id}? A new snapshot will be created from this revision.`,
        );

        if (!confirmed) return;

        setRestoring(true);
        router.post(
            `/${teamSlug}/content/${encodeURIComponent(contentSlug)}/revisions/${selectedRevision.id}/restore`,
            {},
            {
                onSuccess: () => onClose(),
                onFinish: () => setRestoring(false),
            },
        );
    };

    const currentRevision = revisions.find((revision) => revision.is_current);
    const previousLabel = selectedRevision?.id
        ? `Revision #${selectedRevision.id}`
        : "Revision";

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="flex h-dvh w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-6xl sm:rounded-xl">
                <DialogHeader className="shrink-0 border-b bg-background px-4 py-3.5 pr-12 sm:px-6 sm:py-4 sm:pr-6">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-10">
                                <History className="size-4 sm:size-5" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-base font-semibold tracking-tight sm:text-lg">
                                    Version history
                                </DialogTitle>
                                <DialogDescription className="mt-0.5 text-xs leading-5 sm:mt-1 sm:text-sm">
                                    Review previous snapshots, inspect changes,
                                    or restore an earlier version.
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:justify-end">
                            <Badge
                                variant="secondary"
                                className="gap-1.5 px-2 py-0.5 text-[11px] sm:px-2.5 sm:py-1 sm:text-xs"
                            >
                                <FileClock className="size-3.5" />
                                {revisions.length}{" "}
                                {revisions.length === 1
                                    ? "snapshot"
                                    : "snapshots"}
                            </Badge>
                            {currentRevision && (
                                <Badge
                                    variant="outline"
                                    className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300 sm:px-2.5 sm:py-1 sm:text-xs"
                                >
                                    <CheckCircle2 className="size-3.5" /> Latest
                                    #{currentRevision.id}
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Mobile pane switcher */}
                <div className="grid shrink-0 grid-cols-2 border-b bg-muted/30 p-1 md:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileTab("snapshots")}
                        className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
                            mobileTab === "snapshots"
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <History className="size-3.5" />
                        Snapshots ({revisions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab("compare")}
                        className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
                            mobileTab === "compare"
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <ArrowLeftRight className="size-3.5" />
                        {selectedRevision
                            ? `Compare #${selectedRevision.id}`
                            : "Compare"}
                    </button>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[280px_minmax(0,1fr)]">
                    <aside
                        className={cn(
                            "min-h-0 flex-col border-b bg-muted/20 md:flex md:border-b-0 md:border-r",
                            mobileTab === "snapshots" ? "flex flex-1" : "hidden",
                        )}
                    >
                        <div className="hidden shrink-0 items-center justify-between border-b px-4 py-3 md:flex">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Snapshots
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Select a version to compare
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="font-mono text-[10px]"
                            >
                                {revisions.length}
                            </Badge>
                        </div>

                        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                            {loading ? (
                                <div
                                    className="space-y-3 p-1"
                                    aria-label="Loading revisions"
                                >
                                    {Array.from({ length: 4 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="space-y-2 rounded-xl border bg-card p-3"
                                            >
                                                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                                                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                                                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : loadError ? (
                                <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                                    <AlertCircle className="size-5 text-destructive" />
                                    <p className="text-sm font-medium">
                                        Could not load history
                                    </p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {loadError}
                                    </p>
                                </div>
                            ) : revisions.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 px-3 py-12 text-center">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                        <History className="size-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium">
                                        No snapshots yet
                                    </p>
                                    <p className="max-w-48 text-xs leading-5 text-muted-foreground">
                                        Revision snapshots will appear here as
                                        this content is updated.
                                    </p>
                                </div>
                            ) : (
                                revisions.map((revision, index) => {
                                    const isSelected =
                                        selectedRevision?.id === revision.id;
                                    return (
                                        <button
                                            key={revision.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectRevision(revision)
                                            }
                                            aria-pressed={isSelected}
                                            className={cn(
                                                "group relative w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                isSelected
                                                    ? "border-primary/50 bg-primary/6 shadow-sm"
                                                    : "border-border bg-card hover:border-primary/30 hover:bg-accent/40",
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            "flex size-7 shrink-0 items-center justify-center rounded-lg",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted text-muted-foreground",
                                                        )}
                                                    >
                                                        <GitCommitHorizontal className="size-4" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold">
                                                            Revision #
                                                            {revision.id}
                                                        </p>
                                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                            {index === 0
                                                                ? "Most recent snapshot"
                                                                : `Snapshot ${revisions.length - index}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                {revision.is_current && (
                                                    <Badge className="shrink-0 border-0 bg-emerald-600/10 text-[10px] text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-300">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="mt-2.5 line-clamp-2 text-sm font-medium leading-5 text-foreground">
                                                {revision.change_summary?.trim() ||
                                                    revision.title ||
                                                    "Content snapshot"}
                                            </p>

                                            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                                <span className="inline-flex min-w-0 items-center gap-1">
                                                    <UserRound className="size-3 shrink-0" />
                                                    <span className="truncate">
                                                        {revision.author
                                                            ?.name || "System"}
                                                    </span>
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock3 className="size-3 shrink-0" />
                                                    {formatRevisionDate(
                                                        revision.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    <main
                        className={cn(
                            "min-h-0 flex-col overflow-hidden bg-background md:flex",
                            mobileTab === "compare" ? "flex flex-1" : "hidden",
                        )}
                    >
                        {selectedRevision && (
                            <div className="flex shrink-0 flex-col gap-2.5 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-semibold">
                                            Revision #{selectedRevision.id}
                                        </h3>
                                        {selectedRevision.is_current && (
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                            >
                                                Active version
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {formatRevisionDate(
                                            selectedRevision.created_at,
                                        )}
                                        {selectedRevision.author?.name
                                            ? ` · by ${selectedRevision.author.name}`
                                            : ""}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {diff && (
                                        <Badge
                                            variant="secondary"
                                            className="gap-1.5 text-xs"
                                        >
                                            {changedFields} of 3 fields changed
                                        </Badge>
                                    )}
                                    {!selectedRevision.is_current && (
                                        <Button
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            onClick={handleRestore}
                                            disabled={restoring || diffLoading}
                                        >
                                            {restoring ? (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            ) : (
                                                <RotateCcw className="mr-2 size-4" />
                                            )}
                                            {restoring
                                                ? "Restoring…"
                                                : "Restore snapshot"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto p-3.5 sm:space-y-4 sm:p-5">
                            {!selectedRevision && !loading && !loadError ? (
                                <div className="flex h-full min-h-60 flex-col items-center justify-center text-center">
                                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
                                        <ArrowRight className="size-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-semibold">
                                        Choose a snapshot
                                    </p>
                                    <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                                        Select a revision from the timeline to
                                        inspect how the content changed.
                                    </p>
                                </div>
                            ) : diffLoading ? (
                                <div
                                    className="space-y-4"
                                    aria-label="Loading comparison"
                                >
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="size-4 animate-spin" />{" "}
                                        Preparing version comparison…
                                    </div>
                                    {Array.from({ length: 3 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="overflow-hidden rounded-xl border"
                                            >
                                                <div className="h-11 animate-pulse bg-muted/70" />
                                                <div className="grid grid-cols-1 md:grid-cols-2">
                                                    <div className="h-28 animate-pulse border-b bg-muted/20 p-4 md:border-b-0 md:border-r" />
                                                    <div className="h-28 animate-pulse bg-muted/20 p-4" />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : diffError ? (
                                <div className="flex min-h-60 flex-col items-center justify-center gap-2 text-center">
                                    <AlertCircle className="size-6 text-destructive" />
                                    <p className="text-sm font-semibold">
                                        Comparison unavailable
                                    </p>
                                    <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                                        {diffError}
                                    </p>
                                </div>
                            ) : diff ? (
                                <>
                                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold">
                                                Snapshot comparison
                                            </h4>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Selected snapshot compared with
                                                the current saved version.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="size-2 rounded-full bg-rose-500" />{" "}
                                                Selected snapshot
                                            </span>
                                            <ArrowRight className="size-3" />
                                            <span className="inline-flex items-center gap-1">
                                                <span className="size-2 rounded-full bg-emerald-500" />{" "}
                                                Current
                                            </span>
                                        </div>
                                    </div>

                                    {changedFields === 0 && (
                                        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 sm:p-4">
                                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    No differences detected
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    The title, summary, and body
                                                    match the current saved
                                                    version.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <ComparePanel
                                        label="Title"
                                        changed={diff.title.changed}
                                        previousLabel={previousLabel}
                                        currentLabel="Current version"
                                        previous={diff.title.from}
                                        current={diff.title.to}
                                    />
                                    <ComparePanel
                                        label="Summary / Excerpt"
                                        changed={diff.excerpt.changed}
                                        previousLabel={previousLabel}
                                        currentLabel="Current version"
                                        previous={diff.excerpt.from}
                                        current={diff.excerpt.to}
                                    />
                                    <ComparePanel
                                        label="Body content"
                                        changed={diff.body_html.changed}
                                        previousLabel={previousLabel}
                                        currentLabel="Current version"
                                        previous={diff.body_html.from}
                                        current={diff.body_html.to}
                                        html
                                    />
                                </>
                            ) : null}
                        </div>
                    </main>
                </div>

                <DialogFooter className="shrink-0 flex-row justify-end border-t bg-background px-4 py-3 sm:px-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={onClose}
                    >
                        <X className="mr-2 size-4" /> Close history
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}