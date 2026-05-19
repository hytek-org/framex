import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, BookOpen, FolderOpen, Hash, User } from 'lucide-react';

export default function TagShow({ tag, blogs }: { tag: any; blogs: any }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title={`#${tag.name} — Tags`} />

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="relative pt-28 pb-14 border-b overflow-hidden">
                <div className="absolute inset-0 gradient-mesh pointer-events-none" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/tags" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="h-3.5 w-3.5" /> All Tags
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                            <Hash className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                                <Hash className="h-2.5 w-2.5" /> Tag
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">#{tag.name}</h1>
                        </div>
                    </div>

                    <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">{blogs.total}</span>{' '}
                        {blogs.total === 1 ? 'article' : 'articles'} tagged with <code className="font-mono text-sm">#{tag.slug}</code>
                    </p>
                </div>
            </section>

            {/* ── Posts ─────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                {blogs.data.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No published posts yet</p>
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
                                    <div className="aspect-video w-full overflow-hidden bg-muted">
                                        {blog.cover_image ? (
                                            <img src={`/storage/${blog.cover_image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                                                <span className="text-primary/25 font-black text-2xl">FrameX</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-5 flex flex-col">
                                        {/* Category badge */}
                                        {blog.category && (
                                            <Link
                                                href={`/categories/${blog.category.slug}`}
                                                onClick={e => e.stopPropagation()}
                                                className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1 w-fit"
                                                style={{ color: blog.category.color }}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: blog.category.color }} />
                                                {blog.category.name}
                                            </Link>
                                        )}

                                        <h2 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                                            {blog.title}
                                        </h2>
                                        {blog.excerpt && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{blog.excerpt}</p>
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
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <Link href="/categories" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <FolderOpen className="h-4 w-4" /> Categories
                    </Link>
                </div>
            </section>
        </div>
    );
}
