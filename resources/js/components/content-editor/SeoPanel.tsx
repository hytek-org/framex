import React, { useState } from 'react';
import { Globe, Share2, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
    const [previewTab, setPreviewTab] = useState<'google' | 'social'>('google');

    const effectiveTitle = metaTitle || (title ? `${title} | FrameX` : 'Title | FrameX');
    const effectiveDescription = metaDescription || excerpt || 'Add a compelling description to optimize this page for Google search results and social cards.';
    const displayUrl = canonicalUrl || `https://example.com/blogs/${slug || 'post-slug'}`;

    const titleLength = effectiveTitle.length;
    const descLength = effectiveDescription.length;

    return (
        <div className="flex flex-col gap-5 border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">SEO & Social Studio</h3>
                </div>

                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md text-xs">
                    <button
                        type="button"
                        onClick={() => setPreviewTab('google')}
                        className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                            previewTab === 'google'
                                ? 'bg-background shadow-xs font-medium text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <SearchIcon className="h-3 w-3" />
                        Google Preview
                    </button>
                    <button
                        type="button"
                        onClick={() => setPreviewTab('social')}
                        className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                            previewTab === 'social'
                                ? 'bg-background shadow-xs font-medium text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Share2 className="h-3 w-3" />
                        Social Card
                    </button>
                </div>
            </div>

            {/* Live Preview Box */}
            {previewTab === 'google' ? (
                <div className="p-3.5 rounded-lg border bg-muted/20 font-sans text-left max-w-xl">
                    <p className="text-xs text-muted-foreground truncate">{displayUrl}</p>
                    <p className="text-base text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium line-clamp-1 mt-0.5">
                        {effectiveTitle}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-normal">
                        {effectiveDescription}
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden max-w-md bg-muted/20">
                    <div className="aspect-[1.91/1] bg-muted/60 flex items-center justify-center overflow-hidden">
                        {coverImageUrl ? (
                            <img src={coverImageUrl} alt="Social Preview" className="w-full h-full object-cover" />
                        ) : (
                            <p className="text-xs text-muted-foreground">Attach cover image for social sharing card</p>
                        )}
                    </div>
                    <div className="p-3 border-t">
                        <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">example.com</p>
                        <p className="text-sm font-semibold truncate mt-0.5">{effectiveTitle}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{effectiveDescription}</p>
                    </div>
                </div>
            )}

            {/* Form Fields */}
            <div className="grid gap-3.5 text-xs">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-foreground">Meta Title</label>
                        <span className={`text-[10px] ${titleLength > 60 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                            {titleLength} / 60 characters
                        </span>
                    </div>
                    <Input
                        placeholder="Custom title tag (defaults to content title)"
                        value={metaTitle}
                        onChange={(e) => onChange('meta_title', e.target.value)}
                        className="text-xs"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-foreground">Meta Description</label>
                        <span className={`text-[10px] ${descLength > 160 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                            {descLength} / 160 characters
                        </span>
                    </div>
                    <Textarea
                        placeholder="Search snippet summary (defaults to excerpt)"
                        value={metaDescription}
                        onChange={(e) => onChange('meta_description', e.target.value)}
                        rows={3}
                        className="text-xs resize-none"
                    />
                </div>

                <div>
                    <label className="font-medium text-foreground block mb-1">Canonical URL</label>
                    <Input
                        placeholder="https://example.com/canonical-url (optional)"
                        value={canonicalUrl}
                        onChange={(e) => onChange('canonical_url', e.target.value)}
                        className="text-xs"
                    />
                </div>
            </div>
        </div>
    );
}
