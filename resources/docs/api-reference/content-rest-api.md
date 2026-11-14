---
title: Headless Content REST API
slug: content-rest-api
description: Query and deliver published articles, pages, and categories headlessly via JSON REST API.
category: API Reference
order: 2
badge: REST
---

# Headless Content REST API

FrameX provides RESTful endpoints to consume your published content in mobile applications, external frontends (Astro, Next.js, Nuxt), or static site generators.

---

## Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/content` | List published content with filters (`type`, `category`, `search`) |
| `GET` | `/api/v1/content/{slug}` | Retrieve full article detail including HTML and JSON blocks |
| `GET` | `/api/v1/content/types` | List registered content types and their schemas |
| `GET` | `/api/v1/categories` | List active categories with post counts |
| `GET` | `/api/v1/tags` | List taxonomy tags |

---

## Authentication

All endpoints require a Bearer token with the `content:read` capability:

```http
GET /api/v1/content?type=post&limit=10 HTTP/1.1
Host: your-domain.com
Authorization: Bearer framex_tok_...
Accept: application/json
```

Response payloads adhere strictly to JSON API resource standards with metadata, pagination links, and SEO fields.
