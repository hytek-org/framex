---
title: Quickstart Installation and Environment Setup
slug: quickstart-installation-setup
description: Get up and running with FrameX on your local workstation or production server in under 5 minutes.
category: Getting Started
order: 2
badge: Quickstart
---

# Quickstart Installation and Setup

Follow this step-by-step walkthrough to clone, configure, and boot your local FrameX instance.

---

## System Prerequisites

Ensure your development environment meets the following baseline requirements:
- **PHP:** `8.2.0` or higher (`8.3+` recommended)
- **Composer:** `2.5.0` or higher
- **Node.js:** `20.x` or `22.x` (LTS) & **npm**
- **Database:** SQLite (default for development), MySQL `8.0+`, or PostgreSQL `14+`

---

## 1. Clone & Install Dependencies

Clone the repository and install all backend and frontend dependencies:

```bash
# Clone the repository
git clone https://github.com/your-org/framex.git
cd framex

# Install Composer packages
composer install

# Install NPM dependencies
npm install
```

---

## 2. Environment Configuration

Copy the example environment configuration and generate the application encryption key:

```bash
cp .env.example .env
php artisan key:generate
```

Configure your database connection in `.env`:

```env
APP_NAME=FrameX
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# DB_DATABASE=/path/to/database.sqlite
```

---

## 3. Database Migration & Showcase Seeding

Run database migrations to initialize the FrameX core schema, content tables, revisions, forms, and webhooks:

```bash
# Run database migrations
php artisan migrate

# Seed the interactive FrameX showcase workspace
php artisan framex:demo:seed
```

The demo seeder creates an interactive workspace (`/framex-demo/dashboard`) with demo credentials:
- **Email:** `demo@framex.dev`
- **Password:** `password123`

---

## 4. Run Platform Diagnostics

Verify that all environment capabilities, PHP extensions, database connectivity, and modules are operating correctly:

```bash
php artisan framex:doctor
```

---

## 5. Start Development Servers

Start the Laravel backend and Vite frontend hot-reloading dev servers concurrently:

```bash
# Terminal 1: Backend Server
php artisan serve

# Terminal 2: Frontend Vite
npm run dev
```

Visit `http://localhost:8000` to explore the public marketing portal, or navigate to `/docs` to browse the interactive documentation.
