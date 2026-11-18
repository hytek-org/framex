<?php

namespace App\FrameX\Modules\Forms\Requests;

use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreFormRequest extends FormRequest
{
    public const ALLOWED_FIELD_TYPES = [
        'text',
        'email',
        'textarea',
        'number',
        'tel',
        'url',
        'date',
        'select',
        'radio',
        'checkbox',
        'checkbox_group',
    ];

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $rawSlug = $this->input('slug');
        $rawName = $this->input('name', '');

        $normalizedSlug = is_string($rawSlug) && trim($rawSlug) !== ''
            ? Str::slug($rawSlug)
            : Str::slug((string) $rawName);

        $this->merge([
            'slug' => $normalizedSlug !== '' ? $normalizedSlug : null,
            'redirect_url' => is_string($this->input('redirect_url')) && trim($this->input('redirect_url')) !== ''
                ? trim($this->input('redirect_url'))
                : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $team = $this->resolveTeam();
        $teamId = $team?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('forms', 'slug')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'fields' => ['required', 'array', 'min:1', 'max:50'],
            'fields.*.name' => ['required', 'string', 'max:100', 'distinct', 'regex:/^[a-zA-Z_][a-zA-Z0-9_-]*$/'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.type' => ['required', 'string', Rule::in(self::ALLOWED_FIELD_TYPES)],
            'fields.*.required' => ['boolean'],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.help_text' => ['nullable', 'string', 'max:500'],
            'fields.*.width' => ['nullable', 'string', Rule::in(['full', 'half'])],
            'fields.*.options' => ['nullable', 'array', 'max:100'],
            'fields.*.options.*' => ['string', 'max:255'],
            'submit_button_text' => ['nullable', 'string', 'max:100'],
            'success_message' => ['nullable', 'string', 'max:1000'],
            'redirect_url' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
            'notify_team' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.unique' => 'Another form in this workspace already uses this URL slug.',
            'slug.regex' => 'The slug may only contain lowercase letters, numbers, and hyphens.',
            'fields.min' => 'Add at least one field to your form.',
            'fields.*.name.distinct' => 'Each field must have a unique key name.',
            'fields.*.name.regex' => 'Field keys must start with a letter or underscore and contain only letters, numbers, underscores, or hyphens.',
        ];
    }

    protected function resolveTeam(): ?Team
    {
        $slug = $this->route('current_team');
        if (is_string($slug) && $slug !== '') {
            $team = Team::where('slug', $slug)->first();
            if ($team) {
                return $team;
            }
        }

        return $this->user()?->currentTeam;
    }
}
