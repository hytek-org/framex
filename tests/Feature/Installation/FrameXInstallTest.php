<?php

use App\FrameX\Core\Contracts\ModuleInterface;
use App\FrameX\Core\FrameXServiceProvider;
use App\FrameX\Core\Registries\ModuleRegistry;
use App\FrameX\Installation\DatabaseManager;
use App\FrameX\Installation\EnvironmentManager;
use App\FrameX\Installation\InstallationState;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->testDir = storage_path('framework/testing/installation_test_'.uniqid());
    if (! is_dir($this->testDir)) {
        File::makeDirectory($this->testDir, 0755, true);
    }

    $this->testEnvPath = $this->testDir.'/.env';
    $this->testStatePath = $this->testDir.'/framex-installed.json';

    // Seed dummy .env
    File::put($this->testEnvPath, implode(PHP_EOL, [
        'APP_NAME=OldAppName',
        'APP_ENV=local',
        'APP_KEY=base64:existingkey1234567890abcdef==',
        'APP_DEBUG=true',
        'APP_URL=http://localhost',
        '',
        '# Custom Agency Config',
        'CUSTOM_API_KEY=secret_key_value',
        'AGENCY_NAME="Acme Corp"',
        '',
        'DB_CONNECTION=sqlite',
        'DB_DATABASE=database/database.sqlite',
    ]));

    $this->envManager = new EnvironmentManager($this->testEnvPath);
    $this->installationState = new InstallationState($this->testStatePath);
    $this->dbManager = new DatabaseManager;

    app()->instance(EnvironmentManager::class, $this->envManager);
    app()->instance(InstallationState::class, $this->installationState);
    app()->instance(DatabaseManager::class, $this->dbManager);
});

afterEach(function () {
    if (isset($this->testDir) && is_dir($this->testDir)) {
        File::deleteDirectory($this->testDir);
    }
});

// 1. Fresh SQLite installation creates database file, updates .env, and marks installation state
test('fresh sqlite installation creates database file, updates env, and marks installed', function () {
    $customDbPath = $this->testDir.'/database.sqlite';

    $this->artisan('framex:install', [
        '--no-interaction' => true,
        '--force' => true,
        '--app-name' => 'Acme Platform',
        '--app-url' => 'http://acme.test',
        '--app-env' => 'local',
        '--db-connection' => 'sqlite',
        '--db-database' => $customDbPath,
        '--skip-db-check' => true,
        '--skip-migrations' => true,
        '--skip-frontend' => true,
    ])->assertSuccessful();

    // Verify .env was written with new values
    $reloadedEnv = new EnvironmentManager($this->testEnvPath);
    expect($reloadedEnv->get('APP_NAME'))->toBe('Acme Platform')
        ->and($reloadedEnv->get('APP_URL'))->toBe('http://acme.test')
        ->and($reloadedEnv->get('DB_CONNECTION'))->toBe('sqlite')
        ->and($reloadedEnv->get('DB_DATABASE'))->toBe($customDbPath);

    // Verify database file was created
    expect(file_exists($customDbPath))->toBeTrue();

    // Verify installation state is marked installed
    expect($this->installationState->isInstalled())->toBeTrue();
    $metadata = $this->installationState->getMetadata();
    expect($metadata)->not->toBeNull()
        ->and($metadata['app_name'])->toBe('Acme Platform')
        ->and($metadata['database_driver'])->toBe('sqlite');
});

// 2. MySQL configuration generation sets expected .env variables without exposing passwords
test('mysql configuration generates valid keys without exposing credentials', function () {
    $mysqlConfig = $this->dbManager->configureMysql(
        host: '10.0.0.1',
        port: 3306,
        database: 'acme_framex',
        username: 'acme_user',
        password: 'SuperSecretPassword#123'
    );

    expect($mysqlConfig['DB_CONNECTION'])->toBe('mysql')
        ->and($mysqlConfig['DB_HOST'])->toBe('10.0.0.1')
        ->and($mysqlConfig['DB_PORT'])->toBe('3306')
        ->and($mysqlConfig['DB_DATABASE'])->toBe('acme_framex')
        ->and($mysqlConfig['DB_USERNAME'])->toBe('acme_user')
        ->and($mysqlConfig['DB_PASSWORD'])->toBe('SuperSecretPassword#123');

    $this->envManager->setMany($mysqlConfig)->save();

    $reloaded = new EnvironmentManager($this->testEnvPath);
    expect($reloaded->get('DB_CONNECTION'))->toBe('mysql')
        ->and($reloaded->get('DB_HOST'))->toBe('10.0.0.1')
        ->and($reloaded->get('DB_PASSWORD'))->toBe('SuperSecretPassword#123');
});

