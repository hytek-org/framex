<?php

namespace App\Policies;

use App\Models\Blog;
use App\Models\User;
use App\Enums\TeamRole;

class BlogPolicy
{
    /**
     * Determine whether the user can view the blog.
     */
    public function view(User $user, Blog $blog): bool
    {
        $team = $user->currentTeam;
        return $team && $blog->team_id === $team->id;
    }

    /**
     * Determine whether the user can create blogs.
     */
    public function create(User $user): bool
    {
        return $user->current_team_id !== null;
    }

    /**
     * Determine whether the user can update the blog.
     */
    public function update(User $user, Blog $blog): bool
    {
        $team = $user->currentTeam;
        if (!$team || $blog->team_id !== $team->id) {
            return false;
        }

        $role = $user->teamRole($team);
        if ($role === TeamRole::Owner || $role === TeamRole::Admin) {
            return true;
        }

        return $blog->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the blog.
     */
    public function delete(User $user, Blog $blog): bool
    {
        $team = $user->currentTeam;
        if (!$team || $blog->team_id !== $team->id) {
            return false;
        }

        $role = $user->teamRole($team);
        if ($role === TeamRole::Owner || $role === TeamRole::Admin) {
            return true;
        }

        return $blog->user_id === $user->id;
    }
}
