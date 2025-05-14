<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
  ->withExceptions(function (Exceptions $exceptions) {
        // Define handled status codes
        $handledStatusCodes = [
            400, 401, 402, 403, 404, 405, 408, 411, 413, 414, 415, 418, 419, 429, 500, 502, 503, 504
        ];
   // Custom error handling for production
   if (app()->environment('production')) {
    $exceptions->respond(function (Response $response, Throwable $exception, Request $request) use ($handledStatusCodes) {
        $statusCode = $response->getStatusCode();
        if (in_array($statusCode, $handledStatusCodes)) {
            return Inertia::render('ErrorPage', [
                'status' => $statusCode,
                'message' => $statusCode === 419 ? 'The page expired, please try again.' : $exception->getMessage(),
            ])
                ->toResponse($request)
                ->setStatusCode($statusCode);
        }

        return $response;
    });
}
    })->create();
