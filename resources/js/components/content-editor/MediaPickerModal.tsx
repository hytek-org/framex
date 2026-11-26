import React, { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    FileImage,
    FileText,
    Image as ImageIcon,
    Images,
    RefreshCw,
    Search,
    X,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MediaItem {
    id: number;
    filename: string;
    url: string;
    mime_type: string;
    size: number;
    alt_text?: string | null;
}

interface MediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (item: MediaItem) => void;
    title?: string;
}

type MediaFilter = 'all' | 'images' | 'files';

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;

    return `${value.toLocaleString(undefined, {
        maximumFractionDigits: index === 0 ? 0 : 1,
    })} ${units[index]}`;
}

function isImage(item: MediaItem): boolean {
    return item.mime_type?.toLowerCase().startsWith('image/') ?? false;
}

function isSafeMediaUrl(url: string): boolean {
    return (url.startsWith('/') && !url.startsWith('//')) || /^https?:\/\//i.test(url);
}

export function MediaPickerModal({
    open,
    onClose,
    onSelect,
    title = 'Select Media Asset',
}: MediaPickerModalProps) {
    const { currentTeam } = usePage().props as {
        currentTeam?: { slug?: string };
    };
    const teamSlug = currentTeam?.slug || '';

    const [loading, setLoading] = useState(false);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<MediaFilter>('all');
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!open || !teamSlug) return;

        const controller = new AbortController();

        const loadMedia = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/${teamSlug}/media?all=1`, {
                    credentials: 'same-origin',
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Unable to load media library (${response.status}).`);
                }

                const data: unknown = await response.json();
                const items = (data as { media?: { data?: unknown } })?.media?.data;

                if (!Array.isArray(items)) {
                    throw new Error('The media library returned an unexpected response.');
                }

                setMediaItems(items as MediaItem[]);
            } catch (cause) {
                if (cause instanceof Error && cause.name === 'AbortError') return;

                setError(cause instanceof Error ? cause.message : 'Something went wrong while loading media.');
                setMediaItems([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        setSelectedItem(null);
        setSearch('');
        setFilter('all');
        void loadMedia();

        return () => controller.abort();
    }, [open, teamSlug, reloadKey]);

    const filteredItems = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        return mediaItems.filter((item) => {
            const matchesSearch = !query || [item.filename, item.alt_text || '', item.mime_type || '']
                .some((value) => value.toLocaleLowerCase().includes(query));
            const matchesFilter = filter === 'all'
                || (filter === 'images' && isImage(item))
                || (filter === 'files' && !isImage(item));

            return matchesSearch && matchesFilter;
        });
    }, [mediaItems, search, filter]);

    const handleConfirm = () => {
        if (!selectedItem) return;
        onSelect(selectedItem);
        onClose();
    };

    const imageCount = mediaItems.filter(isImage).length;
    const fileCount = mediaItems.length - imageCount;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="flex h-dvh w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[88dvh] sm:max-w-5xl sm:rounded-xl">
                <DialogHeader className="shrink-0 border-b px-4 py-3.5 pr-12 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-10">
                            <Images className="size-4 sm:size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-base font-semibold tracking-tight">{title}</DialogTitle>
                            <DialogDescription className="mt-0.5 text-xs">
                                Browse your workspace media library and choose an asset.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="flex shrink-0 flex-col gap-2.5 border-b px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by filename, alt text, or type..."
                                aria-label="Search media library"
                                className="h-9 pl-9 pr-9 text-sm sm:h-10"
                            />
                            {search && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSearch('')}
                                    aria-label="Clear search"
                                    className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground sm:size-8"
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted/60 p-1" aria-label="Filter media">
                                {([
                                    { value: 'all', label: 'All assets', count: mediaItems.length },
                                    { value: 'images', label: 'Images', count: imageCount },
                                    { value: 'files', label: 'Files', count: fileCount },
                                ] as const).map((option) => (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        size="sm"
                                        variant={filter === option.value ? 'secondary' : 'ghost'}
                                        onClick={() => setFilter(option.value)}
                                        aria-pressed={filter === option.value}
                                        className="h-7 gap-1.5 px-2 text-xs sm:h-8 sm:px-2.5"
                                    >
                                        {option.label}
                                        <span className="text-[10px] text-muted-foreground">{option.count}</span>
                                    </Button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground" aria-live="polite">
                                {loading ? 'Loading assets…' : `${filteredItems.length} of ${mediaItems.length} assets`}
                            </p>
                        </div>
                    </div>

                    <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_240px]">
                        <section className="min-h-0 overflow-y-auto p-3.5 sm:p-5" aria-label="Media assets">
                            {loading ? (
                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4" aria-label="Loading media">
                                    {Array.from({ length: 8 }).map((_, index) => (
                                        <div key={index} className="animate-pulse overflow-hidden rounded-xl border bg-card">
                                            <div className="aspect-square bg-muted" />
                                            <div className="space-y-2 p-3">
                                                <div className="h-3 w-4/5 rounded bg-muted" />
                                                <div className="h-2.5 w-2/5 rounded bg-muted" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
                                    <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                        <AlertCircle className="size-5" />
                                    </div>
                                    <p className="text-sm font-medium">Couldn't load the media library</p>
                                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{error}</p>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)} className="mt-4">
                                        <RefreshCw className="mr-2 size-3.5" /> Try again
                                    </Button>
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
                                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                        <ImageIcon className="size-5" />
                                    </div>
                                    <p className="text-sm font-medium">
                                        {mediaItems.length === 0 ? 'Your media library is empty' : 'No matching assets'}
                                    </p>
                                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                                        {mediaItems.length === 0
                                            ? 'Upload images and files in Media Studio to make them available here.'
                                            : 'Try a different search term or switch the asset filter.'}
                                    </p>
                                    {search && (
                                        <Button type="button" variant="link" size="sm" onClick={() => setSearch('')} className="mt-2 h-auto px-1">
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                                    {filteredItems.map((item) => {
                                        const selected = selectedItem?.id === item.id;
                                        const image = isImage(item);
                                        const safeUrl = isSafeMediaUrl(item.url);

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setSelectedItem(item)}
                                                aria-pressed={selected}
                                                aria-label={`Select ${item.filename}${selected ? ', selected' : ''}`}
                                                className={cn(
                                                    'group relative min-w-0 overflow-hidden rounded-xl border bg-card text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                                    selected
                                                        ? 'border-primary ring-2 ring-primary/20'
                                                        : 'border-border hover:border-primary/50 hover:shadow-sm',
                                                )}
                                            >
                                                <div className="relative aspect-square overflow-hidden bg-muted/50">
                                                    {image && safeUrl ? (
                                                        <img
                                                            src={item.url}
                                                            alt={item.alt_text || item.filename}
                                                            loading="lazy"
                                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                        />
                                                    ) : (
                                                        <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                                            {image ? <FileImage className="size-8 sm:size-9" /> : <FileText className="size-8 sm:size-9" />}
                                                            <span className="max-w-[85%] truncate text-[10px] uppercase tracking-wide">{item.mime_type || 'File'}</span>
                                                        </div>
                                                    )}
                                                    {selected && (
                                                        <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                                            <Check className="size-3.5" />
                                                        </div>
                                                    )}
                                                    {!selected && (
                                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 border-t px-2.5 py-2">
                                                    <p className="truncate text-xs font-medium" title={item.filename}>{item.filename}</p>
                                                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{formatBytes(item.size)}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <aside className="hidden min-h-0 flex-col overflow-y-auto border-l bg-muted/20 p-4 md:flex" aria-label="Selected asset details">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold">Selection</p>
                                {selectedItem && <Badge variant="secondary">Selected</Badge>}
                            </div>

                            {selectedItem ? (
                                <>
                                    <div className="flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background">
                                        {isImage(selectedItem) && isSafeMediaUrl(selectedItem.url) ? (
                                            <img src={selectedItem.url} alt={selectedItem.alt_text || selectedItem.filename} className="size-full object-contain" />
                                        ) : (
                                            <FileText className="size-12 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <p className="wrap-break-word text-sm font-medium leading-snug">{selectedItem.filename}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">{selectedItem.mime_type}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 border-y py-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">File size</p>
                                                <p className="mt-1 text-xs font-medium">{formatBytes(selectedItem.size)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Asset ID</p>
                                                <p className="mt-1 text-xs font-medium">#{selectedItem.id}</p>
                                            </div>
                                        </div>
                                        {selectedItem.alt_text && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Alt text</p>
                                                <p className="mt-1 text-xs leading-relaxed">{selectedItem.alt_text}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center text-center">
                                    <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground">
                                        <ImageIcon className="size-5" />
                                    </div>
                                    <p className="mt-3 text-xs font-medium">No asset selected</p>
                                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Choose an asset to see its details and preview.</p>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>

                {selectedItem && (
                    <div className="flex shrink-0 items-center gap-3 border-t bg-muted/30 px-4 py-2 md:hidden">
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
                            {isImage(selectedItem) && isSafeMediaUrl(selectedItem.url) ? (
                                <img
                                    src={selectedItem.url}
                                    alt={selectedItem.alt_text || selectedItem.filename}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <FileText className="size-4 text-muted-foreground" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{selectedItem.filename}</p>
                            <p className="truncate text-[11px] text-muted-foreground">
                                {formatBytes(selectedItem.size)} · #{selectedItem.id}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t bg-background px-4 py-3 sm:px-6">
                    <p className="hidden truncate text-xs text-muted-foreground sm:block">
                        {selectedItem ? `Selected: ${selectedItem.filename}` : 'Select an asset to continue'}
                    </p>
                    <div className="flex w-full items-center justify-end gap-2 sm:ml-auto sm:w-auto">
                        <Button type="button" variant="outline" className="flex-1 sm:flex-initial" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 sm:flex-initial"
                            onClick={handleConfirm}
                            disabled={!selectedItem || loading || !!error}
                        >
                            <Check className="mr-2 size-4" />
                            Select asset
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}