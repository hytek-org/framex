import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    Crown,
    Globe,
    Info,
    Mail,
    Pencil,
    Search,
    Shield,
    Trash2,
    User,
    UserCheck,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import CancelInvitationModal from '@/components/cancel-invitation-modal';
import DeleteTeamModal from '@/components/delete-team-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import InviteMemberModal from '@/components/invite-member-modal';
import RemoveMemberModal from '@/components/remove-member-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { edit, index, switchMethod, update } from '@/routes/teams';
import { update as updateMember } from '@/routes/teams/members';
import type {
    Auth,
    RoleOption,
    Team,
    TeamInvitation,
    TeamMember,
    TeamPermissions,
} from '@/types';

type Props = {
    team: Team;
    members: TeamMember[];
    invitations: TeamInvitation[];
    permissions: TeamPermissions;
    availableRoles: RoleOption[];
};

export default function TeamEdit({
    team,
    members,
    invitations,
    permissions,
    availableRoles,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const getInitials = useInitials();

    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'owner' | 'admin' | 'member'>('all');
    const [isSwitching, setIsSwitching] = useState(false);

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
    const [cancelInvitationDialogOpen, setCancelInvitationDialogOpen] = useState(false);
    const [invitationToCancel, setInvitationToCancel] = useState<TeamInvitation | null>(null);

    const pageTitle = useMemo(
        () => (permissions.canUpdateTeam ? `Manage ${team.name}` : `View ${team.name}`),
        [permissions.canUpdateTeam, team.name]
    );

    const handleSwitchTeam = () => {
        if (team.isCurrent || isSwitching) {
            return;
        }

        setIsSwitching(true);
        router.visit(switchMethod(team.slug), {
            onFinish: () => setIsSwitching(false),
        });
    };

    const updateMemberRole = (member: TeamMember, newRole: string) => {
        router.visit(updateMember([team.slug, member.id]), {
            data: { role: newRole },
            preserveScroll: true,
        });
    };

    const confirmRemoveMember = (member: TeamMember) => {
        setMemberToRemove(member);
        setRemoveMemberDialogOpen(true);
    };

    const confirmCancelInvitation = (invitation: TeamInvitation) => {
        setInvitationToCancel(invitation);
        setCancelInvitationDialogOpen(true);
    };

    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            const matchesSearch =
                memberSearchQuery.trim() === '' ||
                member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(memberSearchQuery.toLowerCase());

            if (!matchesSearch) {
                return false;
            }

            if (selectedRoleFilter !== 'all') {
                return member.role === selectedRoleFilter;
            }

            return true;
        });
    }, [members, memberSearchQuery, selectedRoleFilter]);

    return (
        <>
            <Head title={pageTitle} />

            <h1 className="sr-only">{pageTitle}</h1>

            <div className="space-y-8">
                {/* Back Link */}
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ml-2 h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Link href="/account/teams">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Teams & Workspaces</span>
                        </Link>
                    </Button>
                </div>

                {/* Workspace Header Overview Card */}
                <Card className="overflow-hidden border shadow-xs">
                    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className={cn(
                                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold shadow-xs',
                                    team.role === 'owner'
                                        ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                        : team.role === 'admin'
                                        ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                        : 'bg-gradient-to-br from-muted to-muted/80 text-foreground border'
                                )}
                            >
                                {getInitials(team.name)}
                            </div>

                            <div className="min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                        {team.name}
                                    </h2>

                                    {team.isCurrent && (
                                        <Badge
                                            variant="outline"
                                            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold gap-1 py-0.5"
                                        >
                                            <Check className="h-3 w-3" /> Active Workspace
                                        </Badge>
                                    )}

                                    {team.isPersonal && (
                                        <Badge variant="secondary" className="text-xs font-medium py-0.5">
                                            Personal
                                        </Badge>
                                    )}

                                    {team.role === 'owner' ? (
                                        <Badge
                                            variant="outline"
                                            className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs font-medium gap-1 py-0.5"
                                        >
                                            <Crown className="h-3 w-3" /> Owner
                                        </Badge>
                                    ) : team.role === 'admin' ? (
                                        <Badge
                                            variant="outline"
                                            className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 text-xs font-medium gap-1 py-0.5"
                                        >
                                            <Shield className="h-3 w-3" /> Admin
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-muted-foreground text-xs font-medium gap-1 py-0.5"
                                        >
                                            <User className="h-3 w-3" /> Member
                                        </Badge>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5" />
                                    <span>app.framex.io/{team.slug}</span>
                                </p>
                            </div>
                        </div>

                        {/* Top Action */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                            {!team.isCurrent && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isSwitching}
                                    onClick={handleSwitchTeam}
                                    className="h-8 text-xs font-medium"
                                >
                                    {isSwitching ? 'Switching...' : 'Switch to this workspace'}
                                </Button>
                            )}

                            {permissions.canCreateInvitation && (
                                <Button
                                    size="sm"
                                    data-test="invite-member-button"
                                    onClick={() => setInviteDialogOpen(true)}
                                    className="h-8 gap-1.5 text-xs font-medium shadow-xs"
                                >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    <span>Invite Member</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Section 1: General Settings */}
                <Card className="shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">General Information</CardTitle>
                        <CardDescription>
                            Configure the display name and core identification details for this workspace.
                        </CardDescription>
                    </CardHeader>

                    {permissions.canUpdateTeam ? (
                        <Form {...update.form(team.slug)}>
                            {({ errors, processing }) => (
                                <>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name" className="text-sm font-medium">
                                                Workspace Name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                data-test="team-name-input"
                                                defaultValue={team.name}
                                                placeholder="e.g., Acme Corporation"
                                                required
                                                className="max-w-lg"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-1.5 text-xs text-muted-foreground">
                                            <p className="font-medium text-foreground">Workspace URL Identifier (Slug)</p>
                                            <p className="font-mono bg-muted/50 p-2 rounded-md max-w-lg border text-muted-foreground">
                                                /{team.slug}
                                            </p>
                                            <p>Used in routes and scoped APIs to identify this workspace environment.</p>
                                        </div>

                                        {team.isPersonal && (
                                            <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground max-w-lg">
                                                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                                <span>
                                                    This is your personal workspace. Personal workspaces cannot be deleted or left as they serve as your account's primary default sandbox.
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="border-t pt-4">
                                        <Button
                                            type="submit"
                                            data-test="team-save-button"
                                            disabled={processing}
                                            className="font-medium shadow-xs"
                                        >
                                            {processing ? 'Saving changes...' : 'Save Changes'}
                                        </Button>
                                    </CardFooter>
                                </>
                            )}
                        </Form>
                    ) : (
                        <CardContent className="space-y-4">
                            <div className="grid gap-1">
                                <span className="text-xs font-medium text-muted-foreground">Workspace Name</span>
                                <span className="text-base font-semibold text-foreground">{team.name}</span>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                                <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>You have view-only access to this workspace. Contact an owner or admin to change settings.</span>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Section 2: Members & Access Control */}
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    {members.length} {members.length === 1 ? 'member' : 'members'}
                                </Badge>
                            </div>
                            <CardDescription>
                                {permissions.canCreateInvitation
                                    ? 'Manage team members, change workspace roles, and control permission levels.'
                                    : 'View current members and role assignments for this workspace.'}
                            </CardDescription>
                        </div>

                        {permissions.canCreateInvitation && (
                            <Button
                                size="sm"
                                data-test="invite-member-button"
                                onClick={() => setInviteDialogOpen(true)}
                                className="h-8 gap-1.5 text-xs font-medium shrink-0"
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Invite Member</span>
                            </Button>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Member Search & Filter Bar */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                            <div className="relative w-full max-w-xs">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={memberSearchQuery}
                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                    className="pl-9 text-xs h-8"
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                {(['all', 'owner', 'admin', 'member'] as const).map((role) => (
                                    <Button
                                        key={role}
                                        variant={selectedRoleFilter === role ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedRoleFilter(role)}
                                        className="h-7 text-[11px] capitalize px-2.5"
                                    >
                                        {role === 'all' ? 'All Roles' : role}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Member Rows */}
                        <div className="divide-y rounded-lg border">
                            {filteredMembers.map((member) => {
                                const isSelf = auth?.user?.id === member.id;

                                return (
                                    <div
                                        key={member.id}
                                        data-test="member-row"
                                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/20"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <Avatar className="h-10 w-10 border shadow-2xs">
                                                {member.avatar ? (
                                                    <AvatarImage src={member.avatar} alt={member.name} />
                                                ) : null}
                                                <AvatarFallback className="font-semibold text-xs">
                                                    {getInitials(member.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {member.name}
                                                    </span>
                                                    {isSelf && (
                                                        <Badge variant="secondary" className="text-[10px] font-medium py-0 px-1.5">
                                                            You
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            {member.role !== 'owner' && permissions.canUpdateMember ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            data-test="member-role-trigger"
                                                            className="h-8 gap-1.5 text-xs font-medium"
                                                        >
                                                            {member.role === 'admin' ? (
                                                                <Shield className="h-3 w-3 text-blue-600" />
                                                            ) : (
                                                                <User className="h-3 w-3 text-muted-foreground" />
                                                            )}
                                                            <span>{member.role_label}</span>
                                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        {availableRoles.map((role) => (
                                                            <DropdownMenuItem
                                                                key={role.value}
                                                                data-test="member-role-option"
                                                                onSelect={() => updateMemberRole(member, role.value)}
                                                                className="flex items-center justify-between text-xs"
                                                            >
                                                                <span>{role.label}</span>
                                                                {member.role === role.value && (
                                                                    <Check className="h-3.5 w-3.5 text-primary" />
                                                                )}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'text-xs font-medium gap-1 py-1 px-2.5',
                                                        member.role === 'owner'
                                                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                                            : member.role === 'admin'
                                                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                                                            : 'text-muted-foreground'
                                                    )}
                                                >
                                                    {member.role === 'owner' ? (
                                                        <Crown className="h-3 w-3" />
                                                    ) : member.role === 'admin' ? (
                                                        <Shield className="h-3 w-3" />
                                                    ) : (
                                                        <User className="h-3 w-3" />
                                                    )}
                                                    <span>{member.role_label}</span>
                                                </Badge>
                                            )}

                                            {member.role !== 'owner' && permissions.canRemoveMember && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                data-test="member-remove-button"
                                                                onClick={() => confirmRemoveMember(member)}
                                                                className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                            >
                                                                <X className="h-4 w-4" />
                                                                <span className="sr-only">Remove member</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Remove member from workspace</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredMembers.length === 0 && (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No members found matching your search.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Pending Invitations */}
                {invitations.length > 0 && (
                    <Card className="shadow-xs">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg font-semibold">Pending Invitations</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    {invitations.length}
                                </Badge>
                            </div>
                            <CardDescription>
                                Outstanding invitations sent to collaborators that have not yet been accepted.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="divide-y rounded-lg border">
                                {invitations.map((invitation) => (
                                    <div
                                        key={invitation.code}
                                        data-test="invitation-row"
                                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/20"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">
                                                    {invitation.email}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Invited as <span className="font-medium text-foreground">{invitation.role_label}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            {permissions.canCancelInvitation && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    data-test="invitation-cancel-button"
                                                    onClick={() => confirmCancelInvitation(invitation)}
                                                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    <span>Revoke Invite</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Section 4: Enterprise Role Permissions Matrix */}
                <Card className="shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Role Permissions Matrix</CardTitle>
                        <CardDescription>
                            Detailed breakdown of granular capabilities and security policies assigned to each role within FrameX.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-hidden rounded-lg border bg-card">
                            <div className="grid grid-cols-4 border-b bg-muted/40 p-3.5 text-xs font-semibold text-muted-foreground">
                                <div>Permission Capability Area</div>
                                <div className="text-center flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400">
                                    <Crown className="h-3.5 w-3.5" /> Owner
                                </div>
                                <div className="text-center flex items-center justify-center gap-1 text-blue-700 dark:text-blue-400">
                                    <Shield className="h-3.5 w-3.5" /> Admin
                                </div>
                                <div className="text-center flex items-center justify-center gap-1 text-muted-foreground">
                                    <User className="h-3.5 w-3.5" /> Member
                                </div>
                            </div>

                            <div className="divide-y text-xs">
                                {[
                                    { area: 'Workspace Identity & Plan Settings', owner: true, admin: true, member: false },
                                    { area: 'Invite & Manage Team Members', owner: true, admin: true, member: false },
                                    { area: 'Delete Team Workspace', owner: true, admin: false, member: false },
                                    { area: 'Content Studio: Create & Draft Articles', owner: true, admin: true, member: true },
                                    { area: 'Content Studio: Edit & Review Submissions', owner: true, admin: true, member: true },
                                    { area: 'Content Studio: Publish Live to Production', owner: true, admin: true, member: false },
                                    { area: 'Content Studio: Delete & Bulk Actions', owner: true, admin: true, member: false },
                                    { area: 'Media Studio: Upload & Asset Management', owner: true, admin: true, member: false },
                                    { area: 'Developer API Keys & Webhook Access', owner: true, admin: true, member: false },
                                ].map((row, idx) => (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-4 items-center p-3 transition-colors hover:bg-muted/20"
                                    >
                                        <div className="font-medium text-foreground">{row.area}</div>
                                        <div className="flex justify-center">
                                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex justify-center">
                                            {row.admin ? (
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <span className="font-mono text-muted-foreground/30">—</span>
                                            )}
                                        </div>
                                        <div className="flex justify-center">
                                            {row.member ? (
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <span className="font-mono text-muted-foreground/30">—</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 5: Danger Zone (Workspace Deletion) */}
                {permissions.canDeleteTeam && !team.isPersonal && (
                    <Card className="border-destructive/30 bg-destructive/[0.02] shadow-xs dark:bg-destructive/[0.04]">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                <CardTitle className="text-lg font-semibold text-destructive">
                                    Danger Zone
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Irreversible actions that will permanently affect this workspace and all associated resources.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/20 bg-background p-4">
                                <div>
                                    <p className="font-semibold text-sm text-foreground">Delete this workspace</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Once deleted, all projects, contents, media files, and invitations will be permanently removed.
                                    </p>
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    data-test="delete-team-button"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    className="shrink-0 gap-1.5 font-medium shadow-xs"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Workspace</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modals */}
            {permissions.canCreateInvitation && (
                <InviteMemberModal
                    team={team}
                    availableRoles={availableRoles}
                    open={inviteDialogOpen}
                    onOpenChange={setInviteDialogOpen}
                />
            )}

            <RemoveMemberModal
                team={team}
                member={memberToRemove}
                open={removeMemberDialogOpen}
                onOpenChange={setRemoveMemberDialogOpen}
            />

            <CancelInvitationModal
                team={team}
                invitation={invitationToCancel}
                open={cancelInvitationDialogOpen}
                onOpenChange={setCancelInvitationDialogOpen}
            />

            {permissions.canDeleteTeam && !team.isPersonal && (
                <DeleteTeamModal
                    team={team}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
            )}
        </>
    );
}

TeamEdit.layout = (props: { team: { name: string; slug: string } }) => ({
    breadcrumbs: [
        {
            title: 'Teams & Workspaces',
            href: index(),
        },
        {
            title: props.team.name,
            href: edit(props.team.slug),
        },
    ],
});
