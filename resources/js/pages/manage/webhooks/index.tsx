import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    Check,
    Clock,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Plus,
    Radio,
    ShieldCheck,
    Trash2,
    Webhook,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function WebhooksIndex({
    endpoints,
    recentDeliveries,
    availableEvents,
}: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const allEventKeys = useMemo(
        () => Object.keys(availableEvents),
        [availableEvents]
    );

    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>([
        'content.published',
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [pingingId, setPingingId] = useState<number | null>(null);
    const [revealedSecrets, setRevealedSecrets] = useState<
        Record<number, boolean>
    >({});
    const [copiedSecretId, setCopiedSecretId] = useState<number | null>(null);

    // AlertDialog state for safe deletion
    const [endpointToDelete, setEndpointToDelete] =
        useState<WebhookEndpointItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const stats = useMemo(() => {
        const activeCount = endpoints.filter((e) => e.is_active).length;
        const totalDeliveries = endpoints.reduce(
            (sum, e) => sum + (e.deliveries_count || 0),
            0
        );
        const successfulRecent = recentDeliveries.filter(
            (d) => d.response_status >= 200 && d.response_status < 300
        ).length;
        const successRate =
            recentDeliveries.length > 0
                ? Math.round(
                      (successfulRecent / recentDeliveries.length) * 100
                  )
                : 100;

        return { activeCount, totalDeliveries, successRate };
    }, [endpoints, recentDeliveries]);

    const toggleRevealSecret = (id: number) => {
        setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const copySecret = async (id: number, secret: string) => {
        try {
            await navigator.clipboard.writeText(secret);
            setCopiedSecretId(id);
            toast.success('Signing secret copied to clipboard');
            setTimeout(() => setCopiedSecretId(null), 2000);
        } catch {
            toast.error('Failed to copy secret to clipboard');
        }
    };

    const toggleEvent = (eventKey: string) => {
        setSelectedEvents((prev) =>
            prev.includes(eventKey)
                ? prev.filter((e) => e !== eventKey)
                : [...prev, eventKey]
        );
    };

    const toggleAllEvents = () => {
        if (selectedEvents.length === allEventKeys.length) {
            setSelectedEvents([]);
        } else {
            setSelectedEvents(allEventKeys);
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) {
            toast.error('Please enter a valid destination URL');
            return;
        }
        if (selectedEvents.length === 0) {
            toast.error('Select at least one event trigger');
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/${teamSlug}/webhooks`,
            {
                name,
                url,
                events: selectedEvents,
                is_active: true,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Webhook endpoint registered', {
                        description:
                            'Signing secret generated. Ready to receive events.',
                    });
                    setShowCreate(false);
                    setName('');
                    setUrl('');
                    setSelectedEvents(['content.published']);
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(
                        typeof firstError === 'string'
                            ? firstError
                            : 'Failed to register webhook endpoint'
                    );
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const confirmDelete = () => {
        if (!endpointToDelete) return;

        setIsDeleting(true);
        router.delete(`/${teamSlug}/webhooks/${endpointToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Webhook endpoint removed', {
                    description:
                        endpointToDelete.name || endpointToDelete.url,
                });
                setEndpointToDelete(null);
            },
            onError: () => {
                toast.error('Could not delete webhook endpoint');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handlePing = (ep: WebhookEndpointItem) => {
        setPingingId(ep.id);
        router.post(
            `/${teamSlug}/webhooks/${ep.id}/ping`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Test payload dispatched', {
                        description: `Sent ping event to ${ep.name || ep.url}`,
                    });
                },
                onError: () => {
                    toast.error('Ping delivery failed', {
                        description:
                            'Verify the destination URL is reachable.',
                    });
                },
                onFinish: () => setPingingId(null),
            }
        );
    };

    return (
        <>
            <Head title="Webhooks Engine" />

            <div className=" space-y-8 p-6 lg:p-8">
                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-linear-to-b from-primary/15 to-primary/5 text-primary shadow-2xs">
                            <Webhook className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                    Outbound Webhooks
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className="gap-1 border border-border/60 bg-muted/60 font-mono text-[11px] font-medium"
                                >
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    HMAC-SHA256
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Stream signed real-time event payloads to your
                                microservices, automation pipelines, and
                                third-party listeners.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setShowCreate((prev) => !prev)}
                        variant={showCreate ? 'outline' : 'default'}
                        className="shrink-0 gap-2 shadow-xs"
                    >
                        {showCreate ? (
                            <>
                                <X className="h-4 w-4" />
                                Close Form
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Endpoint
                            </>
                        )}
                    </Button>
                </div>

                {/* Elevated Metric Summary Strip */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-linear-to-b from-card to-muted/20 p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Active Endpoints</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Radio className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                                {stats.activeCount}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                of {endpoints.length} configured
                            </span>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-linear-to-b from-card to-muted/20 p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Total Dispatched</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                                {stats.totalDeliveries.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                lifetime events
                            </span>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-linear-to-b from-card to-muted/20 p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Delivery Health</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/70 bg-muted/60 text-muted-foreground">
                                <Activity className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                                {recentDeliveries.length > 0
                                    ? `${stats.successRate}%`
                                    : '—'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {recentDeliveries.length > 0
                                    ? `across last ${recentDeliveries.length} runs`
                                    : 'awaiting first delivery'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Create Endpoint Panel */}
                {showCreate && (
                    <form
                        onSubmit={handleCreate}
                        className="overflow-hidden rounded-xl border border-border bg-card shadow-md ring-1 ring-black/3 dark:ring-white/4"
                    >
                        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">
                                    Register Outbound Endpoint
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Configure a destination URL and select which
                                    system events trigger a signed POST request.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowCreate(false)}
                                className="h-8 w-8 text-muted-foreground"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-6 p-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="webhook-name"
                                        className="text-xs font-medium"
                                    >
                                        Endpoint Label
                                    </Label>
                                    <Input
                                        id="webhook-name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="e.g. Production Ingestion Worker"
                                        className="h-9 bg-background"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Optional friendly name to identify this
                                        consumer.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="webhook-url"
                                        className="text-xs font-medium"
                                    >
                                        Destination URL{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="webhook-url"
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://api.yourdomain.com/webhooks/events"
                                        className="h-9 bg-background font-mono text-xs"
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Must be a publicly reachable HTTPS
                                        endpoint.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-xs font-medium">
                                            Subscribed Events{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            {selectedEvents.length} of{' '}
                                            {allEventKeys.length} triggers
                                            selected
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleAllEvents}
                                        className="h-7 text-xs"
                                    >
                                        {selectedEvents.length ===
                                        allEventKeys.length
                                            ? 'Deselect all'
                                            : 'Select all'}
                                    </Button>
                                </div>

                                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(availableEvents).map(
                                        ([evt, desc]) => {
                                            const isChecked =
                                                selectedEvents.includes(evt);
                                            return (
                                                <div
                                                    key={evt}
                                                    onClick={() =>
                                                        toggleEvent(evt)
                                                    }
                                                    className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all select-none ${
                                                        isChecked
                                                            ? 'border-primary/60 bg-primary/4 shadow-2xs ring-1 ring-primary/15'
                                                            : 'border-border/70 bg-background hover:border-border hover:bg-muted/30'
                                                    }`}
                                                >
                                                    <Checkbox
                                                        id={`evt-${evt}`}
                                                        checked={isChecked}
                                                        onCheckedChange={() =>
                                                            toggleEvent(evt)
                                                        }
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="mt-0.5"
                                                    />
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <label
                                                            htmlFor={`evt-${evt}`}
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            className="block cursor-pointer truncate font-mono text-xs font-medium text-foreground"
                                                        >
                                                            {evt}
                                                        </label>
                                                        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                                                            {desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t border-border/60 bg-muted/20 px-6 py-3.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCreate(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={
                                    isSubmitting ||
                                    !url ||
                                    selectedEvents.length === 0
                                }
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                )}
                                Create Endpoint
                            </Button>
                        </div>
                    </form>
                )}

                {/* Registered Endpoints Table */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Registered Endpoints
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Active webhook destinations receiving signed
                                payloads.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
                        <Table>
                            <TableHeader className="bg-muted/35">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[34%] text-xs font-medium">
                                        Endpoint
                                    </TableHead>
                                    <TableHead className="text-xs font-medium">
                                        Triggers
                                    </TableHead>
                                    <TableHead className="text-xs font-medium">
                                        Signing Secret
                                    </TableHead>
                                    <TableHead className="text-xs font-medium">
                                        Deliveries
                                    </TableHead>
                                    <TableHead className="w-32 text-right text-xs font-medium">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {endpoints.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-16 text-center"
                                        >
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-muted/60 text-muted-foreground shadow-2xs">
                                                    <Webhook className="h-5 w-5" />
                                                </div>
                                                <p className="mt-3.5 text-sm font-medium text-foreground">
                                                    No webhook endpoints yet
                                                </p>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    Add an HTTPS endpoint to
                                                    start receiving signed
                                                    real-time event
                                                    notifications.
                                                </p>
                                                {!showCreate && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setShowCreate(true)
                                                        }
                                                        className="mt-4 gap-1.5 shadow-2xs"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add First Endpoint
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    endpoints.map((ep) => {
                                        const visibleEvents =
                                            ep.events?.slice(0, 2) || [];
                                        const extraCount =
                                            (ep.events?.length || 0) -
                                            visibleEvents.length;

                                        return (
                                            <TableRow
                                                key={ep.id}
                                                className="group transition-colors hover:bg-muted/30"
                                            >
                                                <TableCell className="py-3.5">
                                                    <div className="flex items-start gap-3">
                                                        <span
                                                            title={
                                                                ep.is_active
                                                                    ? 'Active'
                                                                    : 'Inactive'
                                                            }
                                                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                                                ep.is_active
                                                                    ? 'bg-emerald-500 ring-4 ring-emerald-500/15'
                                                                    : 'bg-muted-foreground/40'
                                                            }`}
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-medium text-foreground">
                                                                {ep.name ||
                                                                    'Untitled Endpoint'}
                                                            </div>
                                                            <div
                                                                title={ep.url}
                                                                className="mt-0.5 truncate font-mono text-xs text-muted-foreground"
                                                            >
                                                                {ep.url}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {visibleEvents.map(
                                                            (evt) => (
                                                                <Badge
                                                                    key={evt}
                                                                    variant="secondary"
                                                                    className="rounded-md border border-border/50 px-1.5 py-0.5 font-mono text-[11px] font-normal"
                                                                >
                                                                    {evt}
                                                                </Badge>
                                                            )
                                                        )}
                                                        {extraCount > 0 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="rounded-md px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                                                            >
                                                                +{extraCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <div className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-1 font-mono text-xs shadow-2xs">
                                                        <KeyRound className="mr-1 h-3 w-3 text-muted-foreground" />
                                                        <span className="text-foreground/90">
                                                            {revealedSecrets[
                                                                ep.id
                                                            ]
                                                                ? ep.secret
                                                                : `${ep.secret.substring(0, 8)}••••••••`}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                toggleRevealSecret(
                                                                    ep.id
                                                                )
                                                            }
                                                            title={
                                                                revealedSecrets[
                                                                    ep.id
                                                                ]
                                                                    ? 'Hide secret'
                                                                    : 'Reveal secret'
                                                            }
                                                            className="ml-1 h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                                        >
                                                            {revealedSecrets[
                                                                ep.id
                                                            ] ? (
                                                                <EyeOff className="h-3 w-3" />
                                                            ) : (
                                                                <Eye className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                copySecret(
                                                                    ep.id,
                                                                    ep.secret
                                                                )
                                                            }
                                                            title="Copy signing secret"
                                                            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                                        >
                                                            {copiedSecretId ===
                                                            ep.id ? (
                                                                <Check className="h-3 w-3 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                                        {ep.deliveries_count.toLocaleString()}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={
                                                                pingingId ===
                                                                ep.id
                                                            }
                                                            onClick={() =>
                                                                handlePing(ep)
                                                            }
                                                            className="h-7 gap-1.5 px-2.5 text-xs shadow-2xs"
                                                        >
                                                            {pingingId ===
                                                            ep.id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Radio className="h-3 w-3 text-amber-500" />
                                                            )}
                                                            Ping
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                setEndpointToDelete(
                                                                    ep
                                                                )
                                                            }
                                                            title="Delete endpoint"
                                                            className="h-7 w-7 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* Recent Deliveries Table */}
                <section className="space-y-3">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">
                            Delivery Logs
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Real-time HTTP response statuses and latency for
                            dispatched events.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
                        <Table>
                            <TableHeader className="bg-muted/35">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-28 text-xs font-medium">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-xs font-medium">
                                        Event
                                    </TableHead>
                                    <TableHead className="text-xs font-medium">
                                        Destination
                                    </TableHead>
                                    <TableHead className="w-28 text-xs font-medium">
                                        Latency
                                    </TableHead>
                                    <TableHead className="w-36 text-right text-xs font-medium">
                                        Timestamp
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentDeliveries.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-12 text-center text-xs text-muted-foreground"
                                        >
                                            No deliveries recorded yet. Click{' '}
                                            <span className="font-medium text-foreground">
                                                Ping
                                            </span>{' '}
                                            on an endpoint to send a test
                                            payload.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentDeliveries.map((del) => {
                                        const isSuccess =
                                            del.response_status >= 200 &&
                                            del.response_status < 300;
                                        return (
                                            <TableRow
                                                key={del.id}
                                                className="text-xs transition-colors hover:bg-muted/30"
                                            >
                                                <TableCell className="py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${
                                                            isSuccess
                                                                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                                : 'border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-400'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                isSuccess
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-rose-500'
                                                            }`}
                                                        />
                                                        {del.response_status ||
                                                            'ERR'}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="py-3 font-mono font-medium text-foreground">
                                                    {del.event}
                                                </TableCell>

                                                <TableCell className="max-w-xs py-3">
                                                    {del.endpoint?.name && (
                                                        <span className="mr-2 font-medium text-foreground">
                                                            {del.endpoint.name}
                                                        </span>
                                                    )}
                                                    <span className="truncate font-mono text-muted-foreground">
                                                        {del.endpoint?.url ||
                                                            '—'}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="py-3 font-mono tabular-nums text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-3 w-3 opacity-60" />
                                                        {del.duration_ms} ms
                                                    </span>
                                                </TableCell>

                                                <TableCell className="py-3 text-right font-mono tabular-nums text-muted-foreground">
                                                    {new Date(
                                                        del.delivered_at
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            </div>

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog
                open={!!endpointToDelete}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setEndpointToDelete(null);
                    }
                }}
            >
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle>
                            Delete webhook endpoint?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently stop all future event
                            deliveries to this destination and invalidate its
                            signing secret.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {endpointToDelete && (
                        <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs">
                            <div className="font-medium text-foreground">
                                {endpointToDelete.name || 'Untitled Endpoint'}
                            </div>
                            <div className="mt-0.5 truncate font-mono text-muted-foreground">
                                {endpointToDelete.url}
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            )}
                            Delete Endpoint
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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