<?php

namespace App\FrameX\Modules\ContentStudio\Controllers;

use App\FrameX\Modules\ContentStudio\Services\SeoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    /**
     * Render dynamic XML sitemap.
     */
    public function sitemap(SeoService $seoService): Response
    {
        $xml = $seoService->generateSitemapXml();

        return response($xml, 200, [
            'Content-Type' => 'text/xml',
        ]);
    }
}
