import React, { useId, useState } from 'react';
import { Globe, Search as SearchIcon, Share2, Image as ImageIcon, Link2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SeoPanelProps {
    title: string;
    excerpt?: string | null;
    slug?: string;
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    coverImageUrl?: string | null;
    onChange: (field: string, value: string) => void;
}

type PreviewTab = 'google' | 'social';

interface CharacterMeterProps {
    value: number;
    limit: number;
    noun: string;
}

function CharacterMeter({ value, limit, noun }: CharacterMeterProps) {
    const isOverLimit = value > limit;
    const percentage = Math.min((value / limit) * 100, 100);

    return (
        <div className="flex min-w-0 items-center gap-2">
            <span
                className={cn(
                    'shrink-0 text-[11px] tabular-nums',
                    isOverLimit ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                )}
            >
                {value}/{limit}
            </span>
            <div
                className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
                role="meter"
                aria-label={`${noun} character count`}
                aria-valuemin={0}
                aria-valuemax={limit}
                aria-valuenow={Math.min(value, limit)}
            >
                <div
                    className={cn('h-full rounded-full transition-[width] duration-200', isOverLimit ? 'bg-amber-500' : 'bg-primary')}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export function SeoPanel({
    title,
    excerpt,
    slug = 'your-content-slug',
    metaTitle,
    metaDescription,
    canonicalUrl,
    coverImageUrl,
    onChange,
}: SeoPanelProps) {
    const [previewTab, setPreviewTab] = useState<PreviewTab>('google');
    const titleId = useId();
    const descriptionId = useId();
    const canonicalId = useId();

    const effectiveTitle = metaTitle.trim() || (title.trim() ? `${title.trim()} | FrameX` : 'Your page title | FrameX');
    const effectiveDescription =
        metaDescription.trim() ||
        excerpt?.trim() ||
        'Add a concise description that explains what this page is about and why it is useful.';
    const fallbackPath = `/blogs/${slug || 'post-slug'}`;
    const displayUrl = canonicalUrl.trim() || `https://example.com${fallbackPath}`;

    let displayHost = 'example.com';
    let displayPath = fallbackPath;
    try {
        const parsedUrl = new URL(displayUrl);
        displayHost = parsedUrl.hostname.replace(/^www\./, '');
        displayPath = parsedUrl.pathname || '/';
    } catch {
        // Keep the readable fallback values while the user is editing an incomplete URL.
    }

    const titleLength = effectiveTitle.length;
    const descriptionLength = effectiveDescription.length;

    return (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm" aria-labelledby="seo-panel-title">
            <div className="flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Globe className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h3 id="seo-panel-title" className="text-sm font-semibold tracking-tight">
                            Search & social appearance
                        </h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            Control how this content appears when it is discovered and shared.
                        </p>
                    </div>
                </div>

                <div className="inline-flex w-full items-center rounded-xl border bg-muted/50 p-1 sm:w-auto" role="tablist" aria-label="SEO preview type">
                    <Button
                        type="button"
                        size="sm"
                        variant={previewTab === 'google' ? 'secondary' : 'ghost'}
                        role="tab"
                        aria-selected={previewTab === 'google'}
                        aria-controls="seo-preview-panel"
                        onClick={() => setPreviewTab('google')}
                        className={cn('h-8 flex-1 gap-1.5 px-3 text-xs sm:flex-none', previewTab === 'google' && 'bg-background shadow-sm')}
                    >
                        <SearchIcon className="size-3.5" aria-hidden="true" />
                        Search
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={previewTab === 'social' ? 'secondary' : 'ghost'}
                        role="tab"
                        aria-selected={previewTab === 'social'}
                        aria-controls="seo-preview-panel"
                        onClick={() => setPreviewTab('social')}
                        className={cn('h-8 flex-1 gap-1.5 px-3 text-xs sm:flex-none', previewTab === 'social' && 'bg-background shadow-sm')}
                    >
                        <Share2 className="size-3.5" aria-hidden="true" />
                        Social
                    </Button>
                </div>
            </div>

            <div className="space-y-5 p-4 sm:p-5">
                {/* Preview */}
                <div id="seo-preview-panel" role="tabpanel" aria-label={previewTab === 'google' ? 'Search result preview' : 'Social sharing preview'} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                                {previewTab === 'google' ? 'Search result preview' : 'Social sharing preview'}
                            </span>
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground">
                                Live preview
                            </Badge>
                        </div>
                        <span className="hidden text-[11px] text-muted-foreground sm:inline">Approximate appearance</span>
                    </div>

                    {previewTab === 'google' ? (
                        <div className="max-w-2xl rounded-xl border bg-background p-4 shadow-xs sm:p-5">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted/50 text-muted-foreground">
                                    <Globe className="size-3.5" aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-foreground">{displayHost}</p>
                                    <p className="truncate text-[11px] text-muted-foreground">{displayPath}</p>
                                </div>
                                <SearchIcon className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                            </div>
                            <p className="mt-3 line-clamp-2 text-[18px] font-medium leading-snug tracking-tight text-[#1a0dab] dark:text-[#8ab4f8]">
                                {effectiveTitle}
                            </p>
                            <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                                {effectiveDescription}
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-xl overflow-hidden rounded-xl border bg-background shadow-xs">
                            <div className="relative aspect-[1.91/1] overflow-hidden bg-muted/60">
                                {coverImageUrl ? (
                                    <img
                                        src={coverImageUrl}
                                        alt="Social sharing image preview"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <div className="flex size-10 items-center justify-center rounded-xl border bg-background/80">
                                            <ImageIcon className="size-5" aria-hidden="true" />
                                        </div>
                                        <span className="text-xs">Add a cover image for a richer social card</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5 border-t px-4 py-3.5">
                                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                    {displayHost}
                                </p>
                                <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground">
                                    {effectiveTitle}
                                </p>
                                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                    {effectiveDescription}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t" />

                {/* Metadata fields */}
                <div className="grid gap-5">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Label htmlFor={titleId} className="text-xs font-semibold">Meta title</Label>
                            <CharacterMeter value={titleLength} limit={60} noun="Title" />
                        </div>
                        <Input
                            id={titleId}
                            value={metaTitle}
                            onChange={(event) => onChange('meta_title', event.target.value)}
                            placeholder="Custom title (defaults to the content title)"
                            maxLength={200}
                            className="h-10 text-sm"
                        />
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Keep it specific and descriptive. Leave empty to use the content title with your site name.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Label htmlFor={descriptionId} className="text-xs font-semibold">Meta description</Label>
                            <CharacterMeter value={descriptionLength} limit={160} noun="Description" />
                        </div>
                        <Textarea
                            id={descriptionId}
                            value={metaDescription}
                            onChange={(event) => onChange('meta_description', event.target.value)}
                            placeholder="Summarize the page and its value to the reader..."
                            rows={3}
                            maxLength={320}
                            className="min-h-24 resize-y text-sm leading-relaxed"
                        />
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Aim for a useful, natural summary. Search engines may choose a different snippet for some queries.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={canonicalId} className="flex items-center gap-2 text-xs font-semibold">
                            <Link2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                            Canonical URL
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">Optional</Badge>
                        </Label>
                        <Input
                            id={canonicalId}
                            type="url"
                            inputMode="url"
                            value={canonicalUrl}
                            onChange={(event) => onChange('canonical_url', event.target.value)}
                            placeholder="https://yourdomain.com/preferred-page-url"
                            className="h-10 text-sm"
                        />
                        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                            <AlertCircle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                            Set this only when another URL should be treated as the preferred version of this content.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Previews are estimates. Search and social platforms can rewrite titles, descriptions, and image crops when displaying shared content.
                    </p>
                </div>
            </div>
        </section>
    );
}
