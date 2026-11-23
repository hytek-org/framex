import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
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
import { leave as leaveTeamAction } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    team: Team | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function LeaveTeamModal({ team, open, onOpenChange }: Props) {
    const [processing, setProcessing] = useState(false);

    const leaveTeam = () => {
        if (!team) {
            return;
        }

        router.visit(leaveTeamAction(team.slug), {
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
                        <LogOut className="h-6 w-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-bold">
                            Leave Workspace
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Are you sure you want to leave <strong>{team?.name}</strong>? You will lose access to all resources, projects, and permissions associated with this workspace.
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
                        data-test="leave-team-confirm"
                        disabled={processing}
                        onClick={leaveTeam}
                        className="gap-1.5 font-medium shadow-xs"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>{processing ? 'Leaving...' : 'Leave Workspace'}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
