---
title: The 4-Layer Modular Monolith
slug: modular-monolith
description: Detailed architectural breakdown of FrameX four-layer modular monolith pattern.
category: Architecture
order: 1
badge: Architecture
---

# The 4-Layer Modular Monolith

FrameX embraces a **Modular Monolith Architecture** designed to deliver single-process deployment simplicity alongside strict domain boundaries and clear code ownership.

---

## Architectural Breakdown

```text
┌──────────────────────────────────────────────────────────────┐
│  Layer 4: FrameX Applications                                │
│  Corporate Website · Publishing Studio · SaaS · Docs Hub    │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: FrameX Modules                                     │
│  ContentStudio · Forms · Webhooks · Analytics · Media        │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: FrameX Core                                        │
│  ModuleRegistry · NavigationRegistry · Blueprints · Security │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: Laravel Foundation                                 │
│  Eloquent · Fortify · Cashier · Queues · Cache · Storage     │
└──────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Laravel Foundation

The bedrock of FrameX relies on proven framework capabilities:
- **Authentication:** Laravel Fortify provides frontend-agnostic two-factor authentication, passkeys, and session security.
- **Billing:** Laravel Cashier provides first-class Stripe subscriptions, customer portals, and webhooks.
- **Broadcasting & Real-Time:** Laravel Reverb powers low-latency WebSocket events.
- **Queues & Storage:** Standard asynchronous jobs and local/S3 asset adapters.

---

## Layer 2: FrameX Core

The Core layer acts as the orchestrator across all modules and extensions:
- **Contracts:** Defines `ModuleInterface` and `BlueprintInterface`.
- **Registries:** `ModuleRegistry` manages lifecycle hooks, topological dependency ordering, and cycle detection.
- **Immutable Revision Engine:** `RevisionService` snapshots content changes into append-only tables without destructive mutation.
- **Team Scoping:** Enforces strict multi-tenant tenant isolation across all database queries.

---

## Layer 3: FrameX Modules

Each module represents an independent business capability with isolated domain structure:
```text
app/FrameX/Modules/Forms/
├── FormsModule.php
├── Controllers/
│   ├── FormManagementController.php
│   └── FormSubmissionController.php
├── Models/
│   ├── Form.php
│   └── FormSubmission.php
└── Services/
    └── FormService.php
```

Modules never directly modify tables or classes belonging to other modules; cross-module communication occurs via defined contracts, events, or registered services.

---

## Layer 4: FrameX Applications

Applications are turnkey solution presets assembled from Core and selected modules. They can be installed via CLI into any workspace:
```bash
php artisan framex:blueprint:install saas
```
