import { Head, router, usePage } from '@inertiajs/react';
import { Check, CreditCard, ExternalLink, Download, RefreshCw, FileText, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

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
            <span className="inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                VISA
            </span>
        );
    }

    if (formattedBrand === 'mastercard') {
        return (
            <span className="inline-flex items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold tracking-wider text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                MASTERCARD
            </span>
        );
    }

    return (
        <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
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
            <Head title="Billing & Plans" />

            <div className="space-y-10 p-6  pb-20">
                <FadeIn>
                    <PageHeader
                        title="Billing & Subscription"
                        description="Manage your subscription tier, view your payment methods, and download your billing history."
                    >
                        {stripeConfigured && subscription.name !== 'Free' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full px-5 hover:bg-secondary/80 transition-colors"
                                onClick={() => router.get('/billing/portal')}
                            >
                                Customer Portal
                                <ExternalLink className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                        )}
                    </PageHeader>
                </FadeIn>

                <div className="grid gap-10 lg:grid-cols-12">
                    {/* Left & Center: Subscription Management & Invoices */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-10">
                        {/* Current Plan Overview Card */}
                        <FadeIn delay={0.1}>
                            <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-card p-8 shadow-sm transition-all hover:shadow-md">
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                                            <Zap className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-xl font-medium tracking-tight text-foreground">
                                                    {subscription.name} Plan
                                                </h3>
                                                <StatusBadge
                                                    variant={
                                                        subscription.status === 'active' || subscription.status === 'trialing'
                                                            ? 'success'
                                                            : subscription.status === 'past_due'
                                                            ? 'warning'
                                                            : 'neutral'
                                                    }
                                                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                >
                                                    {subscription.status === 'none' ? 'Incomplete' : subscription.status}
                                                </StatusBadge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">
                                                {subscription.name === 'Free' ? (
                                                    "You are currently on our free tier. Upgrade to unlock premium features and higher limits."
                                                ) : subscription.on_grace_period ? (
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                        Your subscription has been cancelled and will end on{' '}
                                                        {subscription.renews_at ? new Date(subscription.renews_at * 1000).toLocaleDateString() : 'N/A'}.
                                                    </span>
                                                ) : (
                                                    <span>
                                                        Your subscription is active and will automatically renew on{' '}
                                                        <span className="font-medium text-foreground">
                                                            {subscription.renews_at ? new Date(subscription.renews_at * 1000).toLocaleDateString() : 'N/A'}
                                                        </span>.
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {subscription.name !== 'Free' && stripeConfigured && (
                                        <div className="flex items-center gap-3 self-start md:self-center">
                                            {subscription.on_grace_period ? (
                                                <Button
                                                    variant="default"
                                                    className="rounded-full"
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
                                                        <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full">
                                                            Cancel Plan
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="rounded-2xl sm:max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl">Cancel Subscription</DialogTitle>
                                                            <DialogDescription className="pt-2 leading-relaxed">
                                                                Are you sure you want to cancel your <span className="font-medium text-foreground">{subscription.name}</span> subscription? You will still have access to your plan benefits until the end of the current billing cycle on{' '}
                                                                <span className="font-medium text-foreground">{subscription.renews_at ? new Date(subscription.renews_at * 1000).toLocaleDateString() : 'N/A'}</span>.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter className="gap-2 pt-4 sm:justify-between sm:space-x-0">
                                                            <DialogClose asChild>
                                                                <Button variant="ghost" className="rounded-full">Keep My Plan</Button>
                                                            </DialogClose>
                                                            <Button
                                                                variant="destructive"
                                                                className="rounded-full"
                                                                disabled={isCancelling}
                                                                onClick={handleCancel}
                                                            >
                                                                {isCancelling ? (
                                                                    <>
                                                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                                        Cancelling...
                                                                    </>
                                                                ) : (
                                                                    'Confirm Cancellation'
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
                                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200/50 bg-amber-50/50 p-5 text-sm dark:border-amber-500/20 dark:bg-amber-500/4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                                <RefreshCw className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-amber-900 dark:text-amber-300">Downgrade Scheduled</p>
                                                <p className="text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                                                    Your subscription will change to{' '}
                                                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                                                        {subscription.pending_downgrade.to}
                                                    </span>{' '}
                                                    on {new Date(subscription.pending_downgrade.effective_at * 1000).toLocaleDateString()}.
                                                </p>
                                            </div>
                                        </div>
                                        {!subscription.on_grace_period && (
                                            <Button
                                                variant="outline"
                                                className="shrink-0 rounded-full border-amber-200 bg-white text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-500/30 dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-500/10"
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

                        <div className="flex flex-col gap-10 ">
                            {/* Payment Method Card */}
                            <FadeIn delay={0.15}>
                                <div className="flex h-full flex-col rounded-3xl border border-border/40 bg-card p-8 shadow-sm">
                                    <h3 className="mb-6 text-base font-medium tracking-tight text-foreground">
                                        Payment Method
                                    </h3>
                                    {paymentMethod ? (
                                        <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border/50 bg-secondary/30 p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm border border-border/50">
                                                    <CreditCard className="h-6 w-6 text-foreground/70" />
                                                </div>
                                                <div>
                                                    <p className="flex items-center gap-3 text-sm font-medium text-foreground">
                                                        •••• {paymentMethod.last_four}
                                                        <CardBrandIcon brand={paymentMethod.brand} />
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Default billing method
                                                    </p>
                                                </div>
                                            </div>
                                            {stripeConfigured && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="mt-6 w-full rounded-full bg-background border shadow-sm hover:bg-accent"
                                                    onClick={() => router.get('/billing/portal')}
                                                >
                                                    Update Payment Info
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">No payment method</p>
                                            <p className="mt-1 text-sm text-muted-foreground max-w-50">Add a payment method to upgrade your plan.</p>
                                        </div>
                                    )}
                                </div>
                            </FadeIn>

                            {/* Invoice History Overview */}
                            <FadeIn delay={0.2}>
                                <div className="flex h-full flex-col rounded-3xl border border-border/40 bg-card p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-base font-medium tracking-tight text-foreground">
                                            Recent Invoices
                                        </h3>
                                    </div>
                                    {invoices && invoices.length > 0 ? (
                                        <div className="flex-1 space-y-4">
                                            {invoices.slice(0, 3).map((invoice) => (
                                                <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 p-4 transition-colors hover:bg-secondary/40">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium">{invoice.total}</span>
                                                        <span className="text-xs text-muted-foreground">{invoice.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn(
                                                            "h-2 w-2 rounded-full",
                                                            invoice.status === 'paid' ? "bg-emerald-500" : "bg-amber-500"
                                                        )} />
                                                        <a
                                                            href={invoice.download_url}
                                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                            {invoices.length > 3 && (
                                                <Button variant="ghost" className="w-full text-xs rounded-full mt-2" onClick={() => router.get('/billing/portal')}>
                                                    View All History
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">No invoices yet</p>
                                            <p className="mt-1 text-sm text-muted-foreground">Your billing history will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </FadeIn>
                        </div>
                    </div>

                    {/* Right side: Pricing Plans / Tiers */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        <div className="mb-2">
                            <h3 className="text-lg font-medium tracking-tight text-foreground">
                                Available Plans
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Choose the perfect tier for your needs.
                            </p>
                        </div>
                        
                        <StaggerChildren
                            className="flex flex-col gap-5"
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
                                                'relative flex flex-col rounded-3xl border p-6 transition-all duration-300',
                                                isCurrent
                                                    ? 'border-primary ring-1 ring-primary/20 bg-primary/3 shadow-md'
                                                    : 'border-border/40 bg-card hover:border-border/80 hover:shadow-lg dark:hover:shadow-black/40',
                                            )}
                                        >
                                            {isCurrent && (
                                                <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-primary-foreground shadow-sm">
                                                    {canCancelDowngrade ? 'Downgrade Pending' : 'Current Plan'}
                                                </div>
                                            )}
                                            
                                            <div className="mb-4">
                                                <h3 className="text-base font-semibold text-foreground">
                                                    {plan.name}
                                                </h3>
                                                <div className="mt-2 flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold tracking-tighter">
                                                        {plan.price}
                                                    </span>
                                                    {plan.price !== '$0' && (
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            /mo
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                                    {plan.description}
                                                </p>
                                            </div>
                                            
                                            <div className="mb-8 mt-2 h-px w-full bg-border/40" />

                                            <ul className="mb-6 flex-1 space-y-3">
                                                {plan.features.map((f) => (
                                                    <li
                                                        key={f}
                                                        className="flex items-start gap-3 text-sm text-foreground/80"
                                                    >
                                                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                            <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                                                        </div>
                                                        <span className="leading-tight">{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            
                                            <Button
                                                className={cn(
                                                    "mt-auto w-full rounded-full font-medium transition-all",
                                                    isCurrent && !canCancelDowngrade ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""
                                                )}
                                                variant={(isCurrent && !canCancelDowngrade) ? 'secondary' : 'default'}
                                                size="lg"
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
                                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
                        <div className="mt-8 rounded-2xl border border-amber-200/50 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 flex items-center gap-3">
                            <Zap className="h-5 w-5 shrink-0 text-amber-500" />
                            <p>
                                Stripe is not configured. Set{' '}
                                <code className="rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-xs font-semibold">
                                    STRIPE_KEY
                                </code>{' '}
                                and{' '}
                                <code className="rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-xs font-semibold">
                                    STRIPE_SECRET
                                </code>{' '}
                                in your <code className="rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-xs font-semibold">.env</code> file to enable checkout.
                            </p>
                        </div>
                    </FadeIn>
                )}
            </div>
        </>
    );
}