<?php

namespace App\FrameX\Installation;

use PDO;
use PDOException;
use RuntimeException;

class DatabaseManager
{
    /**
     * Build SQLite configuration key-value pairs.
     *
     * @return array<string, string>
     */
    public function configureSqlite(?string $customPath = null): array
    {
        $path = $customPath ?: database_path('database.sqlite');
        $this->ensureSqliteFileExists($path);

        return [
            'DB_CONNECTION' => 'sqlite',
            'DB_HOST' => '',
            'DB_PORT' => '',
            'DB_DATABASE' => $path,
            'DB_USERNAME' => '',
            'DB_PASSWORD' => '',
        ];
    }

    /**
     * Build MySQL / MariaDB configuration key-value pairs.
     *
     * @return array<string, string>
     */
    public function configureMysql(
        string $host = '127.0.0.1',
        int|string $port = 3306,
        string $database = 'framex',
        string $username = 'root',
        ?string $password = ''
    ): array {
        return [
            'DB_CONNECTION' => 'mysql',
            'DB_HOST' => $host,
            'DB_PORT' => (string) $port,
            'DB_DATABASE' => $database,
            'DB_USERNAME' => $username,
            'DB_PASSWORD' => (string) ($password ?? ''),
        ];
    }

    /**
     * Build PostgreSQL configuration key-value pairs.
     *
     * @return array<string, string>
     */
    public function configurePgsql(
        string $host = '127.0.0.1',
        int|string $port = 5432,
        string $database = 'framex',
        string $username = 'postgres',
        ?string $password = ''
    ): array {
        return [
            'DB_CONNECTION' => 'pgsql',
            'DB_HOST' => $host,
            'DB_PORT' => (string) $port,
            'DB_DATABASE' => $database,
            'DB_USERNAME' => $username,
            'DB_PASSWORD' => (string) ($password ?? ''),
        ];
    }

    /**
     * Ensure the SQLite database file and its parent directory exist.
     */
    public function ensureSqliteFileExists(string $path): bool
    {
        if ($path === '' || $path === ':memory:') {
            return true;
        }

        $dir = dirname($path);
        if (! is_dir($dir)) {
            if (! mkdir($dir, 0755, true) && ! is_dir($dir)) {
                throw new RuntimeException("Failed to create SQLite directory: [{$dir}]. Please check permissions.");
            }
        }

        if (! file_exists($path)) {
            $created = touch($path);
            if (! $created) {
                throw new RuntimeException("Failed to create SQLite database file at: [{$path}]. Please check permissions.");
            }
        }

        return true;
    }

    /**
     * Verify database connectivity. Returns array with status and sanitized message.
     *
     * @param  array{DB_CONNECTION: string, DB_HOST?: string, DB_PORT?: string, DB_DATABASE: string, DB_USERNAME?: string, DB_PASSWORD?: string}  $config
     * @return array{success: bool, message: string}
     */
    public function testConnection(array $config): array
    {
        $driver = $config['DB_CONNECTION'] ?? 'sqlite';

        try {
            if ($driver === 'sqlite') {
                $path = $config['DB_DATABASE'];
                $this->ensureSqliteFileExists($path);

                $pdo = new PDO('sqlite:'.$path, null, null, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 3,
                ]);
                $pdo->query('SELECT 1');

                return [
                    'success' => true,
                    'message' => "SQLite connection verified successfully at [{$path}].",
                ];
            }

            if ($driver === 'mysql') {
                $host = $config['DB_HOST'] ?? '127.0.0.1';
                $port = $config['DB_PORT'] ?? '3306';
                $database = $config['DB_DATABASE'] ?? 'framex';
                $username = $config['DB_USERNAME'] ?? 'root';
                $password = $config['DB_PASSWORD'] ?? '';

                // Try connecting directly to database
                try {
                    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
                    $pdo = new PDO($dsn, $username, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_TIMEOUT => 4,
                    ]);
                    $pdo->query('SELECT 1');

                    return [
                        'success' => true,
                        'message' => "Connected to MySQL database [{$database}] on [{$host}:{$port}].",
                    ];
                } catch (PDOException $dbNotFoundException) {
                    // If database does not exist (1049), connect to server without database and attempt creation
                    if ($dbNotFoundException->getCode() === 1049 || str_contains($dbNotFoundException->getMessage(), 'Unknown database')) {
                        return $this->createMysqlDatabase($host, $port, $database, $username, $password);
                    }

                    throw $dbNotFoundException;
                }
            }

            if ($driver === 'pgsql') {
                $host = $config['DB_HOST'] ?? '127.0.0.1';
                $port = $config['DB_PORT'] ?? '5432';
                $database = $config['DB_DATABASE'] ?? 'framex';
                $username = $config['DB_USERNAME'] ?? 'postgres';
                $password = $config['DB_PASSWORD'] ?? '';

                try {
                    $dsn = "pgsql:host={$host};port={$port};dbname={$database}";
                    $pdo = new PDO($dsn, $username, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_TIMEOUT => 4,
                    ]);
                    $pdo->query('SELECT 1');

                    return [
                        'success' => true,
                        'message' => "Connected to PostgreSQL database [{$database}] on [{$host}:{$port}].",
                    ];
                } catch (PDOException $pgNotFoundException) {
                    if (str_contains($pgNotFoundException->getMessage(), 'does not exist')) {
                        return $this->createPgsqlDatabase($host, $port, $database, $username, $password);
                    }

                    throw $pgNotFoundException;
                }
            }

            return [
                'success' => false,
                'message' => "Unsupported database driver: [{$driver}].",
            ];
        } catch (PDOException $e) {
            $sanitized = $this->sanitizeErrorMessage($e->getMessage(), $config['DB_PASSWORD'] ?? null);

            return [
                'success' => false,
                'message' => "Database connection failed: {$sanitized}",
            ];
        }
    }

    /**
     * Create MySQL database if it does not exist.
     *
     * @return array{success: bool, message: string}
     */
    protected function createMysqlDatabase(string $host, string|int $port, string $database, string $username, string $password): array
    {
        try {
            $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 4,
            ]);

            // Sanitize identifier
            $quoted = '`'.str_replace('`', '``', $database).'`';
            $pdo->exec("CREATE DATABASE IF NOT EXISTS {$quoted} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            return [
                'success' => true,
                'message' => "Created MySQL database [{$database}] on [{$host}:{$port}].",
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Unable to create MySQL database: '.$this->sanitizeErrorMessage($e->getMessage(), $password),
            ];
        }
    }

    /**
     * Create PostgreSQL database if it does not exist.
     *
     * @return array{success: bool, message: string}
     */
    protected function createPgsqlDatabase(string $host, string|int $port, string $database, string $username, string $password): array
    {
        try {
            $dsn = "pgsql:host={$host};port={$port};dbname=postgres";
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 4,
            ]);

            $quoted = '"'.str_replace('"', '""', $database).'"';
            $pdo->exec("CREATE DATABASE {$quoted}");

            return [
                'success' => true,
                'message' => "Created PostgreSQL database [{$database}] on [{$host}:{$port}].",
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Unable to create PostgreSQL database: '.$this->sanitizeErrorMessage($e->getMessage(), $password),
            ];
        }
    }

    /**
     * Ensure passwords are never leaked in error messages or logs.
     */
    public function sanitizeErrorMessage(string $message, ?string $password): string
    {
        if ($password !== null && $password !== '') {
            $message = str_replace($password, '********', $message);
        }

        // Mask any password= patterns in DSN strings
        return (string) preg_replace('/password=[^;\s&]+/i', 'password=********', $message);
    }
}
