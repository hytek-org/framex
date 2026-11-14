<?php

namespace App\Console\Commands;

use App\FrameX\Core\Registries\ModuleRegistry;
use Illuminate\Console\Command;

class FrameXListModulesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:modules:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all registered FrameX platform modules and their status';

    /**
     * Execute the console command.
     */
    public function handle(ModuleRegistry $registry): int
    {
        $report = $registry->healthCheck();

        if (empty($report)) {
            $this->warn('No FrameX modules are registered in the platform.');

            return self::SUCCESS;
        }

        $rows = [];
        $enabledCount = 0;
        $disabledCount = 0;

        foreach ($report as $id => $info) {
            $status = $info['enabled'] ? '<fg=green>Enabled</>' : '<fg=yellow>Disabled</>';
            if ($info['enabled']) {
                $enabledCount++;
            } else {
                $disabledCount++;
            }

            $health = $info['healthy']
                ? '<fg=green>Healthy</>'
                : '<fg=red>Missing: '.implode(', ', $info['missing_dependencies']).'</>';

            $dependencies = empty($info['dependencies'])
                ? '<fg=gray>None</>'
                : implode(', ', $info['dependencies']);

            $rows[] = [
                $id,
                $info['name'],
                $info['version'],
                $status,
                $health,
                $dependencies,
            ];
        }

        $this->table(
            ['Module ID', 'Name', 'Version', 'Status', 'Health', 'Dependencies'],
            $rows
        );

        $total = count($report);
        $this->line("<fg=cyan>Summary:</> {$total} registered module(s) ({$enabledCount} enabled, {$disabledCount} disabled).");

        return self::SUCCESS;
    }
}
