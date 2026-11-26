import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, isValid } from 'date-fns';
import {
    ArrowRight,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    FileText,
    FolderOpen,
    Hash,
    SearchX,
    X,
} from 'lucide-react';

interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    color?: string | null;
    blogs_count?: number;
}

interface BlogTag {
    id: number;
    name: string;
    slug: string;
    blogs_count?: number;
}

interface BlogAuthor {
    id?: number;
    name?: string | null;
}

interface BlogItem {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    cover_image?: string | null;
    published_at?: string | null;
    created_at?: string | null;
    user?: BlogAuthor | null;
    category?: BlogCategory | null;
    tags?: BlogTag[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedBlogs {
    data: BlogItem[];
    total: number;
    current_page: number;
    last_page: number;
    links: PaginationLink[];
}

interface BlogsIndexProps {
    blogs: PaginatedBlogs;
    categories: BlogCategory[];
    tags: BlogTag[];
}

function formatPublishedDate(value?: string | null): string {
    if (!value) return 'Recently published';

    const date = new Date(value);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Recently published';
}

function paginationLabel(label: string): string {
    return label
        .replace(/<[^>]*>/g, '')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&')
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();
}

function AuthorMeta({ blog, featured = false }: { blog: BlogItem; featured?: boolean }) {
    const authorName = blog.user?.name?.trim() || 'FrameX Team';
    const initial = authorName.charAt(0).toUpperCase();

    return (
        <div className="flex min-w-0 items-center gap-2.5 text-sm text-muted-foreground">
            <span
                className={`flex shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted font-medium text-foreground ${featured ? 'size-8 text-xs' : 'size-7 text-[11px]'}`}
                aria-hidden="true"
            >
                {initial}
            </span>
            <span className="truncate font-medium text-foreground">{authorName}</span>
            <span className="size-1 shrink-0 rounded-full bg-border" aria-hidden="true" />
            <time className="shrink-0" dateTime={blog.published_at || blog.created_at || undefined}>
                {formatPublishedDate(blog.published_at || blog.created_at)}
            </time>
        </div>
    );
}

function CoverPlaceholder({ featured = false }: { featured?: boolean }) {
    return (
        <div className="flex size-full min-h-40 items-center justify-center bg-muted/70">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/70">
                <FileText className={featured ? 'size-10' : 'size-8'} strokeWidth={1.4} />
                <span className="text-xs font-medium tracking-wide">FRAMEX</span>
            </div>
        </div>
    );
}

export default function BlogsIndex({ blogs, categories, tags }: BlogsIndexProps) {
    const { url } = usePage();
    const query = url.includes('?') ? url.slice(url.indexOf('?') + 1).split('#')[0] : '';
    const params = new URLSearchParams(query);
    const activeCategory = params.get('category') ?? '';
    const activeTag = params.get('tag') ?? '';

    const activeCategoryName = categories.find((category) => category.slug === activeCategory)?.name;
    const activeTagName = tags.find((tag) => tag.slug === activeTag)?.name;
    const hasActiveFilters = Boolean(activeCategory || activeTag);
    const showFeatured = !hasActiveFilters && blogs.current_page === 1 && blogs.data.length > 0;
    const featuredBlog = showFeatured ? blogs.data[0] : null;
    const gridBlogs = showFeatured ? blogs.data.slice(1) : blogs.data;

    const navigate = (category?: string, tag?: string) => {
        const filters: Record<string, string> = {};
        if (category) filters.category = category;
        if (tag) filters.tag = tag;

        router.get('/blogs', filters, {
            preserveState: true,
            preserveScroll: false,
            replace: true,
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="FrameX Blog — Insights & Ideas" />

            {/* Editorial introduction */}
            <section className="relative overflow-hidden border-b border-border/70 pt-28 sm:pt-32">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(26,115,232,0.075),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(138,180,248,0.09),transparent_68%)]"
                />
                <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-14 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm shadow-black/[0.02]">
                            <Hash className="size-3.5 text-primary" />
                            Ideas from FrameX
                        </div>
                        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">
                            Insights, ideas and <span className="text-muted-foreground">what&apos;s next.</span>
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                            Practical guides, product updates and thoughtful perspectives on building better digital experiences with FrameX.
                        </p>
                        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                            <span><strong className="font-semibold tabular-nums text-foreground">{blogs.total}</strong> articles</span>
                            <span className="hidden size-1 rounded-full bg-border sm:block" aria-hidden="true" />
                            <span><strong className="font-semibold tabular-nums text-foreground">{categories.length}</strong> categories</span>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
                <div className="grid gap-9 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-12">
                    {/* Browse and filter navigation */}
                    <aside className="min-w-0 space-y-7 lg:sticky lg:top-24 lg:self-start">
                        <section aria-labelledby="category-filter-heading" className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 id="category-filter-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Browse topics
                                </h2>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={() => navigate()}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <X className="size-3" /> Clear
                                    </button>
                                )}
                            </div>
                            <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0" aria-label="Blog categories">
                                <button
                                    type="button"
                                    aria-pressed={!activeCategory}
                                    onClick={() => navigate(undefined, activeTag || undefined)}
                                    className={`flex shrink-0 items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full ${!activeCategory ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                >
                                    <span className="flex items-center gap-2.5"><FolderOpen className="size-4" /> All articles</span>
                                    <span className="text-xs tabular-nums opacity-75">{blogs.total}</span>
                                </button>
                                {categories.map((category) => {
                                    const isActive = activeCategory === category.slug;
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            aria-pressed={isActive}
                                            onClick={() => navigate(category.slug, activeTag || undefined)}
                                            className={`flex shrink-0 items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full ${isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                        >
                                            <span className="flex min-w-0 items-center gap-2.5">
                                                <span
                                                    className="size-2.5 shrink-0 rounded-full ring-2 ring-background"
                                                    style={{ backgroundColor: category.color || 'var(--primary)' }}
                                                    aria-hidden="true"
                                                />
                                                <span className="truncate">{category.name}</span>
                                            </span>
                                            <span className="text-xs tabular-nums text-muted-foreground">{category.blogs_count ?? 0}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </section>

                        {tags.length > 0 && (
                            <section aria-labelledby="tag-filter-heading" className="space-y-3 border-t border-border/70 pt-6">
                                <h2 id="tag-filter-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Popular tags
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {tags.filter((tag) => (tag.blogs_count ?? 0) > 0).map((tag) => {
                                        const isActive = activeTag === tag.slug;
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                aria-pressed={isActive}
                                                onClick={() => navigate(activeCategory || undefined, isActive ? undefined : tag.slug)}
                                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
                                            >
                                                #{tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <div className="hidden rounded-xl border border-border/70 bg-muted/30 p-4 lg:block">
                            <p className="text-sm font-semibold">Stay curious.</p>
                            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                Explore product notes, engineering ideas and practical ways to get more from FrameX.
                            </p>
                        </div>
                    </aside>

                    {/* Articles */}
                    <section className="min-w-0" aria-label="Blog articles">
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                    {hasActiveFilters ? 'Filtered collection' : 'The journal'}
                                </p>
                                <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                                    {activeCategoryName || activeTagName || 'Latest articles'}
                                </h2>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium tabular-nums text-foreground">{blogs.total}</span> {blogs.total === 1 ? 'result' : 'results'}
                            </p>
                        </div>

                        {hasActiveFilters && (
                            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>Showing:</span>
                                {activeCategoryName && <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">{activeCategoryName}</span>}
                                {activeTagName && <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">#{activeTagName}</span>}
                                <button type="button" onClick={() => navigate()} className="font-medium text-primary hover:underline">Reset filters</button>
                            </div>
                        )}

                        {blogs.data.length === 0 ? (
                            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
                                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                    <SearchX className="size-5" />
                                </div>
                                <h3 className="text-base font-semibold">No articles found</h3>
                                <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                                    There are no articles matching these filters. Try another topic or clear your selection.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate()}
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    View all articles <ArrowRight className="size-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                {featuredBlog && (
                                    <Link
                                        href={`/blogs/${featuredBlog.slug}`}
                                        className="group mb-8 grid overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:grid-cols-[1.02fr_0.98fr]"
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto md:min-h-[330px]">
                                            {featuredBlog.cover_image ? (
                                                <img
                                                    src={`/storage/${featuredBlog.cover_image}`}
                                                    alt={featuredBlog.title}
                                                    className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                                                    fetchPriority="high"
                                                />
                                            ) : <CoverPlaceholder featured />}
                                            <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                                                Featured
                                            </div>
                                        </div>
                                        <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-9">
                                            {featuredBlog.category && (
                                                <span className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                                                    <span className="size-2 rounded-full" style={{ backgroundColor: featuredBlog.category.color || 'var(--primary)' }} />
                                                    {featuredBlog.category.name}
                                                </span>
                                            )}
                                            <h3 className="text-2xl font-semibold leading-tight tracking-[-0.035em] text-foreground transition-colors group-hover:text-primary sm:text-3xl lg:text-[2.1rem]">
                                                {featuredBlog.title}
                                            </h3>
                                            {featuredBlog.excerpt && (
                                                <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground sm:text-base">
                                                    {featuredBlog.excerpt}
                                                </p>
                                            )}
                                            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                                                <AuthorMeta blog={featuredBlog} featured />
                                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3">
                                                    Read article <ArrowUpRight className="size-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {gridBlogs.length > 0 && (
                                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                        {gridBlogs.map((blog) => (
                                            <Link
                                                href={`/blogs/${blog.slug}`}
                                                key={blog.id}
                                                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                                                    {blog.cover_image ? (
                                                        <img
                                                            src={`/storage/${blog.cover_image}`}
                                                            alt={blog.title}
                                                            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                                                            loading="lazy"
                                                        />
                                                    ) : <CoverPlaceholder />}
                                                </div>
                                                <div className="flex flex-1 flex-col p-4 sm:p-5">
                                                    {blog.category && (
                                                        <span className="mb-2.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                                                            <span className="size-1.5 rounded-full" style={{ backgroundColor: blog.category.color || 'var(--primary)' }} />
                                                            {blog.category.name}
                                                        </span>
                                                    )}
                                                    <h3 className="line-clamp-2 text-base font-semibold leading-6 tracking-tight text-foreground transition-colors group-hover:text-primary">
                                                        {blog.title}
                                                    </h3>
                                                    {blog.excerpt && (
                                                        <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">
                                                            {blog.excerpt}
                                                        </p>
                                                    )}
                                                    {blog.tags && blog.tags.length > 0 && (
                                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                                            {blog.tags.slice(0, 2).map((tag) => (
                                                                <span key={tag.id} className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                                                                    #{tag.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-3.5">
                                                        <AuthorMeta blog={blog} />
                                                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {blogs.last_page > 1 && (
                                    <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5 border-t border-border/70 pt-7" aria-label="Blog pagination">
                                        {blogs.links.map((link, index) => {
                                            const label = paginationLabel(link.label);
                                            const isPrevious = /previous|«/i.test(label);
                                            const isNext = /next|»/i.test(label);
                                            const isDisabled = !link.url;

                                            return (
                                                <button
                                                    key={`${label}-${index}`}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    aria-current={link.active ? 'page' : undefined}
                                                    aria-label={isPrevious ? 'Previous page' : isNext ? 'Next page' : `Page ${label}`}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                                    className={`inline-flex min-w-9 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${link.active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'} ${isDisabled ? 'cursor-not-allowed opacity-40' : ''}`}
                                                >
                                                    {isPrevious && <ChevronLeft className="size-4" />}
                                                    {!isPrevious && !isNext ? label : null}
                                                    {isNext && <ChevronRight className="size-4" />}
                                                </button>
                                            );
                                        })}
                                    </nav>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
