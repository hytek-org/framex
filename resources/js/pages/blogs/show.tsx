import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock3,
    Share2,
} from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';



type BlogCategory = {
    name: string;
    slug: string;
};

type BlogTag = {
    id: number | string;
    name: string;
    slug: string;
};

type BlogAuthor = {
    name?: string | null;
};

type BlogPost = {
    id: number | string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    cover_image?: string | null;
    published_at?: string | null;
    user?: BlogAuthor | null;
    category?: BlogCategory | null;
    tags?: BlogTag[];
};

type RelatedPost = {
    id: number | string;
    title: string;
    slug: string;
    cover_image?: string | null;
    published_at?: string | null;
};

type BlogShowProps = {
    blog: BlogPost;
    related?: RelatedPost[];
};

/**
 * Blog HTML is treated as untrusted input. Keep this allow-list intentionally
 * narrow: no scripts, inline styles, event handlers, embeds, forms, or SVG.
 * Sanitize on the server before persistence/rendering as well; this is the
 * client-side defence-in-depth boundary before dangerouslySetInnerHTML.
 */
const BLOG_ALLOWED_TAGS = [
    'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col',
    'colgroup', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em', 'figcaption',
    'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins',
    'kbd', 'li', 'mark', 'ol', 'p', 'pre', 's', 'samp', 'small', 'span',
    'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
    'thead', 'tr', 'u', 'ul', 'var',
];

const BLOG_ALLOWED_ATTRIBUTES = [
    'alt', 'cite', 'colspan', 'datetime', 'height', 'href', 'lang', 'open',
    'rowspan', 'scope', 'src', 'start', 'title', 'width',
];

function sanitizeBlogHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: BLOG_ALLOWED_TAGS,
        ALLOWED_ATTR: BLOG_ALLOWED_ATTRIBUTES,
        FORBID_TAGS: ['iframe', 'object', 'embed', 'form', 'input', 'button', 'script', 'style', 'svg', 'math'],
        FORBID_ATTR: ['style', 'class', 'srcset', 'target'],
        ALLOW_DATA_ATTR: false,
        RETURN_TRUSTED_TYPE: false,
    }) as string;
}

function formatPublishedDate(value?: string | null, pattern = 'MMMM d, yyyy'): string | null {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return format(date, pattern);
}

function getReadingTime(html: string): number {
    const plainText = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const wordCount = plainText ? plainText.split(' ').length : 0;
    return Math.max(1, Math.ceil(wordCount / 220));
}

function getInitial(name?: string | null): string {
    return name?.trim().charAt(0).toUpperCase() || 'A';
}

