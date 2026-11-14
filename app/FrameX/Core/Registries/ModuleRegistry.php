<?php

namespace App\FrameX\Core\Registries;

use App\FrameX\Core\Contracts\ModuleInterface;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class ModuleRegistry
{
    /**
     * Map of registered modules indexed by module ID.
     *
     * @var array<string, ModuleInterface>
     */
    protected array $modules = [];

    /**
     * Set of disabled module IDs.
     *
     * @var array<string, bool>
     */
    protected array $disabledModules = [];

    /**
     * Whether all registered modules have been booted.
     */
    protected bool $booted = false;

    public function __construct()
    {
        // Load persisted disabled module state if present
        $disabled = Cache::get('framex:disabled_modules', []);
        foreach ($disabled as $id) {
            $this->disabledModules[$id] = true;
        }
    }

    /**
     * Register a module instance with the platform.
     */
    public function register(ModuleInterface $module): self
    {
        $this->modules[$module->id()] = $module;

        if ($this->isEnabled($module->id())) {
            $module->register();
        }

        return $this;
    }

    /**
     * Check if a module is registered by its ID.
     */
    public function has(string $id): bool
    {
        return isset($this->modules[$id]);
    }

    /**
     * Retrieve a registered module by its ID.
     */
    public function get(string $id): ?ModuleInterface
    {
        return $this->modules[$id] ?? null;
    }

    /**
     * Get all registered modules.
     *
     * @return array<string, ModuleInterface>
     */
    public function all(): array
    {
        return $this->modules;
    }

    /**
     * Determine if a module is enabled.
     */
    public function isEnabled(string $id): bool
    {
        return ! isset($this->disabledModules[$id]);
    }

    /**
     * Enable a module.
     */
    public function enable(string $id): self
    {
        unset($this->disabledModules[$id]);
        $this->persistDisabledState();

        if ($module = $this->get($id)) {
            $module->register();
            if ($this->booted) {
                $module->boot();
            }
        }

        return $this;
    }

    /**
     * Disable a module.
     */
    public function disable(string $id): self
    {
        if ($id === 'content-studio') {
            throw new RuntimeException("Core module [{$id}] cannot be disabled.");
        }

        $this->disabledModules[$id] = true;
        $this->persistDisabledState();

        return $this;
    }

    protected function persistDisabledState(): void
    {
        Cache::forever('framex:disabled_modules', array_keys($this->disabledModules));
    }

    /**
     * Verify whether all dependencies of a module are registered and enabled.
     */
    public function dependenciesMet(string $id): bool
    {
        $module = $this->get($id);

        if (! $module) {
            return false;
        }

        foreach ($module->dependencies() as $dependencyId) {
            if (! $this->has($dependencyId) || ! $this->isEnabled($dependencyId)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get list of missing or disabled dependencies for a given module.
     *
     * @return array<int, string>
     */
    public function missingDependencies(string $id): array
    {
        $module = $this->get($id);

        if (! $module) {
            return [];
        }

        $missing = [];

        foreach ($module->dependencies() as $dependencyId) {
            if (! $this->has($dependencyId) || ! $this->isEnabled($dependencyId)) {
                $missing[] = $dependencyId;
            }
        }

        return $missing;
    }

    /**
     * Calculate topological order of module booting and detect circular dependencies.
     *
     * @return array<int, ModuleInterface>
     *
     * @throws RuntimeException On circular dependency
     */
    public function getBootOrder(): array
    {
        $sorted = [];
        $visited = []; // 0 = unvisited, 1 = visiting (in stack), 2 = visited

        foreach ($this->modules as $id => $module) {
            $visited[$id] = 0;
        }

        $visit = function ($id, array &$path = []) use (&$visit, &$sorted, &$visited) {
            if (! isset($this->modules[$id]) || ! $this->isEnabled($id)) {
                return;
            }

            if ($visited[$id] === 1) {
                $cycle = implode(' -> ', array_merge($path, [$id]));
                throw new RuntimeException("Circular dependency detected in FrameX modules: {$cycle}");
            }

            if ($visited[$id] === 0) {
                $visited[$id] = 1;
                $path[] = $id;

                foreach ($this->modules[$id]->dependencies() as $dep) {
                    $visit($dep, $path);
                }

                array_pop($path);
                $visited[$id] = 2;
                $sorted[] = $this->modules[$id];
            }
        };

        foreach (array_keys($this->modules) as $id) {
            if ($visited[$id] === 0 && $this->isEnabled($id)) {
                $visit($id);
            }
        }

        return $sorted;
    }

    /**
     * Boot all registered enabled modules in dependency order after validating dependencies.
     *
     * @throws RuntimeException If any module has missing dependencies
     */
    public function boot(): void
    {
        if ($this->booted) {
            return;
        }

        // Validate dependencies across all enabled modules
        foreach ($this->modules as $id => $module) {
            if (! $this->isEnabled($id)) {
                continue;
            }

            $missing = $this->missingDependencies($id);
            if (! empty($missing)) {
                $missingList = implode(', ', $missing);
                throw new RuntimeException("FrameX Module [{$module->name()}] is missing required dependencies: [{$missingList}].");
            }
        }

        // Boot in topological order
        $bootOrder = $this->getBootOrder();
        foreach ($bootOrder as $module) {
            $module->boot();
        }

        $this->booted = true;
    }

    /**
     * Produce a diagnostic health report across all modules (Module Intelligence).
     */
    public function healthCheck(): array
    {
        $report = [];

        foreach ($this->modules as $id => $module) {
            $missing = $this->missingDependencies($id);
            $report[$id] = [
                'name' => $module->name(),
                'version' => $module->version(),
                'description' => $module->description(),
                'dependencies' => $module->dependencies(),
                'enabled' => $this->isEnabled($id),
                'healthy' => empty($missing),
                'missing_dependencies' => $missing,
            ];
        }

        return $report;
    }
}
