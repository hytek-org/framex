import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    format,
    formatDistanceToNow,
    isToday,
    isYesterday,
    parseISO,
} from "date-fns";
import {
    Activity as ActivityIcon,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    FilePenLine,
    Globe,
    Image as ImageIcon,
    Info,
    RefreshCw,
    Search,
    Shield,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
    ActivityDetailSheet,
    type ActivityItem,
} from "@/components/activity/ActivityDetailSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ActorOption {
    id: string;
    name: string;
}

interface FiltersState {
    search: string;
    category: string;
    actor: string;
    date_from: string;
    date_to: string;
}

interface PaginatedActivities {
    data: ActivityItem[];
    current_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}
interface ActivityPageProps {
    activities: PaginatedActivities;
    actors: ActorOption[];
    filters: FiltersState;
}

function getEventIcon(event: string, category: string) {
    const lower = event.toLowerCase();
    if (lower.includes("published")) {
        return {
            icon: Globe,
            label: "Published",
            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        };
    }
    if (lower.includes("invited")) {
        return {
            icon: UserPlus,
            label: "Invitation",
            color: "text-[#1A73E8] dark:text-[#8AB4F8] bg-[#1A73E8]/10",
        };
    }
    if (category === "content") {
        return {
            icon: FilePenLine,
            label: "Content",
            color: "text-[#1A73E8] dark:text-[#8AB4F8] bg-[#1A73E8]/10",
        };
    }
    if (category === "media") {
        return {
            icon: ImageIcon,
            label: "Media",
            color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
        };
    }
    if (category === "team") {
        return {
            icon: Users,
            label: "Team",
            color: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
        };
    }
    if (category === "billing") {
        return {
            icon: CreditCard,
            label: "Billing",
            color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
        };
    }
    if (category === "security") {
        return {
            icon: Shield,
            label: "Security",
            color: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
        };
    }

    return {
        icon: ActivityIcon,
        label: "Workspace",
        color: "text-muted-foreground bg-muted",
    };
}

function formatDateGroup(iso: string): string {
    const date = parseISO(iso);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
}

