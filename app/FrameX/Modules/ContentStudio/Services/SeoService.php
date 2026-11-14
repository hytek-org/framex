<?php

namespace App\FrameX\Modules\ContentStudio\Services;

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Support\Str;

class SeoService
{
    /**
     * Resolve effective SEO tags with cascade fallbacks.
     *
     * @return array<string, mixed>
     */
    public function resolveMetadata(Content $content): array
    {
        $seo = $content->seoMetadata;
        $appName = config('app.name', 'FrameX');

        $metaTitle = $seo?->meta_title ?: ($content->title ? "{$content->title} | {$appName}" : $appName);
        $fallbackDescription = $content->excerpt ?: Str::limit(trim(strip_tags((string) $content->body_html)), 155);
        $metaDescription = $seo?->meta_description ?: $fallbackDescription;

        $canonicalUrl = $seo?->canonical_url ?: url("/blogs/{$content->slug}");
        $ogTitle = $seo?->og_title ?: ($seo?->meta_title ?: $content->title);
        $ogDescription = $seo?->og_description ?: $metaDescription;
        $ogImage = $seo?->og_image ?: ($content->cover_image ? url($content->cover_image) : null);

        $structuredData = $seo?->structured_data ?: $this->generateStructuredData($content, $canonicalUrl);

        return [
            'meta_title' => $metaTitle,
            'meta_description' => $metaDescription,
            'canonical_url' => $canonicalUrl,
            'og_title' => $ogTitle,
            'og_description' => $ogDescription,
            'og_image' => $ogImage,
            'twitter_card' => $seo?->twitter_card ?: 'summary_large_image',
            'no_index' => (bool) ($seo?->no_index ?? false),
            'no_follow' => (bool) ($seo?->no_follow ?? false),
            'structured_data' => $structuredData,
        ];
    }

    /**
     * Generate Schema.org JSON-LD structured data.
     *
     * @return array<string, mixed>
     */
    public function generateStructuredData(Content $content, ?string $canonicalUrl = null): array
    {
        $url = $canonicalUrl ?: url("/blogs/{$content->slug}");
        $isPost = $content->contentType?->slug === 'post';

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => $isPost ? 'Article' : 'WebPage',
            'headline' => $content->title,
            'description' => $content->excerpt,
            'url' => $url,
            'datePublished' => $content->published_at?->toIso8601String(),
            'dateModified' => $content->updated_at?->toIso8601String(),
        ];

        if ($content->author) {
            $schema['author'] = [
                '@type' => 'Person',
                'name' => $content->author->name,
            ];
        }

        if ($content->cover_image) {
            $schema['image'] = url($content->cover_image);
        }

        return $schema;
    }

    /**
     * Generate clean, standard XML sitemap for public SEO indexing.
     */
    public function generateSitemapXml(): string
    {
        $urls = [];

        // Homepage
        $urls[] = [
            'loc' => url('/'),
            'lastmod' => now()->toIso8601String(),
            'changefreq' => 'daily',
            'priority' => '1.0',
        ];

        // Published contents (excluding no_index)
        $contents = Content::published()
            ->with(['seoMetadata', 'contentType'])
            ->get();

        foreach ($contents as $content) {
            if ($content->seoMetadata?->no_index) {
                continue;
            }

            $prefix = $content->contentType?->slug === 'page' ? 'pages' : 'blogs';
            $urls[] = [
                'loc' => url("/{$prefix}/{$content->slug}"),
                'lastmod' => ($content->updated_at ?? $content->published_at ?? now())->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => $content->contentType?->slug === 'post' ? '0.8' : '0.6',
            ];
        }

        // Public Categories
        $categories = Category::all();
        foreach ($categories as $category) {
            $urls[] = [
                'loc' => url("/categories/{$category->slug}"),
                'lastmod' => $category->updated_at?->toIso8601String() ?? now()->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => '0.5',
            ];
        }

        // Public Tags
        $tags = Tag::all();
        foreach ($tags as $tag) {
            $urls[] = [
                'loc' => url("/tags/{$tag->slug}"),
                'lastmod' => $tag->updated_at?->toIso8601String() ?? now()->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => '0.4',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($urls as $entry) {
            $xml .= "  <url>\n";
            $xml .= '    <loc>'.htmlspecialchars($entry['loc'], ENT_XML1, 'UTF-8')."</loc>\n";
            $xml .= "    <lastmod>{$entry['lastmod']}</lastmod>\n";
            $xml .= "    <changefreq>{$entry['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$entry['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }
}
