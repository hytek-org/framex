<?php

namespace App\Console\Commands;

use App\FrameX\Blueprints\BlueprintRegistry;
use App\Models\Team;
use App\Models\User;
use Illuminate\Console\Command;

class FrameXInstallBlueprintCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:blueprint:install 
                            {preset : The blueprint preset ID (corporate, publishing, saas, docs)}
                            {--team= : The ID or slug of the target team}
                            {--user= : The ID or email of the authoring user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install and provision a FrameX application blueprint into a workspace';

    /**
     * Execute the console command.
     */
    public function handle(BlueprintRegistry $registry): int
    {
        $preset = $this->argument('preset');
        $blueprint = $registry->get($preset);

        if (! $blueprint) {
            $available = implode(', ', array_keys($registry->all()));
            $this->error("Blueprint [{$preset}] not found. Available blueprints: [{$available}].");

            return self::FAILURE;
        }

        // 1. Resolve Team
        $teamIdentifier = $this->option('team');
        $team = null;

        if ($teamIdentifier) {
            $team = is_numeric($teamIdentifier)
                ? Team::find($teamIdentifier)
                : Team::where('slug', $teamIdentifier)->first();
        } else {
            $team = Team::first();
        }

        if (! $team) {
            $this->error('No valid target team found. Please specify --team= or ensure a team exists.');

            return self::FAILURE;
        }

        // 2. Resolve User
        $userIdentifier = $this->option('user');
        $user = null;

        if ($userIdentifier) {
            $user = is_numeric($userIdentifier)
                ? User::find($userIdentifier)
                : User::where('email', $userIdentifier)->first();
        } else {
            $user = $team->owner ?? User::first();
        }

        if (! $user) {
            $this->error('No authoring user found. Please specify --user= or create a user first.');

            return self::FAILURE;
        }

        $this->info("Installing [{$blueprint->name()}] for team [{$team->name}]...");

        $stats = $blueprint->install($team, $user);

        $this->info("Blueprint [{$blueprint->name()}] successfully installed!");

        $rows = [];
        foreach ($stats as $entity => $count) {
            $rows[] = [ucwords(str_replace('_', ' ', $entity)), $count];
        }

        $this->table(['Provisioned Entity', 'Count Added'], $rows);

        return self::SUCCESS;
    }
}
