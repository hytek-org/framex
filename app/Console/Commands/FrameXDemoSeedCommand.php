<?php

namespace App\Console\Commands;

use App\FrameX\Blueprints\BlueprintRegistry;
use App\FrameX\Modules\Analytics\Models\ContentView;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use App\FrameX\Modules\Webhooks\Models\WebhookEndpoint;
use App\Models\Team;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class FrameXDemoSeedCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:demo:seed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed a rich, end-to-end interactive demo workspace showcasing all FrameX capabilities';

    /**
     * Execute the console command.
     */
    public function handle(BlueprintRegistry $blueprints): int
    {
        $this->components->info('Seeding FrameX Interactive Showcase & Demo Workspace...');

        // 1. Demo User
        $user = User::firstOrCreate(
            ['email' => 'demo@framex.dev'],
            [
                'name' => 'FrameX Platform Lead',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Demo Team
        $team = Team::firstOrCreate(
            ['slug' => 'framex-demo'],
            [
                'name' => 'FrameX Showcase Workspace',
                'is_personal' => false,
            ]
        );

        // Attach user as team admin if not attached
        if (! $user->teams()->where('team_id', $team->id)->exists()) {
            $user->teams()->attach($team->id, ['role' => 'admin']);
        }
        $user->current_team_id = $team->id;
        $user->save();

        // 3. Install Blueprints
        $this->line('  • Provisioning Documentation Hub blueprint...');
        if ($docsBp = $blueprints->get('docs')) {
            $docsBp->install($team, $user);
        }

        $this->line('  • Provisioning Corporate Website blueprint...');
        if ($corpBp = $blueprints->get('corporate')) {
            $corpBp->install($team, $user);
        }

        $this->line('  • Provisioning Publishing Platform blueprint...');
        if ($pubBp = $blueprints->get('publishing')) {
            $pubBp->install($team, $user);
        }

        // 4. Seed Form Submissions
        $this->line('  • Generating sample lead and subscriber submissions...');
        $leadForm = Form::where('team_id', $team->id)->where('slug', 'contact-quote')->first();
        if ($leadForm) {
            FormSubmission::firstOrCreate(
                ['form_id' => $leadForm->id, 'team_id' => $team->id, 'ip_address' => '127.0.0.1'],
                [
                    'data' => [
                        'full_name' => 'Jordan Vance',
                        'email' => 'jvance@acmecorp.com',
                        'company' => 'Acme Corporation',
                        'budget' => '$25,000 - $75,000',
                        'message' => 'We are looking to migrate our internal CMS to the FrameX modular platform.',
                    ],
                    'is_spam' => false,
                    'created_at' => now()->subHours(4),
                ]
            );
        }

        // 5. Seed Webhook Endpoint
        $this->line('  • Setting up outbound webhook endpoints...');
        WebhookEndpoint::firstOrCreate(
            ['team_id' => $team->id, 'url' => 'https://api.acmecorp.com/webhooks/framex'],
            [
                'secret' => 'whsec_demo_secret_key_12345',
                'events' => ['content.published', 'form.submitted'],
                'is_active' => true,
            ]
        );

        // 6. Seed Telemetry Views
        $this->line('  • Generating analytics view telemetry...');
        $sampleContents = Content::where('team_id', $team->id)->limit(3)->get();
        $today = now()->toDateString();
        $ipHash = hash('sha256', 'sample_ip_1');
        foreach ($sampleContents as $content) {
            $existing = ContentView::where('content_id', $content->id)
                ->where('ip_hash', $ipHash)
                ->whereDate('view_date', $today)
                ->first();

            if (! $existing) {
                ContentView::create([
                    'content_id' => $content->id,
                    'view_date' => $today,
                    'ip_hash' => $ipHash,
                    'team_id' => $team->id,
                    'referrer' => 'https://twitter.com',
                    'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    'view_count' => 12,
                ]);
            }
        }

        $this->line('');
        $this->components->info('FrameX Showcase Workspace successfully seeded!');
        $this->line('');
        $this->line('<fg=cyan>Access Details:</>');
        $this->line('  <fg=gray>Workspace URL:</>  <fg=white>/framex-demo/dashboard</>');
        $this->line('  <fg=gray>Public Docs:</>    <fg=white>/docs</>');
        $this->line('  <fg=gray>Demo Email:</>     <fg=yellow>demo@framex.dev</>');
        $this->line('  <fg=gray>Password:</>       <fg=yellow>password123</>');
        $this->line('');

        return self::SUCCESS;
    }
}
