import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Save, Globe, Image as ImageIcon, Send } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StudioEditor } from "@/components/content-editor/StudioEditor";
import { SeoPanel } from "@/components/content-editor/SeoPanel";
import { MediaPickerModal } from "@/components/content-editor/MediaPickerModal";

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
        contentTypes.find((t) => t.slug === defaultType)?.id ||
        contentTypes[0]?.id ||
        1;

    const { data, setData, post, processing, errors } = useForm({
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
        data.status = targetStatus;
        post(`/${teamSlug}/content`);
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

            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${teamSlug}/content`}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-xl font-bold">New Content Item</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleSubmit("draft")}
                            disabled={processing}
                        >
                            <Save className="mr-1.5 h-4 w-4" />
                            Save Draft
                        </Button>
                        <Button
                            onClick={() => handleSubmit("published")}
                            disabled={processing}
                        >
                            <Send className="mr-1.5 h-4 w-4" />
                            Publish Immediately
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Writing Area (2 cols) */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        {/* Title */}
                        <div>
                            <Input
                                placeholder="Article or Page Title..."
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                className="text-xl font-bold py-6 px-4"
                                autoFocus
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Summary / Excerpt
                            </label>
                            <Textarea
                                placeholder="A concise summary of this content item..."
                                value={data.excerpt}
                                onChange={(e) =>
                                    setData("excerpt", e.target.value)
                                }
                                rows={2}
                                className="text-sm resize-none"
                            />
                        </div>

                        {/* TipTap Studio Editor */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Content Canvas
                            </label>
                            <StudioEditor
                                content={data.body_html}
                                onChange={(html, json) => {
                                    setData((prev) => ({
                                        ...prev,
                                        body_html: html,
                                        body_json: json,
                                    }));
                                }}
                                error={errors.body_html}
                            />
                        </div>

                        {/* SEO Studio Panel */}
                        <div className="mt-4">
                            <SeoPanel
                                title={data.title}
                                excerpt={data.excerpt}
                                slug={data.slug}
                                metaTitle={data.meta_title}
                                metaDescription={data.meta_description}
                                canonicalUrl={data.canonical_url}
                                coverImageUrl={data.cover_image}
                                onChange={(field, val) =>
                                    setData(field as any, val)
                                }
                            />
                        </div>
                    </div>

                    {/* Metadata & Publishing Sidebar (1 col) */}
                    <div className="flex flex-col gap-5">
                        {/* Content Type Picker */}
                        <div className="border rounded-lg p-4 bg-card flex flex-col gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Content Type
                            </h3>
                            <select
                                value={data.content_type_id}
                                onChange={(e) =>
                                    setData(
                                        "content_type_id",
                                        Number(e.target.value),
                                    )
                                }
                                className="w-full text-xs rounded-md border bg-background px-3 py-2"
                            >
                                {contentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Taxonomies */}
                        <div className="border rounded-lg p-4 bg-card flex flex-col gap-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Taxonomies
                            </h3>

                            {/* Category */}
                            <div>
                                <label className="text-xs font-medium block mb-1">
                                    Category
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData(
                                            "category_id",
                                            e.target.value
                                                ? Number(e.target.value)
                                                : "",
                                        )
                                    }
                                    className="w-full text-xs rounded-md border bg-background px-3 py-2"
                                >
                                    <option value="">
                                        None / Uncategorized
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="text-xs font-medium block mb-1.5">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                                    {tags.map((tag) => {
                                        const selected = data.tag_ids.includes(
                                            tag.id,
                                        );
                                        return (
                                            <button
                                                type="button"
                                                key={tag.id}
                                                onClick={() =>
                                                    toggleTag(tag.id)
                                                }
                                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                                    selected
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                                }`}
                                            >
                                                #{tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Featured Cover Media */}
                        <div className="border rounded-lg p-4 bg-card flex flex-col gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Featured Cover Asset
                            </h3>

                            {data.cover_image ? (
                                <div className="relative rounded-lg overflow-hidden border aspect-video bg-muted">
                                    <img
                                        src={data.cover_image}
                                        alt="Cover Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData("cover_image", "")
                                        }
                                        className="absolute top-2 right-2 bg-background/80 text-foreground text-xs px-2 py-0.5 rounded shadow"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setCoverPickerOpen(true)}
                                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition-colors text-center"
                                >
                                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-xs font-medium">
                                        Choose from Media Studio
                                    </p>
                                </div>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCoverPickerOpen(true)}
                                className="w-full text-xs"
                            >
                                <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                                Browse Media Library
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <MediaPickerModal
                open={coverPickerOpen}
                onClose={() => setCoverPickerOpen(false)}
                onSelect={(media) => setData("cover_image", media.url)}
                title="Select Featured Cover Asset"
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
