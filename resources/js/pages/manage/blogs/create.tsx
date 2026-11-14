import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Loader2, ImagePlus, Tag, FolderOpen, X, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';




export default function BlogCreate({ categories, tags }: { categories: any[]; tags: any[] }) {
    const { currentTeam } = usePage().props as any;
    const tp = currentTeam?.slug ? `/${currentTeam.slug}` : '';

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        excerpt: '',
        content: '',
        cover_image: null as File | null,
        is_published: false,
        category_id: '' as string | number,
        tag_ids: [] as number[],
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`${tp}/manage/blogs`);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('cover_image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const toggleTag = (id: number) => {
        setData('tag_ids', data.tag_ids.includes(id)
            ? data.tag_ids.filter(t => t !== id)
            : [...data.tag_ids, id]
        );
    };


    return (
       <>
            <Head title="Create Post" />

            <div className="flex h-full flex-1 flex-col">
                {/* Header */}
                <div className="border-b bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg">
                            <Link href={`${tp}/manage/blogs`}><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <h1 className="text-base font-bold">New Post</h1>
                            </div>
                            <p className="text-xs text-muted-foreground">Craft your premium blog post</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border text-xs">
                            <span className="text-muted-foreground">Publish</span>
                            <Switch
                                checked={data.is_published}
                                onCheckedChange={c => setData('is_published', c)}
                                className="scale-75"
                            />
                            <span className={data.is_published ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                                {data.is_published ? 'On' : 'Off'}
                            </span>
                        </div>
                        <Button type="submit" form="blog-form" disabled={processing} size="sm">
                            {processing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                            {data.is_published ? 'Publish' : 'Save Draft'}
                        </Button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto">
                    <form id="blog-form" onSubmit={submit}>
                        <div className="flex flex-col lg:flex-row min-h-full">
                            {/* Main */}
                            <div className="flex-1 px-6 py-6 space-y-5 border-r">
                                <div className="space-y-1.5">
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="Post title…"
                                        className="text-2xl font-bold h-auto py-2 border-0 shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40"
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Excerpt</Label>
                                    <Textarea
                                        value={data.excerpt}
                                        onChange={e => setData('excerpt', e.target.value)}
                                        placeholder="A brief, compelling summary that appears on listing pages…"
                                        rows={2}
                                        className="resize-none text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content</Label>
                                    <RichTextEditor
                                        content={data.content}
                                        onChange={c => setData('content', c)}
                                        error={errors.content}
                                    />
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="w-full lg:w-72 xl:w-80 shrink-0 px-5 py-6 space-y-6 bg-muted/20">

                                {/* Cover Image */}
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                                        <ImagePlus className="h-3 w-3" /> Cover Image
                                    </Label>
                                    {imagePreview ? (
                                        <div className="relative group rounded-xl overflow-hidden border">
                                            <img src={imagePreview} className="w-full aspect-video object-cover" alt="" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button type="button" size="sm" variant="secondary" onClick={() => document.getElementById('cover_image')?.click()}>Change</Button>
                                                <Button type="button" size="icon" variant="destructive" className="h-8 w-8" onClick={() => {
                                                    setImagePreview(null);
                                                    setData('cover_image', null);
                                                }}>
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                            onClick={() => document.getElementById('cover_image')?.click()}
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                                                <ImagePlus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <p className="text-xs font-medium">Upload cover image</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">16:9 · PNG, JPG · Max 5MB</p>
                                        </div>
                                    )}
                                    <Input id="cover_image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </div>

                                {/* Category */}
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                                        <FolderOpen className="h-3 w-3" /> Category
                                    </Label>
                                    <div className="space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => setData('category_id', '')}
                                            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all border ${!data.category_id ? 'border-primary/50 bg-primary/8 text-primary font-medium' : 'border-transparent hover:bg-muted text-muted-foreground'}`}
                                        >
                                            Uncategorized
                                        </button>
                                        {categories.map((cat: any) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setData('category_id', cat.id)}
                                                className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all border flex items-center gap-2 ${data.category_id == cat.id ? 'border-primary/50 bg-primary/8 font-medium' : 'border-transparent hover:bg-muted text-muted-foreground'}`}
                                            >
                                                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                                {cat.name}
                                            </button>
                                        ))}
                                        {categories.length === 0 && (
                                            <p className="text-xs text-muted-foreground px-3 py-2">
                                                No categories yet.{' '}
                                                <Link href={`${tp}/manage/categories`} className="text-primary hover:underline">Create one</Link>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                                        <Tag className="h-3 w-3" /> Tags
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((tag: any) => {
                                            const active = data.tag_ids.includes(tag.id);

                                            return (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50 hover:bg-primary/5'}`}
                                                >
                                                    {tag.name}
                                                </button>
                                            );
                                        })}
                                        {tags.length === 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                No tags yet.{' '}
                                                <Link href={`${tp}/manage/tags`} className="text-primary hover:underline">Create some</Link>
                                            </p>
                                        )}
                                    </div>
                                    {data.tag_ids.length > 0 && (
                                        <p className="text-xs text-muted-foreground">{data.tag_ids.length} tag{data.tag_ids.length > 1 ? 's' : ''} selected</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}


