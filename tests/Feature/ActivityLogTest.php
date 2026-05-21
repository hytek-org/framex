<?php

use App\Models\Blog;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Team;
use App\Models\TeamFile;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Enums\TeamRole;
use Illuminate\Support\Facades\Event;
use App\Events\TeamActivityRecorded;

test('creating updating deleting a team logs activity', function () {
    Event::fake([TeamActivityRecorded::class]);

    $user = User::factory()->create();

    // 1. Create Team
    $response = $this->actingAs($user)->post(route('teams.store'), [
        'name' => 'Acme Labs',
    ]);
    
    $team = Team::where('name', 'Acme Labs')->first();
    expect($team)->not->toBeNull();

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'team.created',
        'description' => "Team 'Acme Labs' was created.",
    ]);

    // 2. Update Team
    $this->actingAs($user)->patch(route('teams.update', $team), [
        'name' => 'Acme Inc',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'team.updated',
        'description' => "Team 'Acme Inc' was updated.",
    ]);

    // 3. Delete Team
    $team = $team->fresh();
    $response = $this->actingAs($user)->delete(route('teams.destroy', $team), [
        'name' => 'Acme Inc',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'team.deleted',
        'description' => "Team 'Acme Inc' was deleted.",
    ]);

    Event::assertDispatched(TeamActivityRecorded::class);
});

test('file uploads and deletions log activities', function () {
    Event::fake([TeamActivityRecorded::class]);

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $file = \Illuminate\Http\UploadedFile::fake()->create('document.pdf', 100);

    // 1. Upload File
    $response = $this->actingAs($user)->post(route('files.store', ['current_team' => $team->slug]), [
        'file' => $file,
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'file.uploaded',
        'description' => 'document.pdf was uploaded.',
    ]);

    $teamFile = TeamFile::where('name', 'document.pdf')->first();
    expect($teamFile)->not->toBeNull();

    // 2. Delete File
    $this->actingAs($user)->delete(route('files.destroy', ['current_team' => $team->slug, 'file' => $teamFile->id]));

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'file.deleted',
        'description' => 'document.pdf was deleted.',
    ]);

    Event::assertDispatched(TeamActivityRecorded::class);
});

test('blog post creation update publishing and deletion logs activities', function () {
    Event::fake([TeamActivityRecorded::class]);

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    // 1. Create Blog
    $response = $this->actingAs($user)->post(route('manage.blogs.store', ['current_team' => $team->slug]), [
        'title' => 'My New Post',
        'excerpt' => 'An excerpt',
        'content' => 'Blog content here',
        'is_published' => false,
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'blog.created',
        'description' => "Blog post 'My New Post' was created.",
    ]);

    $blog = Blog::where('title', 'My New Post')->first();
    expect($blog)->not->toBeNull();

    // 2. Update and Publish Blog
    $response = $this->actingAs($user)->put(route('manage.blogs.update', ['current_team' => $team->slug, 'blog' => $blog->slug]), [
        'title' => 'My New Post (Updated)',
        'excerpt' => 'An excerpt',
        'content' => 'Blog content here',
        'is_published' => true,
    ]);



    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'blog.published',
        'description' => "Blog post 'My New Post (Updated)' was published.",
    ]);

    $blog = $blog->fresh();

    // 3. Delete Blog
    $this->actingAs($user)->delete(route('manage.blogs.destroy', ['current_team' => $team->slug, 'blog' => $blog->slug]));

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'blog.deleted',
        'description' => "Blog post 'My New Post (Updated)' was deleted.",
    ]);

    Event::assertDispatched(TeamActivityRecorded::class);
});

