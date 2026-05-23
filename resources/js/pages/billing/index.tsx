import { Head, router, usePage } from '@inertiajs/react';
import { Check, CreditCard, ExternalLink, Download, RefreshCw, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';

type Plan = {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
};

type Subscription = {
    name: string;
    status: string;
    renews_at: number | null;
    on_grace_period: boolean;
    pending_downgrade: {
        to: string;
        effective_at: number;
    } | null;
};

type PaymentMethod = {
    brand: string;
    last_four: string;
} | null;

type Invoice = {
    id: string;
    date: string;
    total: string;
    status: string;
    download_url: string;
};

type Props = {
    plans: Plan[];
    subscription: Subscription;
    stripeConfigured: boolean;
    paymentMethod: PaymentMethod;
    invoices: Invoice[];
};

const CardBrandIcon = ({ brand }: { brand: string }) => {
    const formattedBrand = brand.toLowerCase();
    if (formattedBrand === 'visa') {
        return (
            <span className="inline-flex items-center justify-center rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                VISA
            </span>
        );
    }
    if (formattedBrand === 'mastercard') {
        return (
            <span className="inline-flex items-center justify-center rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                Mastercard
            </span>
        );
    }
    return (
        <span className="inline-flex items-center justify-center rounded bg-muted px-2 py-0.5 text-[10px] font-bold capitalize">
            {brand}
        </span>
    );
};

export default function BillingIndex({
    plans,
    subscription,
    stripeConfigured,
    paymentMethod,
    invoices = [],
}: Props) {
    const { url } = usePage();
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isResuming, setIsResuming] = useState(false);
    const [activeSwapPlan, setActiveSwapPlan] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('checkout') === 'success') {
            toast.success('Subscription started successfully!');
            window.history.replaceState({}, '', window.location.pathname);
        }

        if (params.get('checkout') === 'cancelled') {
            toast.error('Checkout was cancelled.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [url]);

    const { errors } = usePage().props;
    useEffect(() => {
        if (errors.plan) {
            toast.error(errors.plan as string);
        }

        if (errors.stripe) {
            toast.error(errors.stripe as string);
        }
    }, [errors]);

    const handleCancel = () => {
        setIsCancelling(true);
        router.post('/billing/cancel', {}, {
            onSuccess: () => {
                toast.success('Subscription cancelled successfully.');
                setIsCancelDialogOpen(false);
            },
            onError: () => toast.error('Failed to cancel subscription.'),
            onFinish: () => setIsCancelling(false),
        });
    };

    const handleResume = () => {
        setIsResuming(true);
        router.post('/billing/resume', {}, {
            onSuccess: () => toast.success('Subscription resumed successfully!'),
            onError: () => toast.error('Failed to resume subscription.'),
            onFinish: () => setIsResuming(false),
        });
    };

    const handleSwap = (planId: string) => {
        setActiveSwapPlan(planId);
        router.post(`/billing/swap/${planId}`, {}, {
            onSuccess: () => {
                toast.success('Plan updated successfully!');
            },
            onError: (err) => {
                toast.error(err.plan || 'Failed to update plan.');
            },
            onFinish: () => {
                setActiveSwapPlan(null);
            }
        });
    };

    const planRanks: Record<string, number> = {
        free: 0,
        pro: 1,
        scale: 2,
    };
    const currentRank = planRanks[subscription.name.toLowerCase()] ?? 0;

    return (
        <>
            <Head title="Billing" />

            <div className="space-y-8 p-6 max-w-6xl mx-auto">
                <FadeIn>
                    <PageHeader
                        title="Billing & Subscription"
                        description="Manage your SaaS subscription plan, payment methods, and download receipts."
                    >
                        {stripeConfigured && subscription.name !== 'Free' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/billing/portal')}
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Customer Portal
                            </Button>
                        )}
                    </PageHeader>
                </FadeIn>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left & Center: Subscription Management & Invoices */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Plan Overview Card */}
                        <FadeIn delay={0.1}>
                            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mt-0.5">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    Current Plan: {subscription.name}
                                                </h3>
                                                <StatusBadge
                                                    variant={
                                                        subscription.status === 'active' || subscription.status === 'trialing'
                                                            ? 'success'
                                                            : subscription.status === 'past_due'
                                                            ? 'warning'
                                                            : 'neutral'
                                                    }
                                                >
                                                    {subscription.status === 'none' ? 'Incomplete' : subscription.status}
                                                </StatusBadge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {subscription.name === 'Free' ? (
                                                    "You are currently on our free tier. Upgrade to unlock premium features."
                                                ) : subscription.on_grace_period ? (
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                        Your subscription has been cancelled and will end on{' '}
                                                        {subscription.renews_at ? new Date(subscription.renews_at * 1000).toLocaleDateString() : 'N/A'}.
                                                    </span>
                                                ) : (
                                                    <span>
                                                        Your subscription is active and renews on{' '}
                                                        {subscription.renews_at ? new Date(subscription.renews_at * 1000).toLocaleDateString() : 'N/A'}.
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {subscription.name !== 'Free' && stripeConfigured && (
                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            {subscription.on_grace_period ? (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    disabled={isResuming}
                                                    onClick={handleResume}
                                                >
                                                    {isResuming ? (
                                                        <>
                                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                            Resuming...
                                                        </>
                                                    ) : (
                                                        'Resume Subscription'
                                                    )}
                                                </Button>
                                            ) : (
                                                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                            Cancel Subscription
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Cancel Subscription</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to cancel your {subscription.name} subscription? You will still have access to your plan benefits until the end of the current billing cycle on{' '}
                                                                {subscription.renews_at ? new Date(subscription.renews_at * 1000).toLocaleDateString() : 'N/A'}.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose asChild>
                                                                <Button variant="outline">Keep Plan</Button>
                                                            </DialogClose>
                                                            <Button
                                                                variant="destructive"
                                                                disabled={isCancelling}
                                                                onClick={handleCancel}
                                                            >
                                                                {isCancelling ? (
                                                                    <>
                                                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                                        Cancelling...
                                                                    </>
                                                                ) : (
                                                                    'Yes, Cancel Subscription'
                                                                )}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {subscription.pending_downgrade && (
                                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-sm text-amber-800 dark:text-amber-300">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
                                                <RefreshCw className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Downgrade Scheduled</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Your subscription is scheduled to downgrade to{' '}
                                                    <span className="font-semibold text-foreground">
                                                        {subscription.pending_downgrade.to}
                                                    </span>{' '}
                                                    on{' '}
                                                    {new Date(subscription.pending_downgrade.effective_at * 1000).toLocaleDateString()}{' '}
                                                    after completing your current plan.
                                                </p>
                                            </div>
                                        </div>
                                        {!subscription.on_grace_period && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-amber-500/30 hover:bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 self-start sm:self-center flex-shrink-0"
                                                disabled={activeSwapPlan !== null}
                                                onClick={() => handleSwap(subscription.name.toLowerCase())}
                                            >
                                                {activeSwapPlan === subscription.name.toLowerCase() ? (
                                                    <>
                                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                        Restoring...
                                                    </>
                                                ) : (
                                                    'Cancel Downgrade'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </FadeIn>

                        {/* Payment Method Card */}
                        <FadeIn delay={0.15}>
                            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Payment Method
                                </h3>
                                {paymentMethod ? (
                                    <div className="flex items-center justify-between border rounded-xl p-4 bg-muted/20">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border">
                                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    Card ending in {paymentMethod.last_four}
                                                    <CardBrandIcon brand={paymentMethod.brand} />
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Your default payment method
                                                </p>
                                            </div>
                                        </div>
                                        {stripeConfigured && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get('/billing/portal')}
                                            >
                                                Update Card
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-xl bg-muted/5">
                                        <CreditCard className="h-6 w-6 text-muted-foreground/60 mb-2" />
                                        <p className="text-xs font-medium text-muted-foreground">No payment method on file</p>
                                        <p className="text-[10px] text-muted-foreground/80 mt-1">Subscribe to a paid plan to add a payment method.</p>
                                    </div>
                                )}
                            </div>
                        </FadeIn>

                        {/* Invoice History */}
                        <FadeIn delay={0.2}>
                            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Billing History & Receipts
                                </h3>
                                {invoices && invoices.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                                                    <th className="py-3 px-4">Date</th>
                                                    <th className="py-3 px-4">Amount</th>
                                                    <th className="py-3 px-4">Status</th>
                                                    <th className="py-3 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border text-sm">
                                                {invoices.map((invoice) => (
                                                    <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                                                        <td className="py-3 px-4 font-medium">{invoice.date}</td>
                                                        <td className="py-3 px-4">{invoice.total}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={cn(
                                                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                                                invoice.status === 'paid' 
                                                                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                                                    : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                                            )}>
                                                                {invoice.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <a
                                                                href={invoice.download_url}
                                                                className={cn(
                                                                    "inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3"
                                                                )}
                                                                title="Download Invoice"
                                                            >
                                                                <Download className="h-3.5 w-3.5 mr-2" />
                                                                Download PDF
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl">
                                        <FileText className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                        <p className="text-sm font-medium text-muted-foreground">No invoices found</p>
                                        <p className="text-xs text-muted-foreground/80 mt-1">If you recently made a payment, it might take a few moments to sync.</p>
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    </div>

                    {/* Right side: Pricing Plans / Tiers */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">
                            Plans & Pricing
                        </h3>
                        <StaggerChildren
                            className="flex flex-col gap-4"
                            staggerDelay={0.08}
                        >
                            {plans.map((plan) => {
                                const isCurrent = plan.name === subscription.name;
                                const isTarget = subscription.pending_downgrade && subscription.pending_downgrade.to.toLowerCase() === plan.id;
                                const targetRank = planRanks[plan.id] ?? 0;

                                const canCancelDowngrade = isCurrent && subscription.pending_downgrade && !subscription.on_grace_period;
                                const isSwapping = activeSwapPlan === plan.id;
                                const isDisabled = (isCurrent && !canCancelDowngrade) || isTarget || !stripeConfigured || isSwapping;

                                let buttonText = `Upgrade to ${plan.name}`;
                                if (isCurrent) {
                                    buttonText = canCancelDowngrade ? 'Cancel Downgrade' : 'Current Plan';
                                } else if (isTarget) {
                                    buttonText = 'Downgrade Scheduled';
                                } else if (targetRank < currentRank) {
                                    buttonText = `Downgrade to ${plan.name}`;
                                } else if (subscription.name === 'Free') {
                                    buttonText = `Upgrade to ${plan.name}`;
                                }

                                return (
                                    <StaggerItem key={plan.id}>
                                        <div
                                            className={cn(
                                                'relative flex flex-col rounded-2xl border p-5 transition-all shadow-sm',
                                                isCurrent
                                                    ? 'border-primary bg-primary/[0.03]'
                                                    : 'bg-card hover:shadow-md dark:hover:shadow-black/20',
                                            )}
                                        >
                                            {isCurrent && (
                                                <div className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                                    {canCancelDowngrade ? 'Downgrade Pending' : 'Current'}
                                                </div>
                                            )}
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {plan.name}
                                            </h3>
                                            <div className="mt-1 flex items-baseline gap-1">
                                                <span className="text-2xl font-bold tracking-tight">
                                                    {plan.price}
                                                </span>
                                                {plan.price !== '$0' && (
                                                    <span className="text-xs text-muted-foreground">
                                                        /month
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1.5 text-xs text-muted-foreground leading-normal">
                                                {plan.description}
                                            </p>
                                            <ul className="mt-3 flex-1 space-y-1.5">
                                                {plan.features.map((f) => (
                                                    <li
                                                        key={f}
                                                        className="flex items-center gap-2 text-xs"
                                                    >
                                                        <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                className="mt-4 w-full"
                                                variant={(isCurrent && !canCancelDowngrade) ? 'outline' : 'default'}
                                                size="sm"
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (canCancelDowngrade) {
                                                        handleSwap(subscription.name.toLowerCase());
                                                    } else if (!isCurrent && stripeConfigured) {
                                                        handleSwap(plan.id);
                                                    }
                                                }}
                                            >
                                                {isSwapping ? (
                                                    <>
                                                        <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    buttonText
                                                )}
                                            </Button>
                                        </div>
                                    </StaggerItem>
                                );
                            })}
                        </StaggerChildren>
                    </div>
                </div>

                {!stripeConfigured && (
                    <FadeIn delay={0.3}>
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
                            Stripe is not configured. Set{' '}
                            <code className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium">
                                STRIPE_KEY
                            </code>{' '}
                            and{' '}
                            <code className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium">
                                STRIPE_SECRET
                            </code>{' '}
                            in your <code className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium">.env</code> file.
                        </div>
                    </FadeIn>
                )}
            </div>
        </>
    );
}


