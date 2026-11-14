import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowRight, User, Hash, FolderOpen, Clock, Search } from 'lucide-react';
import { useState } from 'react';

export default function BlogsIndex({ blogs, categories, tags }: { blogs: any; categories: any[]; tags: any[] }) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const activeCategory = params.get('category') ?? '';
    const activeTag = params.get('tag') ?? '';

    const navigate = (cat?: string, tag?: string) => {
        const q: Record<string, string> = {};
        if (cat) q.category = cat;
        if (tag) q.tag = tag;
        router.get('/blogs', q, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Blog — Insights & Ideas" />

            {/* Hero */}
            <section className="relative pt-24 pb-16 overflow-hidden border-b">
                <div className="absolute inset-0 gradient-mesh pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary animate-fade-in-up">
                        <Hash className="h-3 w-3" /> Expert Insights
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter animate-fade-in-up stagger-1">
                        Our <span className="text-gradient-brand">Blog</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in-up stagger-2">
                        Discover strategies, ideas, and deep insights to power your enterprise.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground animate-fade-in-up stagger-3">
                        <span className="font-semibold text-foreground tabular-nums">{blogs.total}</span> articles
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="font-semibold text-foreground tabular-nums">{categories.length}</span> categories
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-8">

                        {/* Categories */}
                        {categories.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => navigate()}
                                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-between group ${!activeCategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <FolderOpen className="h-3.5 w-3.5 opacity-60" />
                                            All Posts
                                        </span>
                                        <span className={`text-xs tabular-nums ${!activeCategory ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {blogs.total}
                                        </span>
                                    </button>
                                    {categories.map((cat: any) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => navigate(cat.slug)}
                                            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-between ${activeCategory === cat.slug ? 'font-medium' : 'hover:bg-muted text-foreground'}`}
                                            style={activeCategory === cat.slug ? { backgroundColor: cat.color + '20', color: cat.color } : {}}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                                {cat.name}
                                            </span>
                                            <span className="text-xs tabular-nums text-muted-foreground">{cat.blogs_count}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Popular Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.filter((t: any) => t.blogs_count > 0).map((tag: any) => (
                                        <button
                                            key={tag.id}
                                            onClick={() => navigate(activeCategory || undefined, activeTag === tag.slug ? undefined : tag.slug)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeTag === tag.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40 hover:bg-muted'}`}
                                        >
                                            #{tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Posts Grid */}
                    <div className="flex-1 min-w-0">
                        {blogs.data.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed p-20 text-center">
                                <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-lg font-semibold">No posts found</p>
                                <p className="text-sm text-muted-foreground mt-1">Try a different filter or category</p>
                                <button onClick={() => navigate()} className="mt-4 text-sm text-primary hover:underline">Clear filters</button>
                            </div>
                        ) : (
                            <>
                                {/* Featured (first post) */}
                                {!activeCategory && !activeTag && blogs.current_page === 1 && (
                                    <Link
                                        href={`/blogs/${blogs.data[0].slug}`}
                                        className="group flex flex-col sm:flex-row gap-0 rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 mb-8 hover:-translate-y-0.5"
                                    >
                                        <div className="sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden bg-muted">
                                            {blogs.data[0].cover_image
                                                ? <img src={`/storage/${blogs.data[0].cover_image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                                : <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center min-h-[200px]">
                                                    <span className="text-primary/30 font-black text-5xl">FrameX</span>
                                                </div>
                                            }
                                        </div>
                                        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                                            {blogs.data[0].category && (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-3"
                                                    style={{ color: blogs.data[0].category.color }}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: blogs.data[0].category.color }} />
                                                    {blogs.data[0].category.name}
                                                </span>
                                            )}
                                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-3">
                                                {blogs.data[0].title}
                                            </h2>
                                            {blogs.data[0].excerpt && (
                                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{blogs.data[0].excerpt}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                                                        {blogs.data[0].user?.name?.charAt(0)}
                                                    </div>
                                                    {blogs.data[0].user?.name}
                                                </div>
                                                <span className="h-1 w-1 rounded-full bg-border" />
                                                <span>{format(new Date(blogs.data[0].published_at), 'MMM d, yyyy')}</span>
                                                <span className="ml-auto flex items-center gap-1 font-semibold text-primary group-hover:gap-2 transition-all">
                                                    Read <ArrowRight className="h-3.5 w-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Grid */}
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {blogs.data.slice(!activeCategory && !activeTag && blogs.current_page === 1 ? 1 : 0).map((blog: any) => (
                                        <Link
                                            href={`/blogs/${blog.slug}`}
                                            key={blog.id}
                                            className="group flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            <div className="aspect-video w-full overflow-hidden bg-muted">
                                                {blog.cover_image
                                                    ? <img src={`/storage/${blog.cover_image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                                    : <div className="w-full h-full bg-linear-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                                                        <span className="text-primary/25 font-black text-2xl">FrameX</span>
                                                    </div>
                                                }
                                            </div>
                                            <div className="flex-1 p-5 flex flex-col">
                                                {blog.category && (
                                                    <span className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: blog.category.color }}>
                                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: blog.category.color }} />
                                                        {blog.category.name}
                                                    </span>
                                                )}
                                                <h2 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                                                    {blog.title}
                                                </h2>
                                                {blog.excerpt && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{blog.excerpt}</p>
                                                )}
                                                {blog.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {blog.tags.slice(0, 3).map((t: any) => (
                                                            <span key={t.id} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">#{t.name}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t mt-auto">
                                                    <span>{blog.user?.name}</span>
                                                    <span className="h-1 w-1 rounded-full bg-border" />
                                                    <span>{format(new Date(blog.published_at), 'MMM d')}</span>
                                                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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
                    </div>
                </div>
            </div>
        </div>
    );
}
