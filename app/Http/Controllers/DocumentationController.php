<?php

namespace App\Http\Controllers;

use App\FrameX\Modules\Forms\Models\Form;
use App\Services\DocumentationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentationController extends Controller
{
    public function __construct(
        protected DocumentationService $docsService
    ) {}

    /**
     * Display the static Markdown documentation index hub.
     */
    public function index(Request $request): Response
    {
        $sections = $this->docsService->getSections();

        $totalDocs = array_reduce(
            $sections,
            fn ($carry, $section) => $carry + count($section['docs']),
            0
        );

        return Inertia::render('docs/index', [
            'sections' => $sections,
            'totalDocs' => $totalDocs,
        ]);
    }

    /**
     * Display a single static Markdown documentation guide.
     */
    public function show(string $slug): Response
    {
        $doc = $this->docsService->find($slug);

        if (! $doc) {
            abort(404, "Documentation article [{$slug}] not found.");
        }

        $feedbackForm = Form::where('slug', 'doc-feedback')
            ->where('is_active', true)
            ->first();

        return Inertia::render('docs/show', [
            'doc' => [
                'title' => $doc['title'],
                'slug' => $doc['slug'],
                'description' => $doc['description'],
                'category' => $doc['category'],
                'badge' => $doc['badge'],
                'reading_time' => $doc['reading_time'],
                'body_html' => $doc['body_html'],
            ],
            'sections' => $this->docsService->getSections(),
            'siblings' => $doc['siblings'],
            'toc' => $doc['toc'],
            'prev' => $doc['prev'],
            'next' => $doc['next'],
            'feedbackForm' => $feedbackForm ? [
                'id' => $feedbackForm->id,
                'slug' => $feedbackForm->slug,
                'name' => $feedbackForm->name,
                'fields' => $feedbackForm->fields,
                'submit_button_text' => $feedbackForm->submit_button_text,
                'success_message' => $feedbackForm->success_message,
            ] : null,
        ]);
    }
}
