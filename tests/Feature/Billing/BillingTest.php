<?php

use App\Models\User;

test('authenticated users can visit the billing index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('billing.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('billing/index')
        ->has('plans')
        ->has('subscription')
        ->where('isMockMode', true)
        ->where('stripeConfigured', true)
    );
});

test('users can subscribe in mock mode via checkout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('billing.checkout', ['plan' => 'pro']));

    $response->assertRedirect(route('billing.index', ['checkout' => 'success']));

    $user->refresh();
    expect($user->currentPlanName())->toBe('Pro');
    expect($user->subscribed('default'))->toBeTrue();
    expect($user->pm_type)->toBe('visa');
    expect($user->pm_last_four)->toBe('4242');
});

test('users can swap between plans in mock mode', function () {
    $user = User::factory()->create();

    // Subscribe to Pro
    $this->actingAs($user)->post(route('billing.checkout', ['plan' => 'pro']));
    $user->refresh();
    expect($user->currentPlanName())->toBe('Pro');

    // Upgrade to Scale
    $response = $this->actingAs($user)->post(route('billing.swap', ['plan' => 'scale']));
    $response->assertRedirect();
    $user->refresh();
    expect($user->currentPlanName())->toBe('Scale');

    // Downgrade to Pro (grace period simulated)
    $response = $this->actingAs($user)->post(route('billing.swap', ['plan' => 'pro']));
    $response->assertRedirect();
    $user->refresh();
    $subscription = $user->subscription('default');
    expect($subscription->pending_plan_to)->toBe('Pro');
    expect($subscription->pending_plan_from)->toBe('Scale');
    expect($user->currentPlanName())->toBe('Scale'); // Retains scale until period ends
});

test('users can cancel and resume subscriptions in mock mode', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('billing.checkout', ['plan' => 'pro']));
    $user->refresh();

    // Cancel
    $response = $this->actingAs($user)->post(route('billing.cancel'));
    $response->assertRedirect();
    $user->refresh();
    $subscription = $user->subscription('default');
    expect($subscription->onGracePeriod())->toBeTrue();

    // Resume
    $response = $this->actingAs($user)->post(route('billing.resume'));
    $response->assertRedirect();
    $user->refresh();
    $subscription = $user->subscription('default');
    expect($subscription->onGracePeriod())->toBeFalse();
});

test('users can download mock invoices', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('billing.invoice', ['invoice' => 'in_mock_001']));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
    expect($response->getContent())->toContain('FRAMEX INVOICE RECEIPT');
});
