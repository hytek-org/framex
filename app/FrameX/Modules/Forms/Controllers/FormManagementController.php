<?php

namespace App\FrameX\Modules\Forms\Controllers;

use App\FrameX\Modules\Forms\Models\Form;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FormManagementController extends Controller
{
    protected function getTeam(Request $request): Team
    {
        $slug = $request->route('current_team');
        if ($slug) {
            $team = Team::where('slug', $slug)->first();
            if ($team) {
                return $team;
            }
        }

        return Auth::user()->currentTeam;
    }

    /**
     * Display list of forms in current workspace.
     */
    public function index(Request $request): Response
    {
        $team = $this->getTeam($request);

        $forms = Form::where('team_id', $team->id)
            ->withCount('submissions')
            ->latest()
            ->paginate(15);

        return Inertia::render('manage/forms/index', [
            'forms' => $forms,
        ]);
    }

    /**
     * Show form builder creation screen.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('manage/forms/builder', [
            'form' => null,
        ]);
    }

    /**
     * Store a newly created form.
     */
    public function store(Request $request): RedirectResponse
    {
        $team = $this->getTeam($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'required|array|min:1',
            'fields.*.name' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|string',
            'fields.*.required' => 'boolean',
            'fields.*.placeholder' => 'nullable|string',
            'submit_button_text' => 'nullable|string',
            'success_message' => 'nullable|string',
            'redirect_url' => 'nullable|url',
            'is_active' => 'boolean',
            'notify_team' => 'boolean',
        ]);

        $slug = $validated['slug'] ? Str::slug($validated['slug']) : Str::slug($validated['name']);

        $form = Form::create([
            'team_id' => $team->id,
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'fields' => $validated['fields'],
            'submit_button_text' => $validated['submit_button_text'] ?? 'Submit',
            'success_message' => $validated['success_message'] ?? 'Thank you! Your submission has been received.',
            'redirect_url' => $validated['redirect_url'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'notify_team' => $validated['notify_team'] ?? true,
        ]);

        return redirect("/{$team->slug}/forms")->with('success', 'Form created successfully.');
    }

    /**
     * Show form builder edit screen.
     */
    public function edit(Request $request, string $current_team, Form $form): Response
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        return Inertia::render('manage/forms/builder', [
            'form' => $form,
        ]);
    }

    /**
     * Update an existing form.
     */
    public function update(Request $request, string $current_team, Form $form): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'required|array|min:1',
            'fields.*.name' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|string',
            'fields.*.required' => 'boolean',
            'fields.*.placeholder' => 'nullable|string',
            'submit_button_text' => 'nullable|string',
            'success_message' => 'nullable|string',
            'redirect_url' => 'nullable|url',
            'is_active' => 'boolean',
            'notify_team' => 'boolean',
        ]);

        $form->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ? Str::slug($validated['slug']) : $form->slug,
            'description' => $validated['description'] ?? null,
            'fields' => $validated['fields'],
            'submit_button_text' => $validated['submit_button_text'] ?? 'Submit',
            'success_message' => $validated['success_message'] ?? 'Thank you! Your submission has been received.',
            'redirect_url' => $validated['redirect_url'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'notify_team' => $validated['notify_team'] ?? true,
        ]);

        return redirect("/{$team->slug}/forms")->with('success', 'Form updated successfully.');
    }

    /**
     * Delete a form.
     */
    public function destroy(Request $request, string $current_team, Form $form): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $form->delete();

        return redirect("/{$team->slug}/forms")->with('success', 'Form deleted successfully.');
    }

    /**
     * View form submissions.
     */
    public function submissions(Request $request, string $current_team, Form $form): Response
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $submissions = $form->submissions()
            ->latest()
            ->paginate(25);

        return Inertia::render('manage/forms/submissions', [
            'form' => $form,
            'submissions' => $submissions,
        ]);
    }

    /**
     * Export submissions as JSON.
     */
    public function export(Request $request, string $current_team, Form $form): JsonResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $submissions = $form->submissions()->latest()->get();

        return response()->json([
            'form' => [
                'id' => $form->id,
                'name' => $form->name,
                'slug' => $form->slug,
            ],
            'exported_at' => now()->toIso8601String(),
            'count' => $submissions->count(),
            'submissions' => $submissions,
        ]);
    }
}
