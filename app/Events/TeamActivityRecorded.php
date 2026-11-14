<?php

namespace App\Events;

use App\Models\ActivityLog;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TeamActivityRecorded implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public ActivityLog $activity)
    {
        $this->activity->loadMissing('user');
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('teams.'.$this->activity->team_id);
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->activity->id,
            'event' => $this->activity->event,
            'description' => $this->activity->description,
            'user' => $this->activity->user?->only(['id', 'name', 'email']),
            'created_at' => $this->activity->created_at?->toISOString(),
        ];
    }
}
