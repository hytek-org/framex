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

class CorporateBlueprint implements BlueprintInterface
{
    public function id(): string
    {
        return 'corporate';
    }

    public function name(): string
    {
        return 'Corporate Website Blueprint';
    }

    public function description(): string
    {
        return 'Multi-page corporate website with company overview, services catalog, leadership team, case studies, and integrated quote request form.';
    }

    public function features(): array
    {
        return [
            'Multi-page marketing architecture: Home, About, Services, Case Studies',
            'Service Content Type with custom metadata',
            'Pre-configured Categories: Case Studies, Corporate News',
            'Dynamic Lead Capture Form: Contact & Request Quote',
            'SEO presets and sitemap indexing',
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

        // 1. Ensure Content Types
        $serviceType = ContentType::firstOrCreate(
            ['slug' => 'service'],
            [
                'name' => 'Service',
                'description' => 'Corporate service or solution offering',
                'icon' => 'Briefcase',
                'supports' => ['revisions', 'seo', 'media'],
                'is_system' => false,
            ]
        );
        if ($serviceType->wasRecentlyCreated) {
            $provisioned['content_types']++;
        }

        $pageType = ContentType::firstOrCreate(
            ['slug' => 'page'],
            ['name' => 'Page', 'description' => 'Static page', 'icon' => 'FileText', 'is_system' => true]
        );

        $postType = ContentType::firstOrCreate(
            ['slug' => 'post'],
            ['name' => 'Post', 'description' => 'Blog article', 'icon' => 'Newspaper', 'is_system' => true]
        );

        // 2. Categories
        $catCaseStudies = Category::firstOrCreate(
            ['slug' => 'case-studies'],
            ['name' => 'Case Studies', 'description' => 'Client success stories and implementations']
        );
        if ($catCaseStudies->wasRecentlyCreated) {
            $provisioned['categories']++;
        }

        $catNews = Category::firstOrCreate(
            ['slug' => 'corporate-news'],
            ['name' => 'Corporate News', 'description' => 'Company announcements and press releases']
        );
        if ($catNews->wasRecentlyCreated) {
            $provisioned['categories']++;
        }

        // 3. Sample Contents
        // About Us Page
        $about = Content::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'about-our-company'],
            [
                'content_type_id' => $pageType->id,
                'author_id' => $user->id,
                'title' => 'About Our Company & Leadership',
                'excerpt' => 'Learn about our mission, leadership, and track record in delivering enterprise software.',
                'status' => ContentStatus::Published,
                'published_at' => now(),
            ]
        );
        if ($about->wasRecentlyCreated) {
            $revisionService->createSnapshot($about, [
                'title' => $about->title,
                'excerpt' => $about->excerpt,
                'body_html' => '<p>Founded with a focus on engineering excellence, our company provides next-generation cloud and web solutions.</p>',
                'body_json' => ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Founded with a focus on engineering excellence.']]]]],
            ], $user, 'Initial corporate blueprint provisioning');
            $provisioned['contents']++;
        }

        // Cloud Migration Service
        $service = Content::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'cloud-architecture-consulting'],
            [
                'content_type_id' => $serviceType->id,
                'author_id' => $user->id,
                'title' => 'Cloud Architecture & Migration Consulting',
                'excerpt' => 'Modernize your digital infrastructure with zero downtime and cloud-native resilience.',
                'status' => ContentStatus::Published,
                'published_at' => now(),
            ]
        );
        if ($service->wasRecentlyCreated) {
            $revisionService->createSnapshot($service, [
                'title' => $service->title,
                'excerpt' => $service->excerpt,
                'body_html' => '<p>Our certified architects guide your modernization journey from legacy monoliths to scalable clouds.</p>',
            ], $user, 'Initial corporate blueprint provisioning');
            $provisioned['contents']++;
        }

        // 4. Form
        $form = Form::firstOrCreate(
            ['team_id' => $team->id, 'slug' => 'contact-quote'],
            [
                'name' => 'Contact & Request Quote',
                'description' => 'Corporate lead generation and proposal request form.',
                'fields' => [
                    ['name' => 'full_name', 'label' => 'Full Name', 'type' => 'text', 'required' => true],
                    ['name' => 'email', 'label' => 'Work Email', 'type' => 'email', 'required' => true],
                    ['name' => 'company', 'label' => 'Company Name', 'type' => 'text', 'required' => true],
                    [
                        'name' => 'budget',
                        'label' => 'Project Budget',
                        'type' => 'select',
                        'required' => true,
                        'options' => ['Under $25,000', '$25,000 - $75,000', '$75,000+'],
                    ],
                    ['name' => 'message', 'label' => 'Project Description', 'type' => 'textarea', 'required' => true],
                ],
                'submit_button_text' => 'Submit Request',
                'success_message' => 'Thank you for reaching out. A corporate representative will be in touch within 24 hours.',
                'is_active' => true,
                'notify_team' => true,
            ]
        );
        if ($form->wasRecentlyCreated) {
            $provisioned['forms']++;
        }

        return $provisioned;
    }
}
