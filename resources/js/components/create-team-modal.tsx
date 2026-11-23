import { Form } from '@inertiajs/react';
import { Building2, Sparkles } from 'lucide-react';
import type { PropsWithChildren } from 'react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/teams';

export default function CreateTeamModal({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <Form
                    key={String(open)}
                    {...store.form()}
                    className="space-y-6"
                    onSuccess={() => setOpen(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader className="gap-2">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold">
                                        Create New Workspace
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                                        Workspaces allow your team to collaborate on projects, content, and applications with dedicated members and settings.
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-xs font-semibold">
                                        Workspace Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        data-test="create-team-name"
                                        placeholder="e.g., Acme Cloud, Marketing, Mobile Team"
                                        required
                                        autoFocus
                                        className="text-sm"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground flex items-center gap-1.5 mb-0.5">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        <span>Owner Privileges</span>
                                    </p>
                                    <span>
                                        You will be automatically designated as the Owner of this workspace and can invite collaborators and configure team roles.
                                    </span>
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
                                    data-test="create-team-submit"
                                    disabled={processing}
                                    className="font-medium shadow-xs"
                                >
                                    {processing ? 'Creating workspace...' : 'Create Workspace'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
