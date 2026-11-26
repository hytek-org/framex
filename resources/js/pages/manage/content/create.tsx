import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Check,
    FileText,
    FolderOpen,
    Globe,
    Image as ImageIcon,
    Save,
    Send,
    Tags as TagsIcon,
    X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SeoPanel } from "@/components/content-editor/SeoPanel";
import { MediaPickerModal } from "@/components/content-editor/MediaPickerModal";
import { RichTextEditor } from "@/components/rich-text-editor";

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

interface Props {
    contentTypes: ContentTypeItem[];
    categories: TaxonomyItem[];
    tags: TaxonomyItem[];
    defaultType?: string;
}

export default function Create({
    contentTypes,
    categories,
    tags,
    defaultType = "post",
}: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || "";

    const initialTypeId =
        contentTypes.find((type) => type.slug === defaultType)?.id ??
        contentTypes[0]?.id ??
        1;

    const { data, setData, post, processing, errors, transform } = useForm({
        content_type_id: initialTypeId,
        title: "",
        slug: "",
        excerpt: "",
        body_html: "",
        body_json: null as any,
        category_id: "" as string | number,
        tag_ids: [] as number[],
        cover_image: "",
        status: "draft",
        meta_title: "",
        meta_description: "",
        canonical_url: "",
    });

    const [coverPickerOpen, setCoverPickerOpen] = useState(false);

    const handleSubmit = (targetStatus: "draft" | "published") => {
        // Keep the form state immutable while sending the requested status.
        transform((formData) => ({ ...formData, status: targetStatus }));
        post(`/${teamSlug}/content`, { preserveScroll: true });
    };

    const toggleTag = (tagId: number) => {
        setData(
            "tag_ids",
            data.tag_ids.includes(tagId)
                ? data.tag_ids.filter((id) => id !== tagId)
                : [...data.tag_ids, tagId],
        );
    };

    return (
        <>
            <Head title="Create Content — Content Studio" />

            <div className="min-h-full bg-muted/20">
                {/* Page header */}
                <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
                    <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="size-9 shrink-0 rounded-full"
                            >
                                <Link
                                    href={`/${teamSlug}/content`}
                                    aria-label="Back to Content Studio"
                                >
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                                        Content Studio
                                    </span>
                                    <span className="hidden size-1 rounded-full bg-border sm:inline-block" />
                                    <span className="text-xs text-muted-foreground">
                                        New item
                                    </span>
                                </div>
                                <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                                    Create content
                                </h1>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <span className="hidden items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground md:inline-flex">
                                <span className="size-1.5 rounded-full bg-amber-500" />
                                Draft
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSubmit("draft")}
                                disabled={processing}
                                className="h-9 gap-2"
                            >
                                <Save className="size-3.5" />
                                <span className="hidden sm:inline">
                                    Save draft
                                </span>
                                <span className="sm:hidden">Save</span>
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSubmit("published")}
                                disabled={processing}
                                className="h-9 gap-2"
                            >
                                <Send className="size-3.5" />
                                Publish
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mb-6 flex flex-col gap-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Create a new item for your workspace
                        </p>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground/80">
                            Add your content, organize it with taxonomies, and
                            configure how it appears when published.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
                        {/* Main writing column */}
                        <div className="min-w-0 space-y-6">
                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm shadow-black/[0.02]">
                                <div className="border-b px-5 py-4 sm:px-7">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <FileText className="size-4 text-muted-foreground" />
                                        Content
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Give your content a clear title and a
                                        useful summary before writing.
                                    </p>
                                </div>

                                <div className="space-y-6 p-5 sm:p-7">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="content-title"
                                            className="text-xs font-medium text-muted-foreground"
                                        >
                                            Title{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="content-title"
                                            placeholder="Give your content a title"
                                            value={data.title}
                                            onChange={(event) =>
                                                setData(
                                                    "title",
                                                    event.target.value,
                                                )
                                            }
                                            autoFocus
                                            aria-invalid={!!errors.title}
                                            className="h-auto border-0 bg-transparent px-0 py-2 text-2xl font-semibold tracking-tight shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 sm:text-3xl"
                                        />
                                        {errors.title && (
                                            <p className="text-xs text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label
                                                htmlFor="content-excerpt"
                                                className="text-sm font-medium"
                                            >
                                                Summary
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">
                                                Optional
                                            </span>
                                        </div>
                                        <Textarea
                                            id="content-excerpt"
                                            placeholder="Write a short summary to introduce this content…"
                                            value={data.excerpt}
                                            onChange={(event) =>
                                                setData(
                                                    "excerpt",
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            aria-invalid={!!errors.excerpt}
                                            className="min-h-24 resize-y border-border/80 bg-background text-sm leading-6 placeholder:text-muted-foreground/60 focus-visible:ring-1"
                                        />
                                        {errors.excerpt && (
                                            <p className="text-xs text-destructive">
                                                {errors.excerpt}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm shadow-black/[0.02]">
                                <div className="border-b px-5 py-4 sm:px-7">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold">
                                                Content canvas
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Write and format the main body
                                                of your content.
                                            </p>
                                        </div>
                                        <span className="rounded-md border bg-muted/40 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                            Editor
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 sm:p-5">
                                    <RichTextEditor
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
                                    {errors.body_json && (
                                        <p className="mt-2 text-xs text-destructive">
                                            {errors.body_json}
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border bg-card shadow-sm shadow-black/[0.02]">
                                <div className="border-b px-5 py-4 sm:px-7">
                                    <div className="text-sm font-semibold">
                                        Search appearance
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Control how this item can appear in
                                        search results and shared links.
                                    </p>
                                </div>
                                <div className="p-5 sm:p-7">
                                    <SeoPanel
                                        title={data.title}
                                        excerpt={data.excerpt}
                                        slug={data.slug}
                                        metaTitle={data.meta_title}
                                        metaDescription={data.meta_description}
                                        canonicalUrl={data.canonical_url}
                                        coverImageUrl={data.cover_image}
                                        onChange={(field, value) =>
                                            setData(field as any, value)
                                        }
                                    />
                                </div>
                            </section>
                        </div>

                        {/* Publishing and metadata sidebar */}
                        <aside className="min-w-0 space-y-5 xl:sticky xl:top-24">
                            <section className="rounded-xl border bg-card shadow-sm shadow-black/[0.02]">
                                <div className="border-b px-4 py-3.5">
                                    <div className="text-sm font-semibold">
                                        Organization
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Choose the type and classification for
                                        this item.
                                    </p>
                                </div>

                                <div className="space-y-5 p-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">
                                            Content type
                                        </Label>
                                        <Select
                                            value={String(data.content_type_id)}
                                            onValueChange={(value) =>
                                                setData(
                                                    "content_type_id",
                                                    Number(value),
                                                )
                                            }
                                            disabled={contentTypes.length === 0}
                                        >
                                            <SelectTrigger className="h-9 w-full bg-background text-sm">
                                                <SelectValue placeholder="Select content type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contentTypes.map((type) => (
                                                    <SelectItem
                                                        key={type.id}
                                                        value={String(type.id)}
                                                    >
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.content_type_id && (
                                            <p className="text-xs text-destructive">
                                                {errors.content_type_id}
                                            </p>
                                        )}
                                        {contentTypes.length === 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                No content types are available
                                                for this workspace.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-medium">
                                            <FolderOpen className="size-3.5 text-muted-foreground" />
                                            Category
                                        </Label>
                                        <Select
                                            value={
                                                data.category_id
                                                    ? String(data.category_id)
                                                    : "none"
                                            }
                                            onValueChange={(value) =>
                                                setData(
                                                    "category_id",
                                                    value === "none"
                                                        ? ""
                                                        : Number(value),
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-9 w-full bg-background text-sm">
                                                <SelectValue placeholder="Choose a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    No category
                                                </SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={String(
                                                            category.id,
                                                        )}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && (
                                            <p className="text-xs text-destructive">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label className="flex items-center gap-1.5 text-xs font-medium">
                                                <TagsIcon className="size-3.5 text-muted-foreground" />
                                                Tags
                                            </Label>
                                            <span className="text-[11px] tabular-nums text-muted-foreground">
                                                {data.tag_ids.length} selected
                                            </span>
                                        </div>
                                        {tags.length > 0 ? (
                                            <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto rounded-lg border bg-muted/20 p-2">
                                                {tags.map((tag) => {
                                                    const selected =
                                                        data.tag_ids.includes(
                                                            tag.id,
                                                        );

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={tag.id}
                                                            aria-pressed={
                                                                selected
                                                            }
                                                            onClick={() =>
                                                                toggleTag(
                                                                    tag.id,
                                                                )
                                                            }
                                                            className={[
                                                                "inline-flex min-h-7 items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                                selected
                                                                    ? "border-primary/30 bg-primary/10 text-primary"
                                                                    : "border-transparent bg-background text-muted-foreground hover:border-border hover:text-foreground",
                                                            ].join(" ")}
                                                        >
                                                            {selected && (
                                                                <Check className="size-3" />
                                                            )}
                                                            {tag.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                                                No tags are available yet.
                                            </p>
                                        )}
                                        {errors.tag_ids && (
                                            <p className="text-xs text-destructive">
                                                {errors.tag_ids}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border bg-card shadow-sm shadow-black/[0.02]">
                                <div className="border-b px-4 py-3.5">
                                    <div className="text-sm font-semibold">
                                        Featured image
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Select the image used to represent this
                                        item.
                                    </p>
                                </div>

                                <div className="space-y-3 p-4">
                                    {data.cover_image ? (
                                        <div className="group relative overflow-hidden rounded-lg border bg-muted">
                                            <div className="aspect-[16/10]">
                                                <img
                                                    src={data.cover_image}
                                                    alt="Selected featured image"
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                                <span className="truncate text-xs font-medium text-white">
                                                    Featured image selected
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon"
                                                    aria-label="Remove featured image"
                                                    onClick={() =>
                                                        setData(
                                                            "cover_image",
                                                            "",
                                                        )
                                                    }
                                                    className="size-8 shrink-0"
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCoverPickerOpen(true)
                                            }
                                            className="flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <span className="mb-3 flex size-10 items-center justify-center rounded-xl border bg-background shadow-sm">
                                                <ImageIcon className="size-5 text-muted-foreground" />
                                            </span>
                                            <span className="text-sm font-medium">
                                                Choose a featured image
                                            </span>
                                            <span className="mt-1 text-xs text-muted-foreground">
                                                Browse your workspace media
                                                library
                                            </span>
                                        </button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCoverPickerOpen(true)}
                                        className="w-full gap-2"
                                    >
                                        <ImageIcon className="size-3.5" />
                                        {data.cover_image
                                            ? "Change image"
                                            : "Browse media library"}
                                    </Button>
                                    {errors.cover_image && (
                                        <p className="text-xs text-destructive">
                                            {errors.cover_image}
                                        </p>
                                    )}
                                </div>
                            </section>

                            <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-3.5">
                                <div className="flex items-start gap-2.5">
                                    <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium">
                                            Publishing visibility
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Saving as a draft keeps this item
                                            out of public listings. Publishing
                                            makes it available according to your
                                            content type and access rules.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>

            <MediaPickerModal
                open={coverPickerOpen}
                onClose={() => setCoverPickerOpen(false)}
                onSelect={(media) => setData("cover_image", media.url)}
                title="Select featured image"
            />
        </>
    );
}

Create.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || "";

    return {
        breadcrumbs: [
            { title: "Dashboard", href: `/${teamSlug}/dashboard` },
            { title: "Content Studio", href: `/${teamSlug}/content` },
            { title: "Create", href: "#" },
        ],
    };
};
