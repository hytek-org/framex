<?php

namespace Database\Seeders;

use App\FrameX\Modules\ContentStudio\Models\ContentType;
use Illuminate\Database\Seeder;

class ContentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ContentType::updateOrCreate(
            ['slug' => 'post'],
            [
                'name' => 'Post',
                'description' => 'Articles and blog posts with authors, revisions, categories and tags.',
                'icon' => 'file-text',
                'supports' => ['revisions', 'taxonomies', 'seo', 'media', 'workflow'],
                'is_system' => true,
            ]
        );

        ContentType::updateOrCreate(
            ['slug' => 'page'],
            [
                'name' => 'Page',
                'description' => 'Static or structured landing pages, about pages, and documentation.',
                'icon' => 'layout',
                'supports' => ['revisions', 'seo', 'media'],
                'is_system' => true,
            ]
        );
    }
}
