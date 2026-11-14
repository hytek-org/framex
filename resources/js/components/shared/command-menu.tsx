import { router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CreditCard,
    FileText,
    Folder,
    Globe,
    Image as ImageIcon,
    Key,
    LayoutGrid,
    Loader2,
    LogOut,
    Moon,
    PenTool,
    Search,
    Settings,
    Sparkles,
    Sun,
    Tags,
    Users,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import { useAppearance } from '@/hooks/use-appearance';
import { toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';

interface SearchResults {
    contents?: any[];
    media?: any[];
    blogs: any[];
    files: any[];
    categories: any[];
    tags: any[];
    members: any[];
    quickActions?: any[];
}

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({
        contents: [],
        media: [],
        blogs: [],
        files: [],
        categories: [],
        tags: [],
        members: [],
        quickActions: [],
    });
    const [isLoading, setIsLoading] = useState(false);

    const { props } = usePage();
    const { auth, currentTeam, teams } = props;
    const { appearance, updateAppearance } = useAppearance();

    if (!auth?.user) return null;

    const dashboardUrl = currentTeam ? toUrl(dashboard(currentTeam.slug)) : '/';

    // Toggle shortcut (Cmd+K / Ctrl+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        const handleToggle = () => {
            setOpen((prev) => !prev);
        };

        document.addEventListener('keydown', down);
        window.addEventListener('toggle-command-menu', handleToggle);
        return () => {
            document.removeEventListener('keydown', down);
            window.removeEventListener('toggle-command-menu', handleToggle);
        };
    }, []);

    // Debounce searchQuery
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch workspace search results dynamically
    useEffect(() => {
        if (!currentTeam || !open) return;

        let active = true;
        setIsLoading(true);

        const fetchResults = async () => {
            try {
                const response = await fetch(
                    `/${currentTeam.slug}/search-api?q=${encodeURIComponent(debouncedQuery)}`,
                );
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();
                if (active) {
                    setResults({
                        contents: data.contents || [],
                        media: data.media || [],
                        blogs: data.blogs || [],
                        files: data.files || [],
                        categories: data.categories || [],
                        tags: data.tags || [],
                        members: data.members || [],
                        quickActions: data.quickActions || [],
                    });
                }
            } catch (err) {
                console.error('Workspace search failed', err);
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        fetchResults();

        return () => {
            active = false;
        };
    }, [debouncedQuery, currentTeam, open]);

    // Reset search query when dialog is closed
    useEffect(() => {
        if (!open) {
            setSearchQuery('');
            setDebouncedQuery('');
        }
    }, [open]);

    const navigate = useCallback(
        (href: string) => {
            setOpen(false);
            router.visit(href);
        },
        [],
    );

    const toggleTheme = useCallback(() => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
        setOpen(false);
    }, [appearance, updateAppearance]);

    const hasResults =
        (results.contents?.length ?? 0) > 0 ||
        (results.media?.length ?? 0) > 0 ||
        results.blogs.length > 0 ||
        results.files.length > 0 ||
        results.categories.length > 0 ||
        results.tags.length > 0 ||
        results.members.length > 0 ||
        (results.quickActions?.length ?? 0) > 0;

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="relative">
                <CommandInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search content, media assets, members, actions (⌘K)..."
                />
                {isLoading && (
                    <div className="absolute right-4 top-3.5 flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                    </div>
                )}
            </div>
            <CommandList>
                {!isLoading && !hasResults && searchQuery.length >= 2 && (
                    <CommandEmpty>No results found for "{searchQuery}".</CommandEmpty>
                )}

                {/* --- Quick Actions --- */}
                {results.quickActions && results.quickActions.length > 0 && (
                    <CommandGroup heading="Platform Quick Actions">
                        {results.quickActions.map((action) => (
                            <CommandItem
                                key={action.id}
                                value={`action-${action.id}-${action.title}-${action.description}`}
                                onSelect={() => navigate(action.url)}
                                className="flex items-center justify-between py-2.5"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">
                                            {action.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {action.description}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">
                                    {action.category}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {/* --- Content Studio Entities --- */}
                {results.contents && results.contents.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="FrameX Content Studio">
                            {results.contents.map((content) => (
                                <CommandItem
                                    key={`content-${content.id}`}
                                    value={`content-${content.id}-${content.title}-${content.contentType?.name || ''}`}
                                    onSelect={() => {
                                        if (!currentTeam) return;
                                        navigate(`/${currentTeam.slug}/content/${content.slug}/edit`);
                                    }}
                                    className="flex items-center justify-between py-2.5"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <PenTool className="h-4 w-4 text-primary shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-foreground truncate">
                                                {content.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {content.contentType?.name || 'Content'} · /{content.slug}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                                            {content.status}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {/* --- Media Studio Assets --- */}
                {results.media && results.media.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Media Studio Assets">
                            {results.media.map((item) => (
                                <CommandItem
                                    key={`media-${item.id}`}
                                    value={`media-${item.id}-${item.original_name || item.filename}`}
                                    onSelect={() => {
                                        if (!currentTeam) return;
                                        navigate(`/${currentTeam.slug}/media`);
                                    }}
                                    className="flex items-center justify-between py-2.5"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {item.mime_type?.startsWith('image/') && item.url ? (
                                            <img
                                                src={item.url}
                                                alt=""
                                                className="h-6 w-6 rounded object-cover border border-border shrink-0"
                                            />
                                        ) : (
                                            <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-foreground truncate">
                                                {item.original_name || item.filename}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {item.mime_type} · {(item.size / 1024).toFixed(0)} KB
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                        Media
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {/* --- Dynamic Workspace Search Results --- */}
                {results.blogs.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Blogs & Posts">
                            {results.blogs.map((blog) => (
                                <CommandItem
                                    key={blog.id}
                                    value={`blog-${blog.id}-${blog.title}`}
                                    onSelect={() => {
                                        if (!currentTeam) return;
                                        navigate(
                                            `/${currentTeam.slug}/manage/blogs/${blog.slug}/edit`,
                                        );
                                    }}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                                {blog.title}
                                            </span>
                                            {blog.excerpt && (
                                                <span className="text-xs text-neutral-400 line-clamp-1">
                                                    {blog.excerpt}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`ml-2 text-[10px] px-2 py-0.5 rounded font-semibold tracking-wide shrink-0 ${
                                            blog.is_published
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                                        }`}
                                    >
                                        {blog.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {results.files.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Files & Documents">
                            {results.files.map((file) => (
                                <CommandItem
                                    key={file.id}
                                    value={`file-${file.id}-${file.name}`}
                                    onSelect={() => {
                                        if (!currentTeam) return;
                                        navigate(`/${currentTeam.slug}/files`);
                                    }}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                                {file.name}
                                            </span>
                                            {file.mime_type && (
                                                <span className="text-xs text-neutral-400">
                                                    {file.mime_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {file.size && (
                                        <span className="text-xs text-neutral-400 font-mono shrink-0 ml-2">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {(results.categories.length > 0 || results.tags.length > 0) && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Taxonomies (Categories & Tags)">
                            {results.categories.map((category) => (
                                <CommandItem
                                    key={category.id}
                                    value={`category-${category.id}-${category.name}`}
                                    onSelect={() => {
                                        if (!currentTeam) return;
                                        navigate(`/${currentTeam.slug}/manage/categories`);
                                    }}
                                    className="flex items-center justify-between py-2.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{
                                                backgroundColor: category.color || '#cccccc',
                                            }}
                                        />
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {category.name}
                                        </span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                                        Category
                                    </span>
                                </CommandItem>
                            ))}
                            {results.tags.map((tag) => (
                                <CommandItem
                                    key={tag.id}
                                    value={`tag-${tag.id}-${tag.name}`}
                                    onSelect={() => {
                                        if (!currentTeam) return;
                                        navigate(`/${currentTeam.slug}/manage/tags`);
                                    }}
                                    className="flex items-center justify-between py-2.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <Tags className="h-4 w-4 text-violet-500 shrink-0" />
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {tag.name}
                                        </span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                                        Tag
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {results.members.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Team Members">
                            {results.members.map((member) => (
                                <CommandItem
                                    key={member.id}
                                    value={`member-${member.id}-${member.name}`}
                                    onSelect={() => navigate(`/settings/teams`)}
                                    className="flex items-center py-3"
                                >
                                    <Users className="h-4 w-4 text-pink-500 shrink-0 mr-2" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {member.name}
                                        </span>
                                        <span className="text-xs text-neutral-400">
                                            {member.email}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {/* --- Static Actions & Navigation (Fallback & Helpers) --- */}
                <CommandSeparator />
                <CommandGroup heading="Quick Navigation">
                    <CommandItem onSelect={() => navigate(dashboardUrl)}>
                        <LayoutGrid className="mr-2" />
                        Dashboard
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/billing')}>
                        <CreditCard className="mr-2" />
                        Billing
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/api-tokens')}>
                        <Key className="mr-2" />
                        API Tokens
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/notifications')}>
                        <Zap className="mr-2" />
                        Notifications
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => navigate('/settings/profile')}>
                        <Settings className="mr-2" />
                        Profile Settings
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/settings/security')}>
                        <Key className="mr-2" />
                        Security Settings
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/settings/teams')}>
                        <Users className="mr-2" />
                        Team Settings
                    </CommandItem>
                </CommandGroup>

                {teams && teams.length > 1 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Switch Team">
                            {teams.map((team) => (
                                <CommandItem
                                    key={team.id}
                                    value={`switch-team-${team.name}`}
                                    onSelect={() =>
                                        navigate(`/settings/teams/${team.slug}/switch`)
                                    }
                                >
                                    <Users className="mr-2" />
                                    {team.name}
                                    {team.isCurrent && (
                                        <CommandShortcut>Current</CommandShortcut>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />
                <CommandGroup heading="System Actions">
                    <CommandItem onSelect={toggleTheme}>
                        {appearance === 'dark' ? (
                            <Sun className="mr-2 text-amber-500" />
                        ) : (
                            <Moon className="mr-2 text-indigo-500" />
                        )}
                        Toggle {appearance === 'dark' ? 'Light' : 'Dark'} Mode
                        <CommandShortcut>⌘T</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => {
                            setOpen(false);
                            router.post('/logout');
                        }}
                    >
                        <LogOut className="mr-2 text-rose-500" />
                        Sign Out
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
