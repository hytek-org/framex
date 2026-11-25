<?php

namespace App\Models;

use App\Concerns\HasTeams;
use Database\Factories\UserFactory;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Billable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property int|null $current_team_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Team|null $currentTeam
 * @property-read Collection<int, Team> $ownedTeams
 * @property-read Collection<int, Membership> $teamMemberships
 * @property-read Collection<int, Team> $teams
 */
#[Fillable([
    'name',
    'email',
    'password',
    'current_team_id',
    'is_admin',
    'locale',
    'phone',
    'avatar',
    'job_title',
    'department',
    'timezone',
    'date_format',
    'time_format',
    'theme',
    'last_login_at',
    'last_login_ip',
])]
#[Hidden([
    'password',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'remember_token',
    'stripe_id',
    'pm_type',
    'pm_last_four',
    'trial_ends_at',
])]
class User extends Authenticatable implements  PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use Billable, HasApiTokens, HasFactory, HasTeams, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_admin' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function accountAuditLogs(): HasMany
    {
        return $this->hasMany(AccountAuditLog::class);
    }

    public function notificationPreference(): HasOne
    {
        return $this->hasOne(NotificationPreference::class);
    }

    /**
     * Get the email address used to create the customer in Stripe.
     */
    public function stripeEmail(): string
    {
        return $this->email;
    }

    /**
     * Get the user's active subscription plan name.
     */
    public function currentPlanName(): string
    {
        if (! $this->subscribed('default')) {
            return 'Free';
        }

        $subscription = $this->subscription('default');
        if (! $subscription) {
            return 'Free';
        }

        // Handle active pending downgrades (e.g. Scale to Pro)
        if ($subscription->pending_plan_from && $subscription->pending_plan_until) {
            if (Carbon::parse($subscription->pending_plan_until)->isFuture()) {
                return $subscription->pending_plan_from;
            }
        }

        $priceId = $subscription->stripe_price;
        if ($priceId === config('services.stripe.price_pro') || $priceId === 'price_mock_pro') {
            return 'Pro';
        } elseif ($priceId === config('services.stripe.price_scale') || $priceId === 'price_mock_scale') {
            return 'Scale';
        }

        return 'Custom';
    }
}
