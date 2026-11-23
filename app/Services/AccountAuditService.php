<?php

namespace App\Services;

use App\Models\AccountAuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AccountAuditService
{
    /**
     * Log an account-level audit event for a user.
     */
    public function log(
        User $user,
        string $action,
        string $description,
        ?Request $request = null,
        ?array $metadata = null
    ): AccountAuditLog {
        return AccountAuditLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'description' => $description,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'metadata' => $metadata,
        ]);
    }
}
