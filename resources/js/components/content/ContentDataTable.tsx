import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    Archive,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    Edit3,
    Eye,
    FileText,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ContentStatusBadge } from './ContentStatusBadge';
import type { ContentFiltersState, ContentItem, ContentStatusValue } from './types';

interface ContentDataTableProps {
    items: ContentItem[];
    teamPrefix: string;
    selectedIds: number[];
    onToggleAll: (checked: boolean) => void;
    onToggleOne: (id: number, checked: boolean) => void;
    filters: ContentFiltersState;
    onSort: (column: string) => void;
    onTransition: (item: ContentItem, status: ContentStatusValue) => void;
    onDeleteRequest: (item: ContentItem) => void;
}

const ALLOWED_TRANSITIONS: Record<ContentStatusValue, ContentStatusValue[]> = {
    draft: ['in_review', 'published', 'archived'],
    in_review: ['published', 'draft'],
    approved: ['published', 'draft'],
    scheduled: ['published', 'draft', 'archived'],
    published: ['draft', 'archived'],
    archived: ['draft'],
};

export function ContentDataTable({
    items,
    teamPrefix,
    selectedIds,
    onToggleAll,
    onToggleOne,
    filters,
    onSort,
    onTransition,
    onDeleteRequest,
}: ContentDataTableProps) {
    const allSelected = items.length > 0 && selectedIds.length === items.length;

    const SortableHead = ({ column, label }: { column: string; label: string }) => (
        <button
            type="button"
            onClick={() => onSort(column)}
            className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
        >
            <span>{label}</span>
            <ArrowUpDown
                className={`h-3.5 w-3.5 ${filters.sort === column ? 'text-[#1A73E8] dark:text-[#8AB4F8]' : 'opacity-50'}`}
            />
        </button>
    );

    return (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xs">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-11 pl-4">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
                                aria-label="Select all content"
                            />
                        </TableHead>
                        <TableHead>
                            <SortableHead column="title" label="Title" />
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>
                            <SortableHead column="status" label="Status" />
                        </TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="hidden lg:table-cell">Author</TableHead>
                        <TableHead className="hidden sm:table-cell">
                            <SortableHead column="updated_at" label="Updated" />
                        </TableHead>
                        <TableHead className="w-14 pr-4 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                            <TableRow key={item.id} data-state={isSelected ? 'selected' : undefined}>
                                <TableCell className="pl-4">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => onToggleOne(item.id, Boolean(checked))}
                                        aria-label={`Select ${item.title}`}
                                    />
                                </TableCell>
                                <TableCell className="max-w-70">
                                    <Link
                                        href={`${teamPrefix}/content/${item.slug}`}
                                        className="block font-medium text-foreground hover:text-[#1A73E8] dark:hover:text-[#8AB4F8]"
                                    >
                                        <span className="line-clamp-1">{item.title}</span>
                                    </Link>
                                    <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                                        /{item.slug}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="rounded-full text-[11px] font-normal">
                                        {item.content_type?.name ?? 'Content'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <ContentStatusBadge status={item.status} />
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {item.category ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: item.category.color || '#1A73E8' }}
                                            />
                                            {item.category.name}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                    {item.author?.name ?? 'Unknown'}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="pr-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem asChild>
                                                <Link href={`${teamPrefix}/content/${item.slug}`}>
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    Preview
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`${teamPrefix}/content/${item.slug}/edit`}>
                                                    <Edit3 className="mr-2 h-3.5 w-3.5" />
                                                    Edit Content
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {ALLOWED_TRANSITIONS[item.status]?.includes('published') && (
                                                <DropdownMenuItem onClick={() => onTransition(item, 'published')}>
                                                    <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                                    Publish
                                                </DropdownMenuItem>
                                            )}
                                            {ALLOWED_TRANSITIONS[item.status]?.includes('in_review') && (
                                                <DropdownMenuItem onClick={() => onTransition(item, 'in_review')}>
                                                    <Clock className="mr-2 h-3.5 w-3.5 text-amber-500" />
                                                    Send to Review
                                                </DropdownMenuItem>
                                            )}
                                            {ALLOWED_TRANSITIONS[item.status]?.includes('draft') && (
                                                <DropdownMenuItem onClick={() => onTransition(item, 'draft')}>
                                                    <FileText className="mr-2 h-3.5 w-3.5" />
                                                    Move to Draft
                                                </DropdownMenuItem>
                                            )}
                                            {ALLOWED_TRANSITIONS[item.status]?.includes('archived') && (
                                                <DropdownMenuItem onClick={() => onTransition(item, 'archived')}>
                                                    <Archive className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                    Archive
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onDeleteRequest(item)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