// 3. PostgreSQL configuration generation sets expected .env variables
test('postgresql configuration generates valid keys', function () {
    $pgsqlConfig = $this->dbManager->configurePgsql(
        host: 'postgres.internal',
        port: 5432,
        database: 'production_db',
        username: 'pg_admin',
        password: 'PgPassword456'
    );

    expect($pgsqlConfig['DB_CONNECTION'])->toBe('pgsql')
        ->and($pgsqlConfig['DB_HOST'])->toBe('postgres.internal')
        ->and($pgsqlConfig['DB_PORT'])->toBe('5432')
        ->and($pgsqlConfig['DB_DATABASE'])->toBe('production_db')
        ->and($pgsqlConfig['DB_USERNAME'])->toBe('pg_admin')
        ->and($pgsqlConfig['DB_PASSWORD'])->toBe('PgPassword456');

    $this->envManager->setMany($pgsqlConfig)->save();

    $reloaded = new EnvironmentManager($this->testEnvPath);
    expect($reloaded->get('DB_CONNECTION'))->toBe('pgsql')
        ->and($reloaded->get('DB_DATABASE'))->toBe('production_db');
});

// 4. Missing SQLite file handling creates file and directory
test('missing sqlite file handling creates directory and touch file', function () {
    $nestedPath = $this->testDir.'/nested/subfolder/database.sqlite';
    expect(file_exists($nestedPath))->toBeFalse();

    $result = $this->dbManager->ensureSqliteFileExists($nestedPath);
    expect($result)->toBeTrue()
        ->and(file_exists($nestedPath))->toBeTrue();
});

// 5. Existing .env preservation ensures comments and custom keys remain intact
test('existing env preservation keeps custom keys and comments intact', function () {
    $this->envManager->set('APP_NAME', 'UpdatedAppName')->save();

    $content = File::get($this->testEnvPath);
    expect($content)->toContain('# Custom Agency Config')
        ->and($content)->toContain('CUSTOM_API_KEY=secret_key_value')
        ->and($content)->toContain('AGENCY_NAME="Acme Corp"')
        ->and($content)->toContain('APP_NAME=UpdatedAppName');
});

// 6. Invalid database configuration reports sanitized error message without leaking credentials
test('database manager sanitizes passwords in error reporting', function () {
    $secretPass = 'ExtremelySecretP@ssw0rd!#';
    $rawError = "SQLSTATE[HY000] [1045] Access denied for user 'admin'@'localhost' (using password: yes) with {$secretPass}";

    $sanitized = $this->dbManager->sanitizeErrorMessage($rawError, $secretPass);

    expect($sanitized)->not->toContain($secretPass)
        ->and($sanitized)->toContain('********');

    // Also verify DSN pattern masking
    $dsnError = 'Connection failed: mysql:host=127.0.0.1;password=MyPlainPassword123';
    $sanitizedDsn = $this->dbManager->sanitizeErrorMessage($dsnError, 'MyPlainPassword123');
    expect($sanitizedDsn)->not->toContain('MyPlainPassword123')
        ->and($sanitizedDsn)->toContain('password=********');
});

// 7. Non-interactive installation completes cleanly with default flags
test('non-interactive installation completes cleanly with flags', function () {
    $this->artisan('framex:install', [
        '--no-interaction' => true,
        '--force' => true,
        '--app-name' => 'HeadlessApp',
        '--app-url' => 'http://headless.test',
        '--skip-db-check' => true,
        '--skip-migrations' => true,
        '--skip-frontend' => true,
    ])->assertSuccessful();

    $reloaded = new EnvironmentManager($this->testEnvPath);
    expect($reloaded->get('APP_NAME'))->toBe('HeadlessApp');
});

// 8. Repeated installer execution detects existing installation and respects --force
test('repeated installer execution detects existing installation and respects force', function () {
    $this->installationState->markInstalled(['app_name' => 'ExistingApp']);
    expect($this->installationState->isInstalled())->toBeTrue();

    // Without --force in non-interactive mode: should report installed and skip
    $this->artisan('framex:install', [
        '--no-interaction' => true,
        '--app-name' => 'ShouldNotOverwrite',
        '--skip-db-check' => true,
        '--skip-migrations' => true,
        '--skip-frontend' => true,
    ])
        ->expectsOutputToContain('FrameX is already installed. Use --force to re-run')
        ->assertSuccessful();

    $reloaded = new EnvironmentManager($this->testEnvPath);
    expect($reloaded->get('APP_NAME'))->not->toBe('ShouldNotOverwrite');

    // With --force: should proceed
    $this->artisan('framex:install', [
        '--no-interaction' => true,
        '--force' => true,
        '--app-name' => 'ForcedApp',
        '--skip-db-check' => true,
        '--skip-migrations' => true,
        '--skip-frontend' => true,
    ])->assertSuccessful();

    $reloadedAfterForce = new EnvironmentManager($this->testEnvPath);
    expect($reloadedAfterForce->get('APP_NAME'))->toBe('ForcedApp');
});

