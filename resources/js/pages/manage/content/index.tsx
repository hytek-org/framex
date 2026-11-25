import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    Archive,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Edit3,
    FileText,
    Layers,
    Loader2,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContentItem {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    status: string;
    cover_image?: string | null;
    published_at?: string | null;
    created_at: string;
    content_type?: {
        name: string;
        slug: string;
    } | null;
    category?: {
        name: string;
        color?: string;
    } | null;
    author?: {
        name: string;
    } | null;
}

interface ContentTypeItem {
    id: number;
    name: string;
    slug: string;
    icon?: string;
}

interface Props {
    contents: {
        data: ContentItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    contentTypes: ContentTypeItem[];
    filters: {
        type?: string;
        status?: string;
        search?: string;
    };
}

type DeleteTarget =
    | { mode: 'single'; item: ContentItem }
    | { mode: 'bulk'; count: number }
    | null;

const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Drafts' },
    { value: 'in_review', label: 'In Review' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'archived', label: 'Archived' },
];

export default function Index({ contents, contentTypes, filters }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [bulkLoadingAction, setBulkLoadingAction] = useState<string | null>(
        null
    );

    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const hasActiveFilters = Boolean(
        filters.type || filters.status || filters.search
    );

    const isAllSelected =
        contents.data.length > 0 &&
        selectedIds.length === contents.data.length;

    const isIndeterminate =
        selectedIds.length > 0 && selectedIds.length < contents.data.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(contents.data.map((item) => item.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const executeBulkAction = (action: string) => {
        if (selectedIds.length === 0) return;

        setBulkLoadingAction(action);
        router.post(
            `/${teamSlug}/content/bulk-action`,
            {
                ids: selectedIds,
                action,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const count = selectedIds.length;
                    const labelMap: Record<string, string> = {
                        publish: `Published ${count} item${count > 1 ? 's' : ''}`,
                        unpublish: `Reverted ${count} item${count > 1 ? 's' : ''} to draft`,
                        archive: `Archived ${count} item${count > 1 ? 's' : ''}`,
                    };
                    toast.success(
                        labelMap[action] || 'Bulk action completed'
                    );
                    setSelectedIds([]);
                },
                onError: () => {
                    toast.error('Failed to process bulk action');
                },
                onFinish: () => setBulkLoadingAction(null),
            }
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);

        if (deleteTarget.mode === 'single') {
            const target = deleteTarget.item;
            router.delete(`/${teamSlug}/content/${target.slug}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Content deleted', {
                        description: target.title,
                    });
                    setSelectedIds((prev) =>
                        prev.filter((id) => id !== target.id)
                    );
                    setDeleteTarget(null);
                },
                onError: () => {
                    toast.error('Could not delete content item');
                },
                onFinish: () => setIsDeleting(false),
            });
        } else {
            const count = selectedIds.length;
            router.post(
                `/${teamSlug}/content/bulk-action`,
                {
                    ids: selectedIds,
                    action: 'delete',
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            `Deleted ${count} content item${count > 1 ? 's' : ''}`
                        );
                        setSelectedIds([]);
                        setDeleteTarget(null);
                    },
                    onError: () => {
                        toast.error('Failed to delete selected items');
                    },
                    onFinish: () => setIsDeleting(false),
                }
            );
        }
    };

    const handleBulkExport = async () => {
        if (selectedIds.length === 0) return;
        setIsExporting(true);

        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]'
                    ) as HTMLMetaElement
                )?.content || '';
            const response = await fetch(`/${teamSlug}/content/bulk-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    ids: selectedIds,
                    action: 'export_json',
                }),
            });

            if (!response.ok) throw new Error('Export failed');

            const data = await response.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `framex-content-export-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(
                `Exported ${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''} as JSON`
            );
        } catch {
            toast.error('Failed to export content JSON');
        } finally {
            setIsExporting(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            `/${teamSlug}/content`,
            { ...filters, search: search || undefined, page: 1 },
            { preserveState: true }
        );
    };

    const handleFilterType = (typeSlug?: string) => {
        setSelectedIds([]);
        router.get(
            `/${teamSlug}/content`,
            { ...filters, type: typeSlug || undefined, page: 1 },
            { preserveState: true }
        );
    };

    const handleFilterStatus = (statusValue: string) => {
        setSelectedIds([]);
        router.get(
            `/${teamSlug}/content`,
            {
                ...filters,
                status: statusValue === 'all' ? undefined : statusValue,
                page: 1,
            },
            { preserveState: true }
        );
    };

    const clearAllFilters = () => {
        setSearch('');
        setSelectedIds([]);
        router.get(`/${teamSlug}/content`, {}, { preserveState: true });
    };

    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/80 bg-emerald-50/80 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Published
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-200/80 bg-violet-50/80 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-400">
                        <Clock className="h-3 w-3" />
                        Scheduled
                    </span>
                );
            case 'in_review':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200/80 bg-amber-50/80 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        In Review
                    </span>
                );
            case 'archived':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        <Archive className="h-3 w-3" />
                        Archived
                    </span>
                );
            case 'draft':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                        Draft
                    </span>
                );
        }
    };

    const pageSummary = useMemo(() => {
        const published = contents.data.filter(
            (i) => i.status === 'published'
        ).length;
        const drafts = contents.data.filter(
            (i) => i.status === 'draft' || i.status === 'in_review'
        ).length;
        return { published, drafts };
    }, [contents.data]);

    return (
        <>
            <Head title="Content Studio" />

            <div className=" space-y-6 p-6 lg:p-8">
                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-b from-primary/15 to-primary/5 text-primary shadow-2xs">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                    Content Studio
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className="border border-border/60 bg-muted/60 font-mono text-[11px] font-medium tabular-nums"
                                >
                                    {contents.total.toLocaleString()}{' '}
                                    {contents.total === 1 ? 'entry' : 'entries'}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Author, schedule, and manage structured
                                articles, documentation, and workspace pages.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button asChild className="gap-2 shadow-xs">
                            <Link href={`/${teamSlug}/content/create`}>
                                <Plus className="h-4 w-4" />
                                New Content
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Unified Filter & Search Toolbar */}
                <div className="space-y-3 rounded-xl border border-border/75 bg-gradient-to-b from-card to-muted/15 p-3.5 shadow-2xs">
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                        {/* Status Tabs */}
                        <Tabs
                            value={filters.status || 'all'}
                            onValueChange={handleFilterStatus}
                            className="w-full lg:w-auto"
                        >
                            <TabsList className="h-9 w-full justify-start overflow-x-auto bg-muted/60 p-1 lg:w-auto">
                                {STATUS_TABS.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="px-3 text-xs"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        {/* Search Input */}
                        <form
                            onSubmit={handleSearch}
                            className="flex w-full items-center gap-2 lg:w-80"
                        >
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title or slug..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9 bg-background pr-8 pl-8.5 text-xs"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            if (filters.search) {
                                                router.get(
                                                    `/${teamSlug}/content`,
                                                    {
                                                        ...filters,
                                                        search: undefined,
                                                        page: 1,
                                                    },
                                                    { preserveState: true }
                                                );
                                            }
                                        }}
                                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Content Type Pills + Active Filter Reset */}
                    {(contentTypes.length > 0 || hasActiveFilters) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="mr-1 text-[11px] font-medium text-muted-foreground">
                                    Type:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleFilterType(undefined)}
                                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                        !filters.type
                                            ? 'border-primary/40 bg-primary/10 text-primary'
                                            : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                    }`}
                                >
                                    All
                                </button>
                                {contentTypes.map((type) => {
                                    const active = filters.type === type.slug;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() =>
                                                handleFilterType(type.slug)
                                            }
                                            className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                                                active
                                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                                    : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                            }`}
                                        >
                                            {type.name}
                                        </button>
                                    );
                                })}
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Contextual Bulk Selection Toolbar */}
                {selectedIds.length > 0 && (
                    <div className="sticky top-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-card/95 px-4 py-3 shadow-lg ring-1 ring-primary/10 backdrop-blur-md">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-primary px-1.5 font-mono text-xs font-semibold tabular-nums text-primary-foreground">
                                {selectedIds.length}
                            </span>
                            <span className="text-xs font-medium text-foreground sm:text-sm">
                                {selectedIds.length === 1
                                    ? 'entry selected'
                                    : 'entries selected'}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={Boolean(bulkLoadingAction)}
                                onClick={() => executeBulkAction('publish')}
                                className="h-8 gap-1.5 text-xs"
                            >
                                {bulkLoadingAction === 'publish' ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                )}
                                Publish
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                disabled={Boolean(bulkLoadingAction)}
                                onClick={() => executeBulkAction('unpublish')}
                                className="h-8 text-xs"
                            >
                                {bulkLoadingAction === 'unpublish' && (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                )}
                                Move to Draft
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                disabled={Boolean(bulkLoadingAction)}
                                onClick={() => executeBulkAction('archive')}
                                className="h-8 gap-1.5 text-xs"
                            >
                                {bulkLoadingAction === 'archive' ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                                Archive
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkExport}
                                disabled={isExporting}
                                className="h-8 gap-1.5 text-xs"
                            >
                                {isExporting ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Download className="h-3.5 w-3.5" />
                                )}
                                Export JSON
                            </Button>

                            <div className="mx-1 hidden h-4 w-px bg-border sm:block" />

                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                    setDeleteTarget({
                                        mode: 'bulk',
                                        count: selectedIds.length,
                                    })
                                }
                                className="h-8 gap-1.5 text-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedIds([])}
                                title="Clear selection"
                                className="h-8 w-8 p-0 text-muted-foreground"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Content Repository Table */}
                <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
                    <Table>
                        <TableHeader className="bg-muted/35">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-11 pl-4">
                                    <Checkbox
                                        checked={
                                            isAllSelected
                                                ? true
                                                : isIndeterminate
                                                  ? 'indeterminate'
                                                  : false
                                        }
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all content"
                                    />
                                </TableHead>
                                <TableHead className="w-[38%] text-xs font-medium">
                                    Entry
                                </TableHead>
                                <TableHead className="text-xs font-medium">
                                    Type
                                </TableHead>
                                <TableHead className="text-xs font-medium">
                                    Status
                                </TableHead>
                                <TableHead className="text-xs font-medium">
                                    Category
                                </TableHead>
                                <TableHead className="text-xs font-medium">
                                    Author
                                </TableHead>
                                <TableHead className="text-xs font-medium">
                                    Date
                                </TableHead>
                                <TableHead className="w-14 text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contents.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-16 text-center"
                                    >
                                        <div className="mx-auto flex max-w-sm flex-col items-center">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-muted/60 text-muted-foreground shadow-2xs">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <p className="mt-3.5 text-sm font-medium text-foreground">
                                                {hasActiveFilters
                                                    ? 'No matching content found'
                                                    : 'Your content studio is empty'}
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                {hasActiveFilters
                                                    ? 'Try adjusting your search query or clearing active status and type filters.'
                                                    : 'Create your first article, guide, or structured entry to begin publishing.'}
                                            </p>
                                            {hasActiveFilters ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={clearAllFilters}
                                                    className="mt-4 gap-1.5"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                    Clear Filters
                                                </Button>
                                            ) : (
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="mt-4 gap-1.5"
                                                >
                                                    <Link
                                                        href={`/${teamSlug}/content/create`}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Create First Entry
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contents.data.map((item) => {
                                    const isSelected = selectedIds.includes(
                                        item.id
                                    );
                                    const displayDate =
                                        item.published_at || item.created_at;

                                    return (
                                        <TableRow
                                            key={item.id}
                                            data-state={
                                                isSelected
                                                    ? 'selected'
                                                    : undefined
                                            }
                                            className={`group transition-colors ${
                                                isSelected
                                                    ? 'bg-primary/[0.04] hover:bg-primary/[0.06]'
                                                    : 'hover:bg-muted/30'
                                            }`}
                                        >
                                            <TableCell className="py-3.5 pl-4">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        toggleSelect(item.id)
                                                    }
                                                    aria-label={`Select ${item.title}`}
                                                />
                                            </TableCell>

                                            <TableCell className="py-3.5">
                                                <div className="flex items-start gap-3">
                                                    {item.cover_image ? (
                                                        <img
                                                            src={
                                                                item.cover_image
                                                            }
                                                            alt=""
                                                            className="mt-0.5 h-10 w-14 shrink-0 rounded-md border border-border/60 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            href={`/${teamSlug}/content/${item.slug}/edit`}
                                                            className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                                                        >
                                                            <span className="line-clamp-1">
                                                                {item.title}
                                                            </span>
                                                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                                                        </Link>

                                                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="truncate font-mono text-[11px]">
                                                                /{item.slug}
                                                            </span>
                                                            {item.excerpt && (
                                                                <>
                                                                    <span className="text-border">
                                                                        •
                                                                    </span>
                                                                    <span className="line-clamp-1">
                                                                        {
                                                                            item.excerpt
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-3.5">
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-md border border-border/50 px-2 py-0.5 text-[11px] font-normal capitalize"
                                                >
                                                    {item.content_type?.name ||
                                                        'Post'}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="py-3.5">
                                                {renderStatusBadge(item.status)}
                                            </TableCell>

                                            <TableCell className="py-3.5 text-xs">
                                                {item.category ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-0.5 font-medium text-foreground/90">
                                                        <span
                                                            className="h-2 w-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    item
                                                                        .category
                                                                        .color ||
                                                                    'var(--primary)',
                                                            }}
                                                        />
                                                        {item.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="py-3.5">
                                                {item.author?.name ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted text-[10px] font-semibold text-muted-foreground">
                                                            {getInitials(
                                                                item.author.name
                                                            )}
                                                        </span>
                                                        <span className="truncate text-xs text-muted-foreground">
                                                            {item.author.name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Unknown
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="py-3.5 font-mono text-xs tabular-nums text-muted-foreground">
                                                <span
                                                    title={
                                                        item.published_at
                                                            ? 'Published date'
                                                            : 'Created date'
                                                    }
                                                    className="inline-flex items-center gap-1.5"
                                                >
                                                    <Calendar className="h-3 w-3 opacity-65" />
                                                    {new Date(
                                                        displayDate
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        }
                                                    )}
                                                </span>
                                            </TableCell>

                                            <TableCell className="py-3.5 pr-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Open actions
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-44"
                                                    >
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/${teamSlug}/content/${item.slug}/edit`}
                                                            >
                                                                <Edit3 className="mr-2 h-3.5 w-3.5" />
                                                                Edit in Studio
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeleteTarget(
                                                                    {
                                                                        mode: 'single',
                                                                        item,
                                                                    }
                                                                )
                                                            }
                                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                            Delete Entry
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Integrated Pagination Footer */}
                    {contents.data.length > 0 && (
                        <div className="flex flex-col justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <span>
                                    Showing{' '}
                                    <strong className="font-medium tabular-nums text-foreground">
                                        {contents.from}
                                    </strong>
                                    –
                                    <strong className="font-medium tabular-nums text-foreground">
                                        {contents.to}
                                    </strong>{' '}
                                    of{' '}
                                    <strong className="font-medium tabular-nums text-foreground">
                                        {contents.total.toLocaleString()}
                                    </strong>
                                </span>
                                <span className="hidden text-border sm:inline">
                                    |
                                </span>
                                <span className="hidden font-mono text-[11px] sm:inline">
                                    {pageSummary.published} published ·{' '}
                                    {pageSummary.drafts} in progress on page
                                </span>
                            </div>

                            {contents.last_page > 1 && (
                                <div className="flex items-center gap-1">
                                    {contents.links.map((link, idx) => {
                                        const isPrev = idx === 0;
                                        const isNext =
                                            idx === contents.links.length - 1;

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs text-muted-foreground/40 select-none"
                                                >
                                                    {isPrev ? (
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    ) : isNext ? (
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    )}
                                                </span>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 font-mono text-xs font-medium tabular-nums transition-colors ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground shadow-2xs'
                                                        : 'border border-transparent text-muted-foreground hover:border-border/70 hover:bg-background hover:text-foreground'
                                                }`}
                                            >
                                                {isPrev ? (
                                                    <ChevronLeft className="h-3.5 w-3.5" />
                                                ) : isNext ? (
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle>
                            {deleteTarget?.mode === 'bulk'
                                ? `Delete ${deleteTarget.count} content ${deleteTarget.count === 1 ? 'item' : 'items'}?`
                                : 'Delete content entry?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The selected content
                            and its associated metadata will be permanently
                            removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {deleteTarget?.mode === 'single' && (
                        <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs">
                            <div className="font-medium text-foreground">
                                {deleteTarget.item.title}
                            </div>
                            <div className="mt-0.5 truncate font-mono text-muted-foreground">
                                /{deleteTarget.item.slug}
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            )}
                            {deleteTarget?.mode === 'bulk'
                                ? `Delete ${deleteTarget.count} Items`
                                : 'Delete Entry'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Index.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Content Studio', href: `/${teamSlug}/content` },
        ],
    };
};