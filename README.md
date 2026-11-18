# FrameX - Laravel 13 Team Management Application

A modern full-stack web application built with **Laravel 13**, **React**, **TypeScript**, and **Inertia.js**. FrameX provides comprehensive team management, user authentication, billing integration, and real-time collaboration features.

##  Features

### Core Features
- **User Authentication** - Secure authentication with two-factor authentication (2FA) support
- **Team Management** - Create, manage, and collaborate within teams
- **Role-Based Access Control** - Fine-grained permission system for team members
- **User Profiles** - Customizable user profiles with team switching
- **Activity Logging** - Track and audit team activities
- **Notification Preferences** - Configurable notification settings per user

### Advanced Features
- **Payment Integration** - Stripe integration via Laravel Cashier for subscription management
- **API Authentication** - Sanctum-based API tokens for secure third-party integrations
- **Real-Time Features** - WebSocket support via Laravel Reverb for live updates
- **File Management** - Team file storage and management
- **Team Invitations** - Invite and manage team members with email invitations
- **Two-Factor Authentication** - Enhanced security with 2FA support

## 🚀 Tech Stack

### Backend
- **PHP** 8.3+
- **Laravel Framework** 13.7 - Modern PHP web framework
- **Laravel Fortify** - Authentication backend
- **Laravel Sanctum** - API token authentication
- **Laravel Cashier** - Stripe payment processing
- **Laravel Reverb** - Real-time WebSocket server
- **Pest** - Modern PHP testing framework

### Frontend
- **React** - Modern UI library
- **Inertia.js** - Server-driven SPA framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Vite** - Fast build tool

### Database & Tools
- **Laravel Migrations** - Database schema management
- **Faker** - Seed data generation
- **Pest** - Testing framework
- **Laravel Pint** - Code style formatter
- **ESLint** - JavaScript linter
- **Prettier** - Code formatter

## 📋 Project Structure

```
├── app/
│   ├── Actions/          # Action classes (Fortify, Teams)
│   ├── Concerns/         # Reusable traits for models
│   ├── Enums/            # Enumeration classes
│   ├── Events/           # Event classes
│   ├── Http/             # Controllers, Middleware, Requests, Responses
│   ├── Models/           # Eloquent models
│   ├── Notifications/    # Notification classes
│   ├── Policies/         # Authorization policies
│   ├── Providers/        # Service providers
│   ├── Rules/            # Custom validation rules
│   └── Support/          # Helper classes
├── bootstrap/            # Application bootstrapping
├── config/               # Configuration files
├── database/
│   ├── factories/        # Model factories
│   ├── migrations/       # Database migrations
│   └── seeders/          # Database seeders
├── public/               # Public assets
├── resources/
│   ├── css/              # Stylesheets
│   ├── js/               # React components and pages
│   └── views/            # Blade view templates
├── routes/               # Application routes
├── storage/              # Application storage
├── tests/                # Test files
│   ├── Feature/          # Feature tests
│   └── Unit/             # Unit tests
└── vendor/               # Composer dependencies
```

### Key Models
- **User** - User accounts with team support, 2FA, and billing
- **Team** - Team records with permissions and roles
- **Membership** - Join table linking users to teams
- **TeamInvitation** - Pending team invitations
- **ActivityLog** - Team activity history
- **TeamFile** - Team file storage
- **NotificationPreference** - User notification settings

## 🔐 Authorization & Permissions

### Team Roles
- **Owner** - Full control over team
- **Admin** - Administrative access
- **Member** - Basic member access
- Custom roles with granular permissions

### Policies
- **TeamPolicy** - Controls team access and management
- Authorization middleware for protected routes

## 🛠️ Installation & Setup

### Prerequisites
- **PHP** 8.3 or higher with `pdo`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `curl` extensions
- **Composer** 2.2+
- **Node.js** 18+ and `npm`, `pnpm`, or `yarn`
- **Git**

### 1. Interactive Installation via Laravel Starter Kit (Recommended)

To create a new application using FrameX as an interactive starter kit, run:

```bash
laravel new my-app --using=hytek/framex
```

