<?php

use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentType;
use App\Models\User;
use App\Policies\ContentPolicy;

test('owner has all content and media permissions', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;

    expect($owner->hasTeamPermission($team, TeamPermission::CreateContent))->toBeTrue()
        ->and($owner->hasTeamPermission($team, TeamPermission::UpdateContent))->toBeTrue()
        ->and($owner->hasTeamPermission($team, TeamPermission::PublishContent))->toBeTrue()
        ->and($owner->hasTeamPermission($team, TeamPermission::DeleteContent))->toBeTrue()
        ->and($owner->hasTeamPermission($team, TeamPermission::ManageMedia))->toBeTrue();

    $permissions = $owner->toTeamPermissions($team);
    expect($permissions->canCreateContent)->toBeTrue()
        ->and($permissions->canPublishContent)->toBeTrue()
        ->and($permissions->canDeleteContent)->toBeTrue()
        ->and($permissions->canManageMedia)->toBeTrue();
});

test('admin has content and media management permissions', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;

    $admin = User::factory()->create();
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);

    expect($admin->hasTeamPermission($team, TeamPermission::CreateContent))->toBeTrue()
        ->and($admin->hasTeamPermission($team, TeamPermission::UpdateContent))->toBeTrue()
        ->and($admin->hasTeamPermission($team, TeamPermission::PublishContent))->toBeTrue()
        ->and($admin->hasTeamPermission($team, TeamPermission::DeleteContent))->toBeTrue()
        ->and($admin->hasTeamPermission($team, TeamPermission::ManageMedia))->toBeTrue();

    $permissions = $admin->toTeamPermissions($team);
    expect($permissions->canCreateContent)->toBeTrue()
        ->and($permissions->canPublishContent)->toBeTrue()
        ->and($permissions->canDeleteContent)->toBeTrue()
        ->and($permissions->canManageMedia)->toBeTrue();
});

test('member has drafting permissions but cannot publish or delete', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;

    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    expect($member->hasTeamPermission($team, TeamPermission::CreateContent))->toBeTrue()
        ->and($member->hasTeamPermission($team, TeamPermission::UpdateContent))->toBeTrue()
        ->and($member->hasTeamPermission($team, TeamPermission::PublishContent))->toBeFalse()
        ->and($member->hasTeamPermission($team, TeamPermission::DeleteContent))->toBeFalse()
        ->and($member->hasTeamPermission($team, TeamPermission::ManageMedia))->toBeFalse();

    $permissions = $member->toTeamPermissions($team);
    expect($permissions->canCreateContent)->toBeTrue()
        ->and($permissions->canPublishContent)->toBeFalse()
        ->and($permissions->canDeleteContent)->toBeFalse()
        ->and($permissions->canManageMedia)->toBeFalse();
});

test('content policy enforces granular role permissions', function () {
    $owner = User::factory()->create();
    $owner->refresh();
    $team = $owner->currentTeam;

    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->refresh();
    $member->update(['current_team_id' => $team->id]);
    $member->refresh();

    $postType = ContentType::where('slug', 'post')->first() ?? ContentType::factory()->post()->create();

    $contentByMember = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $member->id,
        'content_type_id' => $postType->id,
    ]);

    $contentByOwner = Content::factory()->create([
        'team_id' => $team->id,
        'author_id' => $owner->id,
        'content_type_id' => $postType->id,
    ]);

    $policy = new ContentPolicy;

    // View
    expect($policy->view($member, $contentByOwner))->toBeTrue();

    // Create
    expect($policy->create($member))->toBeTrue();

    // Update (member can update own content)
    expect($policy->update($member, $contentByMember))->toBeTrue();

    // Publish (member cannot publish, owner can)
    expect($policy->publish($member, $contentByMember))->toBeFalse()
        ->and($policy->publish($owner, $contentByMember))->toBeTrue();

    // Delete (member cannot delete, owner can)
    expect($policy->delete($member, $contentByMember))->toBeFalse()
        ->and($policy->delete($owner, $contentByMember))->toBeTrue();
});
