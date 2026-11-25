<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class DocumentationService
{
    /**
     * Get the base directory path for Markdown documentation.
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
            $category = $doc['category'] ?? 'General';

            if (! isset($sections[$category])) {
                $sections[$category] = [
                    'name' => $category,
                    'slug' => Str::slug($category),
                    'order' => $doc['category_order'] ?? 99,
                    'docs' => [],
                ];
            }

            // Prevent duplicate entries within a section.
            $existingSlugs = array_column(
                $sections[$category]['docs'],
                'slug'
            );

            if (in_array($doc['slug'], $existingSlugs, true)) {
                continue;
            }

            $sections[$category]['docs'][] = [
                'title' => $doc['title'],
                'slug' => $doc['slug'],
                'description' => $doc['description'] ?? '',
                'order' => $doc['order'] ?? 99,
                'badge' => $doc['badge'] ?? null,
                'reading_time' => $doc['reading_time'],
            ];
        }

        // Sort sections by category order.
        uasort(
            $sections,
            fn ($a, $b) => $a['order'] <=> $b['order']
        );

        // Sort documentation inside each section.
        foreach ($sections as &$section) {
            usort(
                $section['docs'],
                fn ($a, $b) => $a['order'] <=> $b['order']
            );
        }

        unset($section);

        return array_values($sections);
    }

    /**
     * Retrieve all Markdown documentation files.
     *
     * Each Markdown file is registered exactly once.
     *
     * @return array<int, array<string, mixed>>
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
            if (strtolower($file->getExtension()) !== 'md') {
                continue;
            }

            $realPath = $file->getRealPath();

            if (! $realPath) {
                continue;
            }

            $raw = File::get($realPath);

            $parsed = $this->parseFrontmatter($raw);

            $relativePath = str_replace(
                '\\',
                '/',
                $file->getRelativePathname()
            );

            $defaultSlug = Str::beforeLast(
                $relativePath,
                '.md'
            );

            $pureFileName = Str::beforeLast(
                $file->getFilename(),
                '.md'
            );

            // Use the custom slug when provided.
            // Otherwise, preserve the nested relative file path.
            $slug = trim(
                (string) (
                    $parsed['attributes']['slug']
                    ?? $defaultSlug
                ),
                '/'
            );

            if ($slug === '') {
                $slug = $defaultSlug;
            }

            $title = $parsed['attributes']['title']
                ?? Str::headline($pureFileName);

            $category = $parsed['attributes']['category']
                ?? Str::headline(
                    $file->getRelativePath() ?: 'General'
                );

            $readingTime = $this->calculateReadingTime(
                $parsed['body']
            );

            $docs[] = [
                'slug' => $slug,
                'full_slug' => $defaultSlug,
                'file_path' => $realPath,
                'title' => $title,
                'description' => $parsed['attributes']['description'] ?? '',
                'category' => $category,
                'category_order' => (int) (
                    $parsed['attributes']['category_order']
                    ?? $this->getCategoryOrder($category)
                ),
                'order' => (int) (
                    $parsed['attributes']['order'] ?? 99
                ),
                'badge' => $parsed['attributes']['badge'] ?? null,
                'reading_time' => $readingTime,
                'body' => $parsed['body'],
            ];
        }

        // Keep each physical Markdown file only once.
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

        // 1. Match custom slug.
        $matched = null;

        foreach ($docs as $doc) {
            if ($doc['slug'] === $slug) {
                $matched = $doc;
                break;
            }
        }

        // 2. Fallback to the original relative file path.
        if (! $matched) {
            foreach ($docs as $doc) {
                if ($doc['full_slug'] === $slug) {
                    $matched = $doc;
                    break;
                }
            }
        }

        if (! $matched) {
            return null;
        }

        // Render Markdown into HTML.
        $renderedHtml = Str::markdown($matched['body']);

        // Generate heading anchors and table of contents.
        [$htmlWithAnchors, $toc] =
            $this->injectHeadingAnchorsAndExtractToc(
                $renderedHtml
            );

        // Generate siblings, previous and next navigation.
        $sections = $this->getSections();

        $siblings = [];
        $flatList = [];

        foreach ($sections as $section) {
            $isSameCategory = (
                $section['name'] === $matched['category']
            );

            foreach ($section['docs'] as $doc) {
                $flatList[] = $doc;

                if ($isSameCategory) {
                    $siblings[] = $doc;
                }
            }
        }

        $currentIndex = -1;

        foreach ($flatList as $index => $item) {
            if ($item['slug'] === $matched['slug']) {
                $currentIndex = $index;
                break;
            }
        }

        $prev = $currentIndex > 0
            ? $flatList[$currentIndex - 1]
            : null;

        $next = (
            $currentIndex >= 0
            && $currentIndex < count($flatList) - 1
        )
            ? $flatList[$currentIndex + 1]
            : null;

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
     * Parse YAML-style frontmatter from Markdown content.
     *
     * Supports basic key/value frontmatter.
     *
     * @return array{
     *     attributes: array<string, mixed>,
     *     body: string
     * }
     */
    protected function parseFrontmatter(string $content): array
    {
        $attributes = [];
        $body = $content;

        if (
            preg_match(
                '/\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|$)/s',
                $content,
                $matches
            )
        ) {
            $frontmatter = $matches[1];

            $body = substr(
                $content,
                strlen($matches[0])
            );

            foreach (preg_split('/\r?\n/', $frontmatter) as $line) {
                $line = trim($line);

                if (
                    $line === ''
                    || str_starts_with($line, '#')
                ) {
                    continue;
                }

                if (! str_contains($line, ':')) {
                    continue;
                }

                [$key, $value] = explode(':', $line, 2);

                $key = trim($key);
                $value = trim($value);

                if ($key === '') {
                    continue;
                }

                // Remove surrounding quotes.
                if (
                    strlen($value) >= 2
                    && (
                        (
                            str_starts_with($value, '"')
                            && str_ends_with($value, '"')
                        )
                        || (
                            str_starts_with($value, "'")
                            && str_ends_with($value, "'")
                        )
                    )
                ) {
                    $value = substr($value, 1, -1);
                }

                // Convert numeric values.
                if (
                    $value !== ''
                    && is_numeric($value)
                ) {
                    $value = $value + 0;
                }

                // Convert null values.
                if (in_array(strtolower($value), ['null', '~'], true)) {
                    $value = null;
                }

                // Convert boolean values.
                if (in_array(strtolower((string) $value), ['true', 'false'], true)) {
                    $value = strtolower($value) === 'true';
                }

                $attributes[$key] = $value;
            }
        }

        return [
            'attributes' => $attributes,
            'body' => $body,
        ];
    }

    /**
     * Calculate estimated reading time in minutes.
     */
    protected function calculateReadingTime(string $content): string
    {
        $wordCount = str_word_count(
            strip_tags($content)
        );

        $minutes = max(
            1,
            (int) ceil($wordCount / 200)
        );

        return "{$minutes} min read";
    }

    /**
     * Inject unique anchor IDs into H2 and H3 tags
     * and extract the table of contents.
     *
     * @return array{
     *     0: string,
     *     1: array<int, array<string, mixed>>
     * }
     */
    protected function injectHeadingAnchorsAndExtractToc(
        string $html
    ): array {
        $toc = [];
        $usedIds = [];

        $htmlWithAnchors = preg_replace_callback(
            '/<h([2-3])([^>]*)>(.*?)<\/h\1>/is',
            function ($matches) use (&$toc, &$usedIds) {
                $level = (int) $matches[1];
                $attributes = $matches[2];
                $content = $matches[3];

                $title = trim(
                    html_entity_decode(
                        strip_tags($content),
                        ENT_QUOTES | ENT_HTML5,
                        'UTF-8'
                    )
                );

                $baseId = Str::slug($title);

                if ($baseId === '') {
                    $baseId = 'section';
                }

                // Ensure every heading has a unique ID.
                $id = $baseId;
                $counter = 2;

                while (isset($usedIds[$id])) {
                    $id = "{$baseId}-{$counter}";
                    $counter++;
                }

                $usedIds[$id] = true;

                // Preserve existing attributes except old ID.
                $attributes = preg_replace(
                    '/\s+id=(["\']).*?\1/i',
                    '',
                    $attributes
                );

                $toc[] = [
                    'id' => $id,
                    'title' => $title,
                    'level' => $level,
                ];

                return sprintf(
                    '<h%d%s id="%s">%s</h%d>',
                    $level,
                    $attributes,
                    e($id),
                    $content,
                    $level
                );
            },
            $html
        );

        return [
            $htmlWithAnchors ?? $html,
            $toc,
        ];
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
