---
title: Application Blueprints & Presets
slug: solution-blueprints
description: Turnkey application templates for Corporate Websites, Publishing Platforms, SaaS Apps, and Documentation Hubs.
category: Blueprints
order: 1
badge: Turnkey
---

# Application Blueprints & Presets

FrameX ships with production-ready application blueprints designed to eliminate weeks of boilerplate setup:

---

## 1. Corporate Website (`corporate`)
- Multi-page corporate marketing layout.
- Services catalog content type.
- Case studies and announcements taxonomy.
- Dynamic proposal and quote request lead form.

## 2. Publishing Platform (`publishing`)
- Multi-author digital magazine with editorial review stages.
- Technology, Architecture, and Design category hubs.
- Weekly developer digest newsletter subscription form.

## 3. SaaS Starter (`saas`)
- Multi-tenant team onboarding checklist.
- Product changelog and release notes content type.
- Customer NPS feedback and feature request survey form.

## 4. Documentation Hub (`docs`)
- Structured developer documentation viewer.
- Categorized guides with Table of Contents and estimated reading times.
- Interactive helpfulness rating form.

---

## Installing Blueprints

```bash
# List all blueprints
php artisan framex:blueprint:list

# Install into your workspace
php artisan framex:blueprint:install saas --team=default
```
