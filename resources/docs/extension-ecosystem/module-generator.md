---
title: Creating Custom Modules
slug: module-generator
description: Scaffold and register independent FrameX extensions in seconds using the CLI.
category: Extension Ecosystem
order: 1
badge: Developer
---

# Creating Custom Modules

FrameX provides a powerful CLI generator that scaffolds fully compliant modules conforming to `ModuleInterface`:

```bash
php artisan framex:make-module AnalyticsReports --with-ui
```

---

## Scaffolding Architecture

Running the generator produces:

```text
app/FrameX/Modules/AnalyticsReports/
├── AnalyticsReportsModule.php      # Implements ModuleInterface
├── Controllers/
│   └── AnalyticsReportsController.php
├── Models/
│   └── AnalyticsReports.php
└── Services/
    └── AnalyticsReportsService.php
```

With `--with-ui`, the generator also scaffolds an Inertia.js React view at:
`resources/js/pages/manage/analytics-reports/index.tsx`

---

## Dependency Resolution & Topological Ordering

Modules can declare required dependencies via `dependencies()`:

```php
public function dependencies(): array
{
    return ['forms', 'webhooks'];
}
```

When booting, `ModuleRegistry` calculates the topological execution order using a Depth-First Search algorithm. If circular dependencies are detected (e.g. `A` ➔ `B` ➔ `A`), a descriptive `RuntimeException` is thrown with the exact cycle trace before runtime failure occurs.

---

## Module Lifecycle Commands

Manage modules from the command line:

```bash
# List all registered modules and their health
php artisan framex:modules:list

# Disable an optional module
php artisan framex:module:disable analytics-reports

# Re-enable a module
php artisan framex:module:enable analytics-reports
```

> **Safety Rule:** Core modules (`content-studio`) are protected from accidental deactivation.
