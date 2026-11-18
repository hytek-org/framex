<?php

namespace App\FrameX\Modules\Forms\Services;

use App\FrameX\Modules\Forms\Events\FormSubmitted;
use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use App\FrameX\Modules\Forms\Notifications\FormSubmissionReceived;
use App\FrameX\Modules\Webhooks\Services\WebhookDispatcherService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class FormService
{
    public function __construct(
        protected ?WebhookDispatcherService $webhookDispatcher = null
    ) {}

    /**
     * Validate incoming form submission data dynamically against the form schema.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     *
     * @throws ValidationException
     */
    public function validateSubmission(Form $form, array $data): array
    {
        if (! empty($data['_gotcha']) || ! empty($data['_hp'])) {
            throw ValidationException::withMessages([
                'form' => ['Spam detected.'],
            ]);
        }

        $rules = [];
        $attributes = [];

        foreach ($form->fields ?? [] as $field) {
            if (! is_array($field) || empty($field['name'])) {
                continue;
            }

            $name = (string) $field['name'];
            $label = (string) ($field['label'] ?? $name);
            $type = (string) ($field['type'] ?? 'text');
            $required = ! empty($field['required']);
            $options = is_array($field['options'] ?? null)
                ? array_values(array_filter(array_map('strval', $field['options']), fn (string $opt): bool => trim($opt) !== ''))
                : [];

            if ($type === 'checkbox') {
                $rules[$name] = $required ? ['accepted'] : ['nullable', 'boolean'];
                $attributes[$name] = $label;

                continue;
            }

            if ($type === 'checkbox_group') {
                $rules[$name] = $required ? ['required', 'array', 'min:1'] : ['nullable', 'array'];
                $rules["{$name}.*"] = ! empty($options)
                    ? ['string', Rule::in($options)]
                    : ['string', 'max:255'];
                $attributes[$name] = $label;

                continue;
            }

            $fieldRules = $required ? ['required'] : ['nullable'];

            match ($type) {
                'email' => $fieldRules[] = 'email',
                'number' => $fieldRules[] = 'numeric',
                'url' => $fieldRules[] = 'url',
                'tel' => array_push($fieldRules, 'string', 'max:50'),
                'date' => $fieldRules[] = 'date',
                'textarea' => array_push($fieldRules, 'string', 'max:10000'),
                'select', 'radio' => ! empty($options)
                    ? array_push($fieldRules, 'string', Rule::in($options))
                    : array_push($fieldRules, 'string', 'max:500'),
                default => array_push($fieldRules, 'string', 'max:1000'),
            };

            $rules[$name] = $fieldRules;
            $attributes[$name] = $label;
        }

        $validator = Validator::make($data, $rules, [], $attributes);

        return $validator->validate();
    }

    /**
     * Store validated form submission and trigger event, notifications, and webhooks.
     *
     * @param  array<string, mixed>  $data
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

        if ($form->notify_team && $form->team) {
            $members = $form->team->members()->get();
            if ($members->isNotEmpty()) {
                Notification::send($members, new FormSubmissionReceived($form, $submission));
            }
        }

        if ($this->webhookDispatcher && $form->team) {
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

    /**
     * Generate a unique slug within a workspace.
     */
    public function generateUniqueSlug(int $teamId, string $baseSlug, ?int $ignoreFormId = null): string
    {
        $slug = Str::slug($baseSlug);
        if ($slug === '') {
            $slug = 'form';
        }

        $candidate = $slug;
        $counter = 2;

        while (
            Form::where('team_id', $teamId)
                ->where('slug', $candidate)
                ->when($ignoreFormId !== null, fn ($query) => $query->where('id', '!=', $ignoreFormId))
                ->exists()
        ) {
            $candidate = "{$slug}-{$counter}";
            $counter++;
        }

        return $candidate;
    }

    /**
     * Duplicate an existing form with a unique slug.
     */
    public function duplicateForm(Form $form): Form
    {
        $copySlug = $this->generateUniqueSlug($form->team_id, "{$form->slug}-copy");

        return Form::create([
            'team_id' => $form->team_id,
            'name' => "{$form->name} (Copy)",
            'slug' => $copySlug,
            'description' => $form->description,
            'fields' => $form->fields,
            'submit_button_text' => $form->submit_button_text,
            'success_message' => $form->success_message,
            'redirect_url' => $form->redirect_url,
            'is_active' => false,
            'notify_team' => $form->notify_team,
        ]);
    }

    /**
     * Generate a safe RFC-4180 CSV string for a form's submissions.
     *
     * @param  Collection<int, FormSubmission>  $submissions
     */
    public function generateCsv(Form $form, Collection $submissions): string
    {
        $fieldMap = [];
        foreach ($form->fields ?? [] as $field) {
            if (! empty($field['name'])) {
                $fieldMap[(string) $field['name']] = (string) ($field['label'] ?? $field['name']);
            }
        }

        // Include any historical keys that may exist in older submissions
        foreach ($submissions as $submission) {
            foreach (array_keys($submission->data ?? []) as $key) {
                if (! array_key_exists($key, $fieldMap)) {
                    $fieldMap[(string) $key] = Str::title(str_replace(['_', '-'], ' ', (string) $key));
                }
            }
        }

        $handle = fopen('php://temp', 'r+');
        if ($handle === false) {
            return '';
        }

        $headers = array_merge(
            ['Submission ID', 'Status', 'Submitted At', 'IP Address'],
            array_values($fieldMap)
        );
        fputcsv($handle, $headers);

        foreach ($submissions as $submission) {
            $row = [
                $submission->id,
                $submission->status,
                $submission->created_at?->toIso8601String() ?? '',
                $submission->ip_address ?? '',
            ];

            foreach (array_keys($fieldMap) as $key) {
                $value = $submission->data[$key] ?? '';
                if (is_bool($value)) {
                    $formatted = $value ? 'Yes' : 'No';
                } elseif (is_array($value)) {
                    $formatted = implode(', ', array_map('strval', $value));
                } else {
                    $formatted = (string) $value;
                }

                $row[] = $this->sanitizeCsvCell($formatted);
            }

            fputcsv($handle, $row);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv === false ? '' : $csv;
    }

    /**
     * Prevent spreadsheet formula injection on exported CSV cells.
     */
    protected function sanitizeCsvCell(string $value): string
    {
        if ($value !== '' && in_array($value[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
            return "'".$value;
        }

        return $value;
    }
}
