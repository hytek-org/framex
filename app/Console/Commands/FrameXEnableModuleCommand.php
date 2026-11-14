<?php

namespace App\Console\Commands;

use App\FrameX\Core\Registries\ModuleRegistry;
use Illuminate\Console\Command;

class FrameXEnableModuleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:module:enable {id : The ID of the module to enable}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enable a FrameX platform module';

    /**
     * Execute the console command.
     */
    public function handle(ModuleRegistry $registry): int
    {
        $id = $this->argument('id');

        if (! $registry->has($id)) {
            $this->error("FrameX Module [{$id}] is not registered in the platform.");

            return self::FAILURE;
        }

        if ($registry->isEnabled($id)) {
            $this->info("FrameX Module [{$id}] is already enabled.");

            return self::SUCCESS;
        }

        $registry->enable($id);

        $missing = $registry->missingDependencies($id);
        if (! empty($missing)) {
            $this->warn("FrameX Module [{$id}] was enabled, but requires missing or disabled dependencies: [".implode(', ', $missing).'].');
        } else {
            $this->components->info("FrameX Module [{$id}] enabled successfully.");
        }

        return self::SUCCESS;
    }
}
