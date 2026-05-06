<?php

namespace App\Notifications\Teams;

use App\Models\Team;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamInvitationAccepted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Team $team, public User $user)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('Invitation Accepted: :teamName', ['teamName' => $this->team->name]))
            ->line(__(':userName has accepted your invitation to join the :teamName team.', [
                'userName' => $this->user->name,
                'teamName' => $this->team->name,
            ]))
            ->action(__('View Team'), url("/settings/teams/{$this->team->slug}"));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => __('Invitation Accepted'),
            'body' => __(':userName joined :teamName.', [
                'userName' => $this->user->name,
                'teamName' => $this->team->name,
            ]),
            'action_url' => url("/settings/teams/{$this->team->slug}"),
            'team_id' => $this->team->id,
            'team_name' => $this->team->name,
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
        ];
    }
}
