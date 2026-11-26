import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CategoryItem, ContentFiltersState, ContentTypeItem } from './types';

interface ContentToolbarProps {
    search: string;
    onSearchChange: (val: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    filters: ContentFiltersState;
    contentTypes: ContentTypeItem[];
    categories: CategoryItem[];
    onFilterChange: (patch: Partial<ContentFiltersState>) => void;
    onResetFilters: () => void;
}

export function ContentToolbar({
    search,
    onSearchChange,
    onSearchSubmit,
    filters,
    contentTypes,
    categories,
    onFilterChange,
    onResetFilters,
}: ContentToolbarProps) {
    const hasActiveFilters = Boolean(
        filters.search || filters.type || filters.category || filters.status,
    );

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={onSearchSubmit} className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search title, excerpt, or slug..."
                    className="h-9 rounded-full pl-9 pr-8"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            onSearchChange('');
                            onFilterChange({ search: undefined });
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </form>

            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) =>
                        onFilterChange({ type: value === 'all' ? undefined : value })
                    }
                >
                    <SelectTrigger className="h-9 w-[150px] rounded-full text-xs">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {contentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.slug}>
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {categories.length > 0 && (
                    <Select
                        value={filters.category || 'all'}
                        onValueChange={(value) =>
                            onFilterChange({ category: value === 'all' ? undefined : value })
                        }
                    >
                        <SelectTrigger className="h-9 w-[160px] rounded-full text-xs">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-9 rounded-full px-3 text-xs text-muted-foreground"
                    >
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}
