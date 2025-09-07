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
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Check if the user already exists in the database
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // User exists, log them in
                Auth::login($user);
            } else {
                // User does not exist, create and log them in
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'email_verified_at' => now(),
                    'password' => bcrypt(Str::random(24)), // A random password
                    'avatar' => $googleUser->getAvatar(),
                ]);

                Auth::login($user);
            }

            return redirect()->intended('/home');
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['message' => 'Unable to login, try again.']);
        }
    }
    public function handleGithubCallback()
    {
        try {
            $githubUser = Socialite::driver('github')->stateless()->user();

            // Check if user exists
            $user = User::where('email', $githubUser->getEmail())->first();

            if ($user) {
                Auth::login($user);
            } else {
                $user = User::create([
                    'name' => $githubUser->getName() ?? $githubUser->getNickname(),
                    'email' => $githubUser->getEmail(),
                    'email_verified_at' => now(),
                    'password' => bcrypt(Str::random(24)),
                    'avatar' => $githubUser->getAvatar(),
                ]);

                Auth::login($user);
            }

            return redirect()->intended('/home');
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['message' => 'Unable to login with GitHub, try again.']);
        }
    }
}
