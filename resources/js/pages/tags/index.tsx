import { Head, Link } from '@inertiajs/react';
import { Hash, BookOpen, FolderOpen, ArrowRight, TrendingUp } from 'lucide-react';

export default function TagsIndex({ tags, total }: { tags: any[]; total: number }) {
    // Split into tiers for visual hierarchy: top 3 = large, rest = normal
    const top = tags.slice(0, 3);
    const rest = tags.slice(3);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Tags — Blog" />

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="relative pt-28 pb-16 border-b overflow-hidden">
                <div className="absolute inset-0 gradient-mesh pointer-events-none" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                        <Hash className="h-3 w-3" /> Browse by Tag
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tighter">
                        All <span className="text-gradient-brand">Tags</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        {total} articles tagged across {tags.length} topics — find exactly what you're looking for.
                    </p>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {tags.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Hash className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No tags yet</p>
                    </div>
                ) : (
                    <>
                        {/* Top tags — card layout */}
                        {top.length > 0 && (
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-5">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Most Popular</h2>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-3">
                                    {top.map((tag: any, i: number) => (
                                        <Link
                                            key={tag.id}
                                            href={`/tags/${tag.slug}`}
                                            className="group relative flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6"
                                        >
                                            {/* Rank badge */}
                                            <span className="absolute top-4 right-4 text-xs font-black text-muted-foreground/30 tabular-nums">
                                                #{i + 1}
                                            </span>

                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                                                <Hash className="h-6 w-6 text-primary" />
                                            </div>

                                            <h3 className="text-xl font-black tracking-tight mb-1 group-hover:text-primary transition-colors">
                                                {tag.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {tag.blogs_count ?? 0} article{(tag.blogs_count ?? 0) !== 1 ? 's' : ''}
                                            </p>

                                            <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                Explore <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All tags — pill cloud */}
                        {rest.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-5">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">All Tags</h2>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {/* Also include top tags in the cloud */}
                                    {tags.map((tag: any) => {
                                        const size = tag.blogs_count > 10 ? 'text-base px-5 py-2.5' :
                                            tag.blogs_count > 5 ? 'text-sm px-4 py-2' : 'text-xs px-3 py-1.5';
                                        return (
                                            <Link
                                                key={tag.id}
                                                href={`/tags/${tag.slug}`}
                                                className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card font-semibold text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md ${size}`}
                                            >
                                                <Hash className="h-3 w-3 opacity-60" />
                                                {tag.name}
                                                <span className="ml-1 text-[10px] opacity-60 tabular-nums">{tag.blogs_count}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="mt-14 flex items-center justify-center gap-4 text-sm">
                    <Link href="/blogs" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <BookOpen className="h-4 w-4" /> All Posts
                    </Link>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <Link href="/categories" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <FolderOpen className="h-4 w-4" /> Browse Categories
                    </Link>
                </div>
            </section>
        </div>
    );
}
