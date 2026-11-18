<?php

namespace App\FrameX\Installation;

use RuntimeException;

class EnvironmentManager
{
    protected string $envPath;

    protected string $examplePath;

    /**
     * @var array<string, string>
     */
    protected array $variables = [];

    /**
     * Original lines from the .env file to preserve comments and structure.
     *
     * @var array<int, string>
     */
    protected array $lines = [];

    public function __construct(?string $envPath = null, ?string $examplePath = null)
    {
        $this->envPath = $envPath ?: base_path('.env');
        $this->examplePath = $examplePath ?: base_path('.env.example');

        $this->load();
    }

    /**
     * Ensure the .env file exists, copying from .env.example if missing.
     */
    public function ensureEnvFileExists(): bool
    {
        if (file_exists($this->envPath)) {
            return true;
        }

        if (file_exists($this->examplePath)) {
            $copied = copy($this->examplePath, $this->envPath);
            if ($copied) {
                $this->load();

                return true;
            }
        }

        // If no example file, create an empty .env
        $created = file_put_contents($this->envPath, '') !== false;
        if ($created) {
            $this->load();
        }

        return $created;
    }

    /**
     * Load the environment file and parse variables while preserving line layout.
     */
    public function load(): self
    {
        $this->variables = [];
        $this->lines = [];

        if (! file_exists($this->envPath)) {
            return $this;
        }

        $raw = file_get_contents($this->envPath);
        if ($raw === false) {
            return $this;
        }

        $lines = preg_split("/\r\n|\n|\r/", $raw);
        $this->lines = $lines !== false ? $lines : [];

        foreach ($this->lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || str_starts_with($trimmed, '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = $this->stripQuotes(trim($value));
                if ($key !== '') {
                    $this->variables[$key] = $value;
                }
            }
        }

        return $this;
    }

    /**
     * Check if a key exists in the .env file.
     */
    public function has(string $key): bool
    {
        return array_key_exists($key, $this->variables);
    }

    /**
     * Get a value from the .env file.
     */
    public function get(string $key, ?string $default = null): ?string
    {
        return $this->variables[$key] ?? $default;
    }

    /**
     * Set a key-value pair in memory.
     */
    public function set(string $key, mixed $value): self
    {
        $this->variables[$key] = (string) $this->normalizeValue($value);

        return $this;
    }

    /**
     * Set multiple key-value pairs at once.
     *
     * @param  array<string, mixed>  $pairs
     */
    public function setMany(array $pairs): self
    {
        foreach ($pairs as $key => $value) {
            $this->set($key, $value);
        }

        return $this;
    }

    /**
     * Commit changes to the .env file while preserving comments and structure.
     */
    public function save(): bool
    {
        $keysToUpdate = $this->variables;
        $newLines = [];

        foreach ($this->lines as $line) {
            $trimmed = trim($line);

            // Handle commented out keys, e.g. "# DB_HOST=127.0.0.1"
            if (str_starts_with($trimmed, '#')) {
                $uncommented = trim(substr($trimmed, 1));
                if (str_contains($uncommented, '=')) {
                    [$commentKey] = explode('=', $uncommented, 2);
                    $commentKey = trim($commentKey);
                    if (array_key_exists($commentKey, $keysToUpdate)) {
                        $newLines[] = $this->formatLine($commentKey, $keysToUpdate[$commentKey]);
                        unset($keysToUpdate[$commentKey]);

                        continue;
                    }
                }

                $newLines[] = $line;

                continue;
            }

            // Normal active keys
            if (str_contains($line, '=')) {
                [$activeKey] = explode('=', $line, 2);
                $activeKey = trim($activeKey);
                if (array_key_exists($activeKey, $keysToUpdate)) {
                    $newLines[] = $this->formatLine($activeKey, $keysToUpdate[$activeKey]);
                    unset($keysToUpdate[$activeKey]);

                    continue;
                }
            }

            $newLines[] = $line;
        }

        // Append any remaining new keys that were not already in the file
        if (! empty($keysToUpdate)) {
            // Add a separating blank line if the file does not end with one
            if (! empty($newLines) && trim(end($newLines)) !== '') {
                $newLines[] = '';
            }

            foreach ($keysToUpdate as $key => $value) {
                $newLines[] = $this->formatLine($key, $value);
            }
        }

        $content = implode(PHP_EOL, $newLines).PHP_EOL;

        $dir = dirname($this->envPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $written = file_put_contents($this->envPath, $content);
        if ($written === false) {
            throw new RuntimeException("Unable to write to environment file: [{$this->envPath}]. Check file permissions.");
        }

        $this->lines = $newLines;

        return true;
    }

    /**
     * Format a key and value into an .env compliant line.
     */
    public function formatLine(string $key, mixed $value): string
    {
        $normalized = $this->normalizeValue($value);

        if ($normalized === '') {
            return "{$key}=";
        }

        // Wrap in quotes if it contains spaces, quotes, hash, or dollar sign
        if (
            str_contains($normalized, ' ') ||
            str_contains($normalized, '#') ||
            str_contains($normalized, '"') ||
            str_contains($normalized, "'") ||
            (str_contains($normalized, '$') && ! str_contains($normalized, '${'))
        ) {
            $escaped = str_replace('"', '\"', $normalized);

            return "{$key}=\"{$escaped}\"";
        }

        return "{$key}={$normalized}";
    }

    /**
     * Normalize mixed value into string representation.
     */
    protected function normalizeValue(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if ($value === null) {
            return '';
        }

        return (string) $value;
    }

    /**
     * Strip enclosing quotes from parsed values.
     */
    protected function stripQuotes(string $value): string
    {
        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            return substr($value, 1, -1);
        }

        return $value;
    }

    /**
     * Get all currently loaded variables.
     *
     * @return array<string, string>
     */
    public function all(): array
    {
        return $this->variables;
    }
}
