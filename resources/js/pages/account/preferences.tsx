import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    Bell,
    CheckCircle2,
    Clock,
    Globe,
    Moon,
    Shield,
    Sun,
    Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import AppearanceToggleTab from '@/components/appearance-tabs';
import InputError from '@/components/input-error';
import { FadeIn } from '@/components/shared/motion';

type PreferencesData = {
    theme: string;
    locale: string;
    timezone: string;
    date_format: string;
    time_format: string;
};

type NotificationPreferencesData = {
    product_updates: boolean;
    security_alerts: boolean;
    billing_alerts: boolean;
    weekly_summary: boolean;
};

type Props = {
    preferences: PreferencesData;
    notificationPreferences: NotificationPreferencesData;
    timezones: string[];
};

export default function AccountPreferences({ preferences, notificationPreferences, timezones }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        theme: preferences.theme || 'system',
        locale: preferences.locale || 'en',
        timezone: preferences.timezone || 'UTC',
        date_format: preferences.date_format || 'MMM D, YYYY',
        time_format: preferences.time_format || '12h',
        product_updates: Boolean(notificationPreferences.product_updates),
        security_alerts: Boolean(notificationPreferences.security_alerts),
        billing_alerts: Boolean(notificationPreferences.billing_alerts),
        weekly_summary: Boolean(notificationPreferences.weekly_summary),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/account/preferences', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Account Preferences" />

            <div className="space-y-10">
                {/* ── Theme & Appearance Card ── */}
                <FadeIn>
                    <Card className="rounded-2xl border shadow-xs">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-semibold">Display & Theme</CardTitle>
                            <CardDescription className="text-sm">
                                Customize visual appearance and color mode according to your environment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Interface Color Mode</Label>
                                <div>
                                    <AppearanceToggleTab />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    System default adapts automatically to your OS light/dark preferences.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* ── Regional & Formatting Form ── */}
                <FadeIn delay={0.1}>
                    <Card className="rounded-2xl border shadow-xs">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-semibold">Regional & Date Formatting</CardTitle>
                            <CardDescription className="text-sm">
                                Adjust your locale, date patterns, and time representation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={submit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone" className="text-sm font-medium">
                                            Timezone
                                        </Label>
                                        <Select
                                            value={data.timezone}
                                            onValueChange={(val) => setData('timezone', val)}
                                        >
                                            <SelectTrigger id="timezone" className="w-full">
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                {timezones.slice(0, 100).map((tz) => (
                                                    <SelectItem key={tz} value={tz}>
                                                        {tz}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.timezone} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="locale" className="text-sm font-medium">
                                            Display Language
                                        </Label>
                                        <Select
                                            value={data.locale}
                                            onValueChange={(val) => setData('locale', val)}
                                        >
                                            <SelectTrigger id="locale" className="w-full">
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English (United States)</SelectItem>
                                                <SelectItem value="es">Español (Spanish)</SelectItem>
                                                <SelectItem value="fr">Français (French)</SelectItem>
                                                <SelectItem value="de">Deutsch (German)</SelectItem>
                                                <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.locale} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_format" className="text-sm font-medium">
                                            Date Display Format
                                        </Label>
                                        <Select
                                            value={data.date_format}
                                            onValueChange={(val) => setData('date_format', val)}
                                        >
                                            <SelectTrigger id="date_format" className="w-full">
                                                <SelectValue placeholder="Select format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MMM D, YYYY">MMM D, YYYY (e.g. Nov 23, 2026)</SelectItem>
                                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-23)</SelectItem>
                                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (e.g. 23/11/2026)</SelectItem>
                                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/23/2026)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.date_format} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time_format" className="text-sm font-medium">
                                            Clock Time Notation
                                        </Label>
                                        <Select
                                            value={data.time_format}
                                            onValueChange={(val) => setData('time_format', val)}
                                        >
                                            <SelectTrigger id="time_format" className="w-full">
                                                <SelectValue placeholder="Select notation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="12h">12-hour clock (e.g. 2:30 PM)</SelectItem>
                                                <SelectItem value="24h">24-hour clock (e.g. 14:30)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.time_format} />
                                    </div>
                                </div>

                                <Separator />

                                {/* ── Notification Subscriptions ── */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-base font-semibold">Notification & Alert Channels</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Choose what automated communications you wish to receive from FrameX.
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between rounded-xl border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="security_alerts" className="text-sm font-medium cursor-pointer">
                                                    Critical Security & Login Alerts
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Immediate alerts for new device logins, password resets, and permission changes.
                                                </p>
                                            </div>
                                            <Switch
                                                id="security_alerts"
                                                checked={data.security_alerts}
                                                onCheckedChange={(val) => setData('security_alerts', val)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="billing_alerts" className="text-sm font-medium cursor-pointer">
                                                    Billing & Invoicing Notifications
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Monthly receipts, plan renewal reminders, and payment failure notifications.
                                                </p>
                                            </div>
                                            <Switch
                                                id="billing_alerts"
                                                checked={data.billing_alerts}
                                                onCheckedChange={(val) => setData('billing_alerts', val)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="weekly_summary" className="text-sm font-medium cursor-pointer">
                                                    Weekly Workspace Digest
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Summarized team activity, content performance, and analytics digest.
                                                </p>
                                            </div>
                                            <Switch
                                                id="weekly_summary"
                                                checked={data.weekly_summary}
                                                onCheckedChange={(val) => setData('weekly_summary', val)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="product_updates" className="text-sm font-medium cursor-pointer">
                                                    Product Changelog & Feature Announcements
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Updates on new platform capabilities, architectural modules, and releases.
                                                </p>
                                            </div>
                                            <Switch
                                                id="product_updates"
                                                checked={data.product_updates}
                                                onCheckedChange={(val) => setData('product_updates', val)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <Button type="submit" disabled={processing} className="min-w-28">
                                        {processing ? 'Saving...' : 'Save Preferences'}
                                    </Button>

                                    {recentlySuccessful && (
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4" /> Preferences saved successfully.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </>
    );
}

AccountPreferences.layout = {
    breadcrumbs: [
        { title: 'Account', href: '/account' },
        { title: 'Preferences', href: '/account/preferences' },
    ],
};
