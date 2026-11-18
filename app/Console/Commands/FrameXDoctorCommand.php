<?php

namespace App\Console\Commands;

use App\FrameX\Blueprints\BlueprintRegistry;
use App\FrameX\Core\Registries\ModuleRegistry;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FrameXDoctorCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:doctor';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Perform diagnostic health inspection on the FrameX application platform';

    /**
     * Execute the console command.
     */
    public function handle(ModuleRegistry $modules, BlueprintRegistry $blueprints): int
    {
        $this->components->info('FrameX Platform Health & Diagnostics (Doctor)');
        $this->line('');

        $issues = 0;
        $checks = [];

        // 1. PHP Version
        $phpVersion = PHP_VERSION;
        $phpPass = version_compare($phpVersion, '8.2.0', '>=');
        $checks[] = [
            'Environment',
            'PHP Version (>= 8.2)',
            $phpPass ? "<fg=green>PASS ({$phpVersion})</>" : "<fg=red>FAIL ({$phpVersion})</>",
        ];
        if (! $phpPass) {
            $issues++;
        }

        // 2. Required PHP Extensions
        $requiredExtensions = ['pdo', 'mbstring', 'openssl', 'tokenizer', 'xml', 'ctype', 'curl'];
        $missingExtensions = [];
        foreach ($requiredExtensions as $ext) {
            if (! extension_loaded($ext)) {
                $missingExtensions[] = $ext;
            }
        }
        $extPass = empty($missingExtensions);
        $checks[] = [
            'Environment',
            'Required PHP Extensions',
            $extPass ? '<fg=green>PASS</>' : '<fg=red>MISSING: '.implode(', ', $missingExtensions).'</>',
        ];
        if (! $extPass) {
            $issues++;
        }

        // 3. Database Connection
        $dbPass = false;
        $dbDriver = config('database.default');
        try {
            DB::connection()->getPdo();
            $dbPass = true;
            $dbMsg = "<fg=green>CONNECTED ({$dbDriver})</>";
        } catch (Exception $e) {
            $dbMsg = "<fg=red>ERROR: {$e->getMessage()}</>";
            $issues++;
        }
        $checks[] = ['Database', 'Connection Status', $dbMsg];

        // 4. Storage Directory Permissions
        $storageWritable = $this->isPathWritable(storage_path());
        $cacheWritable = $this->isPathWritable(base_path('bootstrap/cache'));
        $permPass = $storageWritable && $cacheWritable;
        $checks[] = [
            'Filesystem',
            'Storage & Cache Writable',
            $permPass ? '<fg=green>PASS</>' : '<fg=red>FAIL (Check storage/ and bootstrap/cache permissions)</>',
        ];
        if (! $permPass) {
            $issues++;
        }

        // 5. FrameX Modules Health
        $moduleReport = $modules->healthCheck();
        $unhealthyModules = [];
        foreach ($moduleReport as $id => $info) {
            if (! $info['healthy']) {
                $unhealthyModules[] = $id;
            }
        }
        $modulesPass = empty($unhealthyModules);
        $checks[] = [
            'Platform Core',
            'FrameX Modules Status',
            $modulesPass
                ? '<fg=green>HEALTHY ('.count($moduleReport).' registered)</>'
                : '<fg=red>UNHEALTHY: '.implode(', ', $unhealthyModules).'</>',
        ];
        if (! $modulesPass) {
            $issues++;
        }

        // 6. Application Blueprints Status
        $allBlueprints = $blueprints->all();
        $blueprintsPass = count($allBlueprints) >= 4;
        $checks[] = [
            'Blueprints',
            'Registered Blueprints',
            $blueprintsPass
                ? '<fg=green>READY ('.count($allBlueprints).' blueprints)</>'
                : '<fg=yellow>WARNING ('.count($allBlueprints).' blueprints)</>',
        ];

        // Render Table
        $this->table(['Category', 'Diagnostic Check', 'Result'], $checks);

        $this->line('');
        if ($issues === 0) {
            $this->components->info('All system checks passed! Your FrameX platform is healthy and ready.');

            return self::SUCCESS;
        }

        $this->components->warn("Diagnostic inspection completed with {$issues} issue(s) detected. Please review the report above.");

        return self::FAILURE;
    }

    /**
     * Determine if a directory path is writable in a cross-platform reliable way.
     */
    protected function isPathWritable(string $path): bool
    {
        if (is_writable($path)) {
            return true;
        }

        if (! is_dir($path)) {
            return false;
        }

        $testFile = rtrim($path, '/\\').DIRECTORY_SEPARATOR.'.framex_perm_check_'.bin2hex(random_bytes(4));
        $written = @file_put_contents($testFile, 'test');
        if ($written !== false) {
            @unlink($testFile);

            return true;
        }

        return false;
    }
}
