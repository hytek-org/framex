<?php

namespace App\FrameX\Modules\Forms\Controllers;

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Models\FormSubmission;
use App\FrameX\Modules\Forms\Requests\StoreFormRequest;
use App\FrameX\Modules\Forms\Requests\UpdateFormRequest;
use App\FrameX\Modules\Forms\Services\FormService;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FormManagementController extends Controller
{
    public function __construct(
        protected FormService $formService
    ) {}

    protected function getTeam(Request $request): Team
    {
        $slug = $request->route('current_team');
        if (is_string($slug) && $slug !== '') {
            $team = Team::where('slug', $slug)->first();
            if ($team) {
                return $team;
            }
        }

        return Auth::user()->currentTeam;
    }

    /**
     * Display list of forms in current workspace with summary metrics and filters.
     */
    public function index(Request $request): Response
    {
        $team = $this->getTeam($request);
        $search = trim((string) $request->input('search', ''));
        $status = (string) $request->input('status', 'all');

        $formsQuery = Form::where('team_id', $team->id)
            ->withCount([
                'submissions',
                'submissions as unread_submissions_count' => fn ($query) => $query->where('status', 'unread'),
            ]);

        if ($search !== '') {
            $formsQuery->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $formsQuery->where('is_active', true);
        } elseif ($status === 'paused') {
            $formsQuery->where('is_active', false);
        }

        $forms = $formsQuery
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $totalForms = Form::where('team_id', $team->id)->count();
        $activeForms = Form::where('team_id', $team->id)->where('is_active', true)->count();
        $totalSubmissions = FormSubmission::where('team_id', $team->id)->count();
        $unreadSubmissions = FormSubmission::where('team_id', $team->id)->where('status', 'unread')->count();

        return Inertia::render('manage/forms/index', [
            'forms' => $forms,
            'stats' => [
                'total_forms' => $totalForms,
                'active_forms' => $activeForms,
                'total_submissions' => $totalSubmissions,
                'unread_submissions' => $unreadSubmissions,
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'appUrl' => rtrim(url('/'), '/'),
        ]);
    }

    /**
     * Show form builder creation screen.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('manage/forms/builder', [
            'form' => null,
            'template' => (string) $request->input('template', ''),
            'appUrl' => rtrim(url('/'), '/'),
        ]);
    }

    /**
     * Store a newly created form.
     */
    public function store(StoreFormRequest $request): RedirectResponse
    {
        $team = $this->getTeam($request);
        $validated = $request->validated();

        $slug = ! empty($validated['slug'])
            ? $validated['slug']
            : $this->formService->generateUniqueSlug($team->id, $validated['name']);

        Form::create([
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

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Form \"{$validated['name']}\" created and ready to share.",
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

        $form->loadCount([
            'submissions',
            'submissions as unread_submissions_count' => fn ($query) => $query->where('status', 'unread'),
        ]);

        return Inertia::render('manage/forms/builder', [
            'form' => $form,
            'template' => '',
            'appUrl' => rtrim(url('/'), '/'),
        ]);
    }

    /**
     * Update an existing form.
     */
    public function update(UpdateFormRequest $request, string $current_team, Form $form): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $validated = $request->validated();

        $form->update([
            'name' => $validated['name'],
            'slug' => ! empty($validated['slug']) ? $validated['slug'] : $form->slug,
            'description' => $validated['description'] ?? null,
            'fields' => $validated['fields'],
            'submit_button_text' => $validated['submit_button_text'] ?? 'Submit',
            'success_message' => $validated['success_message'] ?? 'Thank you! Your submission has been received.',
            'redirect_url' => $validated['redirect_url'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'notify_team' => $validated['notify_team'] ?? true,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Changes to \"{$form->name}\" saved.",
        ]);

        return redirect("/{$team->slug}/forms")->with('success', 'Form updated successfully.');
    }

    /**
     * Toggle active/paused status of a form.
     */
    public function toggleStatus(Request $request, string $current_team, Form $form): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $form->update(['is_active' => ! $form->is_active]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $form->is_active
                ? "\"{$form->name}\" is now active and accepting submissions."
                : "\"{$form->name}\" has been paused.",
        ]);

        return back();
    }

    /**
     * Duplicate an existing form into a new paused copy.
     */
    public function duplicate(Request $request, string $current_team, Form $form): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $copy = $this->formService->duplicateForm($form);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Duplicated as \"{$copy->name}\". Review settings and activate when ready.",
        ]);

        return redirect("/{$team->slug}/forms/{$copy->id}/edit");
    }

    /**
     * Delete a form.
     */
    public function destroy(Request $request, string $current_team, Form $form): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $name = $form->name;
        $form->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Form \"{$name}\" deleted.",
        ]);

        return redirect("/{$team->slug}/forms")->with('success', 'Form deleted successfully.');
    }

    /**
     * View form submissions with search and status filtering.
     */
    public function submissions(Request $request, string $current_team, Form $form): Response
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $status = (string) $request->input('status', 'all');
        $search = trim((string) $request->input('search', ''));

        $query = $form->submissions()->latest();

        if (in_array($status, ['unread', 'read', 'spam', 'archived'], true)) {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('data', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        $submissions = $query->paginate(25)->withQueryString();

        $rawCounts = $form->submissions()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $statusCounts = [
            'all' => (int) $rawCounts->sum(),
            'unread' => (int) ($rawCounts['unread'] ?? 0),
            'read' => (int) ($rawCounts['read'] ?? 0),
            'archived' => (int) ($rawCounts['archived'] ?? 0),
            'spam' => (int) ($rawCounts['spam'] ?? 0),
        ];

        return Inertia::render('manage/forms/submissions', [
            'form' => $form,
            'submissions' => $submissions,
            'statusCounts' => $statusCounts,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'appUrl' => rtrim(url('/'), '/'),
        ]);
    }

    /**
     * Update a single submission's status.
     */
    public function updateSubmissionStatus(
        Request $request,
        string $current_team,
        Form $form,
        FormSubmission $submission
    ): RedirectResponse|JsonResponse {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);
        abort_unless($submission->form_id === $form->id, 404);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['unread', 'read', 'spam', 'archived'])],
        ]);

        $submission->update(['status' => $validated['status']]);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'submission' => $submission,
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Submission #{$submission->id} marked as {$validated['status']}.",
        ]);

        return back();
    }

    /**
     * Delete a single submission.
     */
    public function destroySubmission(
        Request $request,
        string $current_team,
        Form $form,
        FormSubmission $submission
    ): RedirectResponse {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);
        abort_unless($submission->form_id === $form->id, 404);

        $submission->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Submission #{$submission->id} deleted.",
        ]);

        return back();
    }

    /**
     * Execute bulk operations on selected submissions.
     */
    public function bulkSubmissions(Request $request, string $current_team, Form $form): RedirectResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
            'action' => ['required', 'string', Rule::in(['mark_read', 'mark_unread', 'archive', 'spam', 'delete'])],
        ]);

        $query = $form->submissions()->whereIn('id', $validated['ids']);
        $count = $query->count();

        match ($validated['action']) {
            'mark_read' => $query->update(['status' => 'read']),
            'mark_unread' => $query->update(['status' => 'unread']),
            'archive' => $query->update(['status' => 'archived']),
            'spam' => $query->update(['status' => 'spam']),
            'delete' => $query->delete(),
        };

        $label = match ($validated['action']) {
            'mark_read' => 'marked as read',
            'mark_unread' => 'marked as unread',
            'archive' => 'archived',
            'spam' => 'marked as spam',
            'delete' => 'deleted',
        };

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$count} submission(s) {$label}.",
        ]);

        return back();
    }

    /**
     * Export submissions as JSON or CSV.
     */
    public function export(Request $request, string $current_team, Form $form): JsonResponse|HttpResponse
    {
        $team = $this->getTeam($request);
        abort_unless($form->team_id === $team->id, 403);

        $status = (string) $request->input('status', 'all');
        $query = $form->submissions()->latest();

        if (in_array($status, ['unread', 'read', 'spam', 'archived'], true)) {
            $query->where('status', $status);
        }

        $submissions = $query->get();

        if ($request->input('format') === 'csv') {
            $csv = $this->formService->generateCsv($form, $submissions);
            $filename = "{$form->slug}-submissions-".now()->format('Y-m-d').'.csv';

            return response($csv, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]);
        }

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
