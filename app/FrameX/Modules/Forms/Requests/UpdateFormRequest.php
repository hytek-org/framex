<?php

namespace App\FrameX\Modules\Forms\Requests;

use App\FrameX\Modules\Forms\Models\Form;
use Illuminate\Validation\Rule;

class UpdateFormRequest extends StoreFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        $team = $this->resolveTeam();
        $form = $this->route('form');
        $formId = $form instanceof Form ? $form->id : $form;

        $rules['slug'] = [
            'nullable',
            'string',
            'max:255',
            'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            Rule::unique('forms', 'slug')
                ->where(fn ($query) => $query->where('team_id', $team?->id))
                ->ignore($formId),
        ];

        return $rules;
    }
}
