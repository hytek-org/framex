import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    Edit,
    ExternalLink,
    Eye,
    FileJson,
    FileSpreadsheet,
    FileText,
    Globe,
    Inbox,
    MailOpen,
    Monitor,
    Search,
    Share2,
    ShieldAlert,
    Trash2,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import type { FormField } from '@/components/forms/DynamicForm';
import { ShareFormDialog } from '@/components/forms/ShareFormDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface SubmissionItem {
    id: number;
    data: Record<string, any>;
    ip_address?: string | null;
    user_agent?: string | null;
    status: 'unread' | 'read' | 'spam' | 'archived' | string;
    created_at: string;
}

interface Props {
    form: {
        id: number;
        name: string;
        slug: string;
        is_active: boolean;
        fields: FormField[];
    };
    submissions: {
        data: SubmissionItem[];
        total: number;
        current_page: number;
        last_page: number;
        from?: number | null;
        to?: number | null;
        prev_page_url?: string | null;
        next_page_url?: string | null;
    };
    statusCounts?: {
        all: number;
        unread: number;
        read: number;
        archived: number;
        spam: number;
    };
    filters?: {
        status?: string;
        search?: string;
    };
    appUrl?: string;
}

function getCsrfHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const metaToken = (
        document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
    )?.content;

    if (metaToken) {
        headers['X-CSRF-TOKEN'] = metaToken;
    }

    const xsrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (xsrfCookie) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfCookie);
    }

    return headers;
}

function formatCellValue(value: any): string {
    if (value === undefined || value === null || value === '') {
        return '—';
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '—';
    }
    return String(value);
}

function statusBadgeStyle(status: string): string {
    switch (status) {
        case 'unread':
            return 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        case 'read':
            return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        case 'spam':
            return 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        case 'archived':
            return 'text-muted-foreground bg-muted/60 border-border';
        default:
            return 'text-muted-foreground';
    }
}

