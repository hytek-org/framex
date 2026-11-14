<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class DocumentationService
{
    /**
     * Get the base directory path for markdown documentation.
     */
    public function getDocsPath(): string
    {
        return resource_path('docs');
    }

    /**
     * Get all documentation articles grouped by category/section.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getSections(): array
    {
        $docs = $this->getAllDocs();

        $sections = [];
        foreach ($docs as $doc) {
            $cat = $doc['category'] ?? 'General';
            if (! isset($sections[$cat])) {
                $sections[$cat] = [
                    'name' => $cat,
                    'slug' => Str::slug($cat),
                    'order' => $doc['category_order'] ?? 99,
                    'docs' => [],
                ];
            }
            $sections[$cat]['docs'][] = [
                'title' => $doc['title'],
                'slug' => $doc['slug'],
                'description' => $doc['description'] ?? '',
                'order' => $doc['order'] ?? 99,
                'badge' => $doc['badge'] ?? null,
                'reading_time' => $doc['reading_time'],
            ];
        }

        // Sort sections by category order
        uasort($sections, fn ($a, $b) => $a['order'] <=> $b['order']);

        // Sort docs within each section
        foreach ($sections as &$sec) {
            usort($sec['docs'], fn ($a, $b) => $a['order'] <=> $b['order']);
        }

        return array_values($sections);
    }

    /**
     * Retrieve all markdown documentation files metadata and excerpt.
     *
     * @return array<string, array<string, mixed>>
     */
    public function getAllDocs(): array
    {
        $path = $this->getDocsPath();

        if (! File::isDirectory($path)) {
            return [];
        }

        $files = File::allFiles($path);
        $docs = [];

        foreach ($files as $file) {
            if ($file->getExtension() !== 'md') {
                continue;
            }

            $raw = File::get($file->getRealPath());
            $parsed = $this->parseFrontmatter($raw);

            $relativePath = str_replace('\\', '/', $file->getRelativePathname());
            $defaultSlug = Str::beforeLast($relativePath, '.md');
            $pureFileName = Str::beforeLast($file->getFilename(), '.md');

            $slug = $parsed['attributes']['slug'] ?? $pureFileName;
            $title = $parsed['attributes']['title'] ?? Str::headline($pureFileName);
            $category = $parsed['attributes']['category'] ?? Str::headline($file->getRelativePath() ?: 'General');

            $readingTime = $this->calculateReadingTime($parsed['body']);

            $docData = [
                'slug' => $slug,
                'full_slug' => $defaultSlug,
                'file_path' => $file->getRealPath(),
                'title' => $title,
                'description' => $parsed['attributes']['description'] ?? '',
                'category' => $category,
                'category_order' => $parsed['attributes']['category_order'] ?? $this->getCategoryOrder($category),
                'order' => (int) ($parsed['attributes']['order'] ?? 99),
                'badge' => $parsed['attributes']['badge'] ?? null,
                'reading_time' => $readingTime,
                'body' => $parsed['body'],
            ];

            $docs[$slug] = $docData;
            if ($defaultSlug !== $slug) {
                $docs[$defaultSlug] = $docData;
            }
        }

        return $docs;
    }

    /**
     * Find a specific documentation guide by slug.
     *
     * @return array<string, mixed>|null
     */
    public function find(string $slug): ?array
    {
        $docs = $this->getAllDocs();

        // 1. Direct match
        $matched = $docs[$slug] ?? null;

        // 2. If not matched, try matching trailing segment
        if (! $matched) {
            foreach ($docs as $doc) {
                if ($doc['slug'] === $slug || $doc['full_slug'] === $slug) {
                    $matched = $doc;
                    break;
                }
            }
        }

        if (! $matched) {
            return null;
        }

        // Render Markdown to HTML and inject Heading IDs
        $renderedHtml = Str::markdown($matched['body']);
        [$htmlWithAnchors, $toc] = $this->injectHeadingAnchorsAndExtractToc($renderedHtml);

        // Compute Siblings, Previous and Next
        $sections = $this->getSections();
        $siblings = [];
        $flatList = [];

        foreach ($sections as $section) {
            $isSameCategory = ($section['name'] === $matched['category']);
            foreach ($section['docs'] as $d) {
                $flatList[] = $d;
                if ($isSameCategory) {
                    $siblings[] = $d;
                }
            }
        }

        $currentIndex = -1;
        foreach ($flatList as $idx => $item) {
            if ($item['slug'] === $matched['slug']) {
                $currentIndex = $idx;
                break;
            }
        }

        $prev = ($currentIndex > 0) ? $flatList[$currentIndex - 1] : null;
        $next = ($currentIndex >= 0 && $currentIndex < count($flatList) - 1) ? $flatList[$currentIndex + 1] : null;

        return [
            'title' => $matched['title'],
            'slug' => $matched['slug'],
            'description' => $matched['description'],
            'category' => $matched['category'],
            'order' => $matched['order'],
            'badge' => $matched['badge'],
            'reading_time' => $matched['reading_time'],
            'body_html' => $htmlWithAnchors,
            'toc' => $toc,
            'siblings' => $siblings,
            'prev' => $prev,
            'next' => $next,
        ];
    }

    /**
     * Parse YAML-style frontmatter headers from markdown raw content.
     *
     * @return array{attributes: array<string, mixed>, body: string}
     */
    protected function parseFrontmatter(string $content): array
    {
        $attributes = [];
        $body = $content;

        if (preg_match('/^---\s*[\r\n]+(.*?)[\r\n]+---\s*[\r\n]+(.*)$/s', $content, $matches)) {
            $frontmatter = $matches[1];
            $body = $matches[2];

            $lines = explode("\n", $frontmatter);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || str_starts_with($line, '#')) {
                    continue;
                }

                if (str_contains($line, ':')) {
                    [$key, $value] = explode(':', $line, 2);
                    $key = trim($key);
                    $value = trim($value, " \t\n\r\0\x0B\"'");
                    $attributes[$key] = $value;
                }
            }
        }

        return [
            'attributes' => $attributes,
            'body' => $body,
        ];
    }

    /**
     * Calculate estimated reading time in minutes based on word count.
     */
    protected function calculateReadingTime(string $content): string
    {
        $wordCount = str_word_count(strip_tags($content));
        $minutes = max(1, (int) ceil($wordCount / 200));

        return "{$minutes} min read";
    }

    /**
     * Inject anchor IDs into H2 and H3 tags and extract Table of Contents.
     *
     * @return array{0: string, 1: array<int, array<string, mixed>>}
     */
    protected function injectHeadingAnchorsAndExtractToc(string $html): array
    {
        $toc = [];

        $htmlWithAnchors = preg_replace_callback('/<h([2-3])>(.*?)<\/h\1>/i', function ($matches) use (&$toc) {
            $level = (int) $matches[1];
            $title = strip_tags($matches[2]);
            $id = Str::slug($title);

            $toc[] = [
                'id' => $id,
                'title' => $title,
                'level' => $level,
            ];

            return "<h{$level} id=\"{$id}\">{$matches[2]}</h{$level}>";
        }, $html);

        return [$htmlWithAnchors, $toc];
    }

    /**
     * Return default order for standard categories.
     */
    protected function getCategoryOrder(string $category): int
    {
        return match (Str::slug($category)) {
            'getting-started' => 1,
            'architecture' => 2,
            'content-studio' => 3,
            'administration' => 4,
            'business-infrastructure' => 5,
            'extension-ecosystem' => 6,
            'blueprints' => 7,
            'api-reference' => 8,
            default => 50,
        };
    }
}
