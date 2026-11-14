<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()->is_admin, 403);

        return Inertia::render('admin/index', [
            'metrics' => [
                ['label' => 'Users', 'value' => User::count()],
                ['label' => 'Teams', 'value' => Team::count()],
                ['label' => 'Activity events', 'value' => ActivityLog::count()],
            ],
            'latestUsers' => User::latest()->limit(8)->get(['id', 'name', 'email', 'created_at']),
            'latestTeams' => Team::latest()->limit(8)->get(['id', 'name', 'slug', 'created_at']),
        ]);
    }
}
