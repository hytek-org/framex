---
title: API Authentication & Scoped Tokens
slug: authentication-and-tokens
description: Secure, team-scoped Personal Access Tokens with fine-grained authorization scopes.
category: API Reference
order: 1
---

# API Authentication & Scoped Tokens

FrameX provides a robust, team-scoped token authentication layer built on top of Laravel Sanctum and team membership policies.

---

## Generating API Tokens via CLI

Administrators can issue tokens directly from the terminal with specific scopes:

```bash
php artisan framex:token \
    --user=admin@example.com \
    --team=default \
    --name="CI Deployment Token" \
    --scopes="content:read,content:write,forms:read"
```

---

## Token Authorization Header

Send the token as an HTTP `Bearer` token in API requests:

```http
GET /api/v1/content HTTP/1.1
Host: your-domain.com
Authorization: Bearer framex_tok_9f8a7c2b...
Accept: application/json
```

---

## Available Token Scopes

| Scope | Capability |
|---|---|
| `content:read` | Read published articles, pages, and taxonomies |
| `content:write` | Create, draft, and submit revisions |
| `content:publish` | Transition status to published |
| `forms:read` | Read form schemas and list submissions |
| `webhooks:manage`| Create and rotate webhook signing secrets |
| `analytics:read` | Query view counts and telemetry aggregates |
