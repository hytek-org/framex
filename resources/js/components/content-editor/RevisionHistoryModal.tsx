import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { History, RotateCcw, Clock, User, Check, GitCommit, ArrowRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface RevisionDiff {
    title: { from: string; to: string; changed: boolean };
    excerpt: { from: string; to: string; changed: boolean };
    body_html: { from: string; to: string; changed: boolean };
}

interface RevisionHistoryModalProps {
    open: boolean;
    onClose: () => void;
    contentSlug: string;
    currentRevisionId?: number | null;
}

export function RevisionHistoryModal({
    open,
    onClose,
    contentSlug,
    currentRevisionId,
}: RevisionHistoryModalProps) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const [loading, setLoading] = useState(false);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
    const [diff, setDiff] = useState<RevisionDiff | null>(null);
    const [diffLoading, setDiffLoading] = useState(false);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        if (open && teamSlug && contentSlug) {
            setLoading(true);
            fetch(`/${teamSlug}/content/${contentSlug}/revisions`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.revisions) {
                        setRevisions(data.revisions);
                        if (data.revisions.length > 0) {
                            setSelectedRevision(data.revisions[0]);
                        }
                    }
                })
                .catch((err) => console.error('Failed to load revisions', err))
                .finally(() => setLoading(false));
        }
    }, [open, teamSlug, contentSlug]);

    useEffect(() => {
        if (selectedRevision && teamSlug && contentSlug) {
            setDiffLoading(true);
            fetch(`/${teamSlug}/content/${contentSlug}/revisions/${selectedRevision.id}/diff`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.diff) {
                        setDiff(data.diff);
                    }
                })
                .catch((err) => console.error('Failed to load diff', err))
                .finally(() => setDiffLoading(false));
        }
    }, [selectedRevision, teamSlug, contentSlug]);

    const handleRestore = () => {
        if (!selectedRevision) return;

        if (confirm(`Are you sure you want to restore revision #${selectedRevision.id}? A new snapshot will be created.`)) {
            setRestoring(true);
            router.post(
                `/${teamSlug}/content/${contentSlug}/revisions/${selectedRevision.id}/restore`,
                {},
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onFinish: () => setRestoring(false),
                }
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Content Time Machine — Revisions & Diffs
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-[400px]">
                    {/* Left: Revision Timeline */}
                    <div className="border rounded-lg p-3 overflow-y-auto max-h-[450px] flex flex-col gap-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            Snapshot History
                        </h3>

                        {loading ? (
                            <div className="text-xs text-muted-foreground text-center py-8">
                                Loading snapshots...
                            </div>
                        ) : revisions.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center py-8">
                                No revision history available.
                            </div>
                        ) : (
                            revisions.map((rev) => {
                                const isSelected = selectedRevision?.id === rev.id;
                                return (
                                    <div
                                        key={rev.id}
                                        onClick={() => setSelectedRevision(rev)}
                                        className={`p-3 rounded-lg border cursor-pointer text-left transition-colors ${
                                            isSelected
                                                ? 'bg-primary/10 border-primary'
                                                : 'hover:bg-accent/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <span className="font-semibold text-xs flex items-center gap-1.5">
                                                <GitCommit className="h-3.5 w-3.5 text-primary" />
                                                Rev #{rev.id}
                                            </span>
                                            {rev.is_current && (
                                                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-xs font-medium text-foreground truncate">
                                            {rev.change_summary || rev.title}
                                        </p>

                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {rev.author?.name || 'System'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(rev.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Right: Structural Diff Inspector */}
                    <div className="md:col-span-2 border rounded-lg p-4 overflow-y-auto max-h-[450px] bg-muted/20">
                        {diffLoading ? (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                Computing revision diff...
                            </div>
                        ) : !diff ? (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                Select a revision on the left to inspect differences.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 text-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h4 className="font-semibold text-sm">
                                        Comparing Revision #{selectedRevision?.id} with Current Active Version
                                    </h4>
                                    {!selectedRevision?.is_current && (
                                        <Button
                                            size="sm"
                                            onClick={handleRestore}
                                            disabled={restoring}
                                            className="h-7 text-xs"
                                        >
                                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                            {restoring ? 'Restoring...' : 'Restore This Snapshot'}
                                        </Button>
                                    )}
                                </div>

                                {/* Title Diff */}
                                <div className="rounded-md border bg-card p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-muted-foreground">Title</span>
                                        {diff.title.changed ? (
                                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                                                Modified
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                                Unchanged
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 rounded bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
                                            <p className="text-[10px] font-semibold text-rose-600 mb-1">Rev #{selectedRevision?.id}:</p>
                                            <p>{diff.title.from}</p>
                                        </div>
                                        <div className="p-2 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                                            <p className="text-[10px] font-semibold text-emerald-600 mb-1">Current Active:</p>
                                            <p>{diff.title.to}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Excerpt Diff */}
                                <div className="rounded-md border bg-card p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-muted-foreground">Excerpt</span>
                                        {diff.excerpt.changed ? (
                                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                                                Modified
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                                Unchanged
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 rounded bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
                                            <p className="text-[10px] font-semibold text-rose-600 mb-1">Rev #{selectedRevision?.id}:</p>
                                            <p>{diff.excerpt.from || '<Empty>'}</p>
                                        </div>
                                        <div className="p-2 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                                            <p className="text-[10px] font-semibold text-emerald-600 mb-1">Current Active:</p>
                                            <p>{diff.excerpt.to || '<Empty>'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Body Diff */}
                                <div className="rounded-md border bg-card p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-muted-foreground">Body Content</span>
                                        {diff.body_html.changed ? (
                                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                                                Modified
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                                Unchanged
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 rounded bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 max-h-48 overflow-y-auto">
                                            <p className="text-[10px] font-semibold text-rose-600 mb-1">Rev #{selectedRevision?.id}:</p>
                                            <div dangerouslySetInnerHTML={{ __html: diff.body_html.from || '' }} />
                                        </div>
                                        <div className="p-2 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 max-h-48 overflow-y-auto">
                                            <p className="text-[10px] font-semibold text-emerald-600 mb-1">Current Active:</p>
                                            <div dangerouslySetInnerHTML={{ __html: diff.body_html.to || '' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-3">
                    <Button variant="outline" onClick={onClose}>
                        Close Time Machine
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
