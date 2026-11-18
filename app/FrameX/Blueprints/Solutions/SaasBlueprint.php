<?php

namespace App\FrameX\Blueprints\Solutions;

use App\FrameX\Blueprints\Contracts\BlueprintInterface;
use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Services\RevisionService;
use App\FrameX\Modules\Forms\Models\Form;
use App\Models\Team;
use App\Models\User;

class SaasBlueprint implements BlueprintInterface
{
    public function id(): string
    {
        return 'saas';
    }

    public function name(): string
    {
        return 'SaaS Application Blueprint';
    }

    public function description(): string
    {
        return 'Subscription SaaS starter with customer onboarding guides, product changelogs, customer feedback loops, and multi-tenant telemetry.';
    }

    public function features(): array
    {
        return [
            'Changelog & Product Release Content Type',
            'Customer Onboarding & Setup Guide',
            'Customer Feedback & Feature Request Form (NPS)',
            'Multi-tenant seat billing presets',
        ];
    }

    public function install(Team $team, User $user): array
    {
        $revisionService = app(RevisionService::class);
        $provisioned = [
            'content_types' => 0,
            'contents' => 0,
            'forms' => 0,
        ];

        // 1. Ensure Changelog Content Type
        $changelogType = ContentType::firstOrCreate(
            ['slug' => 'changelog'],
            [
                'name' => 'Changelog',
                'description' => 'Product release notes and version updates',
                'icon' => 'GitCommit',
                'supports' => ['revisions', 'seo'],
                'is_system' => false,
            ]
        );
        if ($changelogType->wasRecentlyCreated) {
            $provisioned['content_types']++;
        }

        $pageType = ContentType::firstOrCreate(
            ['slug' => 'page'],
            ['name' => 'Page', 'description' => 'Static page', 'icon' => 'FileText', 'is_system' => true]
        );

        // 2. Onboarding Page
        $onboarding = Content::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'workspace-onboarding-guide'],
            [
                'content_type_id' => $pageType->id,
                'author_id' => $user->id,
                'title' => 'Quickstart Guide to Your SaaS Workspace',
                'excerpt' => 'A step-by-step onboarding walkthrough for setting up your organization, inviting teammates, and configuring webhooks.',
                'status' => ContentStatus::Published,
                'published_at' => now(),
            ]
        );
        if ($onboarding->wasRecentlyCreated) {
            $revisionService->createSnapshot($onboarding, [
                'title' => $onboarding->title,
                'excerpt' => $onboarding->excerpt,
                'body_html' => '<h2>Welcome to your organization workspace</h2><p>Here are the 3 immediate steps to configure your subscription and onboard your teammates.</p>',
            ], $user, 'Initial SaaS blueprint provisioning');
            $provisioned['contents']++;
        }

        // 3. Changelog Sample
        $release = Content::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'release-v1-2-telemetry-webhooks'],
            [
                'content_type_id' => $changelogType->id,
                'author_id' => $user->id,
                'title' => 'Release v1.2: Advanced Telemetry & Outbound Webhooks',
                'excerpt' => 'Automate your pipelines with HMAC signed webhooks and granular analytics.',
                'status' => ContentStatus::Published,
                'published_at' => now(),
            ]
        );
        if ($release->wasRecentlyCreated) {
            $revisionService->createSnapshot($release, [
                'title' => $release->title,
                'excerpt' => $release->excerpt,
                'body_html' => '<p>We are thrilled to unveil release v1.2 featuring real-time webhook retries, signed payloads, and team performance metrics.</p>',
            ], $user, 'Initial SaaS blueprint provisioning');
            $provisioned['contents']++;
        }

        // 4. Feedback Form
        $feedbackForm = Form::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'saas-feedback'],
            [
                'name' => 'Customer Feedback & Feature Requests',
                'description' => 'Collect NPS sentiment, bug reports, and product feature ideas directly from users.',
                'fields' => [
                    [
                        'name' => 'nps_score',
                        'label' => 'How likely are you to recommend us to a colleague?',
                        'type' => 'select',
                        'required' => true,
                        'options' => ['10 - Extremely Likely', '8 - Likely', '6 - Neutral', '3 - Unlikely'],
                    ],
                    ['name' => 'feature_request', 'label' => 'What feature should we build next?', 'type' => 'text', 'required' => false],
                    ['name' => 'general_comments', 'label' => 'Additional feedback or impressions', 'type' => 'textarea', 'required' => true],
                ],
                'submit_button_text' => 'Send Feedback',
                'success_message' => 'Thank you for your valuable feedback! Our product team reviews all submissions weekly.',
                'is_active' => true,
                'notify_team' => true,
            ]
        );
        if ($feedbackForm->wasRecentlyCreated) {
            $provisioned['forms']++;
        }

        return $provisioned;
    }
}
