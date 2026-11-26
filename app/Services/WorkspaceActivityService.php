<?php

namespace App\Services;

use App\Events\TeamActivityRecorded;
use App\Models\ActivityLog;
use App\Models\Team;
use App\Models\User;

class WorkspaceActivityService
{
    /**
     * Record a workspace activity event for a team.
     *
     * @param  array<string, mixed>|null  $metadata
     */
    public static function record(
        Team|int|null $team,
        ?User $actor,
        string $event,
        string $description,
        ?array $metadata = null,
    ): ?ActivityLog {
        $teamId = $team instanceof Team ? $team->id : $team;

        if (! $teamId) {
            return null;
        }

        $activity = ActivityLog::create([
            'team_id' => $teamId,
            'user_id' => $actor?->id,
            'event' => $event,
            'description' => $description,
            'metadata' => empty($metadata) ? null : $metadata,
        ]);

        TeamActivityRecorded::dispatch($activity);

        return $activity;
    }
}
