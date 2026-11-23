import { Form } from '@inertiajs/react';
import { Crown, Mail, Shield, User, UserPlus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store as storeInvitation } from '@/routes/teams/invitations';
import type { RoleOption, Team } from '@/types';

type Props = {
    team: Team;
    availableRoles: RoleOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function InviteMemberModal({
    team,
    availableRoles,
    open,
    onOpenChange,
}: Props) {
    const [inviteRole, setInviteRole] = useState<RoleOption['value']>('member');

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setInviteRole('member');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <Form
                    key={String(open)}
                    {...storeInvitation.form(team.slug)}
                    className="space-y-6"
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader className="gap-2">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <UserPlus className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold">
                                        Invite Collaborator
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                                        Send an invitation to join <strong>{team.name}</strong>. They will receive an email with instructions to accept.
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-xs font-semibold">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            data-test="invite-email"
                                            placeholder="colleague@company.com"
                                            required
                                            autoFocus
                                            className="pl-9 text-sm"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role" className="text-xs font-semibold">
                                        Assigned Role
                                    </Label>
                                    <Select
                                        name="role"
                                        data-test="invite-role"
                                        value={inviteRole}
                                        onValueChange={(value) =>
                                            setInviteRole(value as RoleOption['value'])
                                        }
                                    >
                                        <SelectTrigger className="w-full text-xs">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem
                                                    key={role.value}
                                                    value={role.value}
                                                    className="text-xs"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {role.value === 'admin' ? (
                                                            <Shield className="h-3.5 w-3.5 text-blue-600" />
                                                        ) : (
                                                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                        )}
                                                        <span>{role.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />

                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {inviteRole === 'admin'
                                            ? 'Admins can manage team members, invite collaborators, and edit workspace resources.'
                                            : 'Members can create, draft, and collaborate on workspace resources according to policy.'}
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button variant="outline" size="sm" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    size="sm"
                                    data-test="invite-submit"
                                    disabled={processing}
                                    className="font-medium shadow-xs"
                                >
                                    {processing ? 'Sending invite...' : 'Send Invitation'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
