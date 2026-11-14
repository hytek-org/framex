<?php

namespace App\FrameX\Modules\Forms\Models;

use App\Models\Team;
use Database\Factories\FormFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Form extends Model
{
    use HasFactory;

    protected static function newFactory(): FormFactory
    {
        return FormFactory::new();
    }

    protected $fillable = [
        'team_id',
        'name',
        'slug',
        'description',
        'fields',
        'submit_button_text',
        'success_message',
        'redirect_url',
        'is_active',
        'notify_team',
    ];

    protected $casts = [
        'fields' => 'array',
        'is_active' => 'boolean',
        'notify_team' => 'boolean',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }
}
