<?php

namespace App\FrameX\Core\Registries;

use App\FrameX\Core\Contracts\ModuleInterface;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Throwable;

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

    /**
     * File-based fallback path for persisting module state without a database.
     */
    protected ?string $stateFilePath = null;

    public function __construct(?string $stateFilePath = null)
    {
        $this->stateFilePath = $stateFilePath
            ?: (function_exists('storage_path') ? storage_path('framework/framex-modules.json') : null);

        // Safely load disabled modules with file and installation fallback
        $disabled = $this->loadDisabledModules();
        foreach ($disabled as $id) {
            $this->disabledModules[(string) $id] = true;
        }
    }

    /**
     * Safely load disabled module state with automatic installation and offline fallback.
     *
     * @return array<int, string>
     */
    protected function loadDisabledModules(): array
    {
        // During early bootstrap, package discovery, or installer commands,
        // use the safe local file state to avoid prematurely hitting unmigrated databases.
        if ($this->shouldUseFallback()) {
            return $this->readStateFile();
        }

        try {
            if (Cache::has('framex:disabled_modules')) {
                $cached = Cache::get('framex:disabled_modules');

                return is_array($cached) ? array_values(array_map('strval', $cached)) : [];
            }

            // In automated test runs, an absent cache key represents a pristine state
            if (function_exists('app') && app()->runningUnitTests()) {
                return [];
            }

            return $this->readStateFile();
        } catch (Throwable) {
            // Uninitialized database, missing table, or network partition fallback
            return $this->readStateFile();
        }
    }

    /**
     * Determine if the registry should use the file fallback directly.
     */
    protected function shouldUseFallback(): bool
    {
        if (! function_exists('app')) {
            return true;
        }

        if (! app()->hasBeenBootstrapped()) {
            return true;
        }

        if (app()->runningInConsole() && isset($_SERVER['argv'])) {
            $earlyCommands = ['package:discover', 'framex:install', 'key:generate', 'env', 'about'];
            foreach ($earlyCommands as $cmd) {
                if (in_array($cmd, $_SERVER['argv'], true)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Read persisted module state from local file.
     *
     * @return array<int, string>
     */
    protected function readStateFile(): array
    {
        if ($this->stateFilePath !== null && file_exists($this->stateFilePath)) {
            $raw = @file_get_contents($this->stateFilePath);
            if ($raw) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    return array_values(array_map('strval', $decoded));
                }
            }
        }

        return [];
    }

    /**
     * Write disabled module state to local file.
     *
     * @param  array<int, string>  $disabled
     */
    protected function writeStateFile(array $disabled): void
    {
        if ($this->stateFilePath === null) {
            return;
        }

        $dir = dirname($this->stateFilePath);
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        @file_put_contents($this->stateFilePath, json_encode($disabled, JSON_PRETTY_PRINT));
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
     * Get list of disabled module IDs.
     *
     * @return array<int, string>
     */
    public function disabled(): array
    {
        return array_keys($this->disabledModules);
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

    /**
     * Persist disabled module state to both file and Cache.
     */
    protected function persistDisabledState(): void
    {
        $disabled = array_keys($this->disabledModules);

        // 1. Always persist to local state file for database-free survivability
        $this->writeStateFile($disabled);

        // 2. Persist to Cache if runtime cache repository is available
        try {
            Cache::forever('framex:disabled_modules', $disabled);
        } catch (Throwable) {
            // Safely bypassed during installation or before database migration
        }
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
