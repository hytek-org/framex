<?php

namespace App\Notifications\Teams;

use App\Models\TeamInvitation as TeamInvitationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamInvitation extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public TeamInvitationModel $invitation)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $team = $this->invitation->team ?? $this->invitation->load('team')->team;
        $inviter = $this->invitation->inviter ?? $this->invitation->load('inviter')->inviter;

        return (new MailMessage)
            ->subject(__("You've been invited to join :teamName", ['teamName' => $team->name]))
            ->line(__(':inviterName has invited you to join the :teamName team.', [
                'inviterName' => $inviter->name,
                'teamName' => $team->name,
            ]))
            ->line(__('Role: :role', ['role' => $this->invitation->role->value]))
            ->line($this->invitation->expires_at ? __('This invitation expires on :date', ['date' => $this->invitation->expires_at->format('F d, Y')]) : '')
            ->action(__('Review invitation'), route('invitations.show', $this->invitation->code));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $team = $this->invitation->team ?? $this->invitation->load('team')->team;
        $inviter = $this->invitation->inviter ?? $this->invitation->load('inviter')->inviter;

        return [
            'title' => __('New Team Invitation'),
            'body' => __(':inviterName invited you to join :teamName.', [
                'inviterName' => $inviter->name,
                'teamName' => $team->name,
            ]),
            'action_url' => route('invitations.show', $this->invitation->code),
            'action_label' => 'View Invitation',
            'invitation_id' => $this->invitation->id,
            'invitation_code' => $this->invitation->code,
            'team_id' => $this->invitation->team_id,
            'team_name' => $team->name,
            'inviter_name' => $inviter->name,
            'inviter_email' => $inviter->email,
            'role' => $this->invitation->role->value,
            'expires_at' => $this->invitation->expires_at,
        ];
    }
}
