import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Archive,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Clock3,
    FileText,
    FolderOpen,
    History,
    Image as ImageIcon,
    LoaderCircle,
    Save,
    Send,
    Tag,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MediaPickerModal } from '@/components/content-editor/MediaPickerModal';
import { RevisionHistoryModal } from '@/components/content-editor/RevisionHistoryModal';
import { SeoPanel } from '@/components/content-editor/SeoPanel';
import { StudioEditor } from '@/components/content-editor/StudioEditor';

interface ContentTypeItem {
    id: number;
    name: string;
    slug: string;
}

interface TaxonomyItem {
    id: number;
    name: string;
    slug: string;
}

interface ContentRevisionItem {
    id: number;
    title: string;
    excerpt?: string | null;
    change_summary: string;
    created_at: string;
    author?: { name: string } | null;
}

interface ContentDetail {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    status: string;
    cover_image?: string | null;
    current_revision_id?: number | null;
    content_type_id: number;
    category_id?: number | null;
    tags?: TaxonomyItem[];
    current_revision?: {
        body_html?: string | null;
        body_json?: unknown;
    } | null;
    seo_metadata?: {
        meta_title?: string | null;
        meta_description?: string | null;
        canonical_url?: string | null;
    } | null;
    revisions?: ContentRevisionItem[];
}

interface Props {
    content: ContentDetail;
    contentTypes: ContentTypeItem[];
    categories: TaxonomyItem[];
    tags: TaxonomyItem[];
}

type WorkflowStatus = 'draft' | 'in_review' | 'published' | 'archived';

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string; description: string }> = {
    published: {
        label: 'Published',
        icon: CheckCircle2,
        className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        description: 'This content is live and available to its public audience.',
    },
    scheduled: {
        label: 'Scheduled',
        icon: Clock3,
        className: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-400',
        description: 'This content is scheduled for publication.',
    },
    in_review: {
        label: 'In review',
        icon: AlertCircle,
        className: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        description: 'This content is awaiting editorial review.',
    },
    archived: {
        label: 'Archived',
        icon: Archive,
        className: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400',
        description: 'This content is archived and not part of active publishing.',
    },
    draft: {
        label: 'Draft',
        icon: FileText,
        className: 'border-border bg-muted/60 text-muted-foreground',
        description: 'This content is saved as a draft and is not publicly available.',
    },
};