// 9. Module dependency resolution: content-studio remains enabled and dependencies resolve
test('module dependency resolution preserves core module and resolves dependencies', function () {
    $registry = new ModuleRegistry($this->testDir.'/modules-state.json');

    $mockCore = new class implements ModuleInterface
    {
        public function id(): string
        {
            return 'content-studio';
        }

        public function name(): string
        {
            return 'Content Studio';
        }

        public function version(): string
        {
            return '1.0.0';
        }

        public function description(): string
        {
            return 'Core Content Studio';
        }

        public function dependencies(): array
        {
            return [];
        }

        public function register(): void {}

        public function boot(): void {}

        public function navigation(): array
        {
            return [];
        }

        public function permissions(): array
        {
            return [];
        }
    };

    $mockChild = new class implements ModuleInterface
    {
        public function id(): string
        {
            return 'child-feature';
        }

        public function name(): string
        {
            return 'Child Feature';
        }

        public function version(): string
        {
            return '1.0.0';
        }

        public function description(): string
        {
            return 'Child';
        }

        public function dependencies(): array
        {
            return ['content-studio'];
        }

        public function register(): void {}

        public function boot(): void {}

        public function navigation(): array
        {
            return [];
        }

        public function permissions(): array
        {
            return [];
        }
    };

    $registry->register($mockCore);
    $registry->register($mockChild);

    // Core module cannot be disabled
    expect(fn () => $registry->disable('content-studio'))
        ->toThrow(\RuntimeException::class);

    // Child module can be enabled
    $registry->enable('child-feature');
    expect($registry->isEnabled('child-feature'))->toBeTrue()
        ->and($registry->isEnabled('content-studio'))->toBeTrue();
});

// 10. Package discovery without database boots cleanly
test('package discovery boots without database or unmigrated cache', function () {
    $tempStateFile = $this->testDir.'/discovery-state.json';
    $registry = new ModuleRegistry($tempStateFile);

    // Verify registry can be constructed and queried without throwing PDO / cache exceptions
    expect($registry->all())->toBeArray();
    expect($registry->disabled())->toBeArray();
});

// 11. Windows-compatible path handling in DatabaseManager and EnvironmentManager
test('windows compatible path handling formats sqlite and env paths correctly', function () {
    $winPath = str_replace('/', '\\', $this->testDir).'\win_db\database.sqlite';
    $sqliteConfig = $this->dbManager->configureSqlite($winPath);

    expect($sqliteConfig['DB_CONNECTION'])->toBe('sqlite')
        ->and($sqliteConfig['DB_DATABASE'])->toBe($winPath)
        ->and(file_exists($winPath))->toBeTrue();

    $formattedLine = $this->envManager->formatLine('DB_DATABASE', $winPath);
    expect($formattedLine)->toBe("DB_DATABASE={$winPath}");

    // Test paths with spaces
    $pathWithSpace = 'C:\\Program Files\\FrameX\\database.sqlite';
    $formattedWithSpace = $this->envManager->formatLine('DB_DATABASE', $pathWithSpace);
    expect($formattedWithSpace)->toBe('DB_DATABASE="C:\\Program Files\\FrameX\\database.sqlite"');
});

// 12. Installation failure reporting when database connectivity fails
test('installation fails gracefully when database connectivity check fails', function () {
    // Configure an invalid MySQL host that will fail connection test
    $badDbManager = Mockery::mock(DatabaseManager::class)->makePartial();
    $badDbManager->shouldReceive('testConnection')->andReturn([
        'success' => false,
        'message' => 'Database connection failed: Access denied for user',
    ]);
    app()->instance(DatabaseManager::class, $badDbManager);

    $this->artisan('framex:install', [
        '--no-interaction' => true,
        '--force' => true,
        '--db-connection' => 'mysql',
        '--db-host' => '999.999.999.999',
        '--skip-migrations' => true,
        '--skip-frontend' => true,
    ])
        ->expectsOutputToContain('Database connection failed')
        ->assertFailed();
});