This immediately triggers the FrameX Interactive Setup Wizard (`php artisan framex:install`), guiding you through:
1. **Welcome Screen** — FrameX ASCII banner, platform version, and architectural overview.
2. **Application Configuration** — Name, local/production environment, debug mode, and URL.
3. **Database Selection** — Automatic SQLite provisioning, or interactive MySQL / PostgreSQL configuration with connection verification and safe database creation.
4. **Authentication Architecture** — Configurable Fortify capabilities (Standard registration, Email verification, 2FA TOTP, Passkeys).
5. **Frontend Tooling** — Choice of `npm`, `pnpm`, `yarn`, or manual installation.
6. **FrameX Business Modules** — Selection of modular extensions with core dependency auto-resolution (`content-studio` platform core locked).
7. **Execution Pipeline** — Safe `.env` generation (preserving comments and custom settings), application key generation, migrations, storage linking, and cache optimization.

### 2. Manual Installation or Existing Clone

If cloning the repository directly:

```bash
git clone https://github.com/hytek/framex.git my-app
cd my-app
composer install
php artisan framex:install
```

### 3. Non-Interactive / CI/CD Deployment

For continuous integration, Docker provisioning, or automated deployment scripts, pass `--no-interaction` along with individual configuration options:

```bash
php artisan framex:install \
  --no-interaction \
  --app-name="Acme Platform" \
  --app-url="https://acme.example.com" \
  --app-env=production \
  --app-debug=false \
  --db-connection=mysql \
  --db-host=127.0.0.1 \
  --db-port=3306 \
  --db-database=acme_production \
  --db-username=acme_admin \
  --db-password="SecurePassword" \
  --auth-features=registration \
  --auth-features=two_factor \
  --package-manager=pnpm \
  --modules=content-studio \
  --force
```

#### Available Installer Options:
- `--force` : Force re-installation even if FrameX was already installed
- `--app-name=` : Set application name (`APP_NAME`)
- `--app-url=` : Set application base URL (`APP_URL`)
- `--app-env=` : Set environment (`local`, `production`)
- `--app-debug=` : Toggle debug mode (`true`, `false`)
- `--db-connection=` : Database driver (`sqlite`, `mysql`, `pgsql`)
- `--db-host=` : Database server hostname or IP
- `--db-port=` : Database port (default: 3306 for MySQL, 5432 for PgSQL)
- `--db-database=` : Database name or SQLite file path
- `--db-username=` : Database user
- `--db-password=` : Database password (masked in error reporting)
- `--auth-features=*` : Fortify auth options (`registration`, `email_verification`, `two_factor`, `passkeys`)
- `--package-manager=` : Frontend package manager (`npm`, `pnpm`, `yarn`, `skip`)
- `--modules=*` : Enabled FrameX modules (`content-studio`, etc.)
- `--seed` : Seed initial demo content and workspace records
- `--skip-db-check` : Skip live database connectivity verification
- `--skip-migrations` : Skip running database migrations
- `--skip-frontend` : Skip installing frontend NPM dependencies

### 4. Health Inspection & Diagnostics

FrameX includes a comprehensive diagnostic health inspection command:

```bash
php artisan framex:doctor
```

This verifies:
- PHP version requirements (>= 8.2)
- Required PHP extensions (`pdo`, `mbstring`, `curl`, etc.)
- Database connectivity & active driver
- Storage and cache directory permissions
- FrameX Module Registry health & dependency resolution
- Content Studio blueprint readiness


### Docker Setup (Optional)
```bash
./vendor/bin/sail up -d
sail composer install
sail npm install
sail artisan migrate
sail npm run dev
```

## 📦 Available Commands

### Frontend Development
```bash
pnpm run dev          # Start Vite dev server with hot reload
pnpm run build        # Build production assets
pnpm run build:ssr    # Build with SSR support
pnpm run lint         # Run ESLint with auto-fix
pnpm run lint:check   # Check code style without fixing
pnpm run format       # Format code with Prettier
pnpm run format:check # Check formatting without fixing
pnpm run types:check  # Check TypeScript types
```

### Backend Development
```bash
php artisan migrate              # Run database migrations
php artisan db:seed              # Seed the database
php artisan tinker               # Interactive shell
php artisan serve                # Start development server
php artisan reverb:start          # Start WebSocket server
php artisan horizon              # Start queue worker
php artisan sail up -d           # Start Docker containers
```

