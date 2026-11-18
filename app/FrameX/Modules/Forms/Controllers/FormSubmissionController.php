<?php

namespace App\FrameX\Modules\Forms\Controllers;

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Services\FormService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FormSubmissionController extends Controller
{
    public function __construct(
        protected FormService $formService
    ) {}

    /**
     * Render the public hosted (or embeddable) form page.
     */
    public function show(Request $request, string $slug): Response
    {
        $form = Form::with('team:id,name,slug')
            ->where('slug', $slug)
            ->firstOrFail();

        $user = $request->user();
        $isTeamMember = $user !== null
            && $form->team !== null
            && $user->belongsToTeam($form->team);

        $isPreview = $request->boolean('preview') && $isTeamMember;
        $isEmbed = $request->boolean('embed');

        return Inertia::render('forms/show', [
            'form' => [
                'id' => $form->id,
                'name' => $form->name,
                'slug' => $form->slug,
                'description' => $form->description,
                'fields' => $form->fields ?? [],
                'submit_button_text' => $form->submit_button_text ?: 'Submit',
                'success_message' => $form->success_message ?: 'Thank you! Your submission has been received.',
                'redirect_url' => $form->redirect_url,
                'is_active' => $form->is_active,
                'team_name' => $form->team?->name,
            ],
            'isEmbed' => $isEmbed,
            'isPreview' => $isPreview,
        ]);
    }

    /**
     * Handle public form submission.
     */
    public function submit(Request $request, string $slug): JsonResponse|RedirectResponse
    {
        $form = Form::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $validated = $this->formService->validateSubmission($form, $request->all());

        $submission = $this->formService->storeSubmission(
            $form,
            $validated,
            $request->ip(),
            $request->userAgent()
        );

        $message = $form->success_message ?: 'Thank you! Your submission has been received.';

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'submission_id' => $submission->id,
                'redirect_url' => $form->redirect_url,
            ]);
        }

        if ($form->redirect_url) {
            return redirect()->away($form->redirect_url);
        }

        return back()->with('success', $message);
    }
}
