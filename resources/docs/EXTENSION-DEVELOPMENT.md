# FrameX Extension Development Guide

This guide explains how to build, test, and register custom modules for the FrameX application platform.

---

## 1. Quickstart: Scaffolding a Module

Generate a new module with contracts, services, controllers, and models using the FrameX CLI:

```bash
php artisan framex:make-module AnalyticsReports --with-ui
```

This generates the following directory structure:
```text
app/FrameX/Modules/AnalyticsReports/
├── AnalyticsReportsModule.php      # Main module definition conforming to ModuleInterface
├── Controllers/
│   └── AnalyticsReportsController.php
├── Models/
│   └── AnalyticsReports.php
└── Services/
    └── AnalyticsReportsService.php
```

And optionally scaffolds an Inertia.js React view at:
`resources/js/pages/manage/analytics-reports/index.tsx`

---

## 2. Implementing `ModuleInterface`

Every FrameX module must implement `App\FrameX\Core\Contracts\ModuleInterface`:

```php
namespace App\FrameX\Modules\MyModule;

use App\FrameX\Core\Contracts\ModuleInterface;

class MyModule implements ModuleInterface
{
    public function id(): string
    {
        return 'my-module';
    }

    public function name(): string
    {
        return 'My Custom Module';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function description(): string
    {
        return 'Description of my module capability.';
    }

    public function dependencies(): array
    {
        // Specify other module IDs required by this module
        return ['forms'];
    }

    public function navigation(): array
    {
        return [
            [
                'label' => 'My Module',
                'route' => 'my-module.index',
                'icon' => 'Box',
                'section' => 'modules',
                'order' => 40,
            ],
        ];
    }

    public function permissions(): array
    {
        return [
            'my-module.view',
            'my-module.manage',
        ];
    }

    public function settingsSchema(): array
    {
        return [];
    }

    public function register(): void
    {
        // Bind singletons and services into the container
    }

    public function boot(): void
    {
        // Register event listeners, routes, or observers
    }
}
```

---

## 3. Registering Your Module

Register the module instance in `app/FrameX/Core/FrameXServiceProvider.php`:

```php
$registry->register(new \App\FrameX\Modules\MyModule\MyModule);
```

Verify your module status and dependency health:
```bash
php artisan framex:modules:list
```

---

## 4. Testing Your Module

FrameX includes a comprehensive Pest test suite. Write feature tests for your module in `tests/Feature/`:

```php
test('my custom module service executes properly', function () {
    $service = app(\App\FrameX\Modules\MyModule\Services\MyModuleService::class);
    expect($service->execute())->toBeTrue();
});
```

Run test suite:
```bash
php artisan test --compact
```
