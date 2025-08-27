# FrameX: Advanced Full-Stack Laravel-React Starter Kit

[![GitHub license](https://img.shields.io/github/license/hytek-org/framex?style=flat-square)](https://github.com/hytek-org/framex/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/hytek-org/framex?style=flat-square)](https://github.com/hytek-org/framex/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/hytek-org/framex?style=flat-square)](https://github.com/hytek-org/framex/issues)
[![Laravel Version](https://img.shields.io/badge/Laravel-12.x-red?style=flat-square)](https://laravel.com/docs/12.x)
[![React Version](https://img.shields.io/badge/React-19.1-blue?style=flat-square)](https://react.dev/)
[![TypeScript Version](https://img.shields.io/badge/TypeScript-5.9-green?style=flat-square)](https://www.typescriptlang.org/)

FrameX is a production-ready, enterprise-grade full-stack boilerplate designed to accelerate the development of scalable web applications. Leveraging the robustness of Laravel for backend operations and the reactivity of React with TypeScript for the frontend, FrameX incorporates best practices for security, performance, and maintainability. It extends beyond basic starters by integrating advanced features like role-based access control (RBAC), payment processing, API versioning, and containerized deployment workflows.

This template is ideal for building SaaS platforms, enterprise dashboards, e-commerce systems, content management platforms, and collaborative communities. By adhering to modern development paradigms—such as API-first design, server-side rendering (SSR) via Inertia.js, and utility-first styling—FrameX reduces boilerplate code while ensuring compliance with standards like OWASP for security and WCAG for accessibility.

## Key Features

FrameX distinguishes itself through a comprehensive set of production-oriented features, drawing from 2025 best practices for Laravel-React stacks:

- **Authentication & Authorization**: Full scaffolding with Laravel Sanctum for SPA authentication, email verification, password resets, and OAuth providers (e.g., Google, GitHub). RBAC implemented via Spatie's Permissions package, supporting granular roles like admin, user, and guest.
- **API Excellence**: RESTful APIs with rate limiting, versioning (e.g., `/api/v1/`), and automatic OpenAPI/Swagger documentation. GraphQL support via Lighthouse for complex queries, ensuring flexibility for headless architectures.
- **Admin Dashboard**: Integrated Filament-inspired panel for CRUD operations, real-time analytics, and user management, with customizable themes.
- **Payments & Subscriptions**: Seamless Stripe integration for one-time payments, recurring subscriptions, invoicing, and webhooks handling.
- **Frontend Enhancements**: React with TypeScript for type-safe components, Inertia.js for SSR/SPA hybrid, and shadcn/ui + Radix UI for accessible, customizable UI primitives. Tailwind CSS for responsive styling.
- **Performance Optimizations**: Lazy loading, code splitting via Vite, Redis caching, and queue management with Horizon. Database indexing and query optimization best practices baked in.
- **Security Best Practices**: CSRF/XSS protection, input sanitization, encryption at rest, and automated vulnerability scanning hooks in CI/CD. Follows Laravel's security guidelines and React's secure context usage.
- **Testing & Quality Assurance**: Comprehensive coverage with PHPUnit for backend, Vitest/Jest for frontend, and Cypress for E2E tests. Linting via ESLint, PHPStan, and Prettier.
- **Deployment & Scalability**: Dockerized environment for local development and production, Kubernetes manifests for orchestration, and zero-downtime deployment scripts using Envoy or GitHub Actions.
- **SEO & Internationalization**: Automated sitemap generation, meta tags for Open Graph/Twitter Cards, and i18n support with Laravel localization and React-i18next.
- **Analytics & Monitoring**: Pre-configured hooks for Google Analytics, Sentry for error tracking, and Laravel Telescope for debugging.
- **Modularity & Extensibility**: Modular architecture with feature-based folder structure (e.g., `app/Features/`), allowing easy addition of microservices or third-party integrations like AI APIs (e.g., OpenAI).

These features align with 2025 trends, emphasizing headless APIs, composable UIs, and cloud-native deployments for high-performance applications.

## Technology Stack

FrameX uses cutting-edge versions as of August 2025 for optimal compatibility and features:

| Component          | Version       | Purpose                                                                 |
|--------------------|---------------|-------------------------------------------------------------------------|
| **Backend**       |               |                                                                         |
| Laravel           | 12.x         | Core PHP framework for routing, ORM, queuing, and API development. |
| PostgreSQL/MySQL  | Latest LTS   | Relational database with migrations and seeders.                        |
| Redis             | 7.x          | Caching and session management.                                         |
| **Frontend**      |               |                                                                         |
| React             | 19.1         | Component-based UI library with hooks and context API. |
| TypeScript        | 5.9          | Type-safe JavaScript superset for maintainable code. |
| Inertia.js        | 2.0.17       | Bridge for SSR/SPA without custom client-side routing. |
| Tailwind CSS      | 4.0          | Utility-first CSS for rapid, responsive styling. |
| shadcn/ui         | CLI 3.0      | Customizable UI components with accessibility focus. |
| Radix UI          | 1.4.3        | Unstyled primitives for building complex UIs. |
| **Build Tools**   |               |                                                                         |
| Vite              | 5.x          | Fast frontend bundler with HMR.                                         |
| Docker            | Latest       | Containerization for environments.                                      |
| **Testing**       |               |                                                                         |
| PHPUnit           | 11.x         | Backend unit/integration tests.                                         |
| Vitest            | 1.x          | Frontend testing with React support.                                    |
| Cypress           | 13.x         | End-to-end browser testing.                                             |

## Prerequisites

Before installation, ensure your system meets these requirements:

- PHP >= 8.3 (with extensions: pdo, mbstring, xml, curl, gd, zip)
- Composer >= 2.7
- Node.js >= 20.x with npm/yarn/pnpm
- Docker (for containerized setup)
- Git for version control
- A database server (PostgreSQL recommended for advanced features)

## Installation

Follow these steps to set up FrameX locally. This process incorporates best practices for secure and efficient setup.

1. **Clone the Repository**:
   ```
   git clone https://github.com/hytek-org/framex.git
   cd framex
   ```

2. **Install Backend Dependencies**:
   ```
   composer install --optimize-autoloader --no-dev
   ```

3. **Install Frontend Dependencies**:
   ```
   npm install  # or yarn/pnpm
   ```

4. **Configure Environment**:
   Copy `.env.example` to `.env` and update keys:
   ```
   cp .env.example .env
   ```
   Set database credentials, Stripe keys, etc. Generate app key:
   ```
   php artisan key:generate
   ```

5. **Run Migrations and Seeders**:
   ```
   php artisan migrate --seed
   ```

6. **Build Assets**:
   ```
   npm run build  # Production build
   # or npm run dev for development with HMR
   ```

7. **Start the Server**:
   ```
   php artisan serve
   ```
   Access at `http://localhost:8000`.

## Docker Configuration (Coming Soon)

A flexible, container-based development setup is on the way! Soon, you’ll be able to spin up your full environment using:


You’ll be able to initiate all services effortlessly with:

```bash
docker-compose up -d

```


## Configuration

### Environment Variables

Key `.env` settings (with explanations):

- `APP_ENV=local/production`: Environment mode; use `production` for optimized caching.
- `DB_CONNECTION=pgsql`: Prefer PostgreSQL for JSONB support in advanced queries.
- `STRIPE_KEY=sk_test_...`: For payments; ensure webhooks are configured at `/stripe/webhook`.
- `CACHE_DRIVER=redis`: Enables horizontal scaling.
- `QUEUE_CONNECTION=redis`: For background jobs like email sending.

### Customizing UI

Add shadcn/ui components:
```
npx shadcn@latest add button
```
This follows 2025 best practices for composable UIs.

### API Versioning

Routes in `routes/api.php` use prefixes:
```php
Route::prefix('v1')->group(function () {
    // API endpoints
});
```

## Usage

### Running in Development

- Backend: `php artisan serve`
- Frontend: `npm run dev`
- Tests: `php artisan test` (backend) / `npm test` (frontend)

### Building a Feature

Example: Adding a new dashboard page.

1. Create Laravel controller: `app/Http/Controllers/DashboardController.php`
   ```php
   namespace App\Http\Controllers;

   use Inertia\Inertia;

   class DashboardController extends Controller
   {
       public function index()
       {
           return Inertia::render('Dashboard', [
               'metrics' => auth()->user()->metrics(),
           ]);
       }
   }
   ```

2. Define React component: `resources/js/Pages/Dashboard.tsx`
   ```tsx
   import { usePage } from '@inertiajs/react';
   import { Card } from '@/components/ui/card';

   export default function Dashboard() {
       const { metrics } = usePage().props as { metrics: any };

       return (
           <Card>
               <h1>Dashboard Metrics: {metrics.count}</h1>
           </Card>
       );
   }
   ```

3. Add route: `routes/web.php`
   ```php
   Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth');
   ```

This exemplifies the Inertia.js flow for seamless full-stack integration.

### Deployment

Use GitHub Actions workflow (`.github/workflows/deploy.yml`) for CI/CD:
- Tests on push
- Deploy to production on merge

For Kubernetes: Apply `k8s/deployment.yaml` for scaled pods.

## API Documentation

Access Swagger at `/api/docs`. Example endpoint:
- `GET /api/v1/users`: List users (authenticated).
Generated via Laravel's built-in tools for maintainable APIs.

## Contributing

We welcome contributions! Follow these steps:
1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/new-feature`.
3. Commit changes: `git commit -m 'Add new feature'`.
4. Push: `git push origin feature/new-feature`.
5. Open a Pull Request.

Adhere to PSR-12 for PHP and Airbnb style for JS/TS. Include tests for new features.

## License

FrameX is open-sourced under the [MIT License](LICENSE). Feel free to use, modify, and distribute.