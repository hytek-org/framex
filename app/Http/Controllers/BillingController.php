<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Sync fallback: if checkout=success or (user has stripe_id but no active subscription in local DB)
        if ($request->get('checkout') === 'success' || ($user->stripe_id && !$user->subscribed('default'))) {
            try {
                $user->createOrGetStripeCustomer();
                
                if ($user->stripe_id) {
                    $user->updateDefaultPaymentMethodFromStripe();
                    
                    $stripeCustomer = $user->asStripeCustomer(['subscriptions']);
                    $stripeSubscriptions = $stripeCustomer->subscriptions->data ?? [];
                    
                    foreach ($stripeSubscriptions as $stripeSubscription) {
                        $firstItem = $stripeSubscription->items->data[0];
                        $isSinglePrice = count($stripeSubscription->items->data) === 1;
                        
                        $trialEndsAt = $stripeSubscription->trial_end 
                            ? \Illuminate\Support\Carbon::createFromTimestamp($stripeSubscription->trial_end) 
                            : null;
                            
                        $endsAt = null;
                        if ($stripeSubscription->cancel_at_period_end) {
                            $endsAt = $stripeSubscription->trial_end && \Illuminate\Support\Carbon::createFromTimestamp($stripeSubscription->trial_end)->isFuture()
                                ? $trialEndsAt
                                : \Illuminate\Support\Carbon::createFromTimestamp($stripeSubscription->current_period_end);
                        } elseif ($stripeSubscription->cancel_at ?? $stripeSubscription->canceled_at) {
                            $endsAt = \Illuminate\Support\Carbon::createFromTimestamp($stripeSubscription->cancel_at ?? $stripeSubscription->canceled_at);
                        }
                        
                        $stripePrice = $isSinglePrice ? $firstItem->price->id : null;
                        
                        $subscription = $user->subscriptions()->updateOrCreate([
                            'stripe_id' => $stripeSubscription->id,
                        ], [
                            'type' => $stripeSubscription->metadata['type'] ?? $stripeSubscription->metadata['name'] ?? 'default',
                            'stripe_status' => $stripeSubscription->status,
                            'stripe_price' => $stripePrice,
                            'quantity' => $isSinglePrice ? ($firstItem->quantity ?? null) : null,
                            'trial_ends_at' => $trialEndsAt,
                            'ends_at' => $endsAt,
                        ]);

                        $pendingPriceId = null;
                        if ($subscription->pending_plan_to) {
                            $pendingPriceId = config("services.stripe.price_" . strtolower($subscription->pending_plan_to));
                        }
                        if ($stripePrice !== $pendingPriceId || ($subscription->pending_plan_until && \Illuminate\Support\Carbon::parse($subscription->pending_plan_until)->isPast())) {
                            $subscription->update([
                                'pending_plan_from' => null,
                                'pending_plan_to' => null,
                                'pending_plan_until' => null,
                            ]);
                        }

                        $subscriptionItemIds = [];
                        foreach ($stripeSubscription->items->data as $item) {
                            $subscriptionItemIds[] = $item->id;
                            $subscription->items()->updateOrCreate([
                                'stripe_id' => $item->id,
                            ], [
                                'stripe_product' => $item->price->product,
                                'stripe_price' => $item->price->id,
                                'quantity' => $item->quantity ?? null,
                            ]);
                        }
                        $subscription->items()->whereNotIn('stripe_id', $subscriptionItemIds)->delete();
                    }
                }
            } catch (\Exception $e) {
                logger()->error('Stripe sync failed in BillingController: ' . $e->getMessage());
            }

            return redirect()->route('billing.index');
        }

        $subscription = $user->subscription('default');
        
        // Handle expired pending downgrades
        if ($subscription && $subscription->pending_plan_until) {
            if (\Illuminate\Support\Carbon::parse($subscription->pending_plan_until)->isPast()) {
                $subscription->update([
                    'pending_plan_from' => null,
                    'pending_plan_to' => null,
                    'pending_plan_until' => null,
                ]);
                $subscription = $user->subscription('default');
            }
        }

        $currentPlanName = $user->currentPlanName();

        $invoices = [];
        if ($user->stripe_id) {
            try {
                $invoices = collect($user->invoices())->map(function ($invoice) {
                    return [
                        'id' => $invoice->id,
                        'date' => $invoice->date()->toFormattedDateString(),
                        'total' => $invoice->total(),
                        'status' => $invoice->status,
                        'download_url' => route('billing.invoice', $invoice->id),
                    ];
                })->toArray();
            } catch (\Exception $e) {
                logger()->error('Failed to retrieve invoices: ' . $e->getMessage());
            }
        }

        $renewsAt = null;
        if ($subscription) {
            try {
                $renewsAt = $subscription->asStripeSubscription()?->current_period_end ?? null;
            } catch (\Exception $e) {
                $renewsAt = $subscription->ends_at?->timestamp;
            }
        }

        $pendingDowngrade = null;
        if ($subscription) {
            if ($subscription->pending_plan_to && $subscription->pending_plan_until) {
                $pendingDowngrade = [
                    'to' => $subscription->pending_plan_to,
                    'effective_at' => \Illuminate\Support\Carbon::parse($subscription->pending_plan_until)->timestamp,
                ];
            } elseif ($subscription->onGracePeriod()) {
                $pendingDowngrade = [
                    'to' => 'Free',
                    'effective_at' => $subscription->ends_at?->timestamp,
                ];
            }
        }

        return Inertia::render('billing/index', [
            'plans' => $this->plans(),
            'subscription' => [
                'name' => $currentPlanName,
                'status' => $subscription?->stripe_status ?? 'none',
                'renews_at' => $renewsAt,
                'on_grace_period' => $subscription?->onGracePeriod() ?? false,
                'pending_downgrade' => $pendingDowngrade,
            ],

            'paymentMethod' => $user->pm_type ? [
                'brand' => $user->pm_type,
                'last_four' => $user->pm_last_four,
            ] : null,
            'invoices' => $invoices,
            'stripeConfigured' => filled(config('cashier.key')),
        ]);
    }

    public function checkout(Request $request, string $plan): \Symfony\Component\HttpFoundation\Response
    {
        $normalizedPlan = strtolower(trim($plan));
        if ($normalizedPlan === 'free') {
            return redirect()->route('billing.index');
        }

        $price = config("services.stripe.price_{$normalizedPlan}");

        if (! $price) {
            return back()->withErrors([
                'plan' => "The {$plan} plan is not correctly configured in the system."
            ]);
        }

        $checkout = $request->user()
            ->newSubscription('default', $price)
            ->checkout([
                'success_url' => route('billing.index').'?checkout=success',
                'cancel_url' => route('billing.index').'?checkout=cancelled',
            ]); 

        return Inertia::location($checkout->url);
    }

    public function portal(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        if (!filled(config('cashier.key'))) {
            return back()->withErrors(['stripe' => 'Stripe is not configured.']);
        }

        return Inertia::location($request->user()->billingPortalUrl(route('billing.index')));
    }

    public function cancel(Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($user->subscribed('default')) {
            $subscription = $user->subscription('default');
            // If they had a pending paid-to-paid downgrade, clear it
            $subscription->update([
                'pending_plan_from' => null,
                'pending_plan_to' => null,
                'pending_plan_until' => null,
            ]);
            $subscription->cancel();
        }

        return back();
    }

    public function resume(Request $request): RedirectResponse
    {
        $user = $request->user();
        $subscription = $user->subscription('default');
        if ($subscription && $subscription->onGracePeriod()) {
            $subscription->update([
                'pending_plan_from' => null,
                'pending_plan_to' => null,
                'pending_plan_until' => null,
            ]);
            $subscription->resume();
        }

        return back();
    }

    public function swap(Request $request, string $plan): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $user = $request->user();
        $normalizedPlan = strtolower(trim($plan));

        if ($normalizedPlan === 'free') {
            if ($user->subscribed('default')) {
                $subscription = $user->subscription('default');
                // Clear any pending paid-to-paid downgrades
                $subscription->update([
                    'pending_plan_from' => null,
                    'pending_plan_to' => null,
                    'pending_plan_until' => null,
                ]);
                $subscription->cancel();
            }
            return back();
        }

        $priceId = config("services.stripe.price_{$normalizedPlan}");

        if (!$priceId) {
            return back()->withErrors(['plan' => "The {$plan} plan is not correctly configured in the system."]);
        }

        if ($user->subscribed('default')) {
            $subscription = $user->subscription('default');
            
            $planTiers = ['free' => 0, 'pro' => 1, 'scale' => 2];
            $currentPlanKey = strtolower($user->currentPlanName());
            $targetPlanKey = $normalizedPlan;

            $currentRank = $planTiers[$currentPlanKey] ?? 0;
            $targetRank = $planTiers[$targetPlanKey] ?? 0;

            if ($targetRank < $currentRank) {
                // Downgrade: swap immediately on Stripe but with no proration so it takes effect next cycle,
                // and save local pending details so user keeps active high-tier plan access and UI displays alert.
                try {
                    $stripeSub = $subscription->asStripeSubscription();
                    $renewsAt = $stripeSub->current_period_end;

                    $subscription->swap($priceId, ['proration_behavior' => 'none']);

                    $subscription->update([
                        'pending_plan_from' => ucfirst($currentPlanKey),
                        'pending_plan_to' => ucfirst($targetPlanKey),
                        'pending_plan_until' => \Illuminate\Support\Carbon::createFromTimestamp($renewsAt),
                    ]);
                } catch (\Exception $e) {
                    logger()->error('Stripe downgrade swap failed: ' . $e->getMessage());
                    return back()->withErrors(['plan' => 'Failed to process downgrade in Stripe.']);
                }
                return back();
            } else {
                // Upgrade or resumption: swap immediately on Stripe and clear any pending downgrade fields
                $subscription->update([
                    'pending_plan_from' => null,
                    'pending_plan_to' => null,
                    'pending_plan_until' => null,
                ]);
                
                $subscription->swap($priceId);
                return back();
            }
        }

        return $this->checkout($request, $plan);
    }

    public function downloadInvoice(Request $request, string $invoiceId)
    {
        return $request->user()->downloadInvoice($invoiceId, [
            'vendor' => config('app.name'),
            'product' => 'Subscription',
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function plans(): array
    {
        return [
            [
                'id' => 'free', 
                'name' => 'Free', 
                'price' => '$0', 
                'description' => 'For solo builders validating an idea.', 
                'features' => ['1 team', '1,000 API calls', 'Community support']
            ],
            [
                'id' => 'pro', 
                'name' => 'Pro', 
                'price' => '$29', 
                'description' => 'For teams shipping a real SaaS product.', 
                'features' => ['Unlimited teams', 'Realtime notifications', 'Priority support'],
            ],
            [
                'id' => 'scale', 
                'name' => 'Scale', 
                'price' => '$99', 
                'description' => 'For serious teams with operational needs.', 
                'features' => ['Advanced admin', 'Audit activity', 'Custom limits'],
            ],
        ];
    }
}
