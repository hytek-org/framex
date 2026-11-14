<?php

namespace App\FrameX\Blueprints;

use App\FrameX\Blueprints\Contracts\BlueprintInterface;

class BlueprintRegistry
{
    /**
     * @var array<string, BlueprintInterface>
     */
    protected array $blueprints = [];

    /**
     * Register a blueprint solution template.
     */
    public function register(BlueprintInterface $blueprint): self
    {
        $this->blueprints[$blueprint->id()] = $blueprint;

        return $this;
    }

    /**
     * Check if a blueprint is registered.
     */
    public function has(string $id): bool
    {
        return isset($this->blueprints[$id]);
    }

    /**
     * Retrieve a blueprint by ID.
     */
    public function get(string $id): ?BlueprintInterface
    {
        return $this->blueprints[$id] ?? null;
    }

    /**
     * Get all registered blueprints.
     *
     * @return array<string, BlueprintInterface>
     */
    public function all(): array
    {
        return $this->blueprints;
    }
}
