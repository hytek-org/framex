<?php

namespace App\FrameX\Modules\Forms\Controllers;

use App\FrameX\Modules\Forms\Models\Form;
use App\FrameX\Modules\Forms\Services\FormService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FormSubmissionController extends Controller
{
    public function __construct(
        protected FormService $formService
    ) {}

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
            ]);
        }

        if ($form->redirect_url) {
            return redirect()->away($form->redirect_url);
        }

        return back()->with('success', $message);
    }
}
