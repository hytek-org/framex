import { Form } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
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
import { destroy } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    team: Team;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteTeamModal({ team, open, onOpenChange }: Props) {
    const [confirmationName, setConfirmationName] = useState('');

    const canDeleteTeam = confirmationName === team.name;

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setConfirmationName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <Form
                    key={String(open)}
                    {...destroy.form(team.slug)}
                    className="space-y-6"
                    onSuccess={() => handleOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader className="gap-2">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold text-destructive">
                                        Delete Workspace
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                                        This action is permanent and cannot be undone. All projects, content articles, uploaded media, and team memberships will be permanently deleted.
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="rounded-lg border border-destructive/20 bg-destructive/[0.03] p-3 text-xs text-destructive dark:text-red-300">
                                    Please confirm by typing the exact workspace name: <strong>{team.name}</strong>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="confirmation-name" className="text-xs font-semibold">
                                        Confirm Workspace Name
                                    </Label>
                                    <Input
                                        id="confirmation-name"
                                        name="name"
                                        data-test="delete-team-name"
                                        value={confirmationName}
                                        onChange={(event) =>
                                            setConfirmationName(event.target.value)
                                        }
                                        placeholder={team.name}
                                        autoComplete="off"
                                        className="text-sm font-mono"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button variant="outline" size="sm" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    type="submit"
                                    data-test="delete-team-confirm"
                                    disabled={!canDeleteTeam || processing}
                                    className="gap-1.5 font-medium shadow-xs"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>{processing ? 'Deleting...' : 'Delete Workspace'}</span>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
