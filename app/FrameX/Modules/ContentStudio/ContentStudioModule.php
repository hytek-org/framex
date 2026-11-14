<?php

namespace App\FrameX\Modules\ContentStudio;

use App\FrameX\Core\Contracts\ModuleInterface;
use App\FrameX\Modules\ContentStudio\Services\MediaService;
use App\FrameX\Modules\ContentStudio\Services\PublishingWorkflowService;
use App\FrameX\Modules\ContentStudio\Services\RevisionService;
use App\FrameX\Modules\ContentStudio\Services\SeoService;

class ContentStudioModule implements ModuleInterface
{
    public function id(): string
    {
        return 'content-studio';
    }

    public function name(): string
    {
        return 'FrameX Content Studio';
    }

    public function description(): string
    {
        return 'Unified publishing platform for posts, pages, block editor, revisions, media library, and SEO.';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function dependencies(): array
    {
        return [];
    }

    public function navigation(): array
    {
        return [
            [
                'label' => 'Content Studio',
                'route' => 'content.index',
                'icon' => 'BookOpen',
                'section' => 'publishing',
                'order' => 10,
            ],
            [
                'label' => 'Media Studio',
                'route' => 'media.index',
                'icon' => 'Image',
                'section' => 'publishing',
                'order' => 20,
            ],
        ];
    }

    public function permissions(): array
    {
        return [
            'content.view',
            'content.create',
            'content.update',
            'content.publish',
            'content.delete',
            'media.manage',
        ];
    }

    public function settingsSchema(): array
    {
        return [
            'default_status' => [
                'type' => 'string',
                'default' => 'draft',
                'options' => ['draft', 'in_review', 'published'],
            ],
            'auto_slug' => [
                'type' => 'boolean',
                'default' => true,
            ],
            'revisions_max_snapshots' => [
                'type' => 'integer',
                'default' => 50,
            ],
        ];
    }

    public function register(): void
    {
        app()->singleton(RevisionService::class);
        app()->singleton(PublishingWorkflowService::class);
        app()->singleton(SeoService::class);
        app()->singleton(MediaService::class);
    }

    public function boot(): void
    {
        // Module booted
    }
}
