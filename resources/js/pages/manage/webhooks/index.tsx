import { Head, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Webhook,
    Radio,
    Copy,
    Check,
    MoreHorizontal,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Send,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface WebhookEndpointItem {
    id: number;
    name?: string | null;
    url: string;
    secret: string;
    events: string[];
    is_active: boolean;
    deliveries_count: number;
    created_at: string;
}

interface WebhookDeliveryItem {
    id: number;
    event: string;
    response_status: number;
    duration_ms: number;
    delivered_at: string;
    endpoint?: {
        name?: string;
        url: string;
    };
}

interface Props {
    endpoints: WebhookEndpointItem[];
    recentDeliveries: WebhookDeliveryItem[];
    availableEvents: Record<string, string>;
}

export default function WebhooksIndex({ endpoints, recentDeliveries, availableEvents }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>(['content.published']);
    const [revealedSecrets, setRevealedSecrets] = useState<Record<number, boolean>>({});
    const [copiedSecretId, setCopiedSecretId] = useState<number | null>(null);

    const toggleRevealSecret = (id: number) => {
        setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const copySecret = (id: number, secret: string) => {
        navigator.clipboard.writeText(secret);
        setCopiedSecretId(id);
        setTimeout(() => setCopiedSecretId(null), 2000);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            `/${teamSlug}/webhooks`,
            {
                name,
                url,
                events: selectedEvents,
                is_active: true,
            },
            {
                onSuccess: () => {
                    setShowCreate(false);
                    setName('');
                    setUrl('');
                    setSelectedEvents(['content.published']);
                },
            }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this webhook endpoint?')) {
            router.delete(`/${teamSlug}/webhooks/${id}`);
        }
    };

    const handlePing = (id: number) => {
        router.post(`/${teamSlug}/webhooks/${id}/ping`, {}, { preserveScroll: true });
    };

    const toggleEvent = (eventKey: string) => {
        setSelectedEvents((prev) =>
            prev.includes(eventKey) ? prev.filter((e) => e !== eventKey) : [...prev, eventKey]
        );
    };

    return (
        <>
            <Head title="Webhooks Engine" />

            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Webhook className="h-6 w-6 text-primary" />
                            Outbound Webhooks Engine
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Deliver signed HMAC-SHA256 events in real-time to external microservices and Zapier.
                        </p>
                    </div>

                    <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Webhook Endpoint
                    </Button>
                </div>

                {/* Create Form Modal / Dropdown */}
                {showCreate && (
                    <form onSubmit={handleCreate} className="p-5 rounded-2xl border bg-card shadow-md space-y-4 animate-in fade-in">
                        <h2 className="text-sm font-semibold text-foreground">Register Outbound Endpoint</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Endpoint Name (Optional)</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Production Discord Bot"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Destination URL (HTTPS required) *</Label>
                                <Input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://api.yourdomain.com/webhooks/framex"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label className="text-xs font-semibold">Subscribed Event Triggers</Label>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(availableEvents).map(([evt, desc]) => (
                                    <label
                                        key={evt}
                                        className="flex items-start gap-2 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer text-xs"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedEvents.includes(evt)}
                                            onChange={() => toggleEvent(evt)}
                                            className="mt-0.5 rounded border-border text-primary"
                                        />
                                        <div>
                                            <span className="font-mono font-semibold text-foreground block">{evt}</span>
                                            <span className="text-[11px] text-muted-foreground">{desc}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm">
                                Register Endpoint
                            </Button>
                        </div>
                    </form>
                )}

                {/* Endpoints Table */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Registered Endpoints</h2>
                    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Endpoint</TableHead>
                                    <TableHead>Subscribed Events</TableHead>
                                    <TableHead>Signing Secret</TableHead>
                                    <TableHead>Deliveries</TableHead>
                                    <TableHead className="w-28 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {endpoints.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No webhook endpoints configured yet. Register one above!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    endpoints.map((ep) => (
                                        <TableRow key={ep.id} className="hover:bg-muted/40">
                                            <TableCell>
                                                <div className="font-semibold text-foreground text-sm">
                                                    {ep.name || 'Webhook Destination'}
                                                </div>
                                                <div className="font-mono text-xs text-muted-foreground line-clamp-1">
                                                    {ep.url}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {ep.events?.map((evt) => (
                                                        <Badge key={evt} variant="secondary" className="font-mono text-[10px]">
                                                            {evt}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 font-mono text-xs">
                                                    <span>
                                                        {revealedSecrets[ep.id] ? ep.secret : `${ep.secret.substring(0, 10)}••••••••`}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRevealSecret(ep.id)}
                                                        className="h-6 w-6 p-0 text-muted-foreground"
                                                    >
                                                        {revealedSecrets[ep.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copySecret(ep.id, ep.secret)}
                                                        className="h-6 w-6 p-0 text-muted-foreground"
                                                    >
                                                        {copiedSecretId === ep.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-mono">{ep.deliveries_count} delivered</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handlePing(ep.id)}
                                                        className="h-7 text-xs gap-1"
                                                    >
                                                        <Radio className="h-3 w-3 text-amber-500" />
                                                        Ping
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(ep.id)}
                                                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Recent Deliveries Table */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Recent Event Delivery Logs</h2>
                    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Status Code</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Delivered At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentDeliveries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                                            No deliveries recorded yet. Use the "Ping" button to dispatch a test payload.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentDeliveries.map((del) => {
                                        const isSuccess = del.response_status >= 200 && del.response_status < 300;
                                        return (
                                            <TableRow key={del.id} className="text-xs">
                                                <TableCell className="font-mono font-semibold">
                                                    {del.event}
                                                </TableCell>
                                                <TableCell className="font-mono text-muted-foreground truncate max-w-xs">
                                                    {del.endpoint?.url || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-mono text-[10px] ${
                                                            isSuccess
                                                                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300'
                                                                : 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-300'
                                                        }`}
                                                    >
                                                        {del.response_status || 'ERR'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-muted-foreground">
                                                    {del.duration_ms} ms
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(del.delivered_at).toLocaleTimeString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}

WebhooksIndex.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Webhooks Engine', href: `/${teamSlug}/webhooks` },
        ],
    };
};
