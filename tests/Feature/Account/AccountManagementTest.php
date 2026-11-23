<?php

use App\Models\AccountAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('account overview page loads successfully for authenticated user', function () {
    $user = User::factory()->create([
        'name' => 'Enterprise User',
        'email' => 'enterprise@example.com',
    ]);

    $response = $this->actingAs($user)->get('/account');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('account/index')
        ->has('profile')
        ->where('profile.name', 'Enterprise User')
        ->where('profile.email', 'enterprise@example.com')
        ->has('recentActivity')
        ->has('activeSessions')
    );
});

test('unauthenticated users are redirected from account pages', function () {
    $this->get('/account')->assertRedirect('/login');
    $this->get('/account/profile')->assertRedirect('/login');
    $this->get('/account/preferences')->assertRedirect('/login');
    $this->get('/account/sessions')->assertRedirect('/login');
    $this->get('/account/activity')->assertRedirect('/login');
});

test('account profile page loads with initial user data and timezones', function () {
    $user = User::factory()->create([
        'job_title' => 'Senior Architect',
        'department' => 'Core Systems',
    ]);

    $response = $this->actingAs($user)->get('/account/profile');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('account/profile')
        ->where('user.job_title', 'Senior Architect')
        ->where('user.department', 'Core Systems')
        ->has('timezones')
    );
});

test('user can update personal profile information and avatar', function () {
    Storage::fake('public');

    $user = User::factory()->create([
        'name' => 'Original Name',
        'phone' => null,
    ]);

    $file = UploadedFile::fake()->image('profile.jpg', 200, 200);

    $response = $this->actingAs($user)->post('/account/profile', [
        'name' => 'Updated Enterprise Name',
        'email' => $user->email,
        'phone' => '+1 (555) 019-9999',
        'job_title' => 'VP of Engineering',
        'department' => 'Technology',
        'timezone' => 'America/New_York',
        'avatar' => $file,
    ]);

    $response->assertRedirect();
    $user->refresh();

    expect($user->name)->toBe('Updated Enterprise Name');
    expect($user->phone)->toBe('+1 (555) 019-9999');
    expect($user->job_title)->toBe('VP of Engineering');
    expect($user->department)->toBe('Technology');
    expect($user->timezone)->toBe('America/New_York');
    expect($user->avatar)->not->toBeNull();

    Storage::disk('public')->assertExists($user->avatar);

    expect(AccountAuditLog::where('user_id', $user->id)
        ->where('action', 'profile.updated')
        ->exists())->toBeTrue();
});

test('changing email resets email_verified_at and logs email.changed audit', function () {
    $user = User::factory()->create([
        'email' => 'old@example.com',
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->post('/account/profile', [
        'name' => $user->name,
        'email' => 'new@example.com',
    ]);

    $response->assertRedirect();
    $user->refresh();

    expect($user->email)->toBe('new@example.com');
    expect($user->email_verified_at)->toBeNull();

    expect(AccountAuditLog::where('user_id', $user->id)
        ->where('action', 'email.changed')
        ->exists())->toBeTrue();
});

test('user can update preferences and notification settings', function () {
    $user = User::factory()->create([
        'theme' => 'light',
        'locale' => 'en',
    ]);

    $response = $this->actingAs($user)->patch('/account/preferences', [
        'theme' => 'dark',
        'locale' => 'fr',
        'timezone' => 'Europe/Paris',
        'date_format' => 'DD/MM/YYYY',
        'time_format' => '24h',
        'security_alerts' => true,
        'billing_alerts' => false,
        'weekly_summary' => true,
        'product_updates' => false,
    ]);

    $response->assertRedirect();
    $user->refresh();

    expect($user->theme)->toBe('dark');
    expect($user->locale)->toBe('fr');
    expect($user->timezone)->toBe('Europe/Paris');
    expect($user->date_format)->toBe('DD/MM/YYYY');
    expect($user->time_format)->toBe('24h');

    $notifPref = $user->notificationPreference;
    expect($notifPref->security_alerts)->toBeTrue();
    expect($notifPref->billing_alerts)->toBeFalse();
    expect($notifPref->weekly_summary)->toBeTrue();
    expect($notifPref->product_updates)->toBeFalse();

    expect(AccountAuditLog::where('user_id', $user->id)
        ->where('action', 'preferences.updated')
        ->exists())->toBeTrue();
});

test('user can view active sessions', function () {
    $user = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'session_test_123',
        'user_id' => $user->id,
        'ip_address' => '192.168.1.1',
        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'payload' => 'dummy',
        'last_activity' => time(),
    ]);

    $response = $this->actingAs($user)->get('/account/sessions');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('account/sessions')
        ->has('sessions', 1)
        ->where('sessions.0.platform', 'Windows')
        ->where('sessions.0.browser', 'Chrome')
    );
});

