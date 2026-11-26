import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginatedContents } from './types';

export function ContentPagination({ contents }: { contents: PaginatedContents }) {
    if (contents.last_page <= 1) {
        return null;
    }

    const prevLink = contents.links[0];
    const nextLink = contents.links[contents.links.length - 1];

    return (
        <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
            <p className="text-xs text-muted-foreground">
                Page <span className="font-medium text-foreground">{contents.current_page}</span> of{' '}
                <span className="font-medium text-foreground">{contents.last_page}</span> ·{' '}
                <span className="font-medium text-foreground">{contents.total}</span> total items
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!prevLink?.url}
                    asChild={Boolean(prevLink?.url)}
                    className="h-8 rounded-full px-3 text-xs"
                >
                    {prevLink?.url ? (
                        <Link href={prevLink.url} preserveScroll>
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                            Previous
                        </Link>
                    ) : (
                        <span>
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                            Previous
                        </span>
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!nextLink?.url}
                    asChild={Boolean(nextLink?.url)}
                    className="h-8 rounded-full px-3 text-xs"
                >
                    {nextLink?.url ? (
                        <Link href={nextLink.url} preserveScroll>
                            Next
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                    ) : (
                        <span>
                            Next
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}
