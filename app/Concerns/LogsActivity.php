<?php

namespace App\Concerns;

use App\Events\TeamActivityRecorded;
use App\Models\ActivityLog;
use App\Models\Team;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

trait LogsActivity
{
    /**
     * Boot the trait and register model event listeners.
     */
    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            static::recordActivity($model, 'created');
        });

        static::updated(function ($model) {
            static::recordActivity($model, 'updated');
        });

        static::deleted(function ($model) {
            static::recordActivity($model, 'deleted');
        });
    }

    /**
     * Record the activity for the given action.
     */
    protected static function recordActivity($model, string $action): void
    {
        try {
            // 1. Identify User
            $userId = Auth::id();

            // 2. Identify Team (Workspace)
            $teamId = null;
            if ($model instanceof Team) {
                $teamId = $model->id;
            } elseif (isset($model->team_id)) {
                $teamId = $model->team_id;
            } elseif (method_exists($model, 'team') && $model->team) {
                $teamId = $model->team->id;
            } elseif (Auth::check()) {
                $teamId = Auth::user()->current_team_id;
            }

            if (!$teamId) {
                return; // Can't associate activity log without a team context
            }

            // 3. Capture Changes for Updates
            $metadata = [];
            if ($action === 'updated') {
                $changes = $model->getChanges();
                // Exclude timestamps and internally managed fields
                unset($changes['updated_at'], $changes['created_at']);
                
                if (empty($changes)) {
                    return; // No meaningful changes to log
                }

                $old = [];
                $new = [];
                foreach ($changes as $key => $value) {
                    $old[$key] = $model->getOriginal($key);
                    $new[$key] = $value;
                }

                $metadata['changes'] = [
                    'old' => $old,
                    'new' => $new,
                ];
            }

            // 4. Generate Event and Description
            $event = method_exists($model, 'logActivityEvent')
                ? $model->logActivityEvent($action)
                : static::defaultActivityEvent($model, $action);

            $description = method_exists($model, 'logActivityDescription')
                ? $model->logActivityDescription($action)
                : static::defaultActivityDescription($model, $action);

            // 5. Save Activity Log
            $activity = ActivityLog::create([
                'team_id' => $teamId,
                'user_id' => $userId,
                'event' => $event,
                'description' => $description,
                'metadata' => empty($metadata) ? null : $metadata,
            ]);

            // 6. Broadcast Realtime Event
            TeamActivityRecorded::dispatch($activity);

        } catch (\Throwable $e) {
            if (app()->environment('testing')) {
                throw $e;
            }
            // Fail-safe to prevent user request from crashing due to logging errors
            Log::warning('Activity logging failed: ' . $e->getMessage(), [
                'model' => get_class($model),
                'action' => $action,
                'exception' => $e,
            ]);
        }
    }

    /**
     * Get the default event name for the activity.
     */
    protected static function defaultActivityEvent($model, string $action): string
    {
        $name = strtolower(class_basename($model));
        return "{$name}.{$action}";
    }

    /**
     * Get the default description for the activity.
     */
    protected static function defaultActivityDescription($model, string $action): string
    {
        $modelName = class_basename($model);
        $displayName = $model->name ?? $model->title ?? $model->id;
        return "{$modelName} '{$displayName}' was {$action}.";
    }
}
