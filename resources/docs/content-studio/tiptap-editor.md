---
title: TipTap Block Editor & Content Studio
slug: tiptap-editor
description: How FrameX uses TipTap to provide a modern, semantic block editing experience.
category: Content Studio
order: 1
---

# TipTap Block Editor & Content Studio

FrameX Content Studio replaces traditional raw textarea inputs and rigid page builders with a semantic, headless **TipTap Editor** running natively inside React and Inertia.js.

---

## Editor Architecture

The editor component (`StudioEditor.tsx`) serializes rich content simultaneously into two formats:
1. **Semantic HTML (`body_html`):** Used for instant, high-performance server-side and client-side rendering.
2. **Abstract Syntax Tree JSON (`body_json`):** Retained in revisions for structured parsing, headless API delivery, and programmatic transformations.

```tsx
<StudioEditor
    content={form.data.body_html}
    onChange={(html, json) => {
        form.setData((prev) => ({
            ...prev,
            body_html: html,
            body_json: json,
        }));
    }}
/>
```

---

## Supported Content Blocks

- **Typography:** Headings (H1–H4), Paragraphs, Blockquotes, and Lists (Bullet & Numbered).
- **Code Fences:** Syntax highlighted code blocks with language indicators.
- **Media Assets:** Inline and full-width images integrated directly with the centralized Media Studio.
- **Tables:** Multi-column tables with header rows and custom cell formatting.
- **Callout Banners:** Note, Tip, Warning, and Alert callout containers.

---

## Editorial Workflow Integration

Every document edited in Content Studio can transition through the official multi-state editorial machine:

```text
Draft ──► In Review ──► Approved ──► Scheduled ──► Published ──► Archived
```

When an article is scheduled for future release, the background worker publishes it automatically:

```bash
php artisan framex:publish-scheduled
```
