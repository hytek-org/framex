<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AccountPreferencesUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'theme' => ['nullable', 'string', Rule::in(['light', 'dark', 'system'])],
            'locale' => ['nullable', 'string', 'max:12'],
            'timezone' => ['nullable', 'string', 'max:64', 'timezone:all'],
            'date_format' => ['nullable', 'string', 'max:32'],
            'time_format' => ['nullable', 'string', Rule::in(['12h', '24h'])],
            'product_updates' => ['nullable', 'boolean'],
            'security_alerts' => ['nullable', 'boolean'],
            'billing_alerts' => ['nullable', 'boolean'],
            'weekly_summary' => ['nullable', 'boolean'],
        ];
    }
}
