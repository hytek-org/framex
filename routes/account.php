<?php

use App\Http\Controllers\NotificationPreferenceController;
use App\Http\Controllers\Settings\AccountController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Teams\TeamController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\Teams\TeamMemberController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {

    // ── Enterprise Account Management Center ───────────────────────
    Route::get('account', [AccountController::class, 'index'])->name('account.index');
    Route::get('account/profile', [AccountController::class, 'profile'])->name('account.profile');
    Route::post('account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::get('account/preferences', [AccountController::class, 'preferences'])->name('account.preferences');
    Route::patch('account/preferences', [AccountController::class, 'updatePreferences'])->name('account.preferences.update');
    Route::get('account/sessions', [AccountController::class, 'sessions'])->name('account.sessions');
    Route::delete('account/sessions/{session}', [AccountController::class, 'destroySession'])->name('account.sessions.destroy');
    Route::delete('account/sessions', [AccountController::class, 'destroyOtherSessions'])->name('account.sessions.destroy-others');
    Route::get('account/activity', [AccountController::class, 'activity'])->name('account.activity');
    Route::delete('account', [AccountController::class, 'destroy'])->name('account.destroy');

    // ── Security & Authentication (Account Center) ─────────────────
    Route::get('account/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('account/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    // ── Teams & Workspaces (Account Center) ─────────────────────────
    Route::get('account/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('account/teams', [TeamController::class, 'store'])->name('teams.store');

    Route::middleware(EnsureTeamMembership::class)->group(function () {
        Route::get('account/teams/{team}', [TeamController::class, 'edit'])->name('teams.edit');
        Route::patch('account/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
        Route::delete('account/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
        Route::post('account/teams/{team}/switch', [TeamController::class, 'switch'])->name('teams.switch');
        Route::delete('account/teams/{team}/leave', [TeamController::class, 'leave'])->name('teams.leave');

        Route::patch('account/teams/{team}/members/{user}', [TeamMemberController::class, 'update'])->name('teams.members.update');
        Route::delete('account/teams/{team}/members/{user}', [TeamMemberController::class, 'destroy'])->name('teams.members.destroy');

        Route::post('account/teams/{team}/invitations', [TeamInvitationController::class, 'store'])->name('teams.invitations.store');
        Route::delete('account/teams/{team}/invitations/{invitation}', [TeamInvitationController::class, 'destroy'])->name('teams.invitations.destroy');
    });



});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.view');
    Route::get('/notifications', [NotificationPreferenceController::class, 'edit'])->name('notification-preferences.edit');
    Route::patch('/notifications', [NotificationPreferenceController::class, 'update'])->name('notification-preferences.update');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
