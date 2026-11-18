<?php

namespace App\Console\Commands;

use App\FrameX\Blueprints\BlueprintRegistry;
use Illuminate\Console\Command;

class FrameXListBlueprintsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:blueprint:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all available FrameX application solution blueprints';

    /**
     * Execute the console command.
     */
    public function handle(BlueprintRegistry $registry): int
    {
        $blueprints = $registry->all();

        if (empty($blueprints)) {
            $this->warn('No application blueprints are registered.');

            return self::SUCCESS;
        }

        $rows = [];
        foreach ($blueprints as $blueprint) {
            $features = implode("\n• ", array_map(fn ($f) => "- {$f}", $blueprint->features()));
            $rows[] = [
                $blueprint->id(),
                $blueprint->name(),
                $blueprint->description(),
            ];
        }

        $this->table(['Blueprint ID', 'Solution Name', 'Description'], $rows);
        $this->line('');
        $this->line('<fg=cyan>Tip:</> Install any blueprint into your workspace using:');
        $this->line('  <fg=yellow>php artisan framex:blueprint:install <blueprint-id></>');
        $this->line('');

        return self::SUCCESS;
    }
}
