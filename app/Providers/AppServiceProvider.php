<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerActivityLogListeners();
    }

    /**
     * Register listeners for third-party models to record activities.
     */
    protected function registerActivityLogListeners(): void
    {
        // 1. API Token creation and deletion
        if (class_exists(\Laravel\Sanctum\PersonalAccessToken::class)) {
            \Laravel\Sanctum\PersonalAccessToken::created(function ($token) {
                try {
                    if (Auth::check()) {
                        $user = Auth::user();
                        $activity = \App\Models\ActivityLog::create([
                            'team_id' => $user->current_team_id,
                            'user_id' => $user->id,
                            'event' => 'api_token.created',
                            'description' => "API token '{$token->name}' was created.",
                            'metadata' => [
                                'token_id' => $token->id,
                            ],
                        ]);
                        \App\Events\TeamActivityRecorded::dispatch($activity);
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('Failed to log API token creation: ' . $e->getMessage());
                }
            });

            \Laravel\Sanctum\PersonalAccessToken::deleted(function ($token) {
                try {
                    if (Auth::check()) {
                        $user = Auth::user();
                        $activity = \App\Models\ActivityLog::create([
                            'team_id' => $user->current_team_id,
                            'user_id' => $user->id,
                            'event' => 'api_token.deleted',
                            'description' => "API token '{$token->name}' was deleted.",
                            'metadata' => [
                                'token_id' => $token->id,
                            ],
                        ]);
                        \App\Events\TeamActivityRecorded::dispatch($activity);
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('Failed to log API token deletion: ' . $e->getMessage());
                }
            });
        }

        // 2. Stripe Subscriptions
        if (class_exists(\Laravel\Cashier\Subscription::class)) {
            \Laravel\Cashier\Subscription::created(function ($subscription) {
                try {
                    $user = $subscription->user;
                    if ($user) {
                        $activity = \App\Models\ActivityLog::create([
                            'team_id' => $user->current_team_id,
                            'user_id' => $user->id,
                            'event' => 'subscription.created',
                            'description' => 'Subscribed to plan.',
                            'metadata' => [
                                'subscription_id' => $subscription->id,
                                'stripe_price' => $subscription->stripe_price,
                            ],
                        ]);
                        \App\Events\TeamActivityRecorded::dispatch($activity);
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('Failed to log subscription creation: ' . $e->getMessage());
                }
            });

            \Laravel\Cashier\Subscription::updated(function ($subscription) {
                try {
                    $user = $subscription->user;
                    if ($user && $subscription->wasChanged('stripe_status')) {
                        $activity = \App\Models\ActivityLog::create([
                            'team_id' => $user->current_team_id,
                            'user_id' => $user->id,
                            'event' => 'subscription.updated',
                            'description' => "Subscription status changed to {$subscription->stripe_status}.",
                            'metadata' => [
                                'subscription_id' => $subscription->id,
                                'stripe_status' => $subscription->stripe_status,
                            ],
                        ]);
                        \App\Events\TeamActivityRecorded::dispatch($activity);
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('Failed to log subscription update: ' . $e->getMessage());
                }
            });
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
