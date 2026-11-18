<?php

namespace App\FrameX\Core\Registries;

use App\Enums\TeamPermission;
use App\Models\Team;
use App\Models\User;

class NavigationRegistry
{
    /**
     * Registered navigation items.
     *
     * @var array<int, array{
     *     label: string,
     *     route: string,
     *     icon?: string,
     *     section?: string,
     *     order?: int,
     *     permission?: string
     * }>
     */
    protected array $items = [];

    /**
     * Add a single navigation item.
     */
    public function add(array $item): self
    {
        $this->items[] = array_merge([
            'section' => 'main',
            'order' => 50,
            'icon' => null,
            'permission' => null,
        ], $item);

        return $this;
    }

    /**
     * Register multiple navigation items at once.
     *
     * @param  array<int, array>  $items
     */
    public function addMany(array $items): self
    {
        foreach ($items as $item) {
            $this->add($item);
        }

        return $this;
    }

    /**
     * Retrieve all navigation items, optionally filtered by section and user permissions.
     *
     * @return array<int, array{
     *     label: string,
     *     route: string,
     *     icon?: string,
     *     section: string,
     *     order: int,
     *     permission?: string
     * }>
     */
    public function items(?string $section = null, ?User $user = null, ?Team $team = null): array
    {
        $filtered = array_filter($this->items, function ($item) use ($section, $user, $team) {
            if ($section !== null && ($item['section'] ?? 'main') !== $section) {
                return false;
            }

            if (! empty($item['permission']) && $user && $team) {
                $permission = $item['permission'];

                if (is_string($permission)) {
                    $permission = TeamPermission::tryFrom($permission);
                }

                if ($permission instanceof TeamPermission) {
                    if (! $user->hasTeamPermission($team, $permission)) {
                        return false;
                    }
                }
            }

            return true;
        });

        usort($filtered, fn ($a, $b) => ($a['order'] ?? 50) <=> ($b['order'] ?? 50));

        return array_values($filtered);
    }

    /**
     * Return all unique section names in registration order.
     *
     * @return array<int, string>
     */
    public function sections(): array
    {
        $sections = array_map(fn ($item) => $item['section'] ?? 'main', $this->items);

        return array_values(array_unique($sections));
    }
}
