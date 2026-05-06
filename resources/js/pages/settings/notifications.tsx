import { Head, router, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Preferences = {
    product_updates: boolean;
    security_alerts: boolean;
    billing_alerts: boolean;
    weekly_summary: boolean;
};

type Props = { preferences: Preferences };

const items = [
    { key: 'product_updates' as const, label: 'Product Updates', desc: 'New features, improvements, and changelog.' },
    { key: 'security_alerts' as const, label: 'Security Alerts', desc: 'Login attempts, password changes, and 2FA events.' },
    { key: 'billing_alerts' as const, label: 'Billing Alerts', desc: 'Upcoming charges, failed payments, and receipts.' },
    { key: 'weekly_summary' as const, label: 'Weekly Summary', desc: "A digest of your team's activity sent every Monday." },
];

export default function NotificationSettings({ preferences }: Props) {
    const form = useForm<Preferences>(preferences);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch('/settings/notifications');
    }

    return (
        <>
            <Head title="Notification Preferences" />
            <div className="space-y-6">
                <Heading title="Notifications" description="Choose what you want to be notified about." />
                <form onSubmit={submit}>
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.key} className="flex items-center justify-between rounded-xl border bg-card p-4">
                                <div>
                                    <Label className="text-sm font-medium">{item.label}</Label>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                                <Switch
                                    checked={!!form.data[item.key]}
                                    onCheckedChange={(v) => form.setData(item.key, v)}
                                />
                            </div>
                        ))}
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}Save preferences
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
