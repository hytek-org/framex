import { router } from '@inertiajs/react';
import { UserMinus } from 'lucide-react';
import { useState } from 'react';
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
import { destroy as destroyMember } from '@/routes/teams/members';
import type { Team, TeamMember } from '@/types';

type Props = {
    team: Team;
    member: TeamMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function RemoveMemberModal({
    team,
    member,
    open,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const removeMember = () => {
        if (!member) {
            return;
        }

        router.visit(destroyMember([team.slug, member.id]), {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                        <UserMinus className="h-6 w-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-bold">
                            Remove Team Member
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Are you sure you want to remove <strong>{member?.name}</strong> ({member?.email}) from <strong>{team.name}</strong>? They will immediately lose access to this workspace.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" size="sm" type="button">
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        size="sm"
                        data-test="remove-member-confirm"
                        disabled={processing}
                        onClick={removeMember}
                        className="gap-1.5 font-medium shadow-xs"
                    >
                        <UserMinus className="h-4 w-4" />
                        <span>{processing ? 'Removing...' : 'Remove Member'}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
