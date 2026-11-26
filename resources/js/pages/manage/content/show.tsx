import React, { useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, isValid } from 'date-fns';
import DOMPurify from 'isomorphic-dompurify';
import {
    ArrowLeft,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    FileText,
    Globe2,
    Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge';
import type { ContentStatusValue } from '@/components/content/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ContentShowProps {
    content: {
        id: number;
        title: string;
        slug: string;
        excerpt?: string | null;
        status: ContentStatusValue;
        cover_image?: string | null;
        published_at?: string | null;
        updated_at: string;
        content_type?: { id: number; name: string; slug: string } | null;
        category?: { id: number; name: string; slug: string; color?: string | null } | null;
        tags?: Array<{ id: number; name: string; slug: string }>;
        author?: { id: number; name: string; email?: string } | null;
        current_revision?: {
            id: number;
            body_html?: string | null;
            change_summary?: string | null;
        } | null;
        seo_metadata?: {
            meta_title?: string | null;
            meta_description?: string | null;
            canonical_url?: string | null;
        } | null;
    };
}

function formatDate(value?: string | null): string | null {
    if (!value) return null;
    const date = new Date(value);
    return isValid(date) ? format(date, 'MMMM d, yyyy') : null;
}

export default function ContentShow({ content }: ContentShowProps) {
    const { currentTeam } = usePage().props as {
        currentTeam?: { slug: string } | null;
    };
    const teamPath = currentTeam?.slug ? `/${currentTeam.slug}` : '';
    const [transitioningTo, setTransitioningTo] = useState<ContentStatusValue | null>(null);

    // Content types are intentionally generic: this view can display posts, pages,
    // documentation, campaign content, or any future ContentType using the same schema.
    const bodyHtml = useMemo(
        () => DOMPurify.sanitize(content.current_revision?.body_html || '', {
            USE_PROFILES: { html: true },
        }),
        [content.current_revision?.body_html],
    );

    const handleStatusChange = (status: ContentStatusValue) => {
        if (transitioningTo) return;

        setTransitioningTo(status);
        router.post(
            `${teamPath}/content/${content.slug}/transition`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Content status changed to ${status.replace(/_/g, ' ')}.`),
                onError: () => toast.error('Unable to update the content status.'),
                onFinish: () => setTransitioningTo(null),
            },
        );
    };

    const publishedDate = formatDate(content.published_at);
    const updatedDate = formatDate(content.updated_at);
    const displayTitle = content.seo_metadata?.meta_title || content.title;
    const displayDescription = content.seo_metadata?.meta_description || content.excerpt;

    return (
        <>
            <Head title={`${content.title} — Content Studio`}>
                {content.seo_metadata?.canonical_url && (
                    <link rel="canonical" href={content.seo_metadata.canonical_url} />
                )}
                {displayDescription && <meta head-key="description" name="description" content={displayDescription} />}
                <meta property="og:title" content={displayTitle} />
                {displayDescription && <meta property="og:description" content={displayDescription} />}
                {content.cover_image && <meta property="og:image" content={content.cover_image} />}
            </Head>

            <div className="min-h-full flex-1 bg-background text-foreground">
                {/* Editorial action bar */}
                <div className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                            <Link href={`${teamPath}/content`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Content Studio
                            </Link>
                        </Button>

                        <div className="flex flex-wrap items-center gap-2">
                            <ContentStatusBadge status={content.status} />
                            {content.status === 'published' ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChange('draft')}
                                    disabled={transitioningTo !== null}
                                >
                                    {transitioningTo === 'draft' ? 'Updating…' : 'Move to draft'}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChange('published')}
                                    disabled={transitioningTo !== null}
                                >
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    {transitioningTo === 'published' ? 'Publishing…' : 'Publish'}
                                </Button>
                            )}
                            <Button size="sm" asChild>
                                <Link href={`${teamPath}/content/${content.slug}/edit`}>
                                    <Edit3 className="mr-1.5 h-4 w-4" />
                                    Edit content
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <main className="px-4 pb-20 pt-9 sm:px-6 sm:pt-12 lg:px-8">
                    <article className="mx-auto max-w-5xl">
                        {/* Content identity and hero */}
                        <header className="mx-auto max-w-4xl">
                            <div className="mb-5 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium">
                                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                                    {content.content_type?.name || 'Content'}
                                </Badge>
                                {content.category && (
                                    <Badge variant="outline" className="rounded-full px-3 py-1 font-medium">
                                        <span
                                            className="mr-2 h-2 w-2 rounded-full"
                                            style={{ backgroundColor: content.category.color || 'currentColor' }}
                                        />
                                        {content.category.name}
                                    </Badge>
                                )}
                            </div>

                            <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[3.5rem]">
                                {content.title}
                            </h1>

                            {content.excerpt && (
                                <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                                    {content.excerpt}
                                </p>
                            )}

                            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border/70 py-4 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                        {(content.author?.name || 'A').trim().charAt(0).toUpperCase()}
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {content.author?.name || 'Unknown author'}
                                    </span>
                                </span>
                                {publishedDate && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays className="h-4 w-4" />
                                        Published {publishedDate}
                                    </span>
                                )}
                                {updatedDate && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock3 className="h-4 w-4" />
                                        Updated {updatedDate}
                                    </span>
                                )}
                            </div>
                        </header>

                        {/* Cover artwork */}
                        {content.cover_image && (
                            <figure className="mt-9 overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-sm sm:mt-12">
                                <img
                                    src={content.cover_image}
                                    alt={content.title}
                                    className="max-h-[560px] w-full object-cover"
                                    loading="eager"
                                />
                            </figure>
                        )}

                        {/* Main rich content: sanitized HTML, shared across every content type */}
                        <div className="mx-auto mt-10 max-w-3xl sm:mt-14">
                            {bodyHtml ? (
                                <div
                                    className="content-studio-article prose prose-neutral max-w-none text-[1rem] leading-8 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-h1:text-3xl prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-9 prose-h3:text-xl prose-p:my-6 prose-p:leading-8 prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-4 prose-strong:font-semibold prose-strong:text-foreground prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:not-italic prose-img:rounded-xl prose-img:border prose-img:border-border/60 prose-img:shadow-sm prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted prose-pre:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-li:my-1 dark:prose-invert sm:text-[1.0625rem]"
                                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                                />
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                                    <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
                                    <p className="mt-3 text-sm font-medium text-foreground">No content has been added yet</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Add content in the editor to see the full preview here.
                                    </p>
                                    <Button variant="outline" size="sm" asChild className="mt-5">
                                        <Link href={`${teamPath}/content/${content.slug}/edit`}>Open editor</Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {content.tags && content.tags.length > 0 && (
                            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center gap-2 border-t border-border/70 pt-6">
                                <Hash className="mr-1 h-4 w-4 text-muted-foreground" />
                                {content.tags.map((tag) => (
                                    <Badge key={tag.id} variant="secondary" className="rounded-full px-3 py-1 font-normal">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Supporting information */}
                        <footer className="mx-auto mt-12 grid max-w-3xl gap-4 border-t border-border/70 pt-7 sm:grid-cols-2">
                            <div className="rounded-xl border border-border/70 bg-card p-4">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Globe2 className="h-4 w-4" /> Content address
                                </div>
                                <p className="mt-2 break-all font-mono text-xs text-foreground">/{content.slug}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {content.content_type?.name || 'Content'} · ID {content.id}
                                </p>
                            </div>

                            {content.seo_metadata && (
                                <div className="rounded-xl border border-border/70 bg-card p-4">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <Globe2 className="h-4 w-4" /> Search appearance
                                    </div>
                                    <p className="mt-2 line-clamp-1 text-sm font-medium text-primary">
                                        {content.seo_metadata.meta_title || content.title}
                                    </p>
                                    {content.seo_metadata.meta_description && (
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                            {content.seo_metadata.meta_description}
                                        </p>
                                    )}
                                    {content.seo_metadata.canonical_url && (
                                        <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                                            Canonical URL <ArrowUpRight className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{content.seo_metadata.canonical_url}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </footer>
                    </article>
                </main>
            </div>
        </>
    );
}
