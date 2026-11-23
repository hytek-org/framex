<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AccountDeleteRequest;
use App\Http\Requests\Settings\AccountPreferencesUpdateRequest;
use App\Http\Requests\Settings\AccountProfileUpdateRequest;
use App\Models\AccountAuditLog;
use App\Services\AccountAuditService;
use Carbon\Carbon;
use DateTimeZone;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(
        protected AccountAuditService $auditService
    ) {}

    /**
     * Account Overview dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('account/index', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'job_title' => $user->job_title,
                'department' => $user->department,
                'timezone' => $user->timezone ?? 'UTC',
                'locale' => $user->locale ?? 'en',
                'theme' => $user->theme ?? 'system',
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'two_factor_enabled' => $user->hasEnabledTwoFactorAuthentication(),
                'created_at' => $user->created_at->toIso8601String(),
                'last_login_at' => $user->last_login_at?->toIso8601String(),
                'last_login_ip' => $user->last_login_ip,
            ],
            'recentActivity' => $user->accountAuditLogs()
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (AccountAuditLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->toIso8601String(),
                    'created_at_human' => $log->created_at->diffForHumans(),
                ]),
            'activeSessions' => $this->getActiveSessions($user),
        ]);
    }

    /**
     * Personal information editing page.
     */
    public function profile(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('account/profile', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'job_title' => $user->job_title,
                'department' => $user->department,
                'timezone' => $user->timezone ?? 'UTC',
                'locale' => $user->locale ?? 'en',
            ],
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'emailVerified' => $user->hasVerifiedEmail(),
            'status' => $request->session()->get('status'),
            'timezones' => DateTimeZone::listIdentifiers(),
        ]);
    }

    /**
     * Update personal profile information.
     */
    public function updateProfile(AccountProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $emailChanged = false;

        // Avatar removal
        if ($request->boolean('remove_avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = null;
        }

        // Avatar upload
        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        unset($validated['remove_avatar']);

        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $emailChanged = true;
            $user->email_verified_at = null;
        }

        $user->fill($validated);
        $user->save();

        $this->auditService->log(
            $user,
            $emailChanged ? 'email.changed' : 'profile.updated',
            $emailChanged ? "Updated email to {$user->email}" : 'Updated personal profile information',
            $request,
            ['changed_fields' => array_keys($validated)]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated successfully.')]);

        return back();
    }

    /**
     * Account Preferences page.
     */
    public function preferences(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('account/preferences', [
            'preferences' => [
                'theme' => $user->theme ?? 'system',
                'locale' => $user->locale ?? 'en',
                'timezone' => $user->timezone ?? 'UTC',
                'date_format' => $user->date_format ?? 'MMM D, YYYY',
                'time_format' => $user->time_format ?? '12h',
            ],
            'notificationPreferences' => $user->notificationPreference()->firstOrCreate(),
            'timezones' => DateTimeZone::listIdentifiers(),
        ]);
    }

    /**
     * Update account preferences.
     */
    public function updatePreferences(AccountPreferencesUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $notificationKeys = ['product_updates', 'security_alerts', 'billing_alerts', 'weekly_summary'];
        $notificationData = array_intersect_key($validated, array_flip($notificationKeys));
        $accountData = array_diff_key($validated, array_flip($notificationKeys));

        if (! empty($accountData)) {
            $user->update($accountData);
        }

        if (! empty($notificationData)) {
            $user->notificationPreference()->updateOrCreate([], $notificationData);
        }

        $this->auditService->log(
            $user,
            'preferences.updated',
            'Updated account and notification preferences',
            $request
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Preferences saved successfully.')]);

        return back();
    }

    /**
     * Active Sessions management page.
     */
    public function sessions(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('account/sessions', [
            'sessions' => $this->getActiveSessions($user),
            'currentSessionId' => $request->session()->getId(),
        ]);
    }

    /**
     * Terminate a specific remote session.
     */
    public function destroySession(Request $request, string $sessionId): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $deleted = DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted) {
            $this->auditService->log(
                $request->user(),
                'session.terminated',
                'Terminated remote session '.substr($sessionId, 0, 8).'...',
                $request,
                ['session_id' => substr($sessionId, 0, 8)]
            );
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Session terminated.')]);
        }

        return back();
    }

    /**
     * Terminate all other sessions except current.
     */
    public function destroyOtherSessions(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $currentId = $request->session()->getId();

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $currentId)
            ->delete();

        $this->auditService->log(
            $request->user(),
            'session.terminated_all',
            'Terminated all other active browser sessions',
            $request
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('All other sessions have been logged out.')]);

        return back();
    }

    /**
     * Account Activity Audit log page.
     */
    public function activity(Request $request): Response
    {
        $user = $request->user();

        $query = $user->accountAuditLogs()->latest();

        if ($request->filled('action')) {
            $query->where('action', $request->string('action'));
        }

        $activities = $query->paginate(15)->through(fn (AccountAuditLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'description' => $log->description,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'metadata' => $log->metadata,
            'created_at' => $log->created_at->toIso8601String(),
            'created_at_human' => $log->created_at->diffForHumans(),
        ])->withQueryString();

        $actionTypes = AccountAuditLog::where('user_id', $user->id)
            ->distinct()
            ->pluck('action')
            ->sort()
            ->values();

        return Inertia::render('account/activity', [
            'activities' => $activities,
            'filters' => [
                'action' => $request->input('action', ''),
            ],
            'actionTypes' => $actionTypes,
        ]);
    }

    /**
     * Delete account.
     */
    public function destroy(AccountDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        $this->auditService->log($user, 'account.deleted', 'Account deletion requested and confirmed', $request);

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');     
    }

    /**
     * Parse and fetch active sessions for the user.
     */
    protected function getActiveSessions($user): array
    {
        if (! DB::getSchemaBuilder()->hasTable('sessions')) {
            return [];
        }

        return DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($session) {
                $parsed = $this->parseUserAgent($session->user_agent);

                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'browser' => $parsed['browser'],
                    'platform' => $parsed['platform'],
                    'is_desktop' => $parsed['is_desktop'],
                    'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    'last_active_at' => Carbon::createFromTimestamp($session->last_activity)->toIso8601String(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Parse raw User Agent into clean platform and browser descriptions.
     */
    protected function parseUserAgent(?string $ua): array
    {
        $ua = $ua ?? '';
        $browser = 'Unknown';
        $platform = 'Unknown';
        $isDesktop = true;

        // Platform detection
        if (stripos($ua, 'Windows') !== false) {
            $platform = 'Windows';
        } elseif (stripos($ua, 'Macintosh') !== false || stripos($ua, 'Mac OS') !== false) {
            $platform = 'macOS';
        } elseif (stripos($ua, 'Linux') !== false) {
            $platform = 'Linux';
        } elseif (stripos($ua, 'Android') !== false) {
            $platform = 'Android';
            $isDesktop = false;
        } elseif (stripos($ua, 'iPhone') !== false || stripos($ua, 'iPad') !== false) {
            $platform = 'iOS';
            $isDesktop = false;
        }

        // Browser detection
        if (stripos($ua, 'Edg/') !== false) {
            $browser = 'Edge';
        } elseif (stripos($ua, 'Chrome/') !== false) {
            $browser = 'Chrome';
        } elseif (stripos($ua, 'Firefox/') !== false) {
            $browser = 'Firefox';
        } elseif (stripos($ua, 'Safari/') !== false) {
            $browser = 'Safari';
        }

        return [
            'browser' => $browser,
            'platform' => $platform,
            'is_desktop' => $isDesktop,
        ];
    }
}