test('user can terminate a specific remote session with password confirmation', function () {
    $user = User::factory()->create([
        'password' => bcrypt('correct-password'),
    ]);

    DB::table('sessions')->insert([
        'id' => 'session_to_destroy',
        'user_id' => $user->id,
        'ip_address' => '10.0.0.1',
        'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'payload' => 'dummy',
        'last_activity' => time() - 3600,
    ]);

    // Wrong password fails
    $badResponse = $this->actingAs($user)->delete('/account/sessions/session_to_destroy', [
        'password' => 'wrong-password',
    ]);
    $badResponse->assertSessionHasErrors('password');
    expect(DB::table('sessions')->where('id', 'session_to_destroy')->exists())->toBeTrue();

    // Correct password succeeds
    $goodResponse = $this->actingAs($user)->delete('/account/sessions/session_to_destroy', [
        'password' => 'correct-password',
    ]);
    $goodResponse->assertRedirect();
    expect(DB::table('sessions')->where('id', 'session_to_destroy')->exists())->toBeFalse();

    expect(AccountAuditLog::where('user_id', $user->id)
        ->where('action', 'session.terminated')
        ->exists())->toBeTrue();
});

test('user can terminate all other sessions with password confirmation', function () {
    $user = User::factory()->create([
        'password' => bcrypt('correct-password'),
    ]);

    DB::table('sessions')->insert([
        [
            'id' => 'session_other_1',
            'user_id' => $user->id,
            'ip_address' => '1.1.1.1',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'dummy',
            'last_activity' => time(),
        ],
        [
            'id' => 'session_other_2',
            'user_id' => $user->id,
            'ip_address' => '2.2.2.2',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'dummy',
            'last_activity' => time(),
        ],
    ]);

    $response = $this->actingAs($user)->delete('/account/sessions', [
        'password' => 'correct-password',
    ]);

    $response->assertRedirect();
    expect(DB::table('sessions')->where('user_id', $user->id)->count())->toBe(0);

    expect(AccountAuditLog::where('user_id', $user->id)
        ->where('action', 'session.terminated_all')
        ->exists())->toBeTrue();
});

test('account activity page displays audit logs with action filters', function () {
    $user = User::factory()->create();

    AccountAuditLog::create([
        'user_id' => $user->id,
        'action' => 'login',
        'description' => 'Signed into platform',
        'ip_address' => '127.0.0.1',
    ]);

    AccountAuditLog::create([
        'user_id' => $user->id,
        'action' => 'profile.updated',
        'description' => 'Updated personal details',
        'ip_address' => '127.0.0.1',
    ]);

    // View all
    $responseAll = $this->actingAs($user)->get('/account/activity');
    $responseAll->assertOk();
    $responseAll->assertInertia(fn ($page) => $page
        ->component('account/activity')
        ->has('activities.data', 2)
    );

    // View filtered
    $responseFiltered = $this->actingAs($user)->get('/account/activity?action=login');
    $responseFiltered->assertOk();
    $responseFiltered->assertInertia(fn ($page) => $page
        ->component('account/activity')
        ->has('activities.data', 1)
        ->where('activities.data.0.action', 'login')
    );
});

test('user can delete account with password confirmation', function () {
    $user = User::factory()->create([
        'password' => bcrypt('delete-me-password'),
    ]);

    $response = $this->actingAs($user)->delete('/account', [
        'password' => 'delete-me-password',
    ]);

    $response->assertRedirect('/');
    expect(User::find($user->id))->toBeNull();
});

test('successful login triggers RecordSuccessfulLogin listener and updates last login attributes', function () {
    $user = User::factory()->create([
        'password' => bcrypt('login-test-password'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'login-test-password',
    ]);

    $response->assertRedirect();
    $user->refresh();

    expect($user->last_login_at)->not->toBeNull();
    expect(AccountAuditLog::where('user_id', $user->id)
        ->where('action', 'login')
        ->exists())->toBeTrue();
});
