<?php

namespace App\Console\Commands;

use App\FrameX\Modules\ContentStudio\Services\PublishingWorkflowService;
use Illuminate\Console\Command;

class PublishScheduledContent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'content:publish-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish all content scheduled for release up to the current timestamp';

    /**
     * Execute the console command.
     */
    public function handle(PublishingWorkflowService $workflowService): int
    {
        $this->info('Checking for scheduled content ready to be published...');

        $publishedCount = $workflowService->publishScheduled();

        $this->info("Successfully published {$publishedCount} scheduled content item(s).");

        return self::SUCCESS;
    }
}
