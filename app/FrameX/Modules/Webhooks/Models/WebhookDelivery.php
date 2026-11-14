<?php

namespace App\FrameX\Modules\Webhooks\Models;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'endpoint_id',
        'team_id',
        'event',
        'payload',
        'response_status',
        'response_body',
        'attempts',
        'duration_ms',
        'delivered_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'delivered_at' => 'datetime',
    ];

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'endpoint_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function isSuccess(): bool
    {
        return $this->response_status >= 200 && $this->response_status < 300;
    }
}
