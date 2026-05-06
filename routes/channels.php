<?php

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('teams.{team}', function (User $user, int $team) {
    $team = Team::find($team);

    return $team && $user->belongsToTeam($team);
});
