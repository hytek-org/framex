<?php

use App\FrameX\Blueprints\BlueprintRegistry;
use App\FrameX\Modules\Forms\Models\Form;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->team = Team::factory()->create();
    $this->user->teams()->attach($this->team->id, ['role' => 'admin']);

    // Install docs blueprint for feedback form
    $registry = app(BlueprintRegistry::class);
    $registry->get('docs')->install($this->team, $this->user);
});

test('public docs index renders with static markdown categorized sections', function () {
    $response = $this->get('/docs');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('docs/index')
        ->has('sections')
        ->where('totalDocs', fn ($count) => $count >= 5)
    );
});

test('public docs show renders static markdown guide with table of contents and reading time', function () {
    $response = $this->get('/docs/quickstart-installation-setup');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('docs/show')
        ->where('doc.title', 'Quickstart Installation and Environment Setup')
        ->where('doc.slug', 'quickstart-installation-setup')
        ->has('doc.body_html')
        ->has('doc.reading_time')
        ->has('toc')
        ->has('sections')
    );
});

test('public docs show renders architectural markdown guide', function () {
    $response = $this->get('/docs/modular-monolith');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('docs/show')
        ->where('doc.title', 'The 4-Layer Modular Monolith')
        ->has('toc')
    );
});

test('public docs show returns 404 for non-existent guide', function () {
    $response = $this->get('/docs/completely-non-existent-article');

    $response->assertNotFound();
});

test('submitting feedback on documentation records a form submission', function () {
    $response = $this->postJson('/forms/doc-feedback/submit', [
        'article_slug' => 'quickstart-installation-setup',
        'was_helpful' => 'Yes, completely',
        'suggestions' => 'Terrific guide, got up and running in 2 minutes!',
    ]);

    $response->assertOk()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('form_submissions', [
        'form_id' => Form::where('slug', 'doc-feedback')->first()->id,
    ]);
});
