# FrameX — Enterprise Laravel 13 & React Workspace Platform

FrameX is a production-ready, modular **Laravel 13**, **React 19**, **TypeScript**, and **Inertia.js v3** starter platform. It provides multi-tenant team workspaces, enterprise authentication, content studio, dynamic forms, outbound webhooks, subscription billing, and real-time WebSocket infrastructure out of the box.

## Key Capabilities

- **Workspaces & Team RBAC**: Multi-tenant teams, role-based permissions, email invitations, team switching, and member management.
- **Enterprise Identity & Security**: Laravel Fortify authentication, TOTP two-factor authentication (2FA), passkeys, active session management, and account audit logs.
- **Content Studio & Media**: TipTap rich-text editor with revision history, diffing, SEO metadata panels, categories/tags, and a media library.
- **Forms & Webhooks**: Dynamic form builder with public submission endpoints, CSV exports, and HMAC-signed outbound webhooks with delivery logs.
- **Billing & Subscriptions**: Laravel Cashier Stripe integration with plan upgrades, scheduled downgrades, invoices, and a built-in **Demo Billing Mode** (`BILLING_MOCK=true`) for live previews without exposing Stripe keys.
- **API & Real-Time Infrastructure**: Team-scoped Sanctum API tokens with activity logging, plus Laravel Reverb WebSockets.

## Technology Stack

| Layer | Technology |
| --- | --- |
| **Backend** | PHP 8.3+, Laravel 13, Laravel Fortify, Laravel Sanctum, Laravel Cashier, Laravel Reverb, Laravel Wayfinder |
| **Frontend** | React 19, Inertia.js v3, TypeScript, Tailwind CSS v4, Radix UI, TipTap, Recharts, Lucide Icons |
| **Quality & Testing** | Pest 5, Larastan (PHPStan), Laravel Pint, Vite+, ESLint / Prettier |

## Requirements

- PHP **8.3+**
- Composer **2.x**
- Node.js **20+** & npm
- SQLite, MySQL, or PostgreSQL

## Installation

### Interactive Installer (Recommended)

```bash
laravel new my-app --using=hytek/framex
```

The interactive `php artisan framex:install` wizard configures your `.env`, database connection (SQLite/MySQL/PostgreSQL), application key, migrations, storage link, and frontend assets.

### Manual Installation

```bash
git clone https://github.com/hytek-org/framex.git my-app
cd my-app
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

## Available Artisan Commands

- `php artisan framex:install` — Run the interactive FrameX setup wizard.
- `php artisan framex:doctor` — Run environment, database, storage, and module health diagnostics.
- `php artisan test` — Run the Pest test suite.

## Testing & Code Quality

```bash
# Run Pest tests
php artisan test

# Format PHP code with Laravel Pint
vendor/bin/pint --format agent

# Run TypeScript type checking
npm run types:check

# Build production assets
npm run build
```

## Security

If you discover a security vulnerability, please review [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

## License

FrameX is open-sourced software licensed under the [MIT License](LICENSE).
