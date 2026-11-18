<?php

namespace App\FrameX\Installation;

use Illuminate\Support\Facades\Schema;

class InstallationState
{
    protected string $stateFile;

    public function __construct(?string $stateFile = null)
    {
        $this->stateFile = $stateFile ?: (function_exists('storage_path') ? storage_path('framework/framex-installed.json') : '');
    }

    /**
     * Determine if FrameX has already completed its initial installation.
     */
    public function isInstalled(): bool
    {
        if ($this->stateFile !== '' && file_exists($this->stateFile)) {
            return true;
        }

        // Heuristic fallback: check if APP_KEY is populated and users table exists
        $appKey = config('app.key');
        if (is_string($appKey) && trim($appKey) !== '') {
            try {
                if (Schema::hasTable('users') && Schema::hasTable('teams')) {
                    return true;
                }
            } catch (\Throwable) {
                // Database not initialized yet
                return false;
            }
        }

        return false;
    }

    /**
     * Mark installation as completed and persist metadata.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function markInstalled(array $metadata = []): void
    {
        if ($this->stateFile === '') {
            return;
        }

        $dir = dirname($this->stateFile);
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        $payload = array_merge([
            'version' => '1.0.0',
            'installed_at' => now()->toIso8601String(),
            'platform' => PHP_OS_FAMILY,
            'php_version' => PHP_VERSION,
        ], $metadata);

        @file_put_contents($this->stateFile, json_encode($payload, JSON_PRETTY_PRINT));
    }

    /**
     * Retrieve installation metadata.
     *
     * @return array<string, mixed>|null
     */
    public function getMetadata(): ?array
    {
        if ($this->stateFile === '' || ! file_exists($this->stateFile)) {
            return null;
        }

        $raw = @file_get_contents($this->stateFile);
        if ($raw) {
            $data = json_decode($raw, true);
            if (is_array($data)) {
                return $data;
            }
        }

        return null;
    }

    /**
     * Reset installation marker (useful for testing or re-running setup).
     */
    public function reset(): void
    {
        if ($this->stateFile !== '' && file_exists($this->stateFile)) {
            @unlink($this->stateFile);
        }
    }
}
