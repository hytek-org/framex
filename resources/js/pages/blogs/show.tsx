import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Share2, ArrowRight, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogShow({ blog, related }: { blog: any; related: any[] }) {
    const share = () => {
        if (navigator.share) {
            navigator.share({ title: blog.title, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title={`${blog.title} — FrameX Blog`} />

            <article>
                {/* Hero */}
                <div className="relative pt-24 pb-12 border-b overflow-hidden">
                    <div className="absolute inset-0 gradient-mesh pointer-events-none" />
                    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-8 text-muted-foreground hover:text-foreground">
                            <Link href="/blogs">
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> All Posts
                            </Link>
                        </Button>

                        {/* Category badge */}
                        {blog.category && (
                            <div className="mb-4 animate-fade-in-up">
                                <Link
                                    href={`/blogs?category=${blog.category.slug}`}
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border"
                                    style={{ borderColor: blog.category.color + '40', color: blog.category.color, backgroundColor: blog.category.color + '15' }}
                                >
                                    <FolderOpen className="h-2.5 w-2.5" />
                                    {blog.category.name}
                                </Link>
                            </div>
                        )}

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-5 animate-fade-in-up stagger-1">
                            {blog.title}
                        </h1>

                        {blog.excerpt && (
                            <p className="text-xl text-muted-foreground leading-relaxed mb-6 animate-fade-in-up stagger-2">
                                {blog.excerpt}
                            </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-4 animate-fade-in-up stagger-3">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-black text-sm border-2 border-primary/20">
                                    {blog.user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold leading-none">{blog.user?.name ?? 'Author'}</p>
                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <time>{format(new Date(blog.published_at), 'MMMM d, yyyy')}</time>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            {blog.tags?.length > 0 && (
                                <>
                                    <span className="h-4 w-px bg-border mx-2" />
                                    <div className="flex flex-wrap gap-1.5">
                                        {blog.tags.map((t: any) => (
                                            <Link
                                                key={t.id}
                                                href={`/blogs?tag=${t.slug}`}
                                                className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                                            >
                                                #{t.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}

                            <Button variant="outline" size="sm" className="ml-auto rounded-full" onClick={share}>
                                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                {blog.cover_image && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-0">
                        <div className="rounded-2xl overflow-hidden border shadow-xl mt-8 animate-fade-in-up stagger-3">
                            <img
                                src={`/storage/${blog.cover_image}`}
                                alt={blog.title}
                                className="w-full max-h-[520px] object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none
                            prose-headings:font-black prose-headings:tracking-tight
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-2xl prose-img:shadow-lg
                            prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                            prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm
                            prose-pre:rounded-xl prose-pre:border"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>

                {/* Author Card */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="rounded-2xl border bg-card/60 p-6 flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-black text-xl border-2 border-primary/20 shrink-0">
                            {blog.user?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Written by</p>
                            <p className="font-bold">{blog.user?.name}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{blog.user?.email}</p>
                        </div>
                        <div className="ml-auto">
                            <Button variant="outline" size="sm" onClick={share} className="rounded-full">
                                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share Post
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {related?.length > 0 && (
                    <div className="border-t bg-muted/30">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                            <h3 className="text-2xl font-black tracking-tight mb-8">Related Posts</h3>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {related.map((rel: any) => (
                                    <Link
                                        key={rel.id}
                                        href={`/blogs/${rel.slug}`}
                                        className="group flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        <div className="aspect-video overflow-hidden bg-muted">
                                            {rel.cover_image
                                                ? <img src={`/storage/${rel.cover_image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                                : <div className="w-full h-full bg-linear-to-br from-primary/15 to-primary/5" />
                                            }
                                        </div>
                                        <div className="p-4 flex-1">
                                            <h4 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors">{rel.title}</h4>
                                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                                <span>{format(new Date(rel.published_at), 'MMM d, yyyy')}</span>
                                                <ArrowRight className="ml-auto h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}
