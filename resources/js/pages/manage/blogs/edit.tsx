import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, ImagePlus } from 'lucide-react';
import { RichTextEditor } from '@/components/rich-text-editor';
import { useState } from 'react';

export default function BlogEdit({ blog }: { blog: any }) {
    const { currentTeam } = usePage().props as any;
    const teamPrefix = currentTeam?.slug ? `/${currentTeam.slug}` : '';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manage Blogs', href: `${teamPrefix}/manage/blogs` },
        { title: 'Edit Post', href: '#' },
    ];

    const { data, setData, processing, errors } = useForm({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        cover_image: null as File | null,
        is_published: !!blog.is_published,
        _method: 'PUT', // Needed for file upload with PUT in Laravel
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        blog.cover_image ? `/storage/${blog.cover_image}` : null
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`${teamPrefix}/manage/blogs/${blog.id}`, data, {
            forceFormData: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <Head title={`Edit - ${blog.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={`${teamPrefix}/manage/blogs`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
                            <p className="text-muted-foreground">Update your premium blog post</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-base">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="The Future of Enterprise SaaS..."
                                className="text-lg h-12 font-medium"
                            />
                            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content" className="text-base">Content</Label>
                            <RichTextEditor
                                content={data.content}
                                onChange={content => setData('content', content)}
                                error={errors.content}
                            />
                            {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt" className="text-base">Excerpt (Optional)</Label>
                            <Textarea
                                id="excerpt"
                                value={data.excerpt}
                                onChange={e => setData('excerpt', e.target.value)}
                                placeholder="A brief summary of the post for listing pages..."
                                rows={3}
                                className="resize-none"
                            />
                            {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt}</p>}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 shrink-0 space-y-6">
                        <div className="surface-elevated rounded-xl p-5 space-y-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Save className="h-5 w-5 text-primary" /> Publishing
                            </h3>

                            <div className="flex items-center justify-between p-3 surface-inset rounded-lg">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_published" className="font-medium cursor-pointer">Publish Post</Label>
                                    <p className="text-xs text-muted-foreground">Make visible to public</p>
                                </div>
                                <Switch
                                    id="is_published"
                                    checked={data.is_published}
                                    onCheckedChange={checked => setData('is_published', checked)}
                                />
                            </div>

                            <Button type="submit" disabled={processing} className="w-full" size="lg">
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>

                        <div className="surface-elevated rounded-xl p-5 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <ImagePlus className="h-5 w-5 text-primary" /> Cover Image
                            </h3>

                            <div className="space-y-4">
                                {imagePreview ? (
                                    <div className="relative group rounded-lg overflow-hidden border">
                                        <img src={imagePreview} alt="Preview" className="w-full aspect-video object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('cover_image')?.click()}>
                                                Change Image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20"
                                        onClick={() => document.getElementById('cover_image')?.click()}
                                    >
                                        <ImagePlus className="h-8 w-8 text-muted-foreground mb-3" />
                                        <p className="text-sm font-medium">Click to upload cover</p>
                                        <p className="text-xs text-muted-foreground mt-1">16:9 ratio recommended (Max 5MB)</p>
                                    </div>
                                )}

                                <Input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                {errors.cover_image && <p className="text-sm text-destructive">{errors.cover_image}</p>}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
