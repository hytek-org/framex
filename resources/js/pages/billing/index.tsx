import { Head, router, usePage } from '@inertiajs/react';
import { Check, CreditCard, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Plan = {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    configured?: boolean;
};

type Subscription = {
    name: string;
    status: string;
    renews_at: number | null;
    on_grace_period?: boolean;
};

type Props = {
    plans: Plan[];
    subscription: Subscription;
    stripeConfigured: boolean;
};

export default function BillingIndex({
    plans,
    subscription,
    stripeConfigured,
}: Props) {
    const { url } = usePage();

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
        if (errors.plan) toast.error(errors.plan as string);
        if (errors.stripe) toast.error(errors.stripe as string);
    }, [errors]);

    return (
        <>
            <Head title="Billing" />

            <div className="space-y-6 p-6">
                <FadeIn>
                    <PageHeader
                        title="Billing"
                        description="Manage your subscription and payment methods."
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

                {/* Current Plan */}
                <FadeIn delay={0.1}>
                    <div className="rounded-2xl border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Current Plan
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        You are on the{' '}
                                        <span className="font-medium text-foreground">
                                            {subscription.name}
                                        </span>{' '}
                                        plan
                                    </p>
                                </div>
                            </div>
                            <StatusBadge
                                variant={
                                    subscription.status === 'active'
                                        ? 'success'
                                        : 'warning'
                                }
                            >
                                {subscription.status}
                            </StatusBadge>
                        </div>
                        {subscription.renews_at && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                {subscription.on_grace_period ? (
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                        Your subscription will end on {' '}
                                        {new Date(subscription.renews_at * 1000).toLocaleDateString()}
                                    </span>
                                ) : (
                                    <>
                                        Renews on{' '}
                                        {new Date(subscription.renews_at * 1000).toLocaleDateString()}
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                </FadeIn>

                {/* Plans */}
                <StaggerChildren
                    className="grid gap-4 md:grid-cols-3"
                    staggerDelay={0.08}
                >
                    {plans.map((plan) => {
                        const isCurrent = plan.name === subscription.name;
                        return (
                            <StaggerItem key={plan.id}>
                                <div
                                    className={cn(
                                        'relative flex h-full flex-col rounded-2xl border p-6 transition-all',
                                        isCurrent
                                            ? 'border-primary/40 bg-primary/[0.03]'
                                            : 'bg-card hover:shadow-md dark:hover:shadow-black/20',
                                    )}
                                >
                                    {isCurrent && (
                                        <div className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                            Current
                                        </div>
                                    )}
                                    <h3 className="text-base font-semibold text-foreground">
                                        {plan.name}
                                    </h3>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-semibold tracking-tight">
                                            {plan.price}
                                        </span>
                                        {plan.price !== '$0' && (
                                            <span className="text-sm text-muted-foreground">
                                                /month
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {plan.description}
                                    </p>
                                    <ul className="mt-4 flex-1 space-y-2">
                                        {plan.features.map((f) => (
                                            <li
                                                key={f}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Check className="h-3.5 w-3.5 text-primary" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className="mt-6 w-full"
                                        variant={isCurrent ? 'outline' : 'default'}
                                        disabled={isCurrent || !stripeConfigured}
                                        onClick={() => {
                                            if (!isCurrent && stripeConfigured) {
                                                router.post(
                                                    `/billing/checkout/${plan.id}`,
                                                );
                                            }
                                        }}
                                    >
                                        {isCurrent
                                            ? 'Current Plan'
                                            : `Upgrade to ${plan.name}`}
                                    </Button>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerChildren>

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

BillingIndex.layout = {
    breadcrumbs: [
        { title: 'Billing', href: '/billing' },
    ],
};
