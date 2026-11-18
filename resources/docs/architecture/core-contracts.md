---
title: Core Contracts & Registries
slug: core-contracts
description: Deep dive into ModuleInterface, BlueprintInterface, ModuleRegistry, and NavigationRegistry.
category: Architecture
order: 2
badge: Core
---

# Core Contracts & Registries

FrameX Core provides a contract-driven foundation that decouples business features into independent modules and blueprints.

---

## The Module Contract (`ModuleInterface`)

Every module registered with FrameX must implement `App\FrameX\Core\Contracts\ModuleInterface`:

```php
namespace App\FrameX\Core\Contracts;

interface ModuleInterface
{
    public function id(): string;
    public function name(): string;
    public function version(): string;
    public function description(): string;
    public function dependencies(): array;
    public function navigation(): array;
    public function permissions(): array;
    public function settingsSchema(): array;
    public function register(): void;
    public function boot(): void;
}
```

---

## The Blueprint Contract (`BlueprintInterface`)

Blueprints package repeatable application presets (e.g. Corporate Sites, SaaS starters, Publishing platforms) for rapid provisioning:

```php
namespace App\FrameX\Blueprints\Contracts;

use App\Models\Team;
use App\Models\User;

interface BlueprintInterface
{
    public function id(): string;
    public function name(): string;
    public function description(): string;
    public function features(): array;
    public function install(Team $team, User $user): array;
}
```

---

## The Module Registry (`ModuleRegistry`)

The `ModuleRegistry` handles registration, status toggling, and boot ordering:
- **`register(ModuleInterface $module)`:** Registers the module instance and calls its `register()` hook if enabled.
- **`getBootOrder()`:** Computes topological ordering using Depth-First Search and identifies circular dependencies.
- **`enable($id)` & `disable($id)`:** Persists module activation states. Note that core modules such as `content-studio` are protected from being disabled.
- **`healthCheck()`:** Returns diagnostic reports on missing or unsatisfied dependencies.
