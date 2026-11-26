import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    BookOpen,
    Check,
    ExternalLink,
    FileText,
    FolderOpen,
    ImagePlus,
    Loader2,
    Save,
    Tag,
    Trash2,
    UploadCloud,
} from 'lucide-react';

import { RichTextEditor } from '@/components/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Category = {
    id: number;
    name: string;
    slug?: string;
    color?: string | null;
};

type BlogTag = {
    id: number;
    name: string;
    slug?: string;
};

type BlogRecord = {
    id: number;
    slug: string;
    title?: string | null;
    excerpt?: string | null;
    content?: string | null;
    is_published?: boolean | number;
    category_id?: number | string | null;
    cover_image?: string | null;
    cover_image_url?: string | null;
    tags?: BlogTag[] | null;
};

type BlogEditFormData = {
    title: string;
    excerpt: string;
    content: string;
    is_published: boolean;
    category_id: string | number;
    tag_ids: number[];
    cover_image: File | null;
    /** Laravel controller must delete the old cover when this flag is true. */
    remove_cover_image: boolean;
    _method: 'put';
};

type PageProps = {
    currentTeam?: { slug?: string } | null;
};

const MAX_COVER_SIZE = 5 * 1024 * 1024;
const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function getCoverUrl(blog: BlogRecord): string | null {
    if (blog.cover_image_url) return blog.cover_image_url;
    return blog.cover_image ? `/storage/${blog.cover_image}` : null;
}

