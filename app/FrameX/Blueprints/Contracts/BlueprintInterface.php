<?php

namespace App\FrameX\Blueprints\Contracts;

use App\Models\Team;
use App\Models\User;

interface BlueprintInterface
{
    /**
     * Unique machine slug for the blueprint.
     */
    public function id(): string;

    /**
     * Human-readable display name.
     */
    public function name(): string;

    /**
     * Clear description of the blueprint solution.
     */
    public function description(): string;

    /**
     * List of key platform features provisioned by this blueprint.
     *
     * @return array<int, string>
     */
    public function features(): array;

    /**
     * Install and provision the blueprint within a team workspace.
     *
     * @return array<string, mixed> Summary of created entities
     */
    public function install(Team $team, User $user): array;
}
