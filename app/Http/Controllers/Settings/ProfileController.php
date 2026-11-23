<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the authenticated user's read-only profile.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user, 403);

        return Inertia::render('profile/Index', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,

            'status' => $request->session()->get('status'),

            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,

                'jobTitle' => $user->job_title,
                'department' => $user->department,

                'isAdmin' => (bool) $user->is_admin,

                'emailVerifiedAt' => $user->email_verified_at?->toISOString(),

                'timezone' => $user->timezone,
                'locale' => $user->locale,
                'dateFormat' => $user->date_format,
                'timeFormat' => $user->time_format,
                'theme' => $user->theme,

                'plan' => $user->currentPlanName(),

                'createdAt' => $user->created_at?->toISOString(),
                'updatedAt' => $user->updated_at?->toISOString(),
                'lastLoginAt' => $user->last_login_at?->toISOString(),
            ],
        ]);
    }



}
