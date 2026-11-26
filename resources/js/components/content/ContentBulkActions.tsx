import { Archive, CheckCircle2, Download, FileText, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentBulkActionsProps {
    selectedCount: number;
    processing: boolean;
    onClearSelection: () => void;
    onBulkAction: (action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'export_json') => void;
}

export function ContentBulkActions({
    selectedCount,
    processing,
    onClearSelection,
    onBulkAction,
}: ContentBulkActionsProps) {
    if (selectedCount === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1A73E8]/30 bg-[#1A73E8]/5 px-4 py-2.5 dark:border-[#8AB4F8]/30 dark:bg-[#8AB4F8]/10">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span>{selectedCount} selected</span>
                <button
                    type="button"
                    onClick={onClearSelection}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Clear selection"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={processing}
                    onClick={() => onBulkAction('publish')}
                    className="h-8 rounded-full text-xs"
                >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                    Publish
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={processing}
                    onClick={() => onBulkAction('unpublish')}
                    className="h-8 rounded-full text-xs"
                >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Draft
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={processing}
                    onClick={() => onBulkAction('archive')}
                    className="h-8 rounded-full text-xs"
                >
                    <Archive className="mr-1.5 h-3.5 w-3.5" />
                    Archive
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={processing}
                    onClick={() => onBulkAction('export_json')}
                    className="h-8 rounded-full text-xs"
                >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Export JSON
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={processing}
                    onClick={() => onBulkAction('delete')}
                    className="h-8 rounded-full text-xs"
                >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                </Button>
            </div>
        </div>
    );
}
