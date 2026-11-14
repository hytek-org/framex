import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Image as ImageIcon, Search, Folder, Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

export function MediaPickerModal({
    open,
    onClose,
    onSelect,
    title = 'Select Media Asset',
}: MediaPickerModalProps) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const [loading, setLoading] = useState(false);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (open && teamSlug) {
            setLoading(true);
            fetch(`/${teamSlug}/media?all=1`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.media?.data) {
                        setMediaItems(data.media.data);
                    }
                })
                .catch((err) => console.error('Failed to load media library', err))
                .finally(() => setLoading(false));
        }
    }, [open, teamSlug]);

    const handleConfirm = () => {
        if (selectedItem) {
            onSelect(selectedItem);
            onClose();
        }
    };

    const filtered = mediaItems.filter((item) =>
        item.filename.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="relative my-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter media..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-75 border rounded-lg p-3">
                    {loading ? (
                        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                            Loading media library...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium">No assets found</p>
                            <p className="text-xs text-muted-foreground">
                                Upload media items in Media Studio first.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {filtered.map((item) => {
                                const isSelected = selectedItem?.id === item.id;
                                const isImage = item.mime_type.startsWith('image/');
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`group relative rounded-lg border cursor-pointer overflow-hidden transition-all ${
                                            isSelected
                                                ? 'ring-2 ring-primary border-transparent'
                                                : 'hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="aspect-square bg-muted/40 flex items-center justify-center relative">
                                            {isImage ? (
                                                <img
                                                    src={item.url}
                                                    alt={item.alt_text || item.filename}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <Folder className="h-10 w-10 text-muted-foreground/60" />
                                            )}

                                            {isSelected && (
                                                <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                                                    <Check className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 text-left">
                                            <p className="text-xs font-medium truncate" title={item.filename}>
                                                {item.filename}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!selectedItem}>
                        Select Asset
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
