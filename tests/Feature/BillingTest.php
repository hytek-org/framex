<?php

use App\Models\User;
use Laravel\Cashier\Subscription;
use Laravel\Cashier\Checkout;
use Laravel\Cashier\SubscriptionBuilder;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('billing.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can view the billing page', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('billing.index'));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('billing/index')
        ->has('plans')
        ->has('subscription')
        ->where('subscription.name', 'Free')
    );
});

test('users can view billing page with subscription', function () {
    $user = User::factory()->create(['stripe_id' => 'cus_123']);
    
    $subscription = $user->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_123',
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro_id',
        'quantity' => 1,
    ]);

    config(['services.stripe.price_pro' => 'price_pro_id']);

    $response = $this
        ->actingAs($user)
        ->get(route('billing.index'));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('billing/index')
        ->where('subscription.name', 'Pro')
        ->where('subscription.status', 'active')
    );
});

test('users can initiate checkout redirect to stripe', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    
    config(['services.stripe.price_pro' => 'price_pro_id']);
    config(['cashier.key' => 'sk_test_123']);

    $checkoutMock = Mockery::mock(Checkout::class);
    $checkoutMock->url = 'https://stripe.checkout.url';
    $checkoutMock->shouldReceive('__get')->with('url')->andReturn('https://stripe.checkout.url');

    $userMock = Mockery::mock($user)->makePartial();
    
    $subscriptionBuilderMock = Mockery::mock(SubscriptionBuilder::class);
    $subscriptionBuilderMock->shouldReceive('checkout')->andReturn($checkoutMock);
    
    $userMock->shouldReceive('newSubscription')
        ->with('default', 'price_pro_id')
        ->andReturn($subscriptionBuilderMock);

    $response = $this
        ->actingAs($userMock)
        ->post(route('billing.checkout', 'pro'), [], [
            'X-Inertia' => 'true',
        ]);

    $response->assertStatus(409); // Inertia external redirect status code is 409 Conflict with X-Inertia-Location header
    $response->assertHeader('X-Inertia-Location', 'https://stripe.checkout.url');
});

test('users can cancel an active subscription', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    
    $subscriptionMock = Mockery::mock(Subscription::class)->makePartial();
    $subscriptionMock->shouldReceive('cancel')->once()->andReturnSelf();

    $userMock = Mockery::mock($user)->makePartial();
    $userMock->shouldReceive('subscribed')->with('default')->andReturn(true);
    $userMock->shouldReceive('subscription')->with('default')->andReturn($subscriptionMock);

    $response = $this
        ->actingAs($userMock)
        ->post(route('billing.cancel'));

    $response->assertRedirect();
});

test('users can resume a cancelled subscription on grace period', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    
    $subscriptionMock = Mockery::mock(Subscription::class)->makePartial();
    $subscriptionMock->shouldReceive('onGracePeriod')->andReturn(true);
    $subscriptionMock->shouldReceive('resume')->once()->andReturnSelf();

    $userMock = Mockery::mock($user)->makePartial();
    $userMock->shouldReceive('subscription')->with('default')->andReturn($subscriptionMock);

    $response = $this
        ->actingAs($userMock)
        ->post(route('billing.resume'));

    $response->assertRedirect();
});

test('users can swap plans', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    config(['services.stripe.price_scale' => 'price_scale_id']);

    $subscriptionMock = Mockery::mock(Subscription::class)->makePartial();
    $subscriptionMock->shouldReceive('swap')->with('price_scale_id')->once()->andReturnSelf();

    $userMock = Mockery::mock($user)->makePartial();
    $userMock->shouldReceive('subscribed')->with('default')->andReturn(true);
    $userMock->shouldReceive('subscription')->with('default')->andReturn($subscriptionMock);

    $response = $this
        ->actingAs($userMock)
        ->post(route('billing.swap', 'scale'));

    $response->assertRedirect();
});

test('users can swap to free plan which cancels subscription', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();

    $subscriptionMock = Mockery::mock(Subscription::class)->makePartial();
    $subscriptionMock->shouldReceive('cancel')->once()->andReturnSelf();

    $userMock = Mockery::mock($user)->makePartial();
    $userMock->shouldReceive('subscribed')->with('default')->andReturn(true);
    $userMock->shouldReceive('subscription')->with('default')->andReturn($subscriptionMock);

    $response = $this
        ->actingAs($userMock)
        ->post(route('billing.swap', 'free'));

    $response->assertRedirect();
});


