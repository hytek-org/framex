<?php

namespace App\FrameX\Modules\Forms\Services;

use App\FrameX\Modules\Forms\Events\FormSubmitted;
use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use App\FrameX\Modules\Webhooks\Services\WebhookDispatcherService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class FormService
{
    public function __construct(
        protected ?WebhookDispatcherService $webhookDispatcher = null
    ) {}

    /**
     * Validate incoming form submission data dynamically against the form schema.
     *
     * @throws ValidationException
     */
    public function validateSubmission(Form $form, array $data): array
    {
        // Honeypot check for spam mitigation
        if (! empty($data['_gotcha']) || ! empty($data['_hp'])) {
            throw ValidationException::withMessages([
                'form' => ['Spam detected.'],
            ]);
        }

        $rules = [];
        $attributes = [];

        foreach ($form->fields ?? [] as $field) {
            $name = $field['name'];
            $label = $field['label'] ?? $name;
            $type = $field['type'] ?? 'text';
            $required = ! empty($field['required']);

            $fieldRules = [];

            if ($required) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            match ($type) {
                'email' => $fieldRules[] = 'email',
                'number' => $fieldRules[] = 'numeric',
                'url' => $fieldRules[] = 'url',
                'checkbox' => $fieldRules[] = 'boolean',
                'textarea' => $fieldRules[] = 'string',
                default => array_push($fieldRules, 'string', 'max:1000'),
            };

            $rules[$name] = $fieldRules;
            $attributes[$name] = $label;
        }

        $validator = Validator::make($data, $rules, [], $attributes);

        return $validator->validate();
    }

    /**
     * Store validated form submission and trigger event & webhooks.
     */
    public function storeSubmission(Form $form, array $data, ?string $ip = null, ?string $userAgent = null): FormSubmission
    {
        $submission = FormSubmission::create([
            'form_id' => $form->id,
            'team_id' => $form->team_id,
            'data' => $data,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'status' => 'unread',
        ]);

        event(new FormSubmitted($form, $submission));

        // Dispatch outbound webhook if dispatcher is bound
        if ($this->webhookDispatcher) {
            $this->webhookDispatcher->dispatch($form->team, 'form.submitted', [
                'form_id' => $form->id,
                'form_name' => $form->name,
                'form_slug' => $form->slug,
                'submission_id' => $submission->id,
                'data' => $submission->data,
                'submitted_at' => $submission->created_at->toIso8601String(),
            ]);
        }

        return $submission;
    }
}
