<?php

namespace App\Http\Controllers\Teams;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\AcceptTeamInvitationRequest;
use App\Http\Requests\Teams\CreateTeamInvitationRequest;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Notifications\Teams\TeamInvitation as TeamInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class TeamInvitationController extends Controller
{
    /**
     * Show the invitation.
     */
    public function show(TeamInvitation $invitation)
    {
        if ($user = auth()->user()) {
            $user->unreadNotifications()
                ->where('data->invitation_id', $invitation->id)
                ->update(['read_at' => now()]);
        }

        return Inertia::render('teams/show-invitation', [
            'invitation' => $invitation->load(['team', 'inviter']),
        ]);
    }

    /**
     * Store a newly created invitation.
     */
    public function store(CreateTeamInvitationRequest $request, Team $team): RedirectResponse
    {
        Gate::authorize('inviteMember', $team);

        $invitation = $team->invitations()->create([
            'email' => $request->validated('email'),
            'role' => TeamRole::from($request->validated('role')),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(3),
        ]);

        // Load relationships for notification
        $invitation->load(['team', 'inviter']);

        $user = \App\Models\User::query()
            ->where('email', '=', $invitation->email)
            ->first();

        if ($user) {
            try {
                $user->notify(new TeamInvitationNotification($invitation));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Team invitation notification failed: ' . $e->getMessage());
            }
        } else {
            try {
                Notification::route('mail', $invitation->email)
                    ->notify(new TeamInvitationNotification($invitation));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Team invitation mail notification failed: ' . $e->getMessage());
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invitation sent.']);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Cancel the specified invitation.
     */
    public function destroy(Team $team, TeamInvitation $invitation): RedirectResponse
    {
        abort_unless($invitation->team_id === $team->id, 404);

        Gate::authorize('cancelInvitation', $team);

        /** @phpstan-ignore-next-line */
        $invitation->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invitation cancelled.']);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Accept the invitation.
     */
    public function accept(AcceptTeamInvitationRequest $request, TeamInvitation $invitation): RedirectResponse
    {
        // Check if invitation is expired
        if ($invitation->isExpired()) {
            return back()->withErrors(['invitation' => 'This invitation has expired.']);
        }

        // Check if invitation is already accepted
        if ($invitation->isAccepted()) {
            return to_route('dashboard');
        }

        $user = $request->user();

        DB::transaction(function () use ($user, $invitation) {
            $team = $invitation->team;

            $membership = $team->memberships()->firstOrCreate(
                ['user_id' => $user->id],
                ['role' => $invitation->role],
            );

            $wasRecentlyCreated = $membership->wasRecentlyCreated;

            /** @phpstan-ignore-next-line */
            $invitation->update(['accepted_at' => now()]);

            $user->switchTeam($team);

            // Notify the inviter
            $invitation->inviter->notify(new \App\Notifications\Teams\TeamInvitationAccepted($team, $user));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invitation accepted successfully!']);

        return to_route('dashboard');
    }

    /**
     * Decline the invitation.
     */
    public function decline(TeamInvitation $invitation): RedirectResponse
    {
        // Check if invitation is already handled
        if ($invitation->isAccepted()) {
            return to_route('dashboard');
        }

        if ($invitation->isExpired()) {
            /** @phpstan-ignore-next-line */
            $invitation->delete();
            return to_route('dashboard')->with('toast', ['type' => 'info', 'message' => 'This invitation has already expired.']);
        }

        /** @phpstan-ignore-next-line */
        $invitation->delete();

        Inertia::flash('toast', ['type' => 'info', 'message' => 'Invitation declined.']);

        return to_route('dashboard');
    }
}
