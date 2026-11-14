<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'product_updates', 'security_alerts', 'billing_alerts', 'weekly_summary'])]
class NotificationPreference extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'product_updates' => 'boolean',
            'security_alerts' => 'boolean',
            'billing_alerts' => 'boolean',
            'weekly_summary' => 'boolean',
        ];
    }
}
