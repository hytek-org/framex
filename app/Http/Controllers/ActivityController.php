<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Team;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
        'api_token',
        'secret',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'recovery_codes',
        'remember_token',
        'authorization',
        'cookie',
        'session',
        'body_html',
        'content',
    ];

    public function __invoke(Request $request, Team $current_team): Response
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:100',
            'category' => 'nullable|string|in:content,team,billing,security,media,other',
            'actor' => 'nullable|string|max:32',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $query = ActivityLog::query()
            ->where('team_id', $current_team->id)
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if (! empty($validated['search'])) {
            $search = trim($validated['search']);
            $query->where(function (QueryBuilder $q) use ($search): void {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%");
            });
        }

        if (! empty($validated['category'])) {
            $this->applyCategoryFilter($query, $validated['category']);
        }

        if (! empty($validated['actor'])) {
            if ($validated['actor'] === 'system') {
                $query->whereNull('user_id');
            } elseif (ctype_digit($validated['actor'])) {
                $query->where('user_id', (int) $validated['actor']);
            }
        }

        if (! empty($validated['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($validated['date_from'])->startOfDay());
        }

        if (! empty($validated['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($validated['date_to'])->endOfDay());
        }

        $activities = $query->simplepaginate(20)
            ->withQueryString()
            ->through(fn (ActivityLog $activity): array => [
                'id' => $activity->id,
                'event' => $activity->event,
                'category' => $this->resolveCategory($activity->event),
                'description' => $activity->description,
                'metadata' => $this->sanitizeMetadata($activity->metadata),
                'actor_type' => $activity->user ? 'user' : 'system_or_deleted',
                'user' => $activity->user ? [
                    'id' => $activity->user->id,
                    'name' => $activity->user->name,
                ] : null,
                'created_at' => $activity->created_at?->toIso8601String(),
                'created_at_formatted' => $activity->created_at?->format('M j, Y g:i A'),
            ]);

        $actors = $current_team->members()
            ->select('users.id', 'users.name')
            ->orderBy('users.name')
            ->get()
            ->map(fn ($member) => [
                'id' => (string) $member->id,
                'name' => $member->name,
            ]);

        return Inertia::render('activity/index', [
            'activities' => $activities,
            'actors' => $actors,
            'filters' => [
                'search' => $validated['search'] ?? '',
                'category' => $validated['category'] ?? '',
                'actor' => $validated['actor'] ?? '',
                'date_from' => $validated['date_from'] ?? '',
                'date_to' => $validated['date_to'] ?? '',
            ],
        ]);
    }

private function applyCategoryFilter(EloquentBuilder|QueryBuilder $query, string $category): void
{
    $prefixes = match ($category) {
        'content' => ['content.', 'blog.', 'category.', 'tag.', 'form.'],
        'team' => ['team.', 'invitation.', 'member.'],
        'billing' => ['billing.', 'subscription.', 'invoice.'],
        'security' => ['security.', 'auth.', 'token.', 'api_token.', 'session.'],
        'media' => ['media.', 'drive.', 'file.', 'folder.'],
        default => [],
    };

    if ($category === 'other') {
        $allKnown = ['content.', 'blog.', 'category.', 'tag.', 'form.', 'team.', 'invitation.', 'member.', 'billing.', 'subscription.', 'invoice.', 'security.', 'auth.', 'token.', 'api_token.', 'session.', 'media.', 'drive.', 'file.', 'folder.'];
        $query->where(function (EloquentBuilder|QueryBuilder $q) use ($allKnown): void {
            foreach ($allKnown as $prefix) {
                $q->where('event', 'not like', "{$prefix}%");
            }
        });

        return;
    }

    $query->where(function (EloquentBuilder|QueryBuilder $q) use ($prefixes): void {
        foreach ($prefixes as $prefix) {
            $q->orWhere('event', 'like', "{$prefix}%");
        }
    });
}

    private function resolveCategory(string $event): string
    {
        $lower = strtolower($event);

        return match (true) {
            Str::startsWith($lower, ['content.', 'blog.', 'category.', 'tag.', 'form.']) => 'content',
            Str::startsWith($lower, ['team.', 'invitation.', 'member.']) => 'team',
            Str::startsWith($lower, ['billing.', 'subscription.', 'invoice.']) => 'billing',
            Str::startsWith($lower, ['security.', 'auth.', 'token.', 'api_token.', 'session.']) => 'security',
            Str::startsWith($lower, ['media.', 'drive.', 'file.', 'folder.']) => 'media',
            default => 'other',
        };
    }

    /**
     * Recursively redact sensitive keys and truncate oversized strings from metadata.
     *
     * @param  array<string, mixed>|null  $metadata
     * @return array<string, mixed>|null
     */
    private function sanitizeMetadata(?array $metadata): ?array
    {
        if (empty($metadata)) {
            return null;
        }

        $clean = $this->redactRecursive($metadata);

        return empty($clean) ? null : $clean;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function redactRecursive(array $data): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $normalizedKey = strtolower((string) $key);

            $isSensitive = false;
            foreach (self::SENSITIVE_KEYS as $sensitive) {
                if (str_contains($normalizedKey, $sensitive)) {
                    $isSensitive = true;
                    break;
                }
            }

            if ($isSensitive) {
                $result[$key] = '[REDACTED]';
                continue;
            }

            if (is_array($value)) {
                $result[$key] = $this->redactRecursive($value);
            } elseif (is_string($value)) {
                $result[$key] = Str::limit(strip_tags($value), 200);
            } else {
                $result[$key] = $value;
            }
        }

        return $result;
    }
}
