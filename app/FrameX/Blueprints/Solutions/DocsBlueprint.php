<?php

namespace App\FrameX\Blueprints\Solutions;

use App\FrameX\Blueprints\Contracts\BlueprintInterface;
use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Services\RevisionService;
use App\FrameX\Modules\Forms\Models\Form;
use App\Models\Category;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Str;

class DocsBlueprint implements BlueprintInterface
{
    public function id(): string
    {
        return 'docs';
    }

    public function name(): string
    {
        return 'Knowledge Base & Documentation Hub';
    }

    public function description(): string
    {
        return 'Structured product documentation and support knowledge base with categorized guides, API reference, and helpfulness feedback loops.';
    }

    public function features(): array
    {
        return [
            'Doc Content Type with structured documentation taxonomy',
            'Categorized Guide Hubs: Getting Started, Architecture, API Reference',
            'Documentation Helpfulness & Feedback rating form',
            'Ready-to-use public documentation viewer',
        ];
    }

    public function install(Team $team, User $user): array
    {
        $revisionService = app(RevisionService::class);
        $provisioned = [
            'content_types' => 0,
            'categories' => 0,
            'contents' => 0,
            'forms' => 0,
        ];

        // 1. Ensure Doc Content Type
        $docType = ContentType::firstOrCreate(
            ['slug' => 'doc'],
            [
                'name' => 'Documentation',
                'description' => 'Technical documentation guide or API reference',
                'icon' => 'BookOpen',
                'supports' => ['revisions', 'taxonomies', 'seo'],
                'is_system' => true,
            ]
        );
        if ($docType->wasRecentlyCreated) {
            $provisioned['content_types']++;
        }

        // 2. Categories
        $categories = [
            'Getting Started' => 'Step-by-step setup guides, installation instructions, and quickstart examples.',
            'Core Concepts' => 'Deep dive into fundamental abstractions, architecture, and module patterns.',
            'API Reference' => 'Endpoint documentation, authentication tokens, and request/response specifications.',
        ];

        $categoryModels = [];
        foreach ($categories as $catName => $desc) {
            $cat = Category::firstOrCreate(
                ['slug' => Str::slug($catName)],
                ['name' => $catName, 'description' => $desc]
            );
            if ($cat->wasRecentlyCreated) {
                $provisioned['categories']++;
            }
            $categoryModels[$catName] = $cat;
        }

        // 3. Documentation Articles
        $articles = [
            [
                'title' => 'Quickstart Installation and Environment Setup',
                'slug' => 'quickstart-installation-setup',
                'cat' => 'Getting Started',
                'excerpt' => 'Get up and running with FrameX in less than 5 minutes using Composer and modern presets.',
                'body' => '<h2>Prerequisites</h2><p>Ensure you have PHP 8.4+ and Node.js 20+ installed on your local environment.</p><code>composer install && npm install</code>',
            ],
            [
                'title' => 'Understanding the 4-Layer Modular Monolith',
                'slug' => 'understanding-modular-monolith',
                'cat' => 'Core Concepts',
                'excerpt' => 'An architectural overview of how Layer 1 (Foundation), Layer 2 (Core), Layer 3 (Modules), and Layer 4 (Applications) work together.',
                'body' => '<h2>Architectural Philosophy</h2><p>FrameX separates application concerns into clean, verifiable layers while keeping single-process deployment simplicity.</p>',
            ],
            [
                'title' => 'Authentication and Scoped API Tokens',
                'slug' => 'authentication-and-api-tokens',
                'cat' => 'API Reference',
                'excerpt' => 'How to generate and verify team-scoped personal access tokens with fine-grained capability scopes.',
                'body' => '<h2>Bearer Token Authorization</h2><p>Pass your token in the standard HTTP header:</p><code>Authorization: Bearer framex_...</code>',
            ],
        ];

        foreach ($articles as $art) {
            $doc = Content::firstOrCreate(
                ['team_id' => $team->id, 'slug' => $art['slug']],
                [
                    'content_type_id' => $docType->id,
                    'category_id' => $categoryModels[$art['cat']]->id,
                    'author_id' => $user->id,
                    'title' => $art['title'],
                    'excerpt' => $art['excerpt'],
                    'status' => ContentStatus::Published,
                    'published_at' => now(),
                ]
            );

            if ($doc->wasRecentlyCreated) {
                $revisionService->createSnapshot($doc, [
                    'title' => $doc->title,
                    'excerpt' => $doc->excerpt,
                    'body_html' => $art['body'],
                ], $user, 'Initial documentation blueprint provisioning');
                $provisioned['contents']++;
            }
        }

        // 4. Docs Feedback Form
        $feedbackForm = Form::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'doc-feedback'],
            [
                'name' => 'Documentation Article Feedback',
                'description' => 'Was this documentation article helpful? Help us improve our developer resources.',
                'fields' => [
                    ['name' => 'article_slug', 'label' => 'Article Slug', 'type' => 'text', 'required' => true],
                    [
                        'name' => 'was_helpful',
                        'label' => 'Did this page help you?',
                        'type' => 'select',
                        'required' => true,
                        'options' => ['Yes, completely', 'Somewhat', 'No, missing details'],
                    ],
                    ['name' => 'suggestions', 'label' => 'How can we improve this guide?', 'type' => 'textarea', 'required' => false],
                ],
                'submit_button_text' => 'Submit Feedback',
                'success_message' => 'Thank you for helping us improve our documentation!',
                'is_active' => true,
                'notify_team' => false,
            ]
        );
        if ($feedbackForm->wasRecentlyCreated) {
            $provisioned['forms']++;
        }

        return $provisioned;
    }
}
