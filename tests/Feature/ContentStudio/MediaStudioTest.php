<?php

use App\FrameX\Modules\ContentStudio\Models\Media;
use App\FrameX\Modules\ContentStudio\Models\MediaFolder;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('user can upload media into media library', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $file = UploadedFile::fake()->image('banner.png', 1200, 630);

    $response = $this->actingAs($user)
        ->post("/{$team->slug}/media", [
            'file' => $file,
            'alt_text' => 'Hero Banner Image',
            'caption' => 'Official launch banner',
        ]);

    $response->assertRedirect();

    $media = Media::where('filename', 'banner.png')->first();

    expect($media)->not->toBeNull()
        ->and($media->team_id)->toBe($team->id)
        ->and($media->alt_text)->toBe('Hero Banner Image')
        ->and($media->caption)->toBe('Official launch banner')
        ->and($media->dimensions['width'])->toBe(1200)
        ->and($media->dimensions['height'])->toBe(630)
        ->and($media->url)->not->toBeEmpty();

    Storage::disk('public')->assertExists($media->path);
});

test('user can create folders and organize media files', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $response = $this->actingAs($user)
        ->post("/{$team->slug}/media/folders", [
            'name' => 'Marketing Assets',
        ]);

    $response->assertRedirect();

    $folder = MediaFolder::where('name', 'Marketing Assets')->first();
    expect($folder)->not->toBeNull()
        ->and($folder->slug)->toBe('marketing-assets')
        ->and($folder->team_id)->toBe($team->id);
});

test('json api mode returns paginated media for studio picker dialog', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    Media::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'disk' => 'public',
        'filename' => 'diagram.png',
        'path' => 'media/diagram.png',
        'mime_type' => 'image/png',
        'size' => 10240,
    ]);

    $response = $this->actingAs($user)
        ->getJson("/{$team->slug}/media?all=1");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'media' => [
                'data' => [
                    '*' => ['id', 'filename', 'mime_type', 'size', 'url'],
                ],
            ],
            'folders',
        ]);
});

test('deleting media removes storage file and database record', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);
    $team->members()->attach($user, ['role' => 'owner', 'permissions' => json_encode(['*'])]);

    $file = UploadedFile::fake()->image('temp.jpg');
    $path = $file->storeAs("media/{$team->id}", 'temp.jpg', 'public');

    $media = Media::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'disk' => 'public',
        'filename' => 'temp.jpg',
        'path' => $path,
        'mime_type' => 'image/jpeg',
        'size' => 500,
    ]);

    Storage::disk('public')->assertExists($path);

    $response = $this->actingAs($user)
        ->delete("/{$team->slug}/media/{$media->id}");

    $response->assertRedirect();

    expect(Media::find($media->id))->toBeNull();
    Storage::disk('public')->assertMissing($path);
});
