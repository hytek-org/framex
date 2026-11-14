<?php

namespace App\FrameX\Core;

use App\FrameX\Blueprints\BlueprintRegistry;
use App\FrameX\Blueprints\Solutions\CorporateBlueprint;
use App\FrameX\Blueprints\Solutions\DocsBlueprint;
use App\FrameX\Blueprints\Solutions\PublishingBlueprint;
use App\FrameX\Blueprints\Solutions\SaasBlueprint;
use App\FrameX\Core\Registries\ModuleRegistry;
use App\FrameX\Core\Registries\NavigationRegistry;
use App\FrameX\Modules\ContentStudio\ContentStudioModule;
use App\FrameX\Modules\Forms\FormsModule;
use App\FrameX\Modules\Webhooks\WebhooksModule;
use Illuminate\Support\ServiceProvider;

class FrameXServiceProvider extends ServiceProvider
{
    /**
     * Register Core services in the container.
     */
    public function register(): void
    {
        $this->app->singleton(ModuleRegistry::class, function () {
            $registry = new ModuleRegistry;
            $registry->register(new ContentStudioModule);
            $registry->register(new FormsModule);
            $registry->register(new WebhooksModule);

            return $registry;
        });

        $this->app->singleton(NavigationRegistry::class, function () {
            return new NavigationRegistry;
        });

        $this->app->singleton(BlueprintRegistry::class, function () {
            $registry = new BlueprintRegistry;
            $registry->register(new CorporateBlueprint);
            $registry->register(new PublishingBlueprint);
            $registry->register(new SaasBlueprint);
            $registry->register(new DocsBlueprint);

            return $registry;
        });
    }

    /**
     * Bootstrap platform modules and navigation.
     */
    public function boot(): void
    {
        $moduleRegistry = $this->app->make(ModuleRegistry::class);
        $navigationRegistry = $this->app->make(NavigationRegistry::class);

        // Populate navigation from registered modules
        foreach ($moduleRegistry->all() as $module) {
            $navigationRegistry->addMany($module->navigation());
        }

        // Boot the module registry (validates dependencies and boots all modules)
        $moduleRegistry->boot();
    }
}
