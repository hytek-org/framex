<?php

namespace App\FrameX\Blueprints\Solutions;

use App\FrameX\Blueprints\Contracts\BlueprintInterface;
use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Services\RevisionService;
use App\FrameX\Modules\Forms\Models\Form;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Str;

class PublishingBlueprint implements BlueprintInterface
{
    public function id(): string
    {
        return 'publishing';
    }

    public function name(): string
    {
        return 'Publishing Platform Blueprint';
    }

    public function description(): string
    {
        return 'Multi-author digital magazine and publishing studio with curated category hubs, editorial review workflows, and high-conversion newsletter capture.';
    }

    public function features(): array
    {
        return [
            'Editorial taxonomy hubs: Technology, Architecture, Product Design',
            'Multi-author bylines and review workflows',
            'High-converting Newsletter subscription form',
            'Rich media and automated revision tracking',
        ];
    }

    public function install(Team $team, User $user): array
    {
        $revisionService = app(RevisionService::class);
        $provisioned = [
            'content_types' => 0,
            'categories' => 0,
            'tags' => 0,
            'contents' => 0,
            'forms' => 0,
        ];

        // 1. Ensure Post Content Type
        $postType = ContentType::firstOrCreate(
            ['slug' => 'post'],
            ['name' => 'Post', 'description' => 'Blog article', 'icon' => 'Newspaper', 'is_system' => true]
        );

        // 2. Categories
        $categories = [
            'Technology' => 'Deep-dive explorations into engineering paradigms and developer tools.',
            'Architecture' => 'Modular architectures, cloud patterns, and system scalability.',
            'Product Design' => 'Design systems, user experience heuristics, and ergonomics.',
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

        // 3. Tags
        $tags = ['Laravel', 'TypeScript', 'Performance', 'InertiaJS'];
        $tagModels = [];
        foreach ($tags as $tagName) {
            $tag = Tag::firstOrCreate(
                ['slug' => Str::slug($tagName)],
                ['name' => $tagName]
            );
            if ($tag->wasRecentlyCreated) {
                $provisioned['tags']++;
            }
            $tagModels[] = $tag->id;
        }

        // 4. Sample Articles
        $article1 = Content::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'the-future-of-modular-monoliths'],
            [
                'content_type_id' => $postType->id,
                'category_id' => $categoryModels['Architecture']->id,
                'author_id' => $user->id,
                'title' => 'The Future of Modular Monoliths in Modern Web Development',
                'excerpt' => 'Why ambitious product teams are turning back from microservice fatigue to well-structured modular monoliths.',
                'status' => ContentStatus::Published,
                'published_at' => now(),
            ]
        );
        if ($article1->wasRecentlyCreated) {
            $revisionService->createSnapshot($article1, [
                'title' => $article1->title,
                'excerpt' => $article1->excerpt,
                'body_html' => '<h2>Rethinking Application Boundaries</h2><p>Modular monoliths offer single-deployment simplicity while keeping strict boundaries between core domains.</p>',
            ], $user, 'Initial publishing blueprint provisioning');
            $article1->tags()->sync($tagModels);
            $provisioned['contents']++;
        }

        $article2 = Content::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'designing-accessible-web-interfaces'],
            [
                'content_type_id' => $postType->id,
                'category_id' => $categoryModels['Product Design']->id,
                'author_id' => $user->id,
                'title' => 'Designing Accessible and Beautiful Web Interfaces',
                'excerpt' => 'A guide to contrast, keyboard navigability, and semantic HTML for high-velocity teams.',
                'status' => ContentStatus::InReview,
            ]
        );
        if ($article2->wasRecentlyCreated) {
            $revisionService->createSnapshot($article2, [
                'title' => $article2->title,
                'excerpt' => $article2->excerpt,
                'body_html' => '<p>Accessibility is not a checklist item at the end of a sprint—it is a foundational principle of great interface design.</p>',
            ], $user, 'Initial publishing blueprint provisioning');
            $article2->tags()->sync([$tagModels[1] ?? $tagModels[0]]);
            $provisioned['contents']++;
        }

        // 5. Newsletter Form
        $newsletterForm = Form::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'newsletter-subscription'],
            [
                'name' => 'Weekly Publishing Digest',
                'description' => 'Receive the best articles, tutorials, and engineering case studies weekly.',
                'fields' => [
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'required' => true],
                    [
                        'name' => 'frequency',
                        'label' => 'Digest Frequency',
                        'type' => 'select',
                        'required' => false,
                        'options' => ['Weekly Summary', 'Monthly Recap'],
                    ],
                ],
                'submit_button_text' => 'Subscribe to Digest',
                'success_message' => 'You are now subscribed to our weekly publishing digest!',
                'is_active' => true,
                'notify_team' => false,
            ]
        );
        if ($newsletterForm->wasRecentlyCreated) {
            $provisioned['forms']++;
        }

        return $provisioned;
    }
}
