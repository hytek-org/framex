import { Form, Head } from '@inertiajs/react';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Security & Authentication" />

            <h1 className="sr-only">Security & Authentication</h1>

            <div className="space-y-8">
                {/* Header Banner */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Security & Authentication
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ensure your enterprise account is guarded with high-entropy passwords, multi-factor verification, and modern passkeys.
                    </p>
                </div>

                {/* Password Update Card */}
                <Card className="shadow-xs">
                    <CardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold">Change Password</CardTitle>
                                <CardDescription>
                                    Update your account password. We recommend using a unique password stored in a password manager.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                    >
                        {({ errors, processing }) => (
                            <>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2 max-w-lg">
                                        <Label htmlFor="current_password" className="text-xs font-semibold">
                                            Current Password
                                        </Label>

                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            className="text-sm"
                                            autoComplete="current-password"
                                            placeholder="Enter your current password"
                                        />

                                        <InputError message={errors.current_password} />
                                    </div>

                                    <div className="grid gap-2 max-w-lg">
                                        <Label htmlFor="password" className="text-xs font-semibold">
                                            New Password
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            className="text-sm"
                                            autoComplete="new-password"
                                            placeholder="Enter a secure new password"
                                            passwordrules={props.passwordRules}
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2 max-w-lg">
                                        <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                            Confirm New Password
                                        </Label>

                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            className="text-sm"
                                            autoComplete="new-password"
                                            placeholder="Repeat the new password"
                                            passwordrules={props.passwordRules}
                                        />

                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t pt-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        data-test="update-password-button"
                                        className="font-medium shadow-xs"
                                    >
                                        {processing ? 'Updating password...' : 'Update Password'}
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Form>
                </Card>

                {/* Two Factor Authentication Card */}
                {props.canManageTwoFactor && (
                    <Card className="shadow-xs">
                        <CardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">Two-Factor Authentication (2FA)</CardTitle>
                                    <CardDescription>
                                        Add an extra layer of protection to your account with a time-based one-time password (TOTP) authenticator app.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ManageTwoFactor
                                canManageTwoFactor={props.canManageTwoFactor}
                                requiresConfirmation={props.requiresConfirmation}
                                twoFactorEnabled={props.twoFactorEnabled}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Passkeys Card */}
                {props.canManagePasskeys && (
                    <Card className="shadow-xs">
                        <CardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <KeyRound className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">Passkeys & Security Keys</CardTitle>
                                    <CardDescription>
                                        Sign in passwordlessly and securely using biometric sensors (Touch ID, Windows Hello, Face ID) or hardware security keys (YubiKey).
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ManagePasskeys
                                canManagePasskeys={props.canManagePasskeys}
                                passkeys={props.passkeys}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security & Auth',
            href: edit(),
        },
    ],
};
