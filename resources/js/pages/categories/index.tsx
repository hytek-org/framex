import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { FolderOpen, ArrowRight, Hash, BookOpen, ChevronRight } from 'lucide-react';

export default function CategoriesIndex({ categories, total }: { categories: any[]; total: number }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Categories — Blog" />

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="relative pt-28 pb-16 border-b overflow-hidden">
                <div className="absolute inset-0 gradient-mesh pointer-events-none" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                        <FolderOpen className="h-3 w-3" /> Browse by Topic
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tighter">
                        All <span className="text-gradient-brand">Categories</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Explore {total} articles organized across {categories.length} curated topics.
                    </p>
                </div>
            </section>

            {/* ── Grid ──────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {categories.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No categories yet</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map((cat: any, i: number) => (
                            <Link
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                className="group relative flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Color bar */}
                                <div
                                    className="h-1.5 w-full shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                />

                                <div className="flex-1 p-6">
                                    {/* Icon + count */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white text-xl font-black shadow-sm"
                                            style={{ backgroundColor: cat.color }}
                                        >
                                            {cat.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span
                                            className="text-xs font-bold px-2.5 py-1 rounded-full border"
                                            style={{ borderColor: cat.color + '40', color: cat.color, backgroundColor: cat.color + '15' }}
                                        >
                                            {cat.blogs_count ?? 0} articles
                                        </span>
                                    </div>

                                    <h2 className="text-lg font-black tracking-tight mb-1 group-hover:text-primary transition-colors">
                                        {cat.name}
                                    </h2>
                                    {cat.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {cat.description}
                                        </p>
                                    )}

                                    {/* Latest post preview */}
                                    {cat.latest_blog && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">Latest</p>
                                            <p className="text-sm font-semibold line-clamp-1 text-foreground/90">
                                                {cat.latest_blog.title}
                                            </p>
                                            {cat.latest_blog.published_at && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {format(new Date(cat.latest_blog.published_at), 'MMM d, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
                                    <code className="text-[10px] text-muted-foreground font-mono">{cat.slug}</code>
                                    <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Browse <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-14 flex items-center justify-center gap-4 text-sm">
                    <Link href="/blogs" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <BookOpen className="h-4 w-4" /> All Posts
                    </Link>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <Link href="/tags" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <Hash className="h-4 w-4" /> Browse Tags
                    </Link>
                </div>
            </section>
        </div>
    );
}
