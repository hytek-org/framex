<?php

namespace App\Policies;

use App\Enums\TeamPermission;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Models\Team;
use App\Models\User;

class ContentPolicy
{
    /**
     * Determine whether the user can view the content.
     */
    public function view(User $user, Content $content): bool
    {
        $team = $user->currentTeam;

        return $team && $content->team_id === $team->id;
    }

    /**
     * Determine whether the user can create content.
     */
    public function create(User $user, ?Team $team = null): bool
    {
        $team = $team ?? $user->currentTeam;

        return $team && (
            $user->hasTeamPermission($team, TeamPermission::CreateContent)
            || $user->hasTeamPermission($team, TeamPermission::ManageContent)
        );
    }

    /**
     * Determine whether the user can update the content.
     */
    public function update(User $user, Content $content): bool
    {
        $team = $user->currentTeam;

        if (! $team || $content->team_id !== $team->id) {
            return false;
        }

        return $user->hasTeamPermission($team, TeamPermission::UpdateContent)
            || $user->hasTeamPermission($team, TeamPermission::ManageContent)
            || $content->author_id === $user->id;
    }

    /**
     * Determine whether the user can publish the content.
     */
    public function publish(User $user, Content $content): bool
    {
        $team = $user->currentTeam;

        if (! $team || $content->team_id !== $team->id) {
            return false;
        }

        return $user->hasTeamPermission($team, TeamPermission::PublishContent)
            || $user->hasTeamPermission($team, TeamPermission::ManageContent);
    }

    /**
     * Determine whether the user can delete the content.
     */
    public function delete(User $user, Content $content): bool
    {
        $team = $user->currentTeam;

        if (! $team || $content->team_id !== $team->id) {
            return false;
        }

        return $user->hasTeamPermission($team, TeamPermission::DeleteContent)
            || $user->hasTeamPermission($team, TeamPermission::ManageContent);
    }
}
