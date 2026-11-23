<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class MockBillingService
{
    /**
     * Check if mock billing mode is active.
     */
    public static function isMockMode(): bool
    {
        return config('services.billing.mock', env('BILLING_MOCK', true));
    }

    /**
     * Get or initialize simulated active subscription for user in mock mode.
     */
    public static function getSubscription(User $user): ?object
    {
        $sub = $user->subscriptions()->where('type', 'default')->first();

        if (! $sub) {
            return null;
        }

        return (object) [
            'id' => $sub->id,
            'stripe_id' => $sub->stripe_id,
            'stripe_status' => $sub->stripe_status,
            'stripe_price' => $sub->stripe_price,
            'ends_at' => $sub->ends_at,
            'trial_ends_at' => $sub->trial_ends_at,
            'pending_plan_from' => $sub->pending_plan_from,
            'pending_plan_to' => $sub->pending_plan_to,
            'pending_plan_until' => $sub->pending_plan_until,
            'onGracePeriod' => fn () => $sub->ends_at && Carbon::parse($sub->ends_at)->isFuture(),
        ];
    }

    /**
     * Simulate a plan checkout/upgrade.
     */
    public static function mockSubscribe(User $user, string $planId): void
    {
        $normalizedPlan = strtolower(trim($planId));
        $planName = ucfirst($normalizedPlan);

        if ($normalizedPlan === 'free') {
            static::mockCancel($user, immediate: true);

            return;
        }

        $now = Carbon::now();
        $sub = $user->subscriptions()->where('type', 'default')->first();

        if (! $sub) {
            $user->subscriptions()->create([
                'type' => 'default',
                'stripe_id' => 'sub_mock_'.Str::random(18),
                'stripe_status' => 'active',
                'stripe_price' => 'price_mock_'.$normalizedPlan,
                'quantity' => 1,
                'trial_ends_at' => null,
                'ends_at' => null,
                'pending_plan_from' => null,
                'pending_plan_to' => null,
                'pending_plan_until' => null,
            ]);
        } else {
            $sub->update([
                'stripe_status' => 'active',
                'stripe_price' => 'price_mock_'.$normalizedPlan,
                'ends_at' => null,
                'pending_plan_from' => null,
                'pending_plan_to' => null,
                'pending_plan_until' => null,
            ]);
        }

        if (! $user->stripe_id) {
            $user->stripe_id = 'cus_mock_'.Str::random(16);
        }
        $user->pm_type = 'visa';
        $user->pm_last_four = '4242';
        $user->save();
    }

    /**
     * Simulate plan cancellation.
     */
    public static function mockCancel(User $user, bool $immediate = false): void
    {
        $sub = $user->subscriptions()->where('type', 'default')->first();

        if (! $sub) {
            return;
        }

        if ($immediate) {
            $sub->delete();
        } else {
            $sub->update([
                'ends_at' => Carbon::now()->addDays(30),
                'pending_plan_from' => null,
                'pending_plan_to' => null,
                'pending_plan_until' => null,
            ]);
        }
    }

    /**
     * Simulate plan resumption.
     */
    public static function mockResume(User $user): void
    {
        $sub = $user->subscriptions()->where('type', 'default')->first();

        if ($sub) {
            $sub->update([
                'ends_at' => null,
                'pending_plan_from' => null,
                'pending_plan_to' => null,
                'pending_plan_until' => null,
            ]);
        }
    }

    /**
     * Simulate plan swap (immediate upgrade or graceful downgrade).
     */
    public static function mockSwap(User $user, string $targetPlan): void
    {
        $targetPlanKey = strtolower(trim($targetPlan));

        if ($targetPlanKey === 'free') {
            static::mockCancel($user);

            return;
        }

        $planTiers = ['free' => 0, 'pro' => 1, 'scale' => 2];
        $currentPlanKey = strtolower($user->currentPlanName());
        $currentRank = $planTiers[$currentPlanKey] ?? 0;
        $targetRank = $planTiers[$targetPlanKey] ?? 0;

        $sub = $user->subscriptions()->where('type', 'default')->first();

        if (! $sub) {
            static::mockSubscribe($user, $targetPlanKey);

            return;
        }

        if ($targetRank < $currentRank) {
            // Downgrade: keep high tier until next cycle
            $sub->update([
                'pending_plan_from' => ucfirst($currentPlanKey),
                'pending_plan_to' => ucfirst($targetPlanKey),
                'pending_plan_until' => Carbon::now()->addDays(30),
            ]);
        } else {
            // Upgrade
            $sub->update([
                'stripe_price' => 'price_mock_'.$targetPlanKey,
                'ends_at' => null,
                'pending_plan_from' => null,
                'pending_plan_to' => null,
                'pending_plan_until' => null,
            ]);
        }
    }

    /**
     * Get mock invoices for demo / template preview.
     */
    public static function getMockInvoices(User $user): array
    {
        if (! $user->stripe_id && ! $user->subscriptions()->exists()) {
            return [];
        }

        $currentPlan = strtolower($user->currentPlanName());
        $amount = $currentPlan === 'scale' ? '$99.00' : ($currentPlan === 'pro' ? '$29.00' : '$0.00');

        if ($currentPlan === 'free') {
            return [];
        }

        return [
            [
                'id' => 'in_mock_001',
                'date' => Carbon::now()->toFormattedDateString(),
                'total' => $amount,
                'status' => 'paid',
                'download_url' => route('billing.invoice', 'in_mock_001'),
            ],
            [
                'id' => 'in_mock_002',
                'date' => Carbon::now()->subMonth()->toFormattedDateString(),
                'total' => $amount,
                'status' => 'paid',
                'download_url' => route('billing.invoice', 'in_mock_002'),
            ],
        ];
    }
}
