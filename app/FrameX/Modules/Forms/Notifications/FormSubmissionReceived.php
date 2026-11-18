<?php

namespace App\FrameX\Modules\Forms\Notifications;

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FormSubmissionReceived extends Notification
{
    use Queueable;

    public function __construct(
        public Form $form,
        public FormSubmission $submission
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array{title: string, body: string, action_url: string, form_id: int, submission_id: int}
     */
    public function toArray(object $notifiable): array
    {
        $teamSlug = $this->form->team?->slug ?? '';
        $previewValue = collect($this->submission->data ?? [])
            ->filter(fn (mixed $value): bool => is_string($value) && trim($value) !== '')
            ->first();

        $body = $previewValue
            ? "New submission received on \"{$this->form->name}\": \"{$previewValue}\""
            : "New submission #{$this->submission->id} received on \"{$this->form->name}\".";

        return [
            'title' => "New response: {$this->form->name}",
            'body' => mb_strimwidth($body, 0, 180, '...'),
            'action_url' => $teamSlug !== '' ? "/{$teamSlug}/forms/{$this->form->id}/submissions" : '#',
            'form_id' => $this->form->id,
            'submission_id' => $this->submission->id,
        ];
    }
}
