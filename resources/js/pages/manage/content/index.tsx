import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Calendar,
    FileText,
    History,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    Archive,
    Download,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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

export default function Index({ contents, contentTypes, filters }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    const isAllSelected = contents.data.length > 0 && selectedIds.length === contents.data.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(contents.data.map((item) => item.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleBulkAction = (action: string) => {
        if (selectedIds.length === 0) return;

        if (
            action === 'delete' &&
            !confirm(`Are you sure you want to delete ${selectedIds.length} content item(s)? This action cannot be undone.`)
        ) {
            return;
        }

        router.post(
            `/${teamSlug}/content/bulk-action`,
            {
                ids: selectedIds,
                action,
            },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            }
        );
    };

    const handleBulkExport = async () => {
        if (selectedIds.length === 0) return;
        setIsExporting(true);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const response = await fetch(`/${teamSlug}/content/bulk-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    ids: selectedIds,
                    action: 'export_json',
                }),
            });

            if (!response.ok) throw new Error('Export failed');

            const data = await response.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `framex-content-export-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export content JSON:', error);
            alert('Failed to export content. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            `/${teamSlug}/content`,
            { ...filters, search },
            { preserveState: true }
        );
    };

    const handleFilterType = (typeSlug?: string) => {
        router.get(
            `/${teamSlug}/content`,
            { ...filters, type: typeSlug || undefined, page: 1 },
            { preserveState: true }
        );
    };

    const handleFilterStatus = (statusValue?: string) => {
        router.get(
            `/${teamSlug}/content`,
            { ...filters, status: statusValue || undefined, page: 1 },
            { preserveState: true }
        );
    };

    const handleDelete = (slug: string) => {
        if (confirm('Are you sure you want to delete this content item?')) {
            router.delete(`/${teamSlug}/content/${slug}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return (
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                    </Badge>
                );
            case 'scheduled':
                return (
                    <Badge variant="outline" className="text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-300">
                        <Clock className="mr-1 h-3 w-3" /> Scheduled
                    </Badge>
                );
            case 'in_review':
                return (
                    <Badge variant="outline" className="text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-300">
                        <AlertCircle className="mr-1 h-3 w-3" /> In Review
                    </Badge>
                );
            case 'archived':
                return (
                    <Badge variant="outline" className="text-muted-foreground bg-muted border-border">
                        <Archive className="mr-1 h-3 w-3" /> Archived
                    </Badge>
                );
            case 'draft':
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground bg-muted/50 border-border">
                        Draft
                    </Badge>
                );
        }
    };

    return (
        <>
            <Head title="Content Studio" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            FrameX Content Studio
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Publishing headquarters for articles, docs, and structured content entities.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href={`/${teamSlug}/content/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Content
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Floating Bulk Action Bar */}
                {selectedIds.length > 0 && (
                    <div className="sticky top-4 z-30 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border bg-card/95 backdrop-blur shadow-lg animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                                {selectedIds.length === 1 ? '1 item' : `${selectedIds.length} items`} selected
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkAction('publish')}
                                className="h-8 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                Publish
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkAction('unpublish')}
                                className="h-8 text-xs"
                            >
                                Revert to Draft
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkAction('archive')}
                                className="h-8 text-xs"
                            >
                                <Archive className="mr-1.5 h-3.5 w-3.5" />
                                Archive
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkExport}
                                disabled={isExporting}
                                className="h-8 text-xs"
                            >
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                {isExporting ? 'Exporting...' : 'Export JSON'}
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBulkAction('delete')}
                                className="h-8 text-xs"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Delete
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedIds([])}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Content Type Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                            variant={!filters.type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleFilterType(undefined)}
                            className="rounded-full text-xs h-7"
                        >
                            All Types
                        </Button>
                        {contentTypes.map((type) => (
                            <Button
                                key={type.id}
                                variant={filters.type === type.slug ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleFilterType(type.slug)}
                                className="rounded-full text-xs h-7 capitalize"
                            >
                                {type.name}
                            </Button>
                        ))}
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 text-xs">
                        {['all', 'published', 'draft', 'in_review', 'scheduled'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleFilterStatus(st === 'all' ? undefined : st)}
                                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                                    (filters.status === st || (!filters.status && st === 'all'))
                                        ? 'bg-muted font-semibold text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {st.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search content by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </form>

                {/* Content Table */}
                <div className="border rounded-lg overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                                    />
                                </TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-20"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contents.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                        No content items found. Create your first post or page!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contents.data.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    return (
                                        <TableRow
                                            key={item.id}
                                            className={`hover:bg-muted/40 transition-colors ${
                                                isSelected ? 'bg-primary/5' : ''
                                            }`}
                                        >
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={`/${teamSlug}/content/${item.slug}/edit`}
                                                    className="hover:underline font-semibold text-foreground"
                                                >
                                                    {item.title}
                                                </Link>
                                                {item.excerpt && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                        {item.excerpt}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs capitalize">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {item.content_type?.name || 'Post'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell className="text-xs">
                                                {item.category ? (
                                                    <span className="inline-flex items-center gap-1.5 font-medium">
                                                        <span
                                                            className="h-2 w-2 rounded-full"
                                                            style={{ backgroundColor: item.category.color || '#6366f1' }}
                                                        />
                                                        {item.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {item.author?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(item.published_at || item.created_at).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/${teamSlug}/content/${item.slug}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit in Studio
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(item.slug)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
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
                </div>

                {/* Pagination */}
                {contents.last_page > 1 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            Showing {contents.from}–{contents.to} of {contents.total}
                        </span>
                        <div className="flex gap-1">
                            {contents.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                    } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || "";

    return {
        breadcrumbs: [
            { title: "Dashboard", href: `/${teamSlug}/dashboard` },
            { title: "Content Studio", href: `/${teamSlug}/content` }
        ],
    };
};
