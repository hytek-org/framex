<?php

namespace App\FrameX\Core\Contracts;

interface ModuleInterface
{
    /**
     * Unique identifier for the module (e.g. 'content-studio', 'media-studio').
     */
    public function id(): string;

    /**
     * Human-readable display name.
     */
    public function name(): string;

    /**
     * Semantic version string (e.g. '1.0.0').
     */
    public function version(): string;

    /**
     * Brief summary of module responsibilities.
     */
    public function description(): string;

    /**
     * Array of module IDs this module depends on.
     *
     * @return array<int, string>
     */
    public function dependencies(): array;

    /**
     * Register services, bindings, or configurations in Laravel container.
     */
    public function register(): void;

    /**
     * Boot module routes, event listeners, policies, or scheduled tasks.
     */
    public function boot(): void;

    /**
     * Navigation definitions to inject into the sidebar and command menu.
     *
     * @return array<int, array{
     *     label: string,
     *     route: string,
     *     icon?: string,
     *     section?: string,
     *     order?: int,
     *     permission?: string
     * }>
     */
    public function navigation(): array;

    /**
     * Declared permissions provided by this module.
     *
     * @return array<string, string> Key is permission string, value is description
     */
    public function permissions(): array;
}
