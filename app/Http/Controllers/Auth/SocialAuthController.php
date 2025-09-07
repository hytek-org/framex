<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }
    public function redirectToGithub()
    {
        return Socialite::driver('github')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $socialUser = Socialite::driver('google')->stateless()->user();

            $user = $this->findOrCreateUser($socialUser, 'google');

            Auth::login($user);

            return redirect()->intended('/home');

        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['message' => 'Unable to login, try again.']);
        }
    }
    public function handleGithubCallback()
    {
        try {
            $socialUser = Socialite::driver('github')->stateless()->user();

            $user = $this->findOrCreateUser($socialUser, 'github');

            Auth::login($user);

            return redirect()->intended('/home');
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['message' => 'Unable to login with GitHub, try again.']);
        }
    }


    /**
     * Centralized logic to find or create a local User from a Socialite user object.
     *
     * @param  \Laravel\Socialite\Contracts\User  $socialUser
     * @param  string  $provider (e.g. 'google', 'github')
     * @return \App\Models\User
     */
    protected function findOrCreateUser($socialUser, string $provider)
    {
        // 1) Try to find by email (preferred)
        $email = $socialUser->getEmail();

        if ($email) {
            $existing = User::where('email', $email)->first();
            if ($existing) {
                // Make sure provider info is stored (optional)
                $existing->update([
                    'provider' => $existing->provider ?? $provider,
                    'provider_id' => $existing->provider_id ?? $socialUser->getId(),
                    'avatar' => $existing->avatar ?? $socialUser->getAvatar(),
                ]);
                return $existing;
            }
        }

        // 2) Try to find by provider + provider_id (if user previously signed up via provider)
        $userByProvider = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();
        if ($userByProvider) {
            return $userByProvider;
        }

        // 3) Email missing or not found — create a new user.
        // If email is missing from provider (common with GitHub when email is private),
        // create a synthetic unique email to satisfy DB constraints:
        if (!$email) {
            $host = parse_url(config('app.url'), PHP_URL_HOST) ?: 'local';
            $email = $provider . '_' . $socialUser->getId() . '@' . $host;
            // do not mark email verified in this case
            $emailVerifiedAt = null;
        } else {
            $emailVerifiedAt = now();
        }


        // Build a sensible name fallback
        $name = $socialUser->getName() ?: $socialUser->getNickname() ?: 'User ' . $socialUser->getId();

        // Create user (ensure User model has fillable for these fields)
        $newUser = User::create([
            'name' => $name,
            'email' => $email,
            'email_verified_at' => $emailVerifiedAt,
            'password' => bcrypt(Str::random(24)), // random password — social login used
            'avatar' => $socialUser->getAvatar(),
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
        ]);

        return $newUser;
    }
}