test('users can download invoices', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();

    $userMock = Mockery::mock($user)->makePartial();
    $userMock->shouldReceive('downloadInvoice')
        ->with('in_123', Mockery::any())
        ->once()
        ->andReturn(response('PDF content', 200, [
            'Content-Type' => 'application/pdf',
        ]));

    $response = $this
        ->actingAs($userMock)
        ->get(route('billing.invoice', 'in_123'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/pdf');
    expect($response->getContent())->toBe('PDF content');
});

test('users can downgrade to lower plan which schedules it and keeps current plan name', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    
    config(['services.stripe.price_pro' => 'price_pro_id']);
    config(['services.stripe.price_scale' => 'price_scale_id']);

    $subscriptionMock = Mockery::mock(Subscription::class)->makePartial();
    
    $stripeSubscriptionMock = new stdClass();
    $stripeSubscriptionMock->current_period_end = time() + 3600;

    $subscriptionMock->shouldReceive('asStripeSubscription')->once()->andReturn($stripeSubscriptionMock);
    
    $subscriptionMock->shouldReceive('swap')
        ->with('price_pro_id', ['proration_behavior' => 'none'])
        ->once()
        ->andReturnSelf();

    $subscriptionMock->shouldReceive('update')
        ->with(Mockery::on(function ($arg) {
            return $arg['pending_plan_from'] === 'Scale'
                && $arg['pending_plan_to'] === 'Pro'
                && $arg['pending_plan_until'] instanceof \Illuminate\Support\Carbon;
        }))
        ->once()
        ->andReturn(true);

    $userMock = Mockery::mock($user)->makePartial();
    $userMock->shouldReceive('subscribed')->with('default')->andReturn(true);
    $userMock->shouldReceive('subscription')->with('default')->andReturn($subscriptionMock);
    $userMock->shouldReceive('currentPlanName')->andReturn('Scale');

    // Call swap with 'pro'
    $response = $this
        ->actingAs($userMock)
        ->post(route('billing.swap', 'pro'));

    $response->assertRedirect();
});

test('pending downgrade is cleared when expired', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    
    config(['services.stripe.price_pro' => 'price_pro_id']);
    config(['services.stripe.price_scale' => 'price_scale_id']);

    // Setup a subscription with active pending downgrade in the database (until 1 hour ago)
    $subscription = $user->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_123',
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro_id', // Swapped price is already pro
        'quantity' => 1,
        'pending_plan_from' => 'Scale',
        'pending_plan_to' => 'Pro',
        'pending_plan_until' => now()->subHour(), // expired
    ]);

    // Fetching the billing page should trigger the cleanup
    $response = $this
        ->actingAs($user)
        ->get(route('billing.index'));

    $response->assertOk();

    // Verify columns cleared in DB
    $updatedSub = $user->subscription('default');
    expect($updatedSub->pending_plan_from)->toBeNull();
    expect($updatedSub->pending_plan_to)->toBeNull();
    expect($updatedSub->pending_plan_until)->toBeNull();

    // Verify plan name is now Pro
    expect($user->currentPlanName())->toBe('Pro');
});

test('user can cancel downgrade by swapping back to original plan', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    
    config(['services.stripe.price_pro' => 'price_pro_id']);
    config(['services.stripe.price_scale' => 'price_scale_id']);

    $subscriptionMock = Mockery::mock(Subscription::class)->makePartial();
    
    $subscriptionMock->shouldReceive('update')
        ->with([
            'pending_plan_from' => null,
            'pending_plan_to' => null,
            'pending_plan_until' => null,
        ])
        ->once()
        ->andReturn(true);

    $subscriptionMock->shouldReceive('swap')
        ->with('price_scale_id')
        ->once()
        ->andReturnSelf();

    $userMock = Mockery::mock($user)->makePartial();
    $userMock->shouldReceive('subscribed')->with('default')->andReturn(true);
    $userMock->shouldReceive('subscription')->with('default')->andReturn($subscriptionMock);
    $userMock->shouldReceive('currentPlanName')->andReturn('Scale');

    // Swap back to 'scale' (target rank >= current rank)
    $response = $this
        ->actingAs($userMock)
        ->post(route('billing.swap', 'scale'));

    $response->assertRedirect();
});


