import { Head, Link } from '@inertiajs/react';
import { Hash, ArrowRight, BookOpen, FolderOpen } from 'lucide-react';

export default function TagsIndex({ tags, total }: { tags: any[]; total: number }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Tags — Blog" />

            {/* Hero */}
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
                        Discover {total} articles indexed across {tags.length} tags.
                    </p>
                </div>
            </section>

            {/* Grid */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {tags.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Hash className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No tags yet</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                        {tags.map((tag: any) => (
                            <Link
                                key={tag.id}
                                href={`/tags/${tag.slug}`}
                                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                            >
                                <Hash className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                                    {tag.name}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                                    {tag.blogs_count ?? 0}
                                </span>
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
                    <Link href="/categories" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <FolderOpen className="h-4 w-4" /> Browse Categories
                    </Link>
                </div>
            </section>
        </div>
    );
}
