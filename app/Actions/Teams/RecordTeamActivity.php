<?php

namespace App\Actions\Teams;

use App\Events\TeamActivityRecorded;
use App\Models\ActivityLog;
use App\Models\Team;
use App\Models\User;

class RecordTeamActivity
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function handle(Team $team, ?User $user, string $event, string $description, array $metadata = []): ActivityLog
    {
        $activity = $team->activityLogs()->create([
            'user_id' => $user?->id,
            'event' => $event,
            'description' => $description,
            'metadata' => $metadata,
        ]);

        TeamActivityRecorded::dispatch($activity);

        return $activity;
    }
}
