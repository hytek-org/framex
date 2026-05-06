<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->subscription('default');
        
        $currentPlanName = 'Free';
        if ($user->subscribed('default')) {
            $priceId = $subscription->stripe_price;
            if ($priceId === config('services.stripe.price_pro')) {
                $currentPlanName = 'Pro';
            } elseif ($priceId === config('services.stripe.price_scale')) {
                $currentPlanName = 'Scale';
            }
        }

        return Inertia::render('billing/index', [
            'plans' => $this->plans(),
            'subscription' => [
                'name' => $currentPlanName,
                'status' => $subscription?->stripe_status ?? 'none',
                'renews_at' => $subscription?->asStripeSubscription()?->current_period_end ?? null,
                'on_grace_period' => $subscription?->onGracePeriod() ?? false,
            ],
            'stripeConfigured' => filled(config('cashier.key')),
        ]);
    }

    public function checkout(Request $request, string $plan): \Symfony\Component\HttpFoundation\Response
    {
        $price = config("services.stripe.price_{$plan}");

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

        return Inertia::location($checkout->getTargetUrl());
    }

    public function portal(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        if (!filled(config('cashier.key'))) {
            return back()->withErrors(['stripe' => 'Stripe is not configured.']);
        }

        return Inertia::location($request->user()->billingPortalUrl(route('billing.index')));
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