export default function BlogEdit({
    blog,
    categories,
    tags,
}: {
    blog: BlogRecord;
    categories: Category[];
    tags: BlogTag[];
}) {
    const { currentTeam } = usePage<PageProps>().props;
    const teamPrefix = currentTeam?.slug ? `/${currentTeam.slug}` : '';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const originalCoverExists = Boolean(blog.cover_image || blog.cover_image_url);

    const { data, setData, post, processing, errors } = useForm<BlogEditFormData>({
        title: blog.title ?? '',
        excerpt: blog.excerpt ?? '',
        content: blog.content ?? '<p></p>',
        is_published: Boolean(blog.is_published),
        category_id: blog.category_id ?? '',
        tag_ids: (blog.tags ?? []).map((tag) => tag.id),
        cover_image: null,
        remove_cover_image: false,
        _method: 'put',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(() => getCoverUrl(blog));
    const [coverError, setCoverError] = useState<string | null>(null);
    const [isDraggingCover, setIsDraggingCover] = useState(false);

    // Only revoke previews created with createObjectURL; never revoke the stored image URL.
    useEffect(() => {
        if (!imagePreview?.startsWith('blob:')) return undefined;
        return () => URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);

    const contentStats = useMemo(() => {
        const plainText = data.content
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, ' ')
            .trim();
        const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

        return {
            words,
            minutes: Math.max(1, Math.ceil(words / 220)),
        };
    }, [data.content]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(`${teamPrefix}/manage/blogs/${encodeURIComponent(blog.slug)}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const openCoverPicker = () => fileInputRef.current?.click();

    const applyCoverFile = (file?: File) => {
        if (!file) return;
        setCoverError(null);

        if (!ALLOWED_COVER_TYPES.includes(file.type)) {
            setCoverError('Choose a JPG, PNG, WebP, or AVIF image.');
            return;
        }

        if (file.size > MAX_COVER_SIZE) {
            setCoverError('The cover image must be 5 MB or smaller.');
            return;
        }

        setData('cover_image', file);
        setData('remove_cover_image', false);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        applyCoverFile(event.target.files?.[0]);
        // Reset to allow selecting the same file again after an attempted replacement.
        event.target.value = '';
    };

    const handleCoverDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDraggingCover(false);
        applyCoverFile(event.dataTransfer.files?.[0]);
    };

    const clearCover = () => {
        setData('cover_image', null);
        setData('remove_cover_image', originalCoverExists);
        setImagePreview(null);
        setCoverError(null);
    };

    const toggleTag = (id: number) => {
        setData(
            'tag_ids',
            data.tag_ids.includes(id)
                ? data.tag_ids.filter((tagId) => tagId !== id)
                : [...data.tag_ids, id],
        );
    };

    const selectedCategory = categories.find(
        (category) => String(category.id) === String(data.category_id),
    );

    return (
        <>
            <Head title={`Edit — ${data.title || 'Blog post'}`} />

            <div className="min-h-screen bg-muted/20 text-foreground">
                <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
                    <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <Button
                                asChild
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 shrink-0 rounded-full"
                            >
                                <Link href={`${teamPrefix}/manage/blogs`} aria-label="Back to posts">
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>

                            <Separator orientation="vertical" className="hidden h-7 sm:block" />

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="size-4 shrink-0 text-primary" />
                                    <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                                        Edit post
                                    </h1>
                                    <Badge variant="secondary" className="hidden sm:inline-flex">
                                        {data.is_published ? 'Published' : 'Draft'}
                                    </Badge>
                                </div>
                                <p className="hidden max-w-[34rem] truncate text-xs text-muted-foreground sm:block">
                                    {blog.title || 'Update your article and publishing details'}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Button asChild type="button" variant="outline" size="sm" className="hidden rounded-full sm:inline-flex">
                                <a
                                    href={`/blogs/${encodeURIComponent(blog.slug)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Preview <ExternalLink className="ml-2 size-3.5" />
                                </a>
                            </Button>
                            <Button
                                type="submit"
                                form="edit-blog-form"
                                disabled={processing}
                                className="min-w-32 rounded-full px-4"
                            >
                                {processing ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : data.is_published ? (
                                    <Check className="mr-2 size-4" />
                                ) : (
                                    <Save className="mr-2 size-4" />
                                )}
                                {processing ? 'Saving…' : 'Save changes'}
                            </Button>
                        </div>
                    </div>
                </header>

                <form id="edit-blog-form" onSubmit={submit} className="mx-auto max-w-[1600px]">
                    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:px-8 lg:py-8 xl:grid-cols-[minmax(0,880px)_340px] xl:justify-center">
                        <main className="min-w-0 space-y-6">
                            <Card className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                                <CardHeader className="space-y-2 border-b px-5 py-5 sm:px-8 sm:py-7">
                                    <div className="flex items-center justify-between gap-3">
                                        <Badge variant="outline" className="gap-1.5 rounded-full px-2.5 py-1 font-medium">
                                            <FileText className="size-3.5" /> Article editor
                                        </Badge>
                                        <span className="text-xs tabular-nums text-muted-foreground">
                                            {data.title.length} characters
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-title" className="sr-only">Post title</Label>
                                        <Input
                                            id="edit-title"
                                            name="title"
                                            value={data.title}
                                            onChange={(event) => setData('title', event.target.value)}
                                            placeholder="Give your story a clear title"
                                            aria-invalid={Boolean(errors.title)}
                                            aria-describedby={errors.title ? 'edit-title-error' : undefined}
                                            className="h-auto border-0 bg-transparent px-0 py-1 text-3xl font-semibold tracking-[-0.045em] shadow-none placeholder:text-muted-foreground/45 focus-visible:ring-0 sm:text-4xl"
                                        />
                                        {errors.title && (
                                            <p id="edit-title-error" role="alert" className="text-sm text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-7 p-5 sm:p-8">
                                    <section className="space-y-2.5">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label htmlFor="edit-excerpt" className="text-sm font-semibold">Summary</Label>
                                            <span className="text-xs text-muted-foreground">Shown in article listings</span>
                                        </div>
                                        <Textarea
                                            id="edit-excerpt"
                                            name="excerpt"
                                            value={data.excerpt}
                                            onChange={(event) => setData('excerpt', event.target.value)}
                                            placeholder="Write a concise summary that helps readers understand what this article covers…"
                                            rows={3}
                                            aria-invalid={Boolean(errors.excerpt)}
                                            aria-describedby={errors.excerpt ? 'edit-excerpt-error' : undefined}
                                            className="min-h-24 resize-y rounded-xl text-sm leading-6"
                                        />
                                        {errors.excerpt && (
                                            <p id="edit-excerpt-error" role="alert" className="text-sm text-destructive">
                                                {errors.excerpt}
                                            </p>
                                        )}
                                    </section>

                                    <Separator />

                                    <section className="space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-sm font-semibold">Article content</Label>
                                                <p className="text-xs text-muted-foreground">Structure your story with headings, media, tables, and links.</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                                                <span>{contentStats.words.toLocaleString()} words</span>
                                                <span aria-hidden="true" className="size-1 rounded-full bg-border" />
                                                <span>{contentStats.minutes} min read</span>
                                            </div>
                                        </div>

                                        <RichTextEditor
                                            content={data.content}
                                            onChange={(content) => setData('content', content)}
                                            error={errors.content}
                                            placeholder="Continue editing your article…"
                                        />
                                        {errors.content && (
                                            <p role="alert" className="text-sm text-destructive">{errors.content}</p>
                                        )}
                                    </section>
                                </CardContent>
                            </Card>
                        </main>

                        <aside className="min-w-0 space-y-5 lg:sticky lg:top-24">
                            <Card className="rounded-2xl border bg-background shadow-sm">
                                <CardHeader className="space-y-1 pb-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <CardTitle className="text-sm font-semibold">Publishing</CardTitle>
                                        <Badge variant={data.is_published ? 'default' : 'secondary'}>
                                            {data.is_published ? 'Published on save' : 'Draft'}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs leading-5">
                                        Choose whether this post should be publicly visible after saving.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="edit-publish-switch" className="text-sm font-medium">Publish post</Label>
                                            <p className="text-xs text-muted-foreground">Make this article public on save</p>
                                        </div>
                                        <Switch
                                            id="edit-publish-switch"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) => setData('is_published', checked)}
                                            aria-label="Publish post"
                                        />
                                    </div>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {data.is_published
                                            ? 'Your changes will be saved and the article will remain published.'
                                            : 'Your changes will be saved without making the article public.'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background shadow-sm">
                                <CardHeader className="space-y-1 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <ImagePlus className="size-4 text-muted-foreground" /> Cover image
                                    </CardTitle>
                                    <CardDescription className="text-xs leading-5">
                                        Use a wide image to introduce your article.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <input
                                        ref={fileInputRef}
                                        id="edit-cover-image"
                                        name="cover_image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/avif"
                                        className="sr-only"
                                        onChange={handleImageChange}
                                    />

                                    {imagePreview ? (
                                        <div className="space-y-3">
                                            <div className="group relative overflow-hidden rounded-xl border bg-muted">
                                                <img
                                                    src={imagePreview}
                                                    alt="Cover image preview"
                                                    className="aspect-video w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                                    <Button type="button" size="sm" variant="secondary" onClick={openCoverPicker}>
                                                        Change image
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="min-w-0 truncate text-xs text-muted-foreground">
                                                    {data.cover_image?.name ?? 'Current cover image'}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearCover}
                                                    className="h-7 shrink-0 px-2 text-xs text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="mr-1.5 size-3.5" /> Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onDragEnter={(event) => { event.preventDefault(); setIsDraggingCover(true); }}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDragLeave={(event) => {
                                                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                                    setIsDraggingCover(false);
                                                }
                                            }}
                                            onDrop={handleCoverDrop}
                                            className={cn(
                                                'rounded-xl border border-dashed p-5 text-center transition-colors',
                                                isDraggingCover
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
                                            )}
                                        >
                                            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-background shadow-sm">
                                                <UploadCloud className="size-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium">Drop an image here</p>
                                            <p className="mt-1 text-xs text-muted-foreground">or browse from your device</p>
                                            <Button type="button" variant="outline" size="sm" onClick={openCoverPicker} className="mt-4 rounded-full">
                                                Choose image
                                            </Button>
                                            <p className="mt-3 text-[11px] text-muted-foreground">JPG, PNG, WebP or AVIF · Max 5 MB</p>
                                        </div>
                                    )}

                                    {(coverError || errors.cover_image) && (
                                        <p role="alert" className="text-xs text-destructive">{coverError || errors.cover_image}</p>
                                    )}
                                    {errors.remove_cover_image && (
                                        <p role="alert" className="text-xs text-destructive">{errors.remove_cover_image}</p>
                                    )}
                                    {data.remove_cover_image && (
                                        <p className="text-xs text-muted-foreground">The existing cover will be removed when you save.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background shadow-sm">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <FolderOpen className="size-4 text-muted-foreground" /> Category
                                    </CardTitle>
                                    <CardDescription className="text-xs leading-5">Place this post in the most relevant topic.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('category_id', '')}
                                        aria-pressed={!data.category_id}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                            !data.category_id
                                                ? 'border-primary/40 bg-primary/5 font-medium text-foreground'
                                                : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/50',
                                        )}
                                    >
                                        Uncategorized
                                        {!data.category_id && <Check className="size-4 text-primary" />}
                                    </button>

                                    {categories.map((category) => {
                                        const active = String(data.category_id) === String(category.id);
                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => setData('category_id', category.id)}
                                                aria-pressed={active}
                                                className={cn(
                                                    'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                    active
                                                        ? 'border-primary/40 bg-primary/5 font-medium text-foreground'
                                                        : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/50',
                                                )}
                                            >
                                                <span className="flex min-w-0 items-center gap-2.5">
                                                    <span
                                                        aria-hidden="true"
                                                        className="size-2.5 shrink-0 rounded-full bg-muted-foreground/40"
                                                        style={category.color ? { backgroundColor: category.color } : undefined}
                                                    />
                                                    <span className="truncate">{category.name}</span>
                                                </span>
                                                {active && <Check className="size-4 shrink-0 text-primary" />}
                                            </button>
                                        );
                                    })}

                                    {categories.length === 0 && (
                                        <p className="px-1 py-2 text-xs leading-5 text-muted-foreground">
                                            No categories yet.{' '}
                                            <Link href={`${teamPrefix}/manage/categories`} className="font-medium text-primary underline-offset-4 hover:underline">
                                                Create a category
                                            </Link>
                                        </p>
                                    )}
                                    {errors.category_id && <p role="alert" className="text-xs text-destructive">{errors.category_id}</p>}
                                    {selectedCategory && <p className="pt-1 text-xs text-muted-foreground">Selected: {selectedCategory.name}</p>}
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background shadow-sm">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <Tag className="size-4 text-muted-foreground" /> Tags
                                    </CardTitle>
                                    <CardDescription className="text-xs leading-5">Add keywords to help readers discover this post.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => {
                                                const active = data.tag_ids.includes(tag.id);
                                                return (
                                                    <button
                                                        key={tag.id}
                                                        type="button"
                                                        onClick={() => toggleTag(tag.id)}
                                                        aria-pressed={active}
                                                        className={cn(
                                                            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                            active
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground',
                                                        )}
                                                    >
                                                        {tag.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            No tags yet.{' '}
                                            <Link href={`${teamPrefix}/manage/tags`} className="font-medium text-primary underline-offset-4 hover:underline">
                                                Create tags
                                            </Link>
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                                        <span>{data.tag_ids.length} selected</span>
                                        {errors.tag_ids && <span role="alert" className="text-destructive">{errors.tag_ids}</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </form>
            </div>
        </>
    );
}