export default function BlogShow({ blog, related = [] }: BlogShowProps) {
    const [shareFeedback, setShareFeedback] = useState('');

    const safeContent = useMemo(
        () => sanitizeBlogHtml(blog.content ?? ''),
        [blog.content],
    );
    const readingTime = useMemo(() => getReadingTime(safeContent), [safeContent]);
    const publishedDate = formatPublishedDate(blog.published_at);
    const authorName = blog.user?.name?.trim() || 'FrameX Editorial Team';

    const sharePost = async () => {
        const url = window.location.href;

        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({ title: blog.title, url });
                setShareFeedback('');
                return;
            } catch (error) {
                // A user closing the native share sheet is not an error.
                if (error instanceof DOMException && error.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            setShareFeedback('Link copied to clipboard');
        } catch {
            setShareFeedback('Sharing is unavailable in this browser');
        }
    };

    return (
        <div className="blog-page min-h-screen bg-background text-foreground">
            <Head title={`${blog.title} — FrameX Blog`}>
                {blog.excerpt ? <meta name="description" content={blog.excerpt} /> : null}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={blog.title} />
                {blog.excerpt ? <meta property="og:description" content={blog.excerpt} /> : null}
            </Head>

            <article>
                {/* Article introduction */}
                <header className="border-b border-border/70">
                    <div className="mx-auto max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10 lg:px-10">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="mb-10 -ml-3 mt-12 rounded-full px-3 text-muted-foreground hover:text-foreground"
                        >
                            <Link href="/blogs">
                                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                                All articles
                            </Link>
                        </Button>

                        <div className="mx-auto max-w-[850px]">
                            {blog.category ? (
                                <div className="mb-5">
                                    <Link
                                        href={`/blogs?category=${encodeURIComponent(blog.category.slug)}`}
                                        className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                                            {blog.category.name}
                                        </Badge>
                                    </Link>
                                </div>
                            ) : null}

                            <h1 className="max-w-[820px] text-[2.35rem] font-medium leading-[1.12] tracking-[-0.045em] text-foreground sm:text-5xl sm:leading-[1.08] lg:text-[3.5rem]">
                                {blog.title}
                            </h1>

                            {blog.excerpt ? (
                                <p className="mt-6 max-w-[720px] text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                                    {blog.excerpt}
                                </p>
                            ) : null}

                            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                                            {getInitial(authorName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="leading-tight">
                                        <p className="text-sm font-medium text-foreground">{authorName}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            {publishedDate ? (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                                                    <time dateTime={blog.published_at ?? undefined}>{publishedDate}</time>
                                                </span>
                                            ) : null}
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                                                {readingTime} min read
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {blog.tags?.length ? (
                                    <>
                                        <Separator orientation="vertical" className="hidden h-8 sm:block" />
                                        <div className="flex flex-wrap gap-2" aria-label="Article tags">
                                            {blog.tags.map((tag) => (
                                                <Link key={tag.id} href={`/blogs?tag=${encodeURIComponent(tag.slug)}`}>
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full px-2.5 py-1 text-xs font-normal text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : null}

                                <div className="ml-auto flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={sharePost}
                                        className="rounded-full px-4"
                                    >
                                        <Share2 className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                                        Share
                                    </Button>
                                    <span className="sr-only" role="status" aria-live="polite">
                                        {shareFeedback}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Cover image */}
                {blog.cover_image ? (
                    <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10 lg:px-10">
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted sm:rounded-3xl">
                            <img
                                src={`/storage/${blog.cover_image}`}
                                alt={blog.title}
                                className="aspect-[16/9] max-h-[620px] w-full object-cover"
                                loading="eager"
                                decoding="async"
                            />
                        </div>
                    </div>
                ) : null}

                {/* Long-form article body */}
                <div className="mx-auto max-w-[820px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
                    <div
                        className="blog-rich-content"
                        dangerouslySetInnerHTML={{ __html: safeContent }}
                    />
                </div>

                {/* Author and share */}
                <div className="mx-auto max-w-[820px] px-5 pb-14 sm:px-8 lg:px-10">
                    <Separator className="mb-8" />
                    <Card className="rounded-2xl border-border/70 bg-card shadow-none">
                        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                            <Avatar className="h-12 w-12 border border-border">
                                <AvatarFallback className="bg-muted font-semibold text-foreground">
                                    {getInitial(authorName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                    Written by
                                </p>
                                <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
                                    {authorName}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    More insights and updates from the FrameX team.
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={sharePost} className="shrink-0 rounded-full">
                                <Share2 className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                                Share article
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Related articles */}
                {related.length > 0 ? (
                    <section className="border-t border-border/70 bg-muted/25" aria-labelledby="related-articles-title">
                        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
                            <div className="mb-8 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                        Keep exploring
                                    </p>
                                    <h2 id="related-articles-title" className="mt-2 text-2xl font-medium tracking-[-0.035em] text-foreground sm:text-3xl">
                                        Related articles
                                    </h2>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="shrink-0 rounded-full text-muted-foreground">
                                    <Link href="/blogs">
                                        View all <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {related.map((post) => {
                                    const relatedDate = formatPublishedDate(post.published_at, 'MMM d, yyyy');

                                    return (
                                        <Link
                                            key={post.id}
                                            href={`/blogs/${post.slug}`}
                                            className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
                                        >
                                            <Card className="h-full overflow-hidden rounded-2xl border-border/70 bg-card p-0 shadow-none transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-border group-hover:shadow-md">
                                                <div className="aspect-[16/9] overflow-hidden bg-muted">
                                                    {post.cover_image ? (
                                                        <img
                                                            src={`/storage/${post.cover_image}`}
                                                            alt=""
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gradient-to-br from-muted to-background" />
                                                    )}
                                                </div>
                                                <CardContent className="flex min-h-[132px] flex-col p-5">
                                                    <h3 className="line-clamp-2 text-base font-semibold leading-6 tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary">
                                                        {post.title}
                                                    </h3>
                                                    <div className="mt-auto flex items-center pt-4 text-xs text-muted-foreground">
                                                        {relatedDate ?? 'Read article'}
                                                        <ArrowRight className="ml-auto h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                ) : null}
            </article>
        </div>
    );
}
