import { Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';



export function AppSidebarHeader({
    breadcrumbs,
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const defaultBreadcrumbs = useBreadcrumbs();

    const finalBreadcrumbs = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />

                {finalBreadcrumbs.length > 0 && (
                    <Breadcrumbs breadcrumbs={finalBreadcrumbs} />
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() =>
                        window.dispatchEvent(
                            new CustomEvent('toggle-command-menu')
                        )
                    }
                    className="flex items-center gap-2 px-2.5 py-1.5 h-8 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors text-left text-neutral-400 dark:text-neutral-500 cursor-pointer text-xs"
                >
                    <Search className="h-3.5 w-3.5 shrink-0 text-neutral-500" />

                    <span className="hidden sm:inline">
                        Search...
                    </span>

                    <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-neutral-200 bg-neutral-100 px-1 font-mono text-[9px] font-medium text-neutral-400 opacity-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
                        <span className="text-[10px]">⌘</span>K
                    </kbd>
                </button>
            </div>
        </header>
    );
}