export default function SubmissionsIndex({
    form,
    submissions,
    statusCounts,
    filters,
    appUrl = '',
}: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';
    const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');

    const [search, setSearch] = useState(filters?.search || '');
    const [activeStatus, setActiveStatus] = useState(filters?.status || 'all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeSubmission, setActiveSubmission] = useState<SubmissionItem | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<
        { mode: 'single'; id: number } | { mode: 'bulk'; ids: number[] } | null
    >(null);
    const [copiedJson, setCopiedJson] = useState(false);

    const counts = statusCounts ?? {
        all: submissions.total,
        unread: submissions.data.filter((s) => s.status === 'unread').length,
        read: submissions.data.filter((s) => s.status === 'read').length,
        archived: submissions.data.filter((s) => s.status === 'archived').length,
        spam: submissions.data.filter((s) => s.status === 'spam').length,
    };

    const displayFields = (form.fields || []).slice(0, 3);
    const isAllSelected =
        submissions.data.length > 0 && selectedIds.length === submissions.data.length;

    const applyFilters = (nextStatus: string, nextSearch: string) => {
        setSelectedIds([]);
        router.get(
            `/${teamSlug}/forms/${form.id}/submissions`,
            {
                ...(nextStatus !== 'all' ? { status: nextStatus } : {}),
                ...(nextSearch.trim() ? { search: nextSearch.trim() } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(activeStatus, search);
    };

    const handleStatusTab = (nextStatus: string) => {
        setActiveStatus(nextStatus);
        applyFilters(nextStatus, search);
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(submissions.data.map((s) => s.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    const handleOpenDetail = (sub: SubmissionItem) => {
        setActiveSubmission(sub);
        if (sub.status === 'unread') {
            router.patch(
                `/${teamSlug}/forms/${form.id}/submissions/${sub.id}`,
                { status: 'read' },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setActiveSubmission((prev) =>
                            prev && prev.id === sub.id ? { ...prev, status: 'read' } : prev,
                        );
                    },
                },
            );
        }
    };

    const handleUpdateStatus = (submissionId: number, status: string) => {
        router.patch(
            `/${teamSlug}/forms/${form.id}/submissions/${submissionId}`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setActiveSubmission((prev) =>
                        prev && prev.id === submissionId ? { ...prev, status } : prev,
                    );
                },
            },
        );
    };

    const handleBulkAction = (action: 'mark_read' | 'mark_unread' | 'archive' | 'spam' | 'delete') => {
        if (selectedIds.length === 0) {
            return;
        }
        if (action === 'delete') {
            setDeleteConfirm({ mode: 'bulk', ids: selectedIds });
            return;
        }
        router.post(
            `/${teamSlug}/forms/${form.id}/submissions/bulk`,
            { ids: selectedIds, action },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
    };

    const executeDelete = () => {
        if (!deleteConfirm) {
            return;
        }
        if (deleteConfirm.mode === 'single') {
            const targetId = deleteConfirm.id;
            router.delete(`/${teamSlug}/forms/${form.id}/submissions/${targetId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    if (activeSubmission?.id === targetId) {
                        setActiveSubmission(null);
                    }
                    setSelectedIds((prev) => prev.filter((id) => id !== targetId));
                },
                onFinish: () => setDeleteConfirm(null),
            });
        } else {
            router.post(
                `/${teamSlug}/forms/${form.id}/submissions/bulk`,
                { ids: deleteConfirm.ids, action: 'delete' },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds([]);
                        setActiveSubmission(null);
                    },
                    onFinish: () => setDeleteConfirm(null),
                },
            );
        }
    };

    const handleExport = async (format: 'json' | 'csv') => {
        setIsExporting(true);
        try {
            const res = await fetch(`/${teamSlug}/forms/${form.id}/submissions/export`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: format === 'csv' ? 'text/csv' : 'application/json',
                    ...getCsrfHeaders(),
                },
                body: JSON.stringify({
                    format,
                    status: activeStatus,
                }),
            });

            if (!res.ok) {
                throw new Error('Export failed');
            }

            let blob: Blob;
            let filename: string;
            const dateStamp = new Date().toISOString().slice(0, 10);

            if (format === 'csv') {
                const csvText = await res.text();
                blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
                filename = `${form.slug}-submissions-${dateStamp}.csv`;
            } else {
                const data = await res.json();
                blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                filename = `${form.slug}-submissions-${dateStamp}.json`;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`Exported ${format.toUpperCase()} successfully`);
        } catch {
            toast.error('Failed to export submissions.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleCopyJson = async (sub: SubmissionItem) => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(sub.data, null, 2));
            setCopiedJson(true);
            toast.success('Submission JSON copied');
            window.setTimeout(() => setCopiedJson(false), 2000);
        } catch {
            toast.error('Unable to copy JSON');
        }
    };

    // Build full ordered field rows for the detail sheet (schema fields + any historical keys)
    const getDetailEntries = (sub: SubmissionItem) => {
        const entries: Array<{ key: string; label: string; type?: string; value: any }> = [];
        const seen = new Set<string>();

        for (const field of form.fields || []) {
            seen.add(field.name);
            entries.push({
                key: field.name,
                label: field.label || field.name,
                type: field.type,
                value: sub.data?.[field.name],
            });
        }

        for (const key of Object.keys(sub.data || {})) {
            if (!seen.has(key)) {
                entries.push({
                    key,
                    label: key.replace(/[_-]+/g, ' '),
                    value: sub.data[key],
                });
            }
        }

        return entries;
    };

    return (
        <>
            <Head title={`${form.name} — Submissions`} />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <Button variant="ghost" size="sm" asChild className="mt-0.5 shrink-0">
                            <Link href={`/${teamSlug}/forms`}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Forms
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {form.name}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={
                                        form.is_active
                                            ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-[11px]'
                                            : 'text-muted-foreground text-[11px]'
                                    }
                                >
                                    {form.is_active ? 'Active' : 'Paused'}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {counts.all} total responses · {counts.unread} unread ·{' '}
                                <a
                                    href={`/forms/${form.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    /forms/{form.slug}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShareOpen(true)}
                            className="gap-1.5"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            Share & Embed
                        </Button>
                        <Button variant="outline" size="sm" asChild className="gap-1.5">
                            <Link href={`/${teamSlug}/forms/${form.id}/edit`}>
                                <Edit className="h-3.5 w-3.5" />
                                Edit Form
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="default"
                                    size="sm"
                                    disabled={isExporting || counts.all === 0}
                                    className="gap-1.5"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    {isExporting ? 'Exporting...' : 'Export'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => handleExport('csv')}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                                    Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('json')}>
                                    <FileJson className="mr-2 h-4 w-4 text-blue-600" />
                                    Export as JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Status Filter Tabs & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border bg-muted/40 p-1">
                        {(
                            [
                                { id: 'all', label: 'All', count: counts.all },
                                { id: 'unread', label: 'Unread', count: counts.unread },
                                { id: 'read', label: 'Read', count: counts.read },
                                { id: 'archived', label: 'Archived', count: counts.archived },
                                { id: 'spam', label: 'Spam', count: counts.spam },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleStatusTab(tab.id)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    activeStatus === tab.id
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
                                        activeStatus === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
                        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search responses or IP..."
                            className="pl-9 pr-8 h-9"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    applyFilters(activeStatus, '');
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Bulk Action Toolbar */}
                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
                        <span className="text-xs font-semibold text-foreground">
                            {selectedIds.length} submission(s) selected
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleBulkAction('mark_read')}
                            >
                                <MailOpen className="h-3.5 w-3.5" />
                                Mark Read
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleBulkAction('mark_unread')}
                            >
                                <Inbox className="h-3.5 w-3.5" />
                                Unread
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleBulkAction('archive')}
                            >
                                <Archive className="h-3.5 w-3.5" />
                                Archive
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleBulkAction('spam')}
                            >
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Spam
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleBulkAction('delete')}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </Button>
                        </div>
                    </div>
                )}

                {/* Submissions Table */}
                <div className="border rounded-xl overflow-hidden bg-card shadow-xs">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all submissions"
                                    />
                                </TableHead>
                                <TableHead className="w-20">#ID</TableHead>
                                {displayFields.map((f) => (
                                    <TableHead key={f.name}>{f.label}</TableHead>
                                ))}
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="w-24 text-right">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={displayFields.length + 5}
                                        className="text-center py-14 text-muted-foreground"
                                    >
                                        <FileText className="h-9 w-9 mx-auto mb-2.5 text-muted-foreground/40" />
                                        <p className="text-sm font-medium text-foreground">
                                            No submissions found
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {activeStatus !== 'all' || filters?.search
                                                ? 'Try switching status tabs or clearing your search query.'
                                                : 'Share your hosted form link to start collecting responses.'}
                                        </p>
                                        {counts.all === 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShareOpen(true)}
                                                className="mt-4 gap-1.5"
                                            >
                                                <Share2 className="h-3.5 w-3.5" />
                                                Share Form Link
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.data.map((sub) => {
                                    const isUnread = sub.status === 'unread';
                                    const isSelected = selectedIds.includes(sub.id);

                                    return (
                                        <TableRow
                                            key={sub.id}
                                            onClick={() => handleOpenDetail(sub)}
                                            className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                                                isUnread ? 'bg-primary/[0.02]' : ''
                                            }`}
                                        >
                                            <TableCell
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-10"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleSelect(sub.id)}
                                                    aria-label={`Select submission ${sub.id}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`h-2 w-2 rounded-full shrink-0 ${
                                                            isUnread
                                                                ? 'bg-primary'
                                                                : 'bg-transparent'
                                                        }`}
                                                    />
                                                    #{sub.id}
                                                </div>
                                            </TableCell>
                                            {displayFields.map((f) => (
                                                <TableCell
                                                    key={f.name}
                                                    className={`text-sm max-w-[220px] truncate ${
                                                        isUnread
                                                            ? 'font-medium text-foreground'
                                                            : 'text-foreground/85'
                                                    }`}
                                                >
                                                    {formatCellValue(sub.data?.[f.name])}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize text-[10px] ${statusBadgeStyle(sub.status)}`}
                                                >
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(sub.created_at).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </TableCell>
                                            <TableCell
                                                className="text-right"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenDetail(sub)}
                                                    className="h-7 px-2.5 text-xs gap-1"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {submissions.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground bg-muted/20">
                            <span>
                                Showing {submissions.from ?? 0}–{submissions.to ?? 0} of{' '}
                                {submissions.total} responses
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!submissions.prev_page_url}
                                    onClick={() =>
                                        submissions.prev_page_url &&
                                        router.visit(submissions.prev_page_url)
                                    }
                                    className="h-7 gap-1"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!submissions.next_page_url}
                                    onClick={() =>
                                        submissions.next_page_url &&
                                        router.visit(submissions.next_page_url)
                                    }
                                    className="h-7 gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Submission Detail Slide-Over Sheet */}
            <Sheet
                open={!!activeSubmission}
                onOpenChange={(open) => !open && setActiveSubmission(null)}
            >
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6">
                    {activeSubmission && (
                        <div className="space-y-6">
                            <SheetHeader className="space-y-2 p-0">
                                <div className="flex items-center gap-2">
                                    <SheetTitle className="text-lg font-bold">
                                        Submission #{activeSubmission.id}
                                    </SheetTitle>
                                    <Badge
                                        variant="outline"
                                        className={`capitalize text-[11px] ${statusBadgeStyle(activeSubmission.status)}`}
                                    >
                                        {activeSubmission.status}
                                    </Badge>
                                </div>
                                <SheetDescription className="text-xs">
                                    Received on{' '}
                                    {new Date(activeSubmission.created_at).toLocaleString()} via{' '}
                                    <span className="font-mono">/forms/{form.slug}</span>
                                </SheetDescription>
                            </SheetHeader>

                            {/* Quick Triage Status Switcher */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                {(
                                    [
                                        { id: 'read', label: 'Read', icon: CheckCircle2 },
                                        { id: 'unread', label: 'Unread', icon: Inbox },
                                        { id: 'archived', label: 'Archive', icon: Archive },
                                        { id: 'spam', label: 'Spam', icon: ShieldAlert },
                                    ] as const
                                ).map((st) => {
                                    const Icon = st.icon;
                                    const isCurrent = activeSubmission.status === st.id;
                                    return (
                                        <Button
                                            key={st.id}
                                            type="button"
                                            size="sm"
                                            variant={isCurrent ? 'default' : 'outline'}
                                            className="h-7 text-xs gap-1"
                                            onClick={() =>
                                                handleUpdateStatus(activeSubmission.id, st.id)
                                            }
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {st.label}
                                        </Button>
                                    );
                                })}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                                    onClick={() =>
                                        setDeleteConfirm({
                                            mode: 'single',
                                            id: activeSubmission.id,
                                        })
                                    }
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </div>

                            <Separator />

                            {/* Full Field Responses */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Submitted Answers
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1.5"
                                        onClick={() => handleCopyJson(activeSubmission)}
                                    >
                                        {copiedJson ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                        Copy JSON
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {getDetailEntries(activeSubmission).map((entry) => {
                                        const isArray = Array.isArray(entry.value);
                                        const isBool = typeof entry.value === 'boolean';
                                        const stringVal =
                                            entry.value !== undefined && entry.value !== null
                                                ? String(entry.value)
                                                : '';

                                        return (
                                            <div
                                                key={entry.key}
                                                className="rounded-xl border bg-muted/20 p-3.5 space-y-1"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {entry.label}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground/70">
                                                        {entry.key}
                                                    </span>
                                                </div>

                                                {isArray ? (
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {(entry.value as string[]).length > 0 ? (
                                                            (entry.value as string[]).map((v) => (
                                                                <Badge key={v} variant="secondary">
                                                                    {v}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : isBool ? (
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            entry.value
                                                                ? 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                                                                : ''
                                                        }
                                                    >
                                                        {entry.value ? 'Yes (Checked)' : 'No'}
                                                    </Badge>
                                                ) : entry.type === 'email' && stringVal ? (
                                                    <a
                                                        href={`mailto:${stringVal}`}
                                                        className="text-sm font-medium text-primary hover:underline break-all"
                                                    >
                                                        {stringVal}
                                                    </a>
                                                ) : entry.type === 'url' && stringVal ? (
                                                    <a
                                                        href={stringVal}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 break-all"
                                                    >
                                                        {stringVal}
                                                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                    </a>
                                                ) : stringVal ? (
                                                    <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                                                        {stringVal}
                                                    </p>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator />

                            {/* Submission Metadata */}
                            <div className="rounded-xl border bg-muted/20 p-4 space-y-2.5 text-xs">
                                <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                                    Request Metadata
                                </h4>
                                <div className="flex items-center justify-between gap-2 text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Globe className="h-3.5 w-3.5" />
                                        IP Address
                                    </span>
                                    <span className="font-mono text-foreground">
                                        {activeSubmission.ip_address || 'Unknown'}
                                    </span>
                                </div>
                                {activeSubmission.user_agent && (
                                    <div className="space-y-1 text-muted-foreground pt-1 border-t">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Monitor className="h-3.5 w-3.5" />
                                            User Agent
                                        </span>
                                        <p className="font-mono text-[11px] text-foreground/80 break-all">
                                            {activeSubmission.user_agent}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Share & Embed Dialog */}
            <ShareFormDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                form={form}
                appUrl={baseUrl}
            />

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog
                open={!!deleteConfirm}
                onOpenChange={(open) => !open && setDeleteConfirm(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {deleteConfirm?.mode === 'bulk'
                                ? `Delete ${deleteConfirm.ids.length} submission(s)?`
                                : `Delete submission #${deleteConfirm?.id}?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently deletes the selected response data from your workspace. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

SubmissionsIndex.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Forms Engine', href: `/${teamSlug}/forms` },
            { title: 'Submissions Inbox', href: '#' },
        ],
    };
};
