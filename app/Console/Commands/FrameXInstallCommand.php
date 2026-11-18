<?php

namespace App\Console\Commands;

use App\FrameX\Core\Registries\ModuleRegistry;
use App\FrameX\Installation\DatabaseManager;
use App\FrameX\Installation\EnvironmentManager;
use App\FrameX\Installation\InstallationState;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use Throwable;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\intro;
use function Laravel\Prompts\multiselect;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\password;
use function Laravel\Prompts\select;
use function Laravel\Prompts\spin;
use function Laravel\Prompts\text;

class FrameXInstallCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:install
                            {--force : Force re-installation even if FrameX is already installed}
                            {--app-name= : Application name}
                            {--app-url= : Application URL}
                            {--app-env= : Application environment (local, production)}
                            {--app-debug= : Application debug mode (true, false)}
                            {--db-connection= : Database connection (sqlite, mysql, pgsql)}
                            {--db-host= : Database host for MySQL or PostgreSQL}
                            {--db-port= : Database port for MySQL or PostgreSQL}
                            {--db-database= : Database name or path}
                            {--db-username= : Database username}
                            {--db-password= : Database password}
                            {--auth-features=* : Enabled Fortify authentication features}
                            {--package-manager= : Frontend package manager to execute (npm, pnpm, yarn, skip)}
                            {--modules=* : Enabled FrameX modules}
                            {--seed : Seed demo content and admin account into the workspace}
                            {--skip-db-check : Skip database connectivity verification}
                            {--skip-migrations : Skip running database migrations}
                            {--skip-frontend : Skip installing frontend dependencies}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Interactive installation wizard for FrameX application platform';

    protected EnvironmentManager $envManager;

    protected DatabaseManager $dbManager;

    protected InstallationState $installationState;

    /**
     * Track status of individual execution steps (Step, Status, Details).
     *
     * @var array<int, array{step: string, status: string, details: string}>
     */
    protected array $installationLog = [];

    public function __construct(
        ?EnvironmentManager $envManager = null,
        ?DatabaseManager $dbManager = null,
        ?InstallationState $installationState = null
    ) {
        parent::__construct();

        $this->envManager = $envManager ?: new EnvironmentManager;
        $this->dbManager = $dbManager ?: new DatabaseManager;
        $this->installationState = $installationState ?: new InstallationState;
    }

    /**
     * Execute the console command.
     */
    public function handle(ModuleRegistry $moduleRegistry): int
    {
        $isInteractive = $this->input->isInteractive() && ! $this->option('no-interaction');

        // Check for existing installation to ensure safety and idempotency
        if ($this->installationState->isInstalled() && ! $this->option('force')) {
            if ($isInteractive) {
                $reinstall = confirm(
                    label: 'FrameX appears to be already installed. Do you want to run the installer again?',
                    default: false,
                    hint: 'Re-running allows you to reconfigure environment variables and modules.'
                );

                if (! $reinstall) {
                    note('Installation cancelled. Your existing application configuration remains untouched.');

                    return self::SUCCESS;
                }
            } else {
                $this->info('FrameX is already installed. Use --force to re-run the installer in non-interactive mode.');

                return self::SUCCESS;
            }
        }

        // ── Step 1: Welcome Screen ──────────────────────────────────────────
        $this->renderWelcomeBanner($isInteractive);

        // Ensure base .env exists
        $this->envManager->ensureEnvFileExists();

        // ── Step 2: Application Configuration ───────────────────────────────
        $appConfig = $this->promptApplicationConfiguration($isInteractive);

        // ── Step 3: Database Selection & Configuration ─────────────────────
        $dbConfig = $this->promptDatabaseConfiguration($isInteractive, $appConfig['name']);

        // ── Step 4: Authentication Configuration ────────────────────────────
        $authConfig = $this->promptAuthenticationConfiguration($isInteractive);

        // ── Step 5: Frontend Configuration ──────────────────────────────────
        $frontendConfig = $this->promptFrontendConfiguration($isInteractive);

        // ── Step 6: Optional Features & Modules ─────────────────────────────
        $modulesConfig = $this->promptModulesConfiguration($isInteractive, $moduleRegistry);

        // ── Step 7: Installation Execution ──────────────────────────────────
        $success = $this->executeInstallation(
            $appConfig,
            $dbConfig,
            $authConfig,
            $frontendConfig,
            $modulesConfig,
            $moduleRegistry,
            $isInteractive
        );

        if (! $success) {
            $this->error('FrameX installation failed. Please review the errors above and retry.');

            return self::FAILURE;
        }

        // ── Step 8: Completion Screen ───────────────────────────────────────
        $this->renderCompletionScreen($appConfig, $dbConfig, $authConfig, $frontendConfig, $modulesConfig);

        return self::SUCCESS;
    }

    /**
     * Step 1: Welcome Banner
     */
    protected function renderWelcomeBanner(bool $isInteractive): void
    {
        $asciiLogo = <<<'LOGO'
  ███████╗██████╗  █████╗ ███╗   ███╗███████╗██╗  ██╗
  ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝╚██╗██╔╝
  █████╗  ██████╔╝███████║██╔████╔██║█████╗   ╚███╔╝ 
  ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝   ██╔██╗ 
  ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██╔╝ ██╗
  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
LOGO;

        $this->line('');
        $this->line("<fg=cyan>{$asciiLogo}</>");
        $this->line('  <fg=gray>Modular Laravel Application Platform · v1.0.0</>');
        $this->line('  <fg=gray>Build More. Start Less.</>');
        $this->line('');

        if ($isInteractive) {
            intro("Welcome to FrameX! Let's configure your application foundation.");
        } else {
            $this->info('Running FrameX installer in non-interactive mode...');
        }
    }

    /**
     * Step 2: Application Configuration
     *
     * @return array{name: string, url: string, env: string, debug: bool}
     */
    protected function promptApplicationConfiguration(bool $isInteractive): array
    {
        $defaultName = $this->envManager->get('APP_NAME') ?: basename(base_path());
        if ($defaultName === '' || $defaultName === '.' || $defaultName === 'framex') {
            $defaultName = 'FrameX';
        }

        $defaultUrl = $this->envManager->get('APP_URL') ?: 'http://localhost:8000';

        if (! $isInteractive) {
            $name = (string) ($this->option('app-name') ?: $defaultName);
            $url = (string) ($this->option('app-url') ?: $defaultUrl);
            $env = (string) ($this->option('app-env') ?: 'local');
            $debugOption = $this->option('app-debug');
            $debug = $debugOption !== null ? filter_var($debugOption, FILTER_VALIDATE_BOOLEAN) : ($env === 'local');

            return ['name' => $name, 'url' => $url, 'env' => $env, 'debug' => $debug];
        }

        $name = text(
            label: 'What is your application name?',
            default: $defaultName,
            required: true,
            hint: 'Used in email templates, page titles, and team communications.'
        );

        $url = text(
            label: 'What is your application URL?',
            default: $defaultUrl,
            required: true,
            validate: fn (string $val) => filter_var($val, FILTER_VALIDATE_URL) ? null : 'Please enter a valid URL (e.g. http://localhost:8000).',
            hint: 'Your local development server URL or production domain.'
        );

        $env = select(
            label: 'Select application environment:',
            options: [
                'local' => 'Local (Development)',
                'production' => 'Production',
            ],
            default: 'local'
        );

        $debug = confirm(
            label: 'Enable debug mode (APP_DEBUG)?',
            default: $env === 'local',
            hint: 'Recommended for local development; should be disabled in production.'
        );

        return [
            'name' => $name,
            'url' => rtrim($url, '/'),
            'env' => $env,
            'debug' => $debug,
        ];
    }

    /**
     * Step 3: Database Selection & Configuration
     *
     * @return array<string, string>
     */
    protected function promptDatabaseConfiguration(bool $isInteractive, string $appName): array
    {
        $defaultDriver = $this->option('db-connection') ?: ($this->envManager->get('DB_CONNECTION') ?: 'sqlite');

        if (! $isInteractive) {
            $driver = in_array($defaultDriver, ['sqlite', 'mysql', 'pgsql'], true) ? $defaultDriver : 'sqlite';

            if ($driver === 'sqlite') {
                $sqlitePath = $this->option('db-database') ?: database_path('database.sqlite');

                return $this->dbManager->configureSqlite($sqlitePath);
            }

            if ($driver === 'mysql') {
                return $this->dbManager->configureMysql(
                    host: (string) ($this->option('db-host') ?: '127.0.0.1'),
                    port: (string) ($this->option('db-port') ?: '3306'),
                    database: (string) ($this->option('db-database') ?: (Str::snake(Str::slug($appName, '_')) ?: 'framex')),
                    username: (string) ($this->option('db-username') ?: 'root'),
                    password: (string) ($this->option('db-password') ?: '')
                );
            }

            return $this->dbManager->configurePgsql(
                host: (string) ($this->option('db-host') ?: '127.0.0.1'),
                port: (string) ($this->option('db-port') ?: '5432'),
                database: (string) ($this->option('db-database') ?: (Str::snake(Str::slug($appName, '_')) ?: 'framex')),
                username: (string) ($this->option('db-username') ?: 'postgres'),
                password: (string) ($this->option('db-password') ?: '')
            );
        }

        $driver = select(
            label: 'Which database engine will you use?',
            options: [
                'sqlite' => 'SQLite (Fastest setup, zero daemon configuration)',
                'mysql' => 'MySQL / MariaDB',
                'pgsql' => 'PostgreSQL',
            ],
            default: $defaultDriver
        );

        if ($driver === 'sqlite') {
            $sqlitePath = database_path('database.sqlite');
            note("SQLite selected. The database file will be verified at [{$sqlitePath}].");

            return $this->dbManager->configureSqlite($sqlitePath);
        }

        $suggestedDbName = Str::snake(Str::slug($appName, '_')) ?: 'framex';

        if ($driver === 'mysql') {
            $host = text(
                label: 'MySQL Host:',
                default: $this->envManager->get('DB_HOST') ?: '127.0.0.1',
                required: true
            );
            $port = text(
                label: 'MySQL Port:',
                default: $this->envManager->get('DB_PORT') ?: '3306',
                required: true
            );
            $database = text(
                label: 'Database Name:',
                default: $this->envManager->get('DB_DATABASE') ?: $suggestedDbName,
                required: true
            );
            $username = text(
                label: 'Database Username:',
                default: $this->envManager->get('DB_USERNAME') ?: 'root',
                required: true
            );
            $password = password(
                label: 'Database Password (leave blank for none):'
            );

            return $this->dbManager->configureMysql($host, $port, $database, $username, $password);
        }

        // PostgreSQL
        $host = text(
            label: 'PostgreSQL Host:',
            default: $this->envManager->get('DB_HOST') ?: '127.0.0.1',
            required: true
        );
        $port = text(
            label: 'PostgreSQL Port:',
            default: $this->envManager->get('DB_PORT') ?: '5432',
            required: true
        );
        $database = text(
            label: 'Database Name:',
            default: $this->envManager->get('DB_DATABASE') ?: $suggestedDbName,
            required: true
        );
        $username = text(
            label: 'Database Username:',
            default: $this->envManager->get('DB_USERNAME') ?: 'postgres',
            required: true
        );
        $password = password(
            label: 'Database Password (leave blank for none):'
        );

        return $this->dbManager->configurePgsql($host, $port, $database, $username, $password);
    }

    /**
     * Step 4: Authentication Configuration
     *
     * @return array<string, bool>
     */
    protected function promptAuthenticationConfiguration(bool $isInteractive): array
    {
        $defaultSelections = ['registration', 'email_verification', 'two_factor', 'passkeys'];

        if (! $isInteractive) {
            $cliAuth = $this->option('auth-features');
            $selected = ! empty($cliAuth) ? $cliAuth : $defaultSelections;

            return [
                'registration' => in_array('registration', $selected, true),
                'email_verification' => in_array('email_verification', $selected, true),
                'two_factor' => in_array('two_factor', $selected, true),
                'passkeys' => in_array('passkeys', $selected, true),
            ];
        }

        $selected = multiselect(
            label: 'Which authentication features should be enabled?',
            options: [
                'registration' => 'Standard Authentication (User Registration & Password Reset)',
                'email_verification' => 'Email Verification (Require verified email before dashboard access)',
                'two_factor' => 'Two-Factor Authentication (2FA TOTP / QR codes)',
                'passkeys' => 'Passkeys (WebAuthn Biometric & Hardware Security Keys)',
            ],
            default: $defaultSelections,
            required: false,
            hint: 'All listed options are fully supported out-of-the-box by FrameX Fortify integration.'
        );

        return [
            'registration' => in_array('registration', $selected, true),
            'email_verification' => in_array('email_verification', $selected, true),
            'two_factor' => in_array('two_factor', $selected, true),
            'passkeys' => in_array('passkeys', $selected, true),
        ];
    }

    /**
     * Step 5: Frontend Configuration
     */
    protected function promptFrontendConfiguration(bool $isInteractive): string
    {
        if ($this->option('skip-frontend')) {
            return 'skip';
        }

        $detectedManager = $this->detectPackageManager();

        if (! $isInteractive) {
            $cliManager = $this->option('package-manager');

            return $cliManager ?: 'skip';
        }

        return select(
            label: 'Frontend tooling & dependency installation:',
            options: [
                'npm' => 'npm (Standard Node Package Manager)',
                'pnpm' => 'pnpm (Fast, disk-efficient package manager)',
                'yarn' => 'yarn (Classic / Berry Package Manager)',
                'skip' => 'Skip dependency installation (run manually later)',
            ],
            default: $detectedManager
        );
    }

    /**
     * Detect which package manager is available on the system.
     */
    protected function detectPackageManager(): string
    {
        if (file_exists(base_path('pnpm-lock.yaml'))) {
            return 'pnpm';
        }

        if (file_exists(base_path('yarn.lock'))) {
            return 'yarn';
        }

        return 'npm';
    }

    /**
     * Step 6: Optional Features & Modules
     *
     * @return array{enabled: array<int, string>, disabled: array<int, string>}
     */
    protected function promptModulesConfiguration(bool $isInteractive, ModuleRegistry $moduleRegistry): array
    {
        $allModules = $moduleRegistry->all();
        $coreModules = ['content-studio'];

        // Build selection options
        $options = [];
        $defaultSelections = [];

        foreach ($allModules as $id => $module) {
            if (in_array($id, $coreModules, true)) {
                continue;
            }

            $options[$id] = "{$module->name()} — {$module->description()}";
            if ($moduleRegistry->isEnabled($id)) {
                $defaultSelections[] = $id;
            }
        }

        if (! $isInteractive) {
            $cliModules = $this->option('modules');
            $selected = ! empty($cliModules) ? $cliModules : $defaultSelections;

            $enabled = array_unique(array_merge($coreModules, $selected));
            $disabled = array_values(array_diff(array_keys($allModules), $enabled));

            return ['enabled' => $enabled, 'disabled' => $disabled];
        }

        $selected = multiselect(
            label: 'Select optional FrameX business modules to enable:',
            options: $options,
            default: $defaultSelections,
            required: false,
            hint: 'Content Studio is the platform core and is automatically enabled.'
        );

        $enabled = array_unique(array_merge($coreModules, $selected));

        // Auto-enable any required dependencies
        foreach ($enabled as $modId) {
            $mod = $moduleRegistry->get($modId);
            if ($mod) {
                foreach ($mod->dependencies() as $dep) {
                    if (! in_array($dep, $enabled, true)) {
                        $enabled[] = $dep;
                        note("Automatically enabled dependency [{$dep}] required by [{$modId}].");
                    }
                }
            }
        }

        $disabled = array_values(array_diff(array_keys($allModules), $enabled));

        return [
            'enabled' => $enabled,
            'disabled' => $disabled,
        ];
    }

    /**
     * Record step result in the installation summary log.
     */
    protected function recordStep(string $step, string $status, string $details): void
    {
        $this->installationLog[] = [
            'step' => $step,
            'status' => $status,
            'details' => $details,
        ];
    }

    /**
     * Step 7: Installation Execution Pipeline
     */
    protected function executeInstallation(
        array $appConfig,
        array $dbConfig,
        array $authConfig,
        string $frontendManager,
        array $modulesConfig,
        ModuleRegistry $moduleRegistry,
        bool $isInteractive
    ): bool {
        $this->line('');
        $this->line('<fg=cyan>Running installation steps...</>');
        $this->installationLog = [];

        // 7.1 Write .env configuration
        $this->line('  → Updating environment configuration (.env)...');
        try {
            $envUpdates = array_merge([
                'APP_NAME' => $appConfig['name'],
                'APP_ENV' => $appConfig['env'],
                'APP_DEBUG' => $appConfig['debug'],
                'APP_URL' => $appConfig['url'],
                'VITE_APP_NAME' => '${APP_NAME}',
                'FORTIFY_REGISTRATION' => $authConfig['registration'],
                'FORTIFY_RESET_PASSWORDS' => $authConfig['registration'],
                'FORTIFY_EMAIL_VERIFICATION' => $authConfig['email_verification'],
                'FORTIFY_TWO_FACTOR' => $authConfig['two_factor'],
                'FORTIFY_PASSKEYS' => $authConfig['passkeys'],
            ], $dbConfig);

            $this->envManager->setMany($envUpdates)->save();
            $this->recordStep('Environment Configuration', 'SUCCESS', '.env configuration updated');
        } catch (Throwable $e) {
            $this->recordStep('Environment Configuration', 'FAILED', $e->getMessage());

            return false;
        }

        // 7.2 Generate Application Key if not present
        if (! $this->envManager->get('APP_KEY') || trim($this->envManager->get('APP_KEY')) === '') {
            $this->line('  → Generating application key...');
            try {
                Artisan::call('key:generate', ['--force' => true]);
                $this->recordStep('Application Key', 'SUCCESS', 'New application encryption key generated');
            } catch (Throwable $e) {
                $this->recordStep('Application Key', 'FAILED', $e->getMessage());

                return false;
            }
        } else {
            $this->recordStep('Application Key', 'SUCCESS', 'Existing application key preserved');
        }

        // 7.3 Database creation & connectivity verification
        if (! $this->option('skip-db-check')) {
            $this->line('  → Verifying database connectivity...');
            $test = $this->dbManager->testConnection($dbConfig);
            if (! $test['success']) {
                $this->error("  ✖ {$test['message']}");
                $this->recordStep('Database Connectivity', 'FAILED', $test['message']);

                return false;
            }
            $this->line("  ✔ {$test['message']}");
            $this->recordStep('Database Connectivity', 'SUCCESS', "Connected via {$dbConfig['DB_CONNECTION']}");
        } else {
            $this->recordStep('Database Connectivity', 'SKIPPED', 'Skipped via --skip-db-check flag');
        }

        // 7.4 Database Migrations
        if (! $this->option('skip-migrations')) {
            $this->line('  → Running database migrations...');
            config(['database.default' => $dbConfig['DB_CONNECTION']]);
            $migrateExit = Artisan::call('migrate', ['--force' => true, '--graceful' => true]);
            if ($migrateExit !== 0) {
                $this->warn('  ⚠ Migrations exited with a warning or partial status: '.Artisan::output());
                $this->recordStep('Database Migrations', 'WARNING', 'Completed with warnings');
            } else {
                $this->line('  ✔ Database migrated successfully.');
                $this->recordStep('Database Migrations', 'SUCCESS', 'All schema migrations executed');
            }
        } else {
            $this->recordStep('Database Migrations', 'SKIPPED', 'Skipped via --skip-migrations flag');
        }

        // 7.5 Create storage symlink
        $this->line('  → Linking public storage directory...');
        try {
            Artisan::call('storage:link');
            $this->recordStep('Storage Symlink', 'SUCCESS', 'public/storage symlink verified');
        } catch (Throwable $e) {
            $this->recordStep('Storage Symlink', 'WARNING', $e->getMessage());
        }

        // 7.6 Synchronize Wayfinder routes and actions
        $this->line('  → Generating Wayfinder TypeScript route and action definitions...');
        try {
            Artisan::call('wayfinder:generate', ['--no-interaction' => true]);
            $this->recordStep('Wayfinder TypeScript Types', 'SUCCESS', 'Generated typed route and action bindings');
        } catch (Throwable $e) {
            $this->recordStep('Wayfinder TypeScript Types', 'WARNING', "Could not generate types: {$e->getMessage()}");
        }

        // 7.7 Apply module configuration
        $this->line('  → Configuring FrameX modules...');
        foreach ($modulesConfig['disabled'] as $disabledId) {
            try {
                $moduleRegistry->disable($disabledId);
            } catch (Throwable $e) {
                $this->warn("  ⚠ Could not disable module [{$disabledId}]: {$e->getMessage()}");
            }
        }
        foreach ($modulesConfig['enabled'] as $enabledId) {
            try {
                $moduleRegistry->enable($enabledId);
            } catch (Throwable) {
                // Core or already enabled
            }
        }
        $this->recordStep('FrameX Modules', 'SUCCESS', count($modulesConfig['enabled']).' module(s) enabled');

        // 7.8 Optional Demo Content Seeding
        if ($this->option('seed')) {
            $this->line('  → Provisioning demo content and workspace...');
            try {
                Artisan::call('framex:demo:seed');
                $this->recordStep('Demo Seeding', 'SUCCESS', 'Sample workspace and content provisioned');
            } catch (Throwable $e) {
                $this->recordStep('Demo Seeding', 'WARNING', $e->getMessage());
            }
        } else {
            $this->recordStep('Demo Seeding', 'SKIPPED', 'Omitted (run php artisan framex:demo:seed manually)');
        }

        // 7.9 Frontend Dependency Installation
        if ($frontendManager !== 'skip' && ! $this->option('skip-frontend')) {
            $installed = $this->installFrontendDependencies($frontendManager);
            $this->recordStep('Frontend Dependencies', $installed ? 'SUCCESS' : 'WARNING', "Processed via {$frontendManager}");
        } else {
            $this->recordStep('Frontend Dependencies', 'SKIPPED', 'Skipped dependency installation');
        }

        // 7.10 Clear and optimize caches
        $this->line('  → Clearing bootstrap caches...');
        try {
            Artisan::call('optimize:clear');
            $this->recordStep('Cache Optimization', 'SUCCESS', 'Caches cleared and reset');
        } catch (Throwable $e) {
            $this->recordStep('Cache Optimization', 'WARNING', $e->getMessage());
        }

        // 7.11 Mark installation state
        $this->installationState->markInstalled([
            'app_name' => $appConfig['name'],
            'app_url' => $appConfig['url'],
            'database_driver' => $dbConfig['DB_CONNECTION'],
            'enabled_modules' => $modulesConfig['enabled'],
            'frontend_manager' => $frontendManager,
        ]);
        $this->recordStep('Installation State', 'SUCCESS', 'Marked installed in storage metadata');

        return true;
    }

    /**
     * Install frontend npm/pnpm/yarn dependencies via Process.
     */
    protected function installFrontendDependencies(string $manager): bool
    {
        $this->line("  → Installing frontend dependencies via {$manager}...");

        $command = match ($manager) {
            'pnpm' => PHP_OS_FAMILY === 'Windows' ? 'pnpm.cmd install' : 'pnpm install',
            'yarn' => PHP_OS_FAMILY === 'Windows' ? 'yarn.cmd install' : 'yarn install',
            default => PHP_OS_FAMILY === 'Windows' ? 'npm.cmd install' : 'npm install',
        };

        try {
            $process = Process::fromShellCommandline($command, base_path(), null, null, 300);
            $process->run();

            if ($process->isSuccessful()) {
                $this->line("  ✔ Frontend packages installed via {$manager}.");

                return true;
            }

            $this->warn("  ⚠ {$manager} install finished with warnings. You can run '{$command}' manually.");

            return false;
        } catch (Throwable $e) {
            $this->warn("  ⚠ Could not execute [{$command}]: {$e->getMessage()}. Please run it manually.");

            return false;
        }
    }

    /**
     * Step 8: Completion Screen
     */
    protected function renderCompletionScreen(
        array $appConfig,
        array $dbConfig,
        array $authConfig,
        string $frontendManager,
        array $modulesConfig
    ): void {
        $this->line('');
        outro('FrameX installed successfully!');

        // Render Step Execution Summary
        $this->line('  <fg=cyan;options=bold>Installation Summary:</>');
        $this->table(
            ['Operation', 'Status', 'Details'],
            array_map(fn ($s) => [
                $s['step'],
                match ($s['status']) {
                    'SUCCESS' => '✔ SUCCESS',
                    'SKIPPED' => '⏭ SKIPPED',
                    'WARNING' => '⚠ WARNING',
                    'FAILED' => '✖ FAILED',
                    default => $s['status'],
                },
                $s['details'],
            ], $this->installationLog)
        );

        $activeAuth = [];
        if ($authConfig['registration']) {
            $activeAuth[] = 'Standard Auth';
        }
        if ($authConfig['two_factor']) {
            $activeAuth[] = '2FA (TOTP)';
        }
        if ($authConfig['passkeys']) {
            $activeAuth[] = 'Passkeys';
        }
        if ($authConfig['email_verification']) {
            $activeAuth[] = 'Email Verification';
        }

        $this->line('');
        $this->line('  <fg=cyan;options=bold>Configured Environment & Tooling:</>');
        $this->table(
            ['Component', 'Configured Value'],
            [
                ['Application Name', $appConfig['name']],
                ['Application URL', $appConfig['url']],
                ['Environment', "{$appConfig['env']} (Debug: ".($appConfig['debug'] ? 'On' : 'Off').')'],
                ['Database Driver', strtoupper($dbConfig['DB_CONNECTION'])],
                ['Active Modules', implode(', ', $modulesConfig['enabled'])],
                ['Authentication', ! empty($activeAuth) ? implode(', ', $activeAuth) : 'None'],
                ['Frontend Tooling', $frontendManager !== 'skip' ? "{$frontendManager} (Ready)" : 'Skipped (run npm install)'],
            ]
        );

        $this->line('');
        $this->line('  <fg=cyan;options=bold>Next Steps to get started:</>');
        $this->line("    <fg=yellow>1.</> Start local server:           <fg=green>php artisan serve</>");

        if ($frontendManager !== 'skip') {
            $this->line("    <fg=yellow>2.</> Start frontend Vite dev server: <fg=green>{$frontendManager} run dev</>");
        } else {
            $this->line('    <fg=yellow>2.</> Install & start frontend:      <fg=green>npm install && npm run dev</>');
        }

        if (! $this->option('seed')) {
            $this->line('    <fg=yellow>3.</> (Optional) Seed demo data:     <fg=green>php artisan framex:demo:seed</>');
        }

        $this->line('');
        $this->line("  Visit <fg=cyan;options=underscore>{$appConfig['url']}</> in your browser to start building.");
        $this->line('');
    }
}
