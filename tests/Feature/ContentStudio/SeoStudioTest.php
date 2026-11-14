<?php

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\FrameX\Modules\ContentStudio\Models\SeoMetadata;
use App\FrameX\Modules\ContentStudio\Services\SeoService;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('content can have custom seo metadata with cascade fallbacks', function () {
    $author = User::factory()->create();
    $team = Team::factory()->create();
    $postType = ContentType::where('slug', 'post')->first()
        ?? ContentType::factory()->post()->create();
    $content = Content::factory()->create([
        'team_id' => $team->id,
        'content_type_id' => $postType->id,
        'author_id' => $author->id,
        'title' => 'Mastering Headless CMS Architecture',
        'excerpt' => 'An essential guide for Laravel architects.',
        'cover_image' => 'images/covers/cms.jpg',
    ]);

    $seo = SeoMetadata::create([
        'team_id' => $team->id,
        'seoble_type' => Content::class,
        'seoble_id' => $content->id,
        'meta_title' => 'Custom Meta Title | Special Edition',
        'meta_description' => 'A distinct custom SEO description for search engines.',
        'canonical_url' => 'https://example.com/canonical-cms-post',
        'no_index' => false,
    ]);

    expect($content->fresh()->seoMetadata)->not->toBeNull()
        ->and($content->fresh()->seoMetadata->meta_title)->toBe('Custom Meta Title | Special Edition');

    $seoService = new SeoService;
    $resolved = $seoService->resolveMetadata($content);

    expect($resolved['meta_title'])->toBe('Custom Meta Title | Special Edition')
        ->and($resolved['meta_description'])->toBe('A distinct custom SEO description for search engines.')
        ->and($resolved['canonical_url'])->toBe('https://example.com/canonical-cms-post')
        ->and($resolved['og_title'])->toBe('Custom Meta Title | Special Edition')
        ->and($resolved['no_index'])->toBeFalse()
        ->and($resolved['structured_data']['@type'])->toBe('Article')
        ->and($resolved['structured_data']['headline'])->toBe('Mastering Headless CMS Architecture');
});

test('seo fallbacks resolve correctly when custom metadata is absent', function () {
    $content = Content::factory()->create([
        'title' => 'Default Fallback Article',
        'excerpt' => 'This is a clean excerpt for fallback testing.',
    ]);

    $seoService = new SeoService;
    $resolved = $seoService->resolveMetadata($content);

    expect($resolved['meta_title'])->toContain('Default Fallback Article')
        ->and($resolved['meta_description'])->toBe('This is a clean excerpt for fallback testing.')
        ->and($resolved['canonical_url'])->toContain('/blogs/'.$content->slug)
        ->and($resolved['no_index'])->toBeFalse();
});

test('public sitemap.xml returns valid xml with published content and taxonomy urls', function () {
    $team = Team::factory()->create();

    $publishedPost = Content::factory()->published()->create([
        'team_id' => $team->id,
        'title' => 'Visible Post',
        'slug' => 'visible-post',
    ]);

    $noIndexPost = Content::factory()->published()->create([
        'team_id' => $team->id,
        'title' => 'Hidden Secret Post',
        'slug' => 'hidden-secret-post',
    ]);

    SeoMetadata::create([
        'team_id' => $team->id,
        'seoble_type' => Content::class,
        'seoble_id' => $noIndexPost->id,
        'no_index' => true,
    ]);

    $draftPost = Content::factory()->create([
        'team_id' => $team->id,
        'title' => 'Draft Content',
        'slug' => 'draft-content',
    ]);

    $category = Category::factory()->create(['slug' => 'engineering']);
    $tag = Tag::factory()->create(['slug' => 'architecture']);

    $response = $this->get('/sitemap.xml');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/xml; charset=UTF-8');

    $content = $response->getContent();

    expect($content)->toContain('<loc>'.url('/blogs/visible-post').'</loc>')
        ->and($content)->toContain('<loc>'.url('/categories/engineering').'</loc>')
        ->and($content)->toContain('<loc>'.url('/tags/architecture').'</loc>')
        ->and($content)->not->toContain('<loc>'.url('/blogs/hidden-secret-post').'</loc>')
        ->and($content)->not->toContain('<loc>'.url('/blogs/draft-content').'</loc>');
});