### Testing
```bash
./vendor/bin/pest                # Run all tests
./vendor/bin/pest --filter=TestName  # Run specific test
./vendor/bin/pest --coverage     # Generate coverage report
php artisan test                 # Alternative test runner
```

### Code Quality
```bash
composer pint                    # Fix PHP code style
pnpm run lint                    # Fix JavaScript/TypeScript style
pnpm run format                  # Format code with Prettier
```

## 🔌 Configuration

### Key Configuration Files
- **config/app.php** - Application settings
- **config/auth.php** - Authentication configuration
- **config/database.php** - Database configuration
- **config/fortify.php** - Fortify authentication settings
- **config/inertia.php** - Inertia.js settings
- **config/cashier.php** - Stripe payment configuration
- **config/reverb.php** - WebSocket configuration

### Environment Variables
```env
APP_NAME=FrameX
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite
# or
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=framex
DB_USERNAME=root
DB_PASSWORD=

STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

## 🧪 Testing

### Running Tests
```bash
# All tests
./vendor/bin/pest

# Specific test file
./vendor/bin/pest tests/Feature/AuthenticationTest.php

# With coverage report
./vendor/bin/pest --coverage
```

### Test Structure
- **Feature Tests** - Integration tests for API endpoints and features
- **Unit Tests** - Individual component and method tests

## 🔄 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `POST /two-factor-challenge` - 2FA verification

### Teams
- `GET /teams` - List user's teams
- `POST /teams` - Create new team
- `PUT /teams/{id}` - Update team
- `DELETE /teams/{id}` - Delete team

### Team Members
- `GET /teams/{id}/members` - List team members
- `POST /teams/{id}/members` - Add team member
- `PUT /teams/{id}/members/{id}` - Update member role
- `DELETE /teams/{id}/members/{id}` - Remove member

### Files
- `GET /teams/{id}/files` - List team files
- `POST /teams/{id}/files` - Upload file
- `DELETE /teams/{id}/files/{id}` - Delete file

## 📚 Documentation

### Laravel Packages
- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Fortify](https://laravel.com/docs/fortify) - Authentication backend
- [Laravel Sanctum](https://laravel.com/docs/sanctum) - API authentication
- [Laravel Cashier](https://laravel.com/docs/cashier) - Payment processing
- [Laravel Reverb](https://laravel.com/docs/reverb) - WebSocket server

### Frontend
- [Inertia.js](https://inertiajs.com/) - Server-driven SPA
- [React Documentation](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## 🚨 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
# Or use a different port
pnpm run dev -- --port 3001
```

**Database connection error**
- Verify `.env` database credentials
- Ensure database server is running
- Check database user permissions

**Node modules issues**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Composer issues**
```bash
composer clear-cache
composer install
```

## 📝 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make Changes**
   - Follow PSR-12 PHP coding standards (enforced by Pint)
   - Follow ESLint rules for JavaScript/TypeScript
   - Write tests for new features

3. **Run Code Quality Checks**
   ```bash
   composer pint
   pnpm run lint
   pnpm run format
   pnpm run types:check
   ./vendor/bin/pest
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin feature/feature-name
   ```

5. **Create Pull Request**

## 🔒 Security Considerations

- Keep Laravel and dependencies updated
- Use HTTPS in production
- Configure CORS properly for API requests
- Implement rate limiting on sensitive endpoints
- Use strong database passwords
- Keep Stripe keys secure and never commit them
- Regular security audits and vulnerability scanning
- Enable CSRF protection (default in Laravel)
- SQL injection protection via Eloquent ORM

## 📄 License

This project is open-source software licensed under the [MIT license](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please follow the development workflow:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass and code style is correct
5. Commit with clear messages
6. Push to your fork
7. Submit a pull request

## 📞 Support

For questions or issues, please:
- Check existing [Issues](https://github.com/hytek-org/framex/issues)
- Create a new issue with detailed information
- Contact the development team

## 🎉 Acknowledgments

Built with:
- [Laravel](https://laravel.com) - The PHP Framework
- [React](https://react.dev) - UI Library
- [Inertia.js](https://inertiajs.com/) - Modern SPA Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Headless Components

---

**Last Updated:** November 2026
**Version:** 1.2.0
