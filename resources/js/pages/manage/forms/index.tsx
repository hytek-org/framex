import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Copy,
    CopyPlus,
    Edit,
    ExternalLink,
    Inbox,
    LifeBuoy,
    Mail,
    MessageSquare,
    MoreHorizontal,
    Plus,
    Search,
    Share2,
    Sparkles,
    Trash2,
    Users,
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
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormItem {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    notify_team?: boolean;
    submissions_count: number;
    unread_submissions_count?: number;
    fields: FormField[];
    created_at: string;
    updated_at: string;
}

interface Props {
    forms: {
        data: FormItem[];
        current_page: number;
        last_page: number;
        total: number;
        from?: number | null;
        to?: number | null;
        prev_page_url?: string | null;
        next_page_url?: string | null;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: {
        total_forms: number;
        active_forms: number;
        total_submissions: number;
        unread_submissions: number;
    };
    filters?: {
        search?: string;
        status?: string;
    };
    appUrl?: string;
}

const STARTER_TEMPLATES = [
    {
        id: 'contact',
        name: 'Contact Us',
        description: 'Classic name, email, subject & message inquiry form.',
        icon: Mail,
        fieldsCount: 4,
    },
    {
        id: 'lead',
        name: 'Sales & Demo Request',
        description: 'Capture B2B leads with company size and use-case dropdowns.',
        icon: Sparkles,
        fieldsCount: 5,
    },
    {
        id: 'feedback',
        name: 'Product Feedback',
        description: 'Collect satisfaction ratings and improvement suggestions.',
        icon: MessageSquare,
        fieldsCount: 4,
    },
    {
        id: 'support',
        name: 'Support Ticket',
        description: 'Structured issue reporting with urgency and category selection.',
        icon: LifeBuoy,
        fieldsCount: 5,
    },
];

export default function FormsIndex({ forms, stats, filters, appUrl = '' }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [shareTarget, setShareTarget] = useState<FormItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FormItem | null>(null);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');

    const applyFilters = (nextSearch: string, nextStatus: string) => {
        router.get(
            `/${teamSlug}/forms`,
            {
                ...(nextSearch.trim() ? { search: nextSearch.trim() } : {}),
                ...(nextStatus !== 'all' ? { status: nextStatus } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(search, statusFilter);
    };

    const handleClearSearch = () => {
        setSearch('');
        applyFilters('', statusFilter);
    };

    const handleStatusChange = (nextStatus: string) => {
        setStatusFilter(nextStatus);
        applyFilters(search, nextStatus);
    };

    const handleToggleActive = (form: FormItem) => {
        setTogglingId(form.id);
        router.patch(
            `/${teamSlug}/forms/${form.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    const handleDuplicate = (form: FormItem) => {
        router.post(`/${teamSlug}/forms/${form.id}/duplicate`);
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }
        router.delete(`/${teamSlug}/forms/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    const handleCopyPublicUrl = async (slug: string) => {
        const url = `${baseUrl}/forms/${slug}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedSlug(slug);
            toast.success('Public form link copied to clipboard');
            window.setTimeout(() => setCopiedSlug(null), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const summary = stats ?? {
        total_forms: forms.total,
        active_forms: forms.data.filter((f) => f.is_active).length,
        total_submissions: forms.data.reduce((sum, f) => sum + (f.submissions_count || 0), 0),
        unread_submissions: forms.data.reduce((sum, f) => sum + (f.unread_submissions_count || 0), 0),
    };

    const isFiltered = Boolean(filters?.search) || (filters?.status && filters.status !== 'all');

    return (
        <>
            <Head title="Forms Engine" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            Forms Engine
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Design hosted forms, share public links or iframe embeds, and triage incoming submissions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1.5">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Templates
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                {STARTER_TEMPLATES.map((tpl) => {
                                    const Icon = tpl.icon;
                                    return (
                                        <DropdownMenuItem key={tpl.id} asChild>
                                            <Link
                                                href={`/${teamSlug}/forms/create?template=${tpl.id}`}
                                                className="flex items-start gap-2.5 py-2"
                                            >
                                                <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                <div className="space-y-0.5">
                                                    <div className="text-xs font-medium text-foreground">
                                                        {tpl.name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                                                        {tpl.description}
                                                    </div>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button asChild className="gap-1.5">
                            <Link href={`/${teamSlug}/forms/create`}>
                                <Plus className="h-4 w-4" />
                                Create Form
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Forms</p>
                                <p className="text-2xl font-bold tracking-tight mt-1">
                                    {summary.total_forms}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Active & Live</p>
                                <p className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
                                    {summary.active_forms}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Responses</p>
                                <p className="text-2xl font-bold tracking-tight mt-1">
                                    {summary.total_submissions}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Unread Inbox</p>
                                <p className="text-2xl font-bold tracking-tight mt-1">
                                    {summary.unread_submissions}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Inbox className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Status Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search forms by name or slug..."
                            className="pl-9 pr-8 h-9"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </form>

                    <div className="inline-flex items-center rounded-lg border bg-muted/40 p-1">
                        {(['all', 'active', 'paused'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => handleStatusChange(tab)}
                                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                                    statusFilter === tab
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Empty State with Starter Templates OR Forms Table */}
                {forms.data.length === 0 && !isFiltered ? (
                    <div className="rounded-2xl border border-dashed bg-card p-8 sm:p-12 text-center space-y-8">
                        <div className="space-y-2 max-w-md mx-auto">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Build your first hosted form
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Start from a ready-made template or create a custom schema with live preview, shareable link, and spam protection.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                            {STARTER_TEMPLATES.map((tpl) => {
                                const Icon = tpl.icon;
                                return (
                                    <Link
                                        key={tpl.id}
                                        href={`/${teamSlug}/forms/create?template=${tpl.id}`}
                                        className="group rounded-xl border bg-background p-4 hover:border-primary/60 hover:shadow-sm transition-all space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <Badge variant="secondary" className="text-[10px]">
                                                {tpl.fieldsCount} fields
                                            </Badge>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {tpl.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {tpl.description}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        <Button asChild>
                            <Link href={`/${teamSlug}/forms/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Start from Scratch
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="border rounded-xl overflow-hidden bg-card shadow-xs">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead>Form</TableHead>
                                    <TableHead>Public Hosted URL</TableHead>
                                    <TableHead>Responses</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {forms.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-12 text-muted-foreground"
                                        >
                                            No forms match your current filter.{' '}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearch('');
                                                    setStatusFilter('all');
                                                    applyFilters('', 'all');
                                                }}
                                                className="text-primary underline font-medium"
                                            >
                                                Reset filters
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    forms.data.map((form) => {
                                        const unread = form.unread_submissions_count ?? 0;
                                        return (
                                            <TableRow key={form.id} className="hover:bg-muted/30">
                                                <TableCell className="max-w-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/${teamSlug}/forms/${form.id}/submissions`}
                                                            className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                                                        >
                                                            {form.name}
                                                        </Link>
                                                        {unread > 0 && (
                                                            <Badge className="h-5 px-1.5 text-[10px] font-semibold">
                                                                {unread} new
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <span>{form.fields?.length || 0} fields</span>
                                                        {form.description && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="truncate max-w-[220px]">
                                                                    {form.description}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <a
                                                            href={`/forms/${form.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground inline-flex items-center gap-1.5 transition-colors"
                                                        >
                                                            <span>/forms/{form.slug}</span>
                                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                        </a>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleCopyPublicUrl(form.slug)}
                                                                >
                                                                    {copiedSlug === form.slug ? (
                                                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                                    ) : (
                                                                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Copy public form link</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Link
                                                        href={`/${teamSlug}/forms/${form.id}/submissions`}
                                                        className="inline-flex items-center gap-1.5 group"
                                                    >
                                                        <Badge
                                                            variant="secondary"
                                                            className="font-mono group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                                                        >
                                                            {form.submissions_count}{' '}
                                                            {form.submissions_count === 1 ? 'response' : 'responses'}
                                                        </Badge>
                                                    </Link>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <Switch
                                                            checked={form.is_active}
                                                            disabled={togglingId === form.id}
                                                            onCheckedChange={() => handleToggleActive(form)}
                                                            aria-label={`Toggle ${form.name} active status`}
                                                        />
                                                        <span
                                                            className={`text-xs font-medium ${
                                                                form.is_active
                                                                    ? 'text-emerald-700 dark:text-emerald-400'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {form.is_active ? 'Active' : 'Paused'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="inline-flex items-center justify-end gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 gap-1.5 text-xs"
                                                                    onClick={() => setShareTarget(form)}
                                                                >
                                                                    <Share2 className="h-3.5 w-3.5" />
                                                                    <span className="hidden xl:inline">Share</span>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Share & Embed</TooltipContent>
                                                        </Tooltip>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    aria-label="Form actions"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <a
                                                                        href={`/forms/${form.slug}${!form.is_active ? '?preview=1' : ''}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                                        {form.is_active
                                                                            ? 'Open Live Form'
                                                                            : 'Preview Form'}
                                                                    </a>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => setShareTarget(form)}
                                                                >
                                                                    <Share2 className="mr-2 h-4 w-4" />
                                                                    Share & Embed
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                    <Link
                                                                        href={`/${teamSlug}/forms/${form.id}/submissions`}
                                                                    >
                                                                        <Users className="mr-2 h-4 w-4" />
                                                                        Submissions Inbox
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link
                                                                        href={`/${teamSlug}/forms/${form.id}/edit`}
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit in Builder
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDuplicate(form)}
                                                                >
                                                                    <CopyPlus className="mr-2 h-4 w-4" />
                                                                    Duplicate Form
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setDeleteTarget(form)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete Form
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>

                        {forms.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground bg-muted/20">
                                <span>
                                    Showing {forms.from ?? 0}–{forms.to ?? 0} of {forms.total} forms
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!forms.prev_page_url}
                                        onClick={() =>
                                            forms.prev_page_url && router.visit(forms.prev_page_url)
                                        }
                                        className="h-7 gap-1"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!forms.next_page_url}
                                        onClick={() =>
                                            forms.next_page_url && router.visit(forms.next_page_url)
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
                )}
            </div>

            {/* Share & Embed Dialog */}
            <ShareFormDialog
                open={!!shareTarget}
                onOpenChange={(open) => !open && setShareTarget(null)}
                form={shareTarget}
                appUrl={baseUrl}
            />

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes the form, its public endpoint{' '}
                            <span className="font-mono">/forms/{deleteTarget?.slug}</span>, and all{' '}
                            {deleteTarget?.submissions_count ?? 0} recorded submission(s). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Form
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

FormsIndex.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Forms Engine', href: `/${teamSlug}/forms` },
        ],
    };
};
