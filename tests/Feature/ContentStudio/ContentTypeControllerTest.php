<?php

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->team = Team::factory()->create();
    $this->user->update(['current_team_id' => $this->team->id]);
    $this->team->members()->attach($this->user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);
    $this->actingAs($this->user);
});

test('user can view content types management page', function () {
    ContentType::factory()->create(['name' => 'Post', 'slug' => 'post', 'is_system' => true]);

    $this->get(route('content.types.index', ['current_team' => $this->team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('manage/content-types/index')
            ->has('contentTypes', 1)
            ->has('availableSupports')
        );
});

test('user can create a custom content type', function () {
    $this->post(route('content.types.store', ['current_team' => $this->team->slug]), [
        'name' => 'Case Study',
        'description' => 'Customer success stories.',
        'icon' => 'book-open',
        'supports' => ['revisions', 'seo'],
    ])->assertRedirect();

    $type = ContentType::where('slug', 'case-study')->first();
    expect($type)->not->toBeNull()
        ->and($type->is_system)->toBeFalse()
        ->and($type->supports)->toBe(['revisions', 'seo']);
});

test('user can update a content type', function () {
    $type = ContentType::factory()->create([
        'name' => 'Changelog',
        'slug' => 'changelog',
        'is_system' => false,
    ]);

    $this->put(route('content.types.update', [
        'current_team' => $this->team->slug,
        'contentType' => $type->slug,
    ]), [
        'name' => 'Release Notes',
        'slug' => 'release-notes',
        'description' => 'Product release updates.',
        'icon' => 'megaphone',
        'supports' => ['revisions', 'workflow'],
    ])->assertRedirect();

    $type->refresh();
    expect($type->name)->toBe('Release Notes')
        ->and($type->slug)->toBe('release-notes');
});

test('user can delete an unused custom content type', function () {
    $type = ContentType::factory()->create([
        'name' => 'Temp Type',
        'slug' => 'temp-type',
        'is_system' => false,
    ]);

    $this->delete(route('content.types.destroy', [
        'current_team' => $this->team->slug,
        'contentType' => $type->slug,
    ]))->assertRedirect();

    expect(ContentType::where('slug', 'temp-type')->exists())->toBeFalse();
});

test('system content types and types with content cannot be deleted', function () {
    $systemType = ContentType::factory()->create([
        'name' => 'Post',
        'slug' => 'post',
        'is_system' => true,
    ]);

    $this->delete(route('content.types.destroy', [
        'current_team' => $this->team->slug,
        'contentType' => $systemType->slug,
    ]))->assertSessionHasErrors('content_type');

    $usedType = ContentType::factory()->create([
        'name' => 'Guide',
        'slug' => 'guide',
        'is_system' => false,
    ]);

    Content::factory()->create([
        'team_id' => $this->team->id,
        'content_type_id' => $usedType->id,
        'author_id' => $this->user->id,
    ]);

    $this->delete(route('content.types.destroy', [
        'current_team' => $this->team->slug,
        'contentType' => $usedType->slug,
    ]))->assertSessionHasErrors('content_type');
});
