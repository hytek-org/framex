import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Check,
    CheckCircle2,
    Crown,
    Eye,
    Globe,
    LogOut,
    Pencil,
    Plus,
    Search,
    Shield,
    Sparkles,
    User,
    Users,
    Users2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import CreateTeamModal from '@/components/create-team-modal';
import Heading from '@/components/heading';
import LeaveTeamModal from '@/components/leave-team-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { edit, index, switchMethod } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    teams: Team[];
};

export default function TeamsIndex({ teams }: Props) {
    const getInitials = useInitials();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'member'>('all');
    const [switchingId, setSwitchingId] = useState<number | null>(null);
    const [leaveTeamDialogOpen, setLeaveTeamDialogOpen] = useState(false);
    const [teamLeaving, setTeamLeaving] = useState<Team | null>(null);

    const openLeaveTeamDialog = (team: Team) => {
        setTeamLeaving(team);
        setLeaveTeamDialogOpen(true);
    };

    const handleSwitchTeam = (team: Team) => {
        if (team.isCurrent || switchingId) {
            return;
        }

        setSwitchingId(team.id);
        router.visit(switchMethod(team.slug), {
            onFinish: () => setSwitchingId(null),
        });
    };

    const currentTeam = useMemo(
        () => teams.find((t) => t.isCurrent) || teams[0] || null,
        [teams]
    );

    const ownedTeamsCount = useMemo(
        () => teams.filter((t) => t.role === 'owner').length,
        [teams]
    );

    const sharedTeamsCount = useMemo(
        () => teams.filter((t) => t.role !== 'owner').length,
        [teams]
    );

    const filteredTeams = useMemo(() => {
        return teams.filter((team) => {
            const matchesSearch =
                searchQuery.trim() === '' ||
                team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                team.slug.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) {
                return false;
            }

            if (roleFilter === 'owner') {
                return team.role === 'owner';
            }
            if (roleFilter === 'member') {
                return team.role !== 'owner';
            }

            return true;
        });
    }, [teams, searchQuery, roleFilter]);

    return (
        <>
            <Head title="Teams & Workspaces" />

            <h1 className="sr-only">Teams & Workspaces</h1>

            <div className="space-y-8">
                {/* Header & Quick Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Teams & Workspaces
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Collaborate across enterprise organizations, departments, and private project workspaces.
                        </p>
                    </div>

                    <CreateTeamModal>
                        <Button
                            data-test="teams-new-team-button"
                            className="shrink-0 gap-2 font-medium shadow-xs"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Workspace</span>
                        </Button>
                    </CreateTeamModal>
                </div>

                {/* Stat Summary Metrics */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="p-4 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">Total Workspaces</p>
                                <p className="text-xl font-bold tracking-tight text-foreground">{teams.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">Active Workspace</p>
                                <p className="truncate text-sm font-bold text-foreground">
                                    {currentTeam ? currentTeam.name : 'None'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Crown className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">Workspaces Owned</p>
                                <p className="text-xl font-bold tracking-tight text-foreground">{ownedTeamsCount}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Users2 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">Collaborations</p>
                                <p className="text-xl font-bold tracking-tight text-foreground">{sharedTeamsCount}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Filter workspaces by name or slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border bg-muted/40 p-1">
                        <Button
                            variant={roleFilter === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setRoleFilter('all')}
                            className="h-7 text-xs font-medium px-2.5"
                        >
                            All ({teams.length})
                        </Button>
                        <Button
                            variant={roleFilter === 'owner' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setRoleFilter('owner')}
                            className="h-7 text-xs font-medium px-2.5"
                        >
                            Owned ({ownedTeamsCount})
                        </Button>
                        <Button
                            variant={roleFilter === 'member' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setRoleFilter('member')}
                            className="h-7 text-xs font-medium px-2.5"
                        >
                            Joined ({sharedTeamsCount})
                        </Button>
                    </div>
                </div>

                {/* Workspace List / Grid */}
                <div className="space-y-3">
                    {filteredTeams.map((team) => {
                        const canLeaveTeam = !team.isPersonal && team.role !== 'owner';
                        const isSwitching = switchingId === team.id;

                        return (
                            <div
                                key={team.id}
                                data-test="team-row"
                                className={cn(
                                    'group flex flex-col gap-4 rounded-xl border p-5 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between',
                                    team.isCurrent
                                        ? 'border-primary/40 bg-primary/[0.02] shadow-xs dark:bg-primary/[0.04]'
                                        : 'bg-card hover:border-muted-foreground/30 hover:shadow-2xs'
                                )}
                            >
                                {/* Left Info */}
                                <div className="flex items-start sm:items-center gap-4">
                                    <div
                                        className={cn(
                                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-2xs',
                                            team.role === 'owner'
                                                ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                                : team.role === 'admin'
                                                ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                                : 'bg-gradient-to-br from-muted to-muted/80 text-foreground border border-border'
                                        )}
                                    >
                                        {getInitials(team.name)}
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-base text-foreground tracking-tight">
                                                {team.name}
                                            </span>

                                            {team.isCurrent && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] font-semibold gap-1 py-0.5"
                                                >
                                                    <Check className="h-3 w-3" /> Active Workspace
                                                </Badge>
                                            )}

                                            {team.isPersonal && (
                                                <Badge variant="secondary" className="text-[11px] font-medium py-0.5">
                                                    Personal
                                                </Badge>
                                            )}

                                            {team.role === 'owner' ? (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-[11px] font-medium gap-1 py-0.5"
                                                >
                                                    <Crown className="h-3 w-3" /> Owner
                                                </Badge>
                                            ) : team.role === 'admin' ? (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 text-[11px] font-medium gap-1 py-0.5"
                                                >
                                                    <Shield className="h-3 w-3" /> Admin
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-muted-foreground text-[11px] font-medium gap-1 py-0.5"
                                                >
                                                    <User className="h-3 w-3" /> Member
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                                            <span>/{team.slug}</span>
                                            <span className="text-muted-foreground/40">•</span>
                                            <span>{team.roleLabel}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0">
                                    {!team.isCurrent ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isSwitching}
                                            onClick={() => handleSwitchTeam(team)}
                                            className="h-8 text-xs font-medium"
                                        >
                                            {isSwitching ? 'Switching...' : 'Switch to workspace'}
                                        </Button>
                                    ) : null}

                                    {team.role === 'member' ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            data-test="team-view-button"
                                            asChild
                                            className="h-8 text-xs font-medium gap-1.5"
                                        >
                                            <Link href={edit(team.slug)}>
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>View details</span>
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant={team.isCurrent ? 'default' : 'outline'}
                                            size="sm"
                                            data-test="team-edit-button"
                                            asChild
                                            className="h-8 text-xs font-medium gap-1.5"
                                        >
                                            <Link href={edit(team.slug)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                                <span>Manage settings</span>
                                            </Link>
                                        </Button>
                                    )}

                                    {canLeaveTeam && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="team-leave-button"
                                                        onClick={() => openLeaveTeamDialog(team)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        <span className="sr-only">Leave workspace</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Leave workspace</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredTeams.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 px-4 text-center">
                            <Building2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
                            <h3 className="text-base font-semibold text-foreground">
                                {searchQuery ? 'No matching workspaces' : 'No workspaces available'}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                                {searchQuery
                                    ? `No workspaces found matching "${searchQuery}". Try adjusting your search or filter.`
                                    : 'You do not belong to any workspaces yet. Create your first workspace to start collaborating.'}
                            </p>
                            {searchQuery ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setRoleFilter('all');
                                    }}
                                    className="mt-4 text-xs"
                                >
                                    Clear filters
                                </Button>
                            ) : (
                                <CreateTeamModal>
                                    <Button size="sm" className="mt-4 gap-1.5 text-xs">
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Create Workspace</span>
                                    </Button>
                                </CreateTeamModal>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <LeaveTeamModal
                team={teamLeaving}
                open={leaveTeamDialogOpen}
                onOpenChange={setLeaveTeamDialogOpen}
            />
        </>
    );
}

TeamsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Teams & Workspaces',
            href: index(),
        },
    ],
};
