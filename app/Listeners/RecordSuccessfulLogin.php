<?php

namespace App\Listeners;

use App\Models\AccountAuditLog;
use Illuminate\Auth\Events\Login;

class RecordSuccessfulLogin
{
    /**
     * Handle user login event to capture security audit details.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;
        $request = request();

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->saveQuietly();

        AccountAuditLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => 'Signed into account successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'guard' => $event->guard,
                'remember' => $event->remember,
            ],
        ]);
    }
}
