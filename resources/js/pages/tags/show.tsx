import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, BookOpen, Hash, FolderOpen, User } from 'lucide-react';

export default function TagShow({ tag, blogs }: { tag: any; blogs: any }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title={`#${tag.name} — Tags`} />

            {/* Hero */}
            <section className="relative pt-28 pb-14 border-b overflow-hidden">
                <div className="absolute inset-0 gradient-mesh pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/tags" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="h-3.5 w-3.5" /> All Tags
                    </Link>

                    <div className="flex items-center gap-5 mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-3xl font-black shadow-sm shrink-0">
                            <Hash className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider mb-2 text-primary">
                                Tag
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">#{tag.name}</h1>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">{blogs.total}</span>
                        {blogs.total === 1 ? 'article' : 'articles'} tagged
                    </div>
                </div>
            </section>

            {/* Posts */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                {blogs.data.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No published posts with this tag yet</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {blogs.data.map((blog: any) => (
                                <Link
                                    key={blog.id}
                                    href={`/blogs/${blog.slug}`}
                                    className="group flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                                        {blog.cover_image ? (
                                            <img src={`/storage/${blog.cover_image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                <span className="font-black text-2xl text-primary/40">FrameX</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-5 flex flex-col">
                                        <h2 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                                            {blog.title}
                                        </h2>
                                        {blog.excerpt && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{blog.excerpt}</p>
                                        )}
                                        {blog.category && (
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: blog.category.color }} />
                                                <span className="text-xs font-medium text-muted-foreground">{blog.category.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t mt-auto">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {blog.user?.name}
                                            </div>
                                            <span className="h-1 w-1 rounded-full bg-border" />
                                            <span>{format(new Date(blog.published_at), 'MMM d, yyyy')}</span>
                                            <ArrowRight className="ml-auto h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {blogs.last_page > 1 && (
                            <div className="mt-12 flex justify-center gap-1.5">
                                {blogs.links.map((link: any, i: number) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${link.active ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground'} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-12 flex items-center justify-center gap-4 text-sm">
                    <Link href="/tags" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <Hash className="h-4 w-4" /> All Tags
                    </Link>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <Link href="/blogs" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <BookOpen className="h-4 w-4" /> All Posts
                    </Link>
                </div>
            </section>
        </div>
    );
}
