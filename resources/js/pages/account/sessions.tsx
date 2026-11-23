import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Laptop,
    LogOut,
    Monitor,
    Shield,
    ShieldAlert,
    Smartphone,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { FadeIn } from '@/components/shared/motion';

type Session = {
    id: string;
    ip_address: string | null;
    browser: string;
    platform: string;
    is_desktop: boolean;
    last_active: string;
    last_active_at: string;
};

type Props = {
    sessions: Session[];
    currentSessionId: string;
};

export default function AccountSessions({ sessions, currentSessionId }: Props) {
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [terminateAllOpen, setTerminateAllOpen] = useState(false);
    const [terminateSingleOpen, setTerminateSingleOpen] = useState(false);

    // Form for terminating all other sessions
    const {
        data: allData,
        setData: setAllData,
        delete: destroyOthers,
        processing: processingAll,
        errors: errorsAll,
        reset: resetAll,
        clearErrors: clearErrorsAll,
    } = useForm({
        password: '',
    });

    // Form for terminating single session
    const {
        data: singleData,
        setData: setSingleData,
        delete: destroySingle,
        processing: processingSingle,
        errors: errorsSingle,
        reset: resetSingle,
        clearErrors: clearErrorsSingle,
    } = useForm({
        password: '',
    });

    const handleTerminateAll: FormEventHandler = (e) => {
        e.preventDefault();
        destroyOthers('/account/sessions', {
            preserveScroll: true,
            onSuccess: () => {
                setTerminateAllOpen(false);
                resetAll();
            },
        });
    };

    const handleTerminateSingle: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedSessionId) return;

        destroySingle(`/account/sessions/${selectedSessionId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setTerminateSingleOpen(false);
                setSelectedSessionId(null);
                resetSingle();
            },
        });
    };

    const otherSessionsCount = sessions.filter((s) => s.id !== currentSessionId).length;

    return (
        <>
            <Head title="Active Sessions" />

            <div className="space-y-8">
                <FadeIn>
                    <Card className="rounded-2xl border shadow-xs">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-semibold">Active Browser Sessions</CardTitle>
                                    <CardDescription className="text-sm">
                                        Monitor and terminate active sessions signed into your account across various devices and locations.
                                    </CardDescription>
                                </div>

                                {otherSessionsCount > 0 && (
                                    <Dialog open={terminateAllOpen} onOpenChange={setTerminateAllOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10">
                                                <LogOut className="mr-2 h-4 w-4" /> Log Out All Other Devices
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Log out from all other devices</DialogTitle>
                                                <DialogDescription>
                                                    Please enter your current password to confirm you want to revoke all other active sessions across mobile and desktop devices.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <form onSubmit={handleTerminateAll} className="space-y-4 pt-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="all_password">Current Password</Label>
                                                    <PasswordInput
                                                        id="all_password"
                                                        value={allData.password}
                                                        onChange={(e) => setAllData('password', e.target.value)}
                                                        placeholder="Enter account password"
                                                        autoFocus
                                                    />
                                                    <InputError message={errorsAll.password} />
                                                </div>

                                                <DialogFooter className="gap-2">
                                                    <DialogClose asChild>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            onClick={() => {
                                                                resetAll();
                                                                clearErrorsAll();
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                    <Button
                                                        type="submit"
                                                        variant="destructive"
                                                        disabled={processingAll}
                                                    >
                                                        {processingAll ? 'Revoking...' : 'Revoke All Other Sessions'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {sessions.map((session) => {
                                    const isCurrent = session.id === currentSessionId;

                                    return (
                                        <div
                                            key={session.id}
                                            className={`flex items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                                                isCurrent
                                                    ? 'bg-primary/5 border-primary/20 dark:bg-primary/10'
                                                    : 'bg-card border-border hover:bg-muted/40'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-0.5 sm:mt-0 p-2.5 rounded-xl border ${
                                                    isCurrent
                                                        ? 'bg-primary/10 text-primary border-primary/20'
                                                        : 'bg-muted text-muted-foreground border-border'
                                                }`}>
                                                    {session.is_desktop ? (
                                                        <Laptop className="h-5 w-5" />
                                                    ) : (
                                                        <Smartphone className="h-5 w-5" />
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            {session.platform} • {session.browser}
                                                        </span>
                                                        {isCurrent && (
                                                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs py-0">
                                                                This Device
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                                        <span>IP: {session.ip_address || 'Unknown'}</span>
                                                        <span>•</span>
                                                        <span>Last active: {session.last_active}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {!isCurrent && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                                                    onClick={() => {
                                                        setSelectedSessionId(session.id);
                                                        setTerminateSingleOpen(true);
                                                    }}
                                                >
                                                    Revoke
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>

            {/* Terminate Single Session Dialog */}
            <Dialog open={terminateSingleOpen} onOpenChange={setTerminateSingleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Terminate this session</DialogTitle>
                        <DialogDescription>
                            Confirm with your password to revoke authorization for this browser session.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleTerminateSingle} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="single_password">Current Password</Label>
                            <PasswordInput
                                id="single_password"
                                value={singleData.password}
                                onChange={(e) => setSingleData('password', e.target.value)}
                                placeholder="Enter account password"
                                autoFocus
                            />
                            <InputError message={errorsSingle.password} />
                        </div>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        resetSingle();
                                        clearErrorsSingle();
                                        setSelectedSessionId(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processingSingle}
                            >
                                {processingSingle ? 'Revoking...' : 'Terminate Session'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

AccountSessions.layout = {
    breadcrumbs: [
        { title: 'Account', href: '/account' },
        { title: 'Sessions', href: '/account/sessions' },
    ],
};