export default function ActivityIndex({
    activities,
    actors,
    filters,
}: ActivityPageProps) {
    const { currentTeam } = usePage().props as {
        currentTeam?: { slug: string } | null;
    };
    const tp = currentTeam?.slug ? `/${currentTeam.slug}` : "";

    const [search, setSearch] = useState(filters.search || "");
    const [selectedActivity, setSelectedActivity] =
        useState<ActivityItem | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const applyFilters = (patch: Partial<FiltersState>) => {
        const merged = { ...filters, ...patch };
        const params: Record<string, string> = {};
        if (merged.search) params.search = merged.search;
        if (merged.category) params.category = merged.category;
        if (merged.actor) params.actor = merged.actor;
        if (merged.date_from) params.date_from = merged.date_from;
        if (merged.date_to) params.date_to = merged.date_to;

        router.get(`${tp}/activity`, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: search.trim() });
    };

    const handleClearFilters = () => {
        setSearch("");
        router.get(`${tp}/activity`, {}, { preserveState: true });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            only: ["activities"],
            onFinish: () => setRefreshing(false),
        });
    };

    const hasFilters = Boolean(
        filters.search ||
        filters.category ||
        filters.actor ||
        filters.date_from ||
        filters.date_to,
    );

    const groupedActivities = useMemo(() => {
        const groups: Array<{ label: string; items: ActivityItem[] }> = [];
        const map = new Map<string, ActivityItem[]>();

        for (const item of activities.data) {
            const label = item.created_at
                ? formatDateGroup(item.created_at)
                : "Earlier";
            if (!map.has(label)) {
                const list: ActivityItem[] = [];
                map.set(label, list);
                groups.push({ label, items: list });
            }
            map.get(label)!.push(item);
        }

        return groups;
    }, [activities.data]);



    return (
        <>
            <Head title="Activity" />

            <div className="flex h-full flex-1 flex-col">
                {/* Header */}
                <div className="border-b border-border/60 bg-card/60 px-6 py-5 backdrop-blur-sm">
                    <div className=" flex  flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                Activity
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                A timeline of important events across your
                                workspace.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="self-start rounded-full sm:self-auto"
                        >
                            <RefreshCw
                                className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-6">
                    <div className=" space-y-6">
                        {/* Search & Filters */}
                        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <form
                                    onSubmit={handleSearchSubmit}
                                    className="relative flex-1"
                                >
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search events or descriptions..."
                                        className="h-9 rounded-full pl-9 pr-8"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch("");
                                                applyFilters({ search: "" });
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
                                        value={filters.category || "all"}
                                        onValueChange={(v) =>
                                            applyFilters({
                                                category: v === "all" ? "" : v,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-[145px] rounded-full text-xs">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Categories
                                            </SelectItem>
                                            <SelectItem value="content">
                                                Content
                                            </SelectItem>
                                            <SelectItem value="team">
                                                Team
                                            </SelectItem>
                                            <SelectItem value="media">
                                                Media
                                            </SelectItem>
                                            <SelectItem value="billing">
                                                Billing
                                            </SelectItem>
                                            <SelectItem value="security">
                                                Security
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={filters.actor || "all"}
                                        onValueChange={(v) =>
                                            applyFilters({
                                                actor: v === "all" ? "" : v,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-[160px] rounded-full text-xs">
                                            <SelectValue placeholder="All Actors" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Actors
                                            </SelectItem>
                                            <SelectItem value="system">
                                                System / Removed
                                            </SelectItem>
                                            {actors.map((actor) => (
                                                <SelectItem
                                                    key={actor.id}
                                                    value={actor.id}
                                                >
                                                    {actor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        Date range:
                                    </span>
                                    <Input
                                        type="date"
                                        value={filters.date_from}
                                        onChange={(e) =>
                                            applyFilters({
                                                date_from: e.target.value,
                                            })
                                        }
                                        aria-label="Date from"
                                        className="h-8 w-[145px] rounded-full text-xs"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        to
                                    </span>
                                    <Input
                                        type="date"
                                        value={filters.date_to}
                                        onChange={(e) =>
                                            applyFilters({
                                                date_to: e.target.value,
                                            })
                                        }
                                        aria-label="Date to"
                                        className="h-8 w-[145px] rounded-full text-xs"
                                    />
                                </div>

                                {hasFilters && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="h-8 rounded-full px-3 text-xs text-muted-foreground"
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        {groupedActivities.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 py-16 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                    <ActivityIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h2 className="text-base font-semibold text-foreground">
                                    {hasFilters
                                        ? "No matching activity"
                                        : "No activity yet"}
                                </h2>
                                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                                    {hasFilters
                                        ? "Try clearing or adjusting your search and filter criteria."
                                        : "When team members perform actions in this workspace, they will appear here."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupedActivities.map((group) => (
                                    <section
                                        key={group.label}
                                        className="space-y-2"
                                    >
                                        <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {group.label}
                                        </h2>
                                        <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xs">
                                            {group.items.map((item) => {
                                                const meta = getEventIcon(
                                                    item.event,
                                                    item.category,
                                                );
                                                const Icon = meta.icon;
                                                const actorName =
                                                    item.user?.name ??
                                                    "System / Removed User";

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.color}`}
                                                                aria-label={
                                                                    meta.label
                                                                }
                                                            >
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="min-w-0 space-y-1">
                                                                <p className="text-sm text-foreground">
                                                                    <span className="font-medium">
                                                                        {
                                                                            actorName
                                                                        }
                                                                    </span>{" "}
                                                                    <span className="text-muted-foreground">
                                                                        —{" "}
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </span>
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="rounded-full px-2 py-0 text-[10px] font-medium capitalize"
                                                                    >
                                                                        {
                                                                            item.category
                                                                        }
                                                                    </Badge>
                                                                    <code className="font-mono text-[11px] text-muted-foreground">
                                                                        {
                                                                            item.event
                                                                        }
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-3 pl-11 sm:justify-end sm:pl-0">
                                                            <time
                                                                dateTime={
                                                                    item.created_at
                                                                }
                                                                title={
                                                                    item.created_at_formatted
                                                                }
                                                                className="whitespace-nowrap text-xs text-muted-foreground"
                                                            >
                                                                {item.created_at
                                                                    ? formatDistanceToNow(
                                                                          parseISO(
                                                                              item.created_at,
                                                                          ),
                                                                          {
                                                                              addSuffix: true,
                                                                          },
                                                                      )
                                                                    : ""}
                                                            </time>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setSelectedActivity(
                                                                        item,
                                                                    )
                                                                }
                                                                className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Info className="mr-1 h-3.5 w-3.5" />
                                                                Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}

                        {/*  Pagination */}
                        {(activities.prev_page_url ||
                            activities.next_page_url ||
                            activities.current_page > 1) && (
                            <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
                                <p className="text-xs text-muted-foreground">
                                    Page{" "}
                                    <span className="font-medium text-foreground">
                                        {activities.current_page}
                                    </span>
                                    {activities.from !== null &&
                                        activities.to !== null && (
                                            <>
                                                {" "}
                                                · Showing{" "}
                                                <span className="font-medium text-foreground">
                                                    {activities.from}
                                                </span>
                                                –
                                                <span className="font-medium text-foreground">
                                                    {activities.to}
                                                </span>
                                            </>
                                        )}
                                </p>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!activities.prev_page_url}
                                        asChild={Boolean(
                                            activities.prev_page_url,
                                        )}
                                        className="h-8 rounded-full px-3 text-xs"
                                    >
                                        {activities.prev_page_url ? (
                                            <Link
                                                className="flex items-center"
                                                href={activities.prev_page_url}
                                                preserveScroll
                                            >
                                                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                                                Previous
                                            </Link>
                                        ) : (
                                            <span className="flex items-center">
                                                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                                                Previous
                                            </span>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!activities.next_page_url}
                                        asChild={Boolean(
                                            activities.next_page_url,
                                        )}
                                        className="h-8 rounded-full px-3 text-xs"
                                    >
                                        {activities.next_page_url ? (
                                            <Link
                                                className="flex items-center"
                                                href={activities.next_page_url}
                                                preserveScroll
                                            >
                                                Next
                                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                            </Link>
                                        ) : (
                                            <span className="flex items-center">
                                                Next
                                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ActivityDetailSheet
                activity={selectedActivity}
                open={Boolean(selectedActivity)}
                onOpenChange={(open) => !open && setSelectedActivity(null)}
            />
        </>
    );
}
