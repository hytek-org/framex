<?php

namespace App\FrameX\Modules\Webhooks\Models;

use App\Concerns\LogsActivity;
use App\Models\Team;
use Database\Factories\WebhookEndpointFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class WebhookEndpoint extends Model
{
    use HasFactory, LogsActivity;

    public function logActivityEvent(string $action): string
    {
        return "webhook.{$action}";
    }

    public function logActivityDescription(string $action): string
    {
        $label = $this->name ?: $this->url;

        return match ($action) {
            'created' => "Registered webhook endpoint '{$label}'",
            'updated' => "Updated webhook endpoint '{$label}'",
            'deleted' => "Removed webhook endpoint '{$label}'",
            default => "Webhook endpoint '{$label}' {$action}",
        };
    }

    protected static function newFactory(): WebhookEndpointFactory
    {
        return WebhookEndpointFactory::new();
    }

    protected $fillable = [
        'team_id',
        'name',
        'url',
        'secret',
        'events',
        'is_active',
        'description',
    ];

    protected $casts = [
        'events' => 'array',
        'is_active' => 'boolean',
    ];

    public static function generateSecret(): string
    {
        return 'whsec_'.Str::random(32);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class, 'endpoint_id');
    }

    public function listensTo(string $event): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $events = $this->events ?? [];

        return in_array('*', $events) || in_array($event, $events);
    }
}
