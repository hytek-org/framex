<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/notifications', [
            'preferences' => $request->user()->notificationPreference()->firstOrCreate(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_updates' => ['boolean'],
            'security_alerts' => ['boolean'],
            'billing_alerts' => ['boolean'],
            'weekly_summary' => ['boolean'],
        ]);

        $request->user()->notificationPreference()->updateOrCreate([], $validated);

        return back();
    }
}