test('category and tag actions log activities', function () {
    Event::fake([TeamActivityRecorded::class]);

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    // 1. Create Category
    $this->actingAs($user)->post(route('manage.categories.store', ['current_team' => $team->slug]), [
        'name' => 'Technology',
        'description' => 'Tech items',
        'color' => '#ff0000',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'category.created',
        'description' => "Category 'Technology' was created.",
    ]);

    $category = Category::where('name', 'Technology')->first();
    expect($category)->not->toBeNull();

    // 2. Update Category
    $this->actingAs($user)->put(route('manage.categories.update', ['current_team' => $team->slug, 'category' => $category->slug]), [
        'name' => 'Technology (Updated)',
        'description' => 'Tech items',
        'color' => '#ff0000',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'category.updated',
        'description' => "Category 'Technology (Updated)' was updated.",
    ]);

    $category = $category->fresh();

    // 3. Delete Category
    $this->actingAs($user)->delete(route('manage.categories.destroy', ['current_team' => $team->slug, 'category' => $category->slug]));

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'category.deleted',
        'description' => "Category 'Technology (Updated)' was deleted.",
    ]);

    // 4. Create Tag
    $this->actingAs($user)->post(route('manage.tags.store', ['current_team' => $team->slug]), [
        'name' => 'Laravel',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'tag.created',
        'description' => "Tag 'Laravel' was created.",
    ]);

    $tag = Tag::where('name', 'Laravel')->first();
    expect($tag)->not->toBeNull();

    // 5. Update Tag
    $this->actingAs($user)->put(route('manage.tags.update', ['current_team' => $team->slug, 'tag' => $tag->slug]), [
        'name' => 'Laravel (Updated)',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'tag.updated',
        'description' => "Tag 'Laravel (Updated)' was updated.",
    ]);

    $tag = $tag->fresh();

    // 6. Delete Tag
    $this->actingAs($user)->delete(route('manage.tags.destroy', ['current_team' => $team->slug, 'tag' => $tag->slug]));

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'tag.deleted',
        'description' => "Tag 'Laravel (Updated)' was deleted.",
    ]);

    Event::assertDispatched(TeamActivityRecorded::class);
});

test('invitation actions and member actions log activities', function () {
    Event::fake([TeamActivityRecorded::class]);

    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);

    // 1. Send Invitation
    $this->actingAs($owner)->post(route('teams.invitations.store', $team), [
        'email' => 'invitee@example.com',
        'role' => TeamRole::Member->value,
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'invitation.sent',
        'description' => 'Invitation sent to invitee@example.com with role member.',
    ]);

    $invitation = TeamInvitation::where('email', 'invitee@example.com')->first();
    expect($invitation)->not->toBeNull();

    // 2. Decline Invitation
    $this->actingAs($owner)->post(route('invitations.decline', $invitation));

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'invitation.declined',
        'description' => 'Invitation for invitee@example.com was declined.',
    ]);

    // 3. Send Invitation again and Accept Invitation
    $this->actingAs($owner)->post(route('teams.invitations.store', $team), [
        'email' => 'invitee2@example.com',
        'role' => TeamRole::Admin->value,
    ]);

    $invitation2 = TeamInvitation::where('email', 'invitee2@example.com')->first();
    $invitee = User::factory()->create(['email' => 'invitee2@example.com']);

    $this->actingAs($invitee)->post(route('invitations.accept', $invitation2));

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'invitation.accepted',
        'description' => 'Invitation for invitee2@example.com was accepted.',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'member.joined',
        'description' => "{$invitee->name} joined the team.",
    ]);

    // 4. Update Member Role
    $this->actingAs($owner)->patch(route('teams.members.update', [$team, $invitee]), [
        'role' => TeamRole::Member->value,
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'member.updated',
        'description' => "{$invitee->name}'s role was updated to member.",
    ]);

    // 5. Remove Member
    $this->actingAs($owner)->delete(route('teams.members.destroy', [$team, $invitee]));

    $this->assertDatabaseHas('activity_logs', [
        'team_id' => $team->id,
        'event' => 'member.removed',
        'description' => "{$invitee->name} was removed from the team.",
    ]);

    Event::assertDispatched(TeamActivityRecorded::class);
});
