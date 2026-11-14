<?php

namespace App\Console\Commands;

use App\FrameX\Core\Registries\ModuleRegistry;
use Exception;
use Illuminate\Console\Command;

class FrameXDisableModuleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:module:disable {id : The ID of the module to disable}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Disable a FrameX platform module';

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

        if (! $registry->isEnabled($id)) {
            $this->info("FrameX Module [{$id}] is already disabled.");

            return self::SUCCESS;
        }

        try {
            $registry->disable($id);
            $this->components->info("FrameX Module [{$id}] disabled successfully.");

            return self::SUCCESS;
        } catch (Exception $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
