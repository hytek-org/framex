import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    BookOpen,
    Check,
    FileText,
    FolderOpen,
    ImagePlus,
    Loader2,
    Save,
    Tag,
    Trash2,
    UploadCloud,
    X,
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

type BlogFormData = {
    title: string;
    excerpt: string;
    content: string;
    cover_image: File | null;
    is_published: boolean;
    category_id: string | number;
    tag_ids: number[];
};

type PageProps = {
    currentTeam?: { slug?: string } | null;
};

const MAX_COVER_SIZE = 5 * 1024 * 1024;
const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export default function BlogCreate({
    categories,
    tags,
}: {
    categories: Category[];
    tags: BlogTag[];
}) {
    const { currentTeam } = usePage<PageProps>().props;
    const teamPrefix = currentTeam?.slug ? `/${currentTeam.slug}` : '';
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<BlogFormData>({
        title: '',
        excerpt: '',
        content: '<p></p>',
        cover_image: null,
        is_published: false,
        category_id: '',
        tag_ids: [],
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [coverError, setCoverError] = useState<string | null>(null);
    const [isDraggingCover, setIsDraggingCover] = useState(false);

    useEffect(() => {
        if (!imagePreview) return undefined;
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
        post(`${teamPrefix}/manage/blogs`, {
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
        setImagePreview(URL.createObjectURL(file));
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        applyCoverFile(event.target.files?.[0]);
        // Reset so selecting the same file again still triggers onChange.
        event.target.value = '';
    };

    const handleCoverDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDraggingCover(false);
        applyCoverFile(event.dataTransfer.files?.[0]);
    };

    const clearCover = () => {
        setData('cover_image', null);
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

    const selectedCategory = categories.find((category) => category.id == data.category_id);

    return (
        <>
            <Head title="Create post" />

            <div className="min-h-screen bg-muted/20 text-foreground">
                <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
                    <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
                                        Create post
                                    </h1>
                                    <Badge variant="secondary" className="hidden sm:inline-flex">
                                        {data.is_published ? 'Ready to publish' : 'Draft'}
                                    </Badge>
                                </div>
                                <p className="hidden text-xs text-muted-foreground sm:block">
                                    Write, organize, and publish an article
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:inline-flex">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Changes are saved when you submit
                            </span>
                            <Button
                                type="submit"
                                form="blog-form"
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
                                {processing ? 'Saving…' : data.is_published ? 'Publish post' : 'Save draft'}
                            </Button>
                        </div>
                    </div>
                </header>

                <form id="blog-form" onSubmit={submit} className="mx-auto max-w-[1600px]">
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
                                        <Label htmlFor="title" className="sr-only">Post title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={data.title}
                                            onChange={(event) => setData('title', event.target.value)}
                                            placeholder="Give your story a clear title"
                                            aria-invalid={Boolean(errors.title)}
                                            aria-describedby={errors.title ? 'title-error' : 'title-hint'}
                                            required
                                            className="h-auto border-0 bg-transparent px-0 py-1 text-[2rem] font-semibold leading-[1.15] tracking-[-0.045em] shadow-none placeholder:text-muted-foreground/45 focus-visible:ring-0 sm:text-4xl"
                                        />
                                        {errors.title ? (
                                            <p id="title-error" role="alert" className="text-sm text-destructive">
                                                {errors.title}
                                            </p>
                                        ) : (
                                            <p id="title-hint" className="text-xs text-muted-foreground">
                                                A strong title helps readers understand what this article is about.
                                            </p>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-7 px-5 py-6 sm:px-8 sm:py-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label htmlFor="excerpt" className="text-sm font-medium">Summary</Label>
                                            <span className="text-xs text-muted-foreground">Shown on post listings</span>
                                        </div>
                                        <Textarea
                                            id="excerpt"
                                            name="excerpt"
                                            value={data.excerpt}
                                            onChange={(event) => setData('excerpt', event.target.value)}
                                            placeholder="Write a short introduction that gives readers a reason to continue…"
                                            rows={3}
                                            aria-invalid={Boolean(errors.excerpt)}
                                            className="min-h-24 resize-y rounded-xl bg-background text-sm leading-6 placeholder:text-muted-foreground/60"
                                        />
                                        {errors.excerpt && (
                                            <p role="alert" className="text-sm text-destructive">{errors.excerpt}</p>
                                        )}
                                    </div>

                                    <Separator />

                                    <section aria-labelledby="body-heading" className="space-y-3">
                                        <div className="flex flex-wrap items-end justify-between gap-3">
                                            <div className="space-y-1">
                                                <h2 id="body-heading" className="text-sm font-semibold tracking-tight">Article body</h2>
                                                <p className="text-xs text-muted-foreground">
                                                    Structure your story with headings, media, links, and tables.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
                                                <span>{contentStats.words.toLocaleString()} words</span>
                                                <span aria-hidden="true" className="size-1 rounded-full bg-border" />
                                                <span>{contentStats.minutes} min read</span>
                                            </div>
                                        </div>

                                        <RichTextEditor
                                            content={data.content}
                                            onChange={(content) => setData('content', content)}
                                            error={errors.content}
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
                                        Choose whether this post should be visible after saving.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="publish-switch" className="text-sm font-medium">Publish immediately</Label>
                                            <p className="text-xs text-muted-foreground">Make this post public on save</p>
                                        </div>
                                        <Switch
                                            id="publish-switch"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) => setData('is_published', checked)}
                                            aria-label="Publish immediately"
                                        />
                                    </div>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {data.is_published
                                            ? 'This post will be published when you submit the form.'
                                            : 'This post will remain a draft until you publish it.'}
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
                                        id="cover_image"
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
                                                    alt="Selected cover image preview"
                                                    className="aspect-video w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                                    <Button type="button" size="sm" variant="secondary" onClick={openCoverPicker}>
                                                        Change image
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="destructive"
                                                        className="size-9"
                                                        onClick={clearCover}
                                                        aria-label="Remove cover image"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="min-w-0 truncate text-xs text-muted-foreground">
                                                    {data.cover_image?.name}
                                                </span>
                                                <Button type="button" variant="ghost" size="sm" onClick={clearCover} className="h-7 shrink-0 px-2 text-xs">
                                                    Remove
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
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background shadow-sm">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <FolderOpen className="size-4 text-muted-foreground" /> Category
                                    </CardTitle>
                                    <CardDescription className="text-xs">Choose the best home for this post.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <button
                                        type="button"
                                        aria-pressed={!data.category_id}
                                        onClick={() => setData('category_id', '')}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                                            !data.category_id
                                                ? 'border-primary/40 bg-primary/5 font-medium text-foreground'
                                                : 'border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                        )}
                                    >
                                        <span>Uncategorized</span>
                                        {!data.category_id && <Check className="size-4 text-primary" />}
                                    </button>

                                    {categories.map((category) => {
                                        const active = data.category_id == category.id;
                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => setData('category_id', category.id)}
                                                className={cn(
                                                    'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                                                    active
                                                        ? 'border-primary/40 bg-primary/5 font-medium text-foreground'
                                                        : 'border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                )}
                                            >
                                                <span className="flex min-w-0 items-center gap-2.5">
                                                    <span
                                                        aria-hidden="true"
                                                        className="size-2.5 shrink-0 rounded-full ring-2 ring-background"
                                                        style={{ backgroundColor: category.color || 'hsl(var(--muted-foreground))' }}
                                                    />
                                                    <span className="truncate">{category.name}</span>
                                                </span>
                                                {active && <Check className="size-4 shrink-0 text-primary" />}
                                            </button>
                                        );
                                    })}

                                    {categories.length === 0 && (
                                        <p className="rounded-lg bg-muted/40 px-3 py-3 text-xs leading-5 text-muted-foreground">
                                            No categories yet.{' '}
                                            <Link href={`${teamPrefix}/manage/categories`} className="font-medium text-primary underline-offset-4 hover:underline">
                                                Create a category
                                            </Link>
                                        </p>
                                    )}
                                    {errors.category_id && <p role="alert" className="pt-1 text-xs text-destructive">{errors.category_id}</p>}
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background shadow-sm">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <Tag className="size-4 text-muted-foreground" /> Tags
                                    </CardTitle>
                                    <CardDescription className="text-xs">Add topics to make this post easier to discover.</CardDescription>
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
                                                        aria-pressed={active}
                                                        onClick={() => toggleTag(tag.id)}
                                                        className={cn(
                                                            'inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                                            active
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                                                        )}
                                                    >
                                                        {active && <Check className="size-3" />}
                                                        {tag.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="rounded-lg bg-muted/40 px-3 py-3 text-xs leading-5 text-muted-foreground">
                                            No tags yet.{' '}
                                            <Link href={`${teamPrefix}/manage/tags`} className="font-medium text-primary underline-offset-4 hover:underline">
                                                Create tags
                                            </Link>
                                        </p>
                                    )}

                                    <Separator />
                                    <p className="text-xs text-muted-foreground">
                                        {data.tag_ids.length === 0
                                            ? 'No tags selected'
                                            : `${data.tag_ids.length} tag${data.tag_ids.length === 1 ? '' : 's'} selected`}
                                    </p>
                                    {errors.tag_ids && <p role="alert" className="text-xs text-destructive">{errors.tag_ids}</p>}
                                </CardContent>
                            </Card>

                            <div className="rounded-xl border border-dashed bg-background/60 p-4">
                                <p className="text-xs font-medium">Post overview</p>
                                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Reading time</span>
                                        <span className="font-medium tabular-nums text-foreground">{contentStats.minutes} min</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Category</span>
                                        <span className="max-w-36 truncate font-medium text-foreground">{selectedCategory?.name || 'Uncategorized'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Tags</span>
                                        <span className="font-medium tabular-nums text-foreground">{data.tag_ids.length}</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </form>
            </div>
        </>
    );
}