export default function Edit({ content, contentTypes, categories, tags }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';
    const contentTypeName = contentTypes.find((type) => type.id === content.content_type_id)?.name ?? 'Content';

    const { data, setData, put, processing, errors } = useForm({
        title: content.title || '',
        slug: content.slug || '',
        excerpt: content.excerpt || '',
        body_html: content.current_revision?.body_html || '',
        body_json: content.current_revision?.body_json || null,
        category_id: content.category_id || ('' as string | number),
        tag_ids: content.tags?.map((tag) => tag.id) || [],
        cover_image: content.cover_image || '',
        change_summary: '',
        meta_title: content.seo_metadata?.meta_title || '',
        meta_description: content.seo_metadata?.meta_description || '',
        canonical_url: content.seo_metadata?.canonical_url || '',
    });

    const [coverPickerOpen, setCoverPickerOpen] = useState(false);
    const [timeMachineOpen, setTimeMachineOpen] = useState(false);
    const [transitioning, setTransitioning] = useState(false);

    const currentStatus = statusConfig[content.status] ?? statusConfig.draft;
    const StatusIcon = currentStatus.icon;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(`/${teamSlug}/content/${content.slug}`, {
            preserveScroll: true,
        });
    };

    const handleWorkflowTransition = (targetStatus: WorkflowStatus) => {
        if (transitioning || processing) return;

        setTransitioning(true);
        router.post(
            `/${teamSlug}/content/${content.slug}/transition`,
            { status: targetStatus },
            {
                preserveScroll: true,
                onFinish: () => setTransitioning(false),
            },
        );
    };

    const toggleTag = (tagId: number) => {
        setData(
            'tag_ids',
            data.tag_ids.includes(tagId)
                ? data.tag_ids.filter((id) => id !== tagId)
                : [...data.tag_ids, tagId],
        );
    };

    const transitionActions: { label: string; status: WorkflowStatus }[] = [
        ...(content.status !== 'in_review' ? [{ label: 'Submit for review', status: 'in_review' as const }] : []),
        ...(content.status !== 'published' ? [{ label: 'Publish now', status: 'published' as const }] : []),
        ...(content.status === 'published' ? [{ label: 'Unpublish to draft', status: 'draft' as const }] : []),
        ...(content.status !== 'archived' ? [{ label: 'Archive content', status: 'archived' as const }] : []),
    ];

    return (
        <>
            <Head title={`Edit: ${content.title} — Content Studio`} />

            <form onSubmit={handleSubmit} className="min-h-full bg-background">
                {/* Page toolbar */}
                <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0">
                                <Link href={`/${teamSlug}/content`} aria-label="Back to Content Studio">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-xs font-medium text-muted-foreground">Content Studio</p>
                                    <span className="text-muted-foreground/50">/</span>
                                    <Badge variant="secondary" className="font-medium">{contentTypeName}</Badge>
                                    <Badge variant="outline" className={currentStatus.className}>
                                        <StatusIcon className="mr-1.5 h-3 w-3" />
                                        {currentStatus.label}
                                    </Badge>
                                </div>
                                <h1 className="mt-0.5 truncate text-sm font-semibold tracking-tight sm:max-w-[34rem]">
                                    {content.title || 'Untitled content'}
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setTimeMachineOpen(true)}
                                className="gap-2"
                            >
                                <History className="h-4 w-4" />
                                <span className="hidden sm:inline">Revision history</span>
                                <span className="sm:hidden">History</span>
                                <Badge variant="secondary" className="ml-0.5 px-1.5 tabular-nums">
                                    {content.revisions?.length ?? 0}
                                </Badge>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="outline" size="sm" disabled={transitioning || processing} className="gap-2">
                                        <span className="hidden sm:inline">Workflow</span>
                                        <span className="sm:hidden">Status</span>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-2 py-1.5">
                                        <p className="text-xs font-medium">Change publishing status</p>
                                        <p className="text-xs text-muted-foreground">Current: {currentStatus.label}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    {transitionActions.map((action) => (
                                        <DropdownMenuItem
                                            key={action.status}
                                            disabled={transitioning || processing}
                                            onSelect={() => handleWorkflowTransition(action.status)}
                                        >
                                            {action.status === 'published' && <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />}
                                            {action.status === 'in_review' && <Send className="mr-2 h-4 w-4 text-amber-600" />}
                                            {action.status === 'draft' && <FileText className="mr-2 h-4 w-4" />}
                                            {action.status === 'archived' && <Archive className="mr-2 h-4 w-4 text-rose-600" />}
                                            {action.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button type="submit" size="sm" disabled={processing || transitioning} className="gap-2">
                                {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                <span>{processing ? 'Saving…' : 'Save changes'}</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mb-7 max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Editorial workspace</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Edit your content</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Update the content, organize its metadata, and manage its publishing lifecycle from one place.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
                        {/* Main editor column */}
                        <div className="min-w-0 space-y-6">
                            <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold">Content details</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">The title and summary help readers understand this piece.</p>
                                    </div>
                                    <Badge variant="outline" className="hidden sm:inline-flex">Main content</Badge>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label htmlFor="content-title" className="text-sm font-medium">Title</label>
                                        <Input
                                            id="content-title"
                                            autoFocus
                                            placeholder="Give your content a clear title"
                                            value={data.title}
                                            onChange={(event) => setData('title', event.target.value)}
                                            aria-invalid={Boolean(errors.title)}
                                            className="h-auto border-0 bg-transparent px-0 py-2 text-2xl font-semibold tracking-tight shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 sm:text-3xl"
                                        />
                                        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                        <p className="break-all text-xs text-muted-foreground">/{data.slug}</p>
                                    </div>

                                    <div className="space-y-2 border-t pt-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <label htmlFor="content-excerpt" className="text-sm font-medium">Summary</label>
                                            <span className="text-xs text-muted-foreground">Optional</span>
                                        </div>
                                        <Textarea
                                            id="content-excerpt"
                                            placeholder="Write a concise introduction or summary…"
                                            value={data.excerpt}
                                            onChange={(event) => setData('excerpt', event.target.value)}
                                            rows={3}
                                            aria-invalid={Boolean(errors.excerpt)}
                                            className="min-h-24 resize-y text-sm leading-6"
                                        />
                                        {errors.excerpt && <p className="text-xs text-destructive">{errors.excerpt}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
                                    <div>
                                        <h3 className="text-sm font-semibold">Content canvas</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">Write and format your content using the rich text editor.</p>
                                    </div>
                                    <Badge variant="secondary" className="font-normal">Editor</Badge>
                                </div>
                                <div className="p-2 sm:p-4">
                                    <StudioEditor
                                        content={data.body_html}
                                        onChange={(html, json) => {
                                            setData((previous) => ({
                                                ...previous,
                                                body_html: html,
                                                body_json: json,
                                            }));
                                        }}
                                        error={errors.body_html}
                                    />
                                </div>
                            </section>

                            <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
                                <div className="mb-3 flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <History className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold">Revision snapshot note</h3>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">Add a short note describing what changed. This helps teammates understand the revision history.</p>
                                    </div>
                                </div>
                                <Input
                                    id="change-summary"
                                    placeholder="e.g. Updated product details and added the security section"
                                    value={data.change_summary}
                                    onChange={(event) => setData('change_summary', event.target.value)}
                                    aria-invalid={Boolean(errors.change_summary)}
                                />
                                {errors.change_summary && <p className="mt-1.5 text-xs text-destructive">{errors.change_summary}</p>}
                            </section>

                            <section className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold">Search engine optimization</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">Control how this content appears in search results and shared links.</p>
                                </div>
                                <SeoPanel
                                    title={data.title}
                                    excerpt={data.excerpt}
                                    slug={data.slug}
                                    metaTitle={data.meta_title}
                                    metaDescription={data.meta_description}
                                    canonicalUrl={data.canonical_url}
                                    coverImageUrl={data.cover_image}
                                    onChange={(field, value) => setData(field as keyof typeof data, value as never)}
                                />
                            </section>
                        </div>

                        {/* Metadata sidebar */}
                        <aside className="min-w-0 space-y-5 xl:sticky xl:top-24">
                            <section className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold">Publishing status</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">Current visibility and workflow.</p>
                                    </div>
                                    <Badge variant="outline" className={currentStatus.className}>
                                        <StatusIcon className="mr-1.5 h-3 w-3" />
                                        {currentStatus.label}
                                    </Badge>
                                </div>
                                <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
                                    {currentStatus.description}
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 w-full justify-between"
                                    disabled={transitioning || processing}
                                    onClick={() => handleWorkflowTransition(content.status === 'published' ? 'draft' : 'published')}
                                >
                                    <span className="flex items-center gap-2">
                                        {transitioning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        {content.status === 'published' ? 'Move to draft' : 'Publish now'}
                                    </span>
                                    <span aria-hidden="true">→</span>
                                </Button>
                            </section>

                            <section className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <FolderOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">Organization</h3>
                                        <p className="text-xs text-muted-foreground">Category and topic tags</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="content-category" className="text-xs font-medium">Category</label>
                                        <Select
                                            value={data.category_id ? String(data.category_id) : '__none__'}
                                            onValueChange={(value) => setData('category_id', value === '__none__' ? '' : Number(value))}
                                        >
                                            <SelectTrigger id="content-category" className="w-full">
                                                <SelectValue placeholder="Choose a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__">No category</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={String(category.id)}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <label className="text-xs font-medium">Tags</label>
                                            <span className="text-xs tabular-nums text-muted-foreground">{data.tag_ids.length} selected</span>
                                        </div>
                                        {tags.length > 0 ? (
                                            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-lg border bg-muted/20 p-2">
                                                {tags.map((tag) => {
                                                    const selected = data.tag_ids.includes(tag.id);
                                                    return (
                                                        <Button
                                                            key={tag.id}
                                                            type="button"
                                                            size="sm"
                                                            variant={selected ? 'default' : 'outline'}
                                                            aria-pressed={selected}
                                                            onClick={() => toggleTag(tag.id)}
                                                            className="h-7 rounded-full px-2.5 text-xs"
                                                        >
                                                            {selected && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                                            #{tag.name}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="rounded-lg border border-dashed p-3 text-xs leading-5 text-muted-foreground">No tags are available for this workspace yet.</p>
                                        )}
                                        {errors.tag_ids && <p className="text-xs text-destructive">{errors.tag_ids}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <ImageIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">Featured image</h3>
                                        <p className="text-xs text-muted-foreground">Visual cover for this content</p>
                                    </div>
                                </div>

                                {data.cover_image ? (
                                    <div className="group relative overflow-hidden rounded-lg border bg-muted">
                                        <img
                                            src={data.cover_image}
                                            alt={`Featured image for ${data.title || 'content'}`}
                                            className="aspect-[16/10] w-full object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                            <span className="min-w-0 truncate text-xs font-medium text-white">Selected cover image</span>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                className="h-8 w-8 shrink-0"
                                                aria-label="Remove featured image"
                                                onClick={() => setData('cover_image', '')}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setCoverPickerOpen(true)}
                                        className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border bg-background text-muted-foreground">
                                            <ImageIcon className="h-5 w-5" />
                                        </span>
                                        <span className="text-sm font-medium">Choose a cover image</span>
                                        <span className="mt-1 text-xs text-muted-foreground">Select an asset from Media Studio</span>
                                    </button>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 w-full gap-2"
                                    onClick={() => setCoverPickerOpen(true)}
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    {data.cover_image ? 'Replace image' : 'Browse media library'}
                                </Button>
                                {errors.cover_image && <p className="mt-1.5 text-xs text-destructive">{errors.cover_image}</p>}
                            </section>

                            <section className="rounded-xl border bg-muted/30 p-4">
                                <div className="flex items-start gap-2.5">
                                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium">Revision history</p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {content.revisions?.length ?? 0} saved {content.revisions?.length === 1 ? 'revision' : 'revisions'}. Open Time Machine to compare or restore a previous snapshot.
                                        </p>
                                        <Button type="button" variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" onClick={() => setTimeMachineOpen(true)}>
                                            View revision history
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <Button type="button" variant="ghost" asChild>
                            <Link href={`/${teamSlug}/content`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Content Studio
                            </Link>
                        </Button>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <Button type="button" variant="outline" onClick={() => setTimeMachineOpen(true)}>
                                <History className="mr-2 h-4 w-4" />
                                Revision history
                            </Button>
                            <Button type="submit" disabled={processing || transitioning}>
                                {processing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {processing ? 'Saving changes…' : 'Save changes'}
                            </Button>
                        </div>
                    </div>
                </main>
            </form>

            <MediaPickerModal
                open={coverPickerOpen}
                onClose={() => setCoverPickerOpen(false)}
                onSelect={(media) => setData('cover_image', media.url)}
                title="Select Featured Cover Asset"
            />

            <RevisionHistoryModal
                open={timeMachineOpen}
                onClose={() => setTimeMachineOpen(false)}
                contentSlug={content.slug}
                currentRevisionId={content.current_revision_id}
            />
        </>
    );
}

Edit.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Content Studio', href: `/${teamSlug}/content` },
            { title: 'Edit', href: '#' },
        ],
    };
};
