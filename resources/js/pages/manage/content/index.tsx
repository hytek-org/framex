import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, FileText, FolderOpen, Layers, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ContentBulkActions } from '@/components/content/ContentBulkActions';
import { ContentDataTable } from '@/components/content/ContentDataTable';
import { ContentDeleteDialog } from '@/components/content/ContentDeleteDialog';
import { ContentPagination } from '@/components/content/ContentPagination';
import { ContentToolbar } from '@/components/content/ContentToolbar';
import type {
    CategoryItem,
    ContentFiltersState,
    ContentItem,
    ContentStatusValue,
    ContentTypeItem,
    PaginatedContents,
    StatusCounts,
} from '@/components/content/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContentIndexProps {
    contents: PaginatedContents;
    contentTypes: ContentTypeItem[];
    categories?: CategoryItem[];
    statusCounts?: StatusCounts;
    filters: ContentFiltersState;
}

export default function ContentIndex({
    contents,
    contentTypes,
    categories = [],
    statusCounts,
    filters,
}: ContentIndexProps) {
    const { currentTeam } = usePage().props as {
        currentTeam?: { slug: string } | null;
    };
    const tp = currentTeam?.slug ? `/${currentTeam.slug}` : '';

    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const applyFilters = (patch: Partial<ContentFiltersState>) => {
        const next: Record<string, string> = {};
        const merged: ContentFiltersState = { ...filters, ...patch };

        if (merged.type) next.type = merged.type;
        if (merged.status) next.status = merged.status;
        if (merged.category) next.category = merged.category;
        if (merged.search) next.search = merged.search;
        if (merged.sort) next.sort = merged.sort;
        if (merged.direction) next.direction = merged.direction;

        router.get(`${tp}/content`, next, { preserveState: true, preserveScroll: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: search.trim() || undefined });
    };

    const handleSort = (column: string) => {
        const nextDir =
            filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: column, direction: nextDir });
    };

    const handleTransition = (item: ContentItem, status: ContentStatusValue) => {
        router.post(
            `${tp}/content/${item.slug}/transition`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Updated "${item.title}" to ${status}.`),
                onError: () => toast.error('Unable to update content status.'),
            },
        );
    };

    const confirmSingleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`${tp}/content/${deleteTarget.slug}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Content item deleted.');
                setDeleteTarget(null);
            },
            onError: () => toast.error('Failed to delete content item.'),
            onFinish: () => setDeleting(false),
        });
    };

    const executeBulkAction = async (
        action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'export_json',
    ) => {
        if (action === 'delete') {
            setBulkDeleteOpen(true);
            return;
        }

        if (action === 'export_json') {
            setBulkProcessing(true);
            try {
                const csrf =
                    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
                const res = await fetch(`${tp}/content/bulk-action`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify({ ids: selectedIds, action: 'export_json' }),
                });
                const payload = await res.json();
                const blob = new Blob([JSON.stringify(payload, null, 2)], {
                    type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `framex-content-export-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(`Exported ${selectedIds.length} item(s).`);
            } catch {
                toast.error('Failed to export content.');
            } finally {
                setBulkProcessing(false);
            }
            return;
        }

        setBulkProcessing(true);
        router.post(
            `${tp}/content/bulk-action`,
            { ids: selectedIds, action },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Bulk action "${action}" completed.`);
                    setSelectedIds([]);
                },
                onError: () => toast.error('Bulk action failed.'),
                onFinish: () => setBulkProcessing(false),
            },
        );
    };

    const confirmBulkDelete = () => {
        setDeleting(true);
        router.post(
            `${tp}/content/bulk-action`,
            { ids: selectedIds, action: 'delete' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Deleted ${selectedIds.length} item(s).`);
                    setSelectedIds([]);
                    setBulkDeleteOpen(false);
                },
                onError: () => toast.error('Bulk delete failed.'),
                onFinish: () => setDeleting(false),
            },
        );
    };

    const counts = statusCounts ?? {
        all: contents.total,
        draft: 0,
        in_review: 0,
        published: 0,
        archived: 0,
    };

    return (
        <>
            <Head title="Content Studio" />

            <div className="flex h-full flex-1 flex-col">
                {/* Header */}
                <div className="border-b border-border/60 bg-card/60 px-6 py-5 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#8AB4F8]/15 dark:text-[#8AB4F8]">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                    Content Studio
                                </h1>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Unified editorial engine for articles, pages, revisions, and SEO metadata.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" size="sm" className="rounded-full" asChild>
                                <Link href={`${tp}/content/types`}>
                                    <Layers className="mr-1.5 h-3.5 w-3.5" />
                                    Content Types
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full" asChild>
                                <Link href={`${tp}/manage/blogs`}>
                                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                                    Blogs
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full" asChild>
                                <Link href={`${tp}/manage/categories`}>
                                    <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                                    Categories
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-full bg-[#1A73E8] text-white hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49]"
                                asChild
                            >
                                <Link href={`${tp}/content/create`}>
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    New Content
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="mx-auto max-w-7xl space-y-5">
                        {/* Status Tabs */}
                        <Tabs
                            value={filters.status || 'all'}
                            onValueChange={(value) =>
                                applyFilters({ status: value === 'all' ? undefined : value })
                            }
                        >
                            <TabsList className="h-10 rounded-full bg-muted/60 p-1">
                                <TabsTrigger value="all" className="rounded-full px-4 text-xs">
                                    All ({counts.all})
                                </TabsTrigger>
                                <TabsTrigger value="draft" className="rounded-full px-4 text-xs">
                                    Draft ({counts.draft})
                                </TabsTrigger>
                                <TabsTrigger value="in_review" className="rounded-full px-4 text-xs">
                                    In Review ({counts.in_review})
                                </TabsTrigger>
                                <TabsTrigger value="published" className="rounded-full px-4 text-xs">
                                    Published ({counts.published})
                                </TabsTrigger>
                                <TabsTrigger value="archived" className="rounded-full px-4 text-xs">
                                    Archived ({counts.archived})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <ContentToolbar
                            search={search}
                            onSearchChange={setSearch}
                            onSearchSubmit={handleSearchSubmit}
                            filters={filters}
                            contentTypes={contentTypes}
                            categories={categories}
                            onFilterChange={applyFilters}
                            onResetFilters={() => {
                                setSearch('');
                                router.get(`${tp}/content`, {}, { preserveState: true });
                            }}
                        />

                        <ContentBulkActions
                            selectedCount={selectedIds.length}
                            processing={bulkProcessing}
                            onClearSelection={() => setSelectedIds([])}
                            onBulkAction={executeBulkAction}
                        />

                        {contents.data.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 py-16 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h2 className="text-base font-semibold text-foreground">
                                    No content items found
                                </h2>
                                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                                    Try adjusting your filters or create a new article or page in Content Studio.
                                </p>
                                <Button
                                    asChild
                                    size="sm"
                                    className="mt-5 rounded-full bg-[#1A73E8] text-white hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49]"
                                >
                                    <Link href={`${tp}/content/create`}>
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Create Content
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <ContentDataTable
                                items={contents.data}
                                teamPrefix={tp}
                                selectedIds={selectedIds}
                                onToggleAll={(checked) =>
                                    setSelectedIds(checked ? contents.data.map((i) => i.id) : [])
                                }
                                onToggleOne={(id, checked) =>
                                    setSelectedIds((prev) =>
                                        checked ? [...prev, id] : prev.filter((x) => x !== id),
                                    )
                                }
                                filters={filters}
                                onSort={handleSort}
                                onTransition={handleTransition}
                                onDeleteRequest={setDeleteTarget}
                            />
                        )}

                        <ContentPagination contents={contents} />
                    </div>
                </div>
            </div>

            <ContentDeleteDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete content item?"
                description={`This will move "${deleteTarget?.title ?? ''}" to trash.`}
                onConfirm={confirmSingleDelete}
                loading={deleting}
            />

            <ContentDeleteDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title={`Delete ${selectedIds.length} selected items?`}
                description="All selected content items will be moved to trash."
                onConfirm={confirmBulkDelete}
                loading={deleting}
            />
        </>
    );
}
