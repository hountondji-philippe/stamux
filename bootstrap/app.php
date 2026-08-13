<?php

use App\Http\Middleware\AuditLog;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: ['api/*']);
        $middleware->append(SecurityHeaders::class);
        $middleware->append(AuditLog::class);

        $middleware->alias([
            'role' => EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\App\Exceptions\AccountNotActiveException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'ACCOUNT_NOT_ACTIVE', 'message' => $e->getMessage()],
            ], 403);
        });

        $exceptions->render(function (\App\Exceptions\InvalidInvitationTokenException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'INVALID_TOKEN', 'message' => $e->getMessage()],
            ], 422);
        });

        $exceptions->render(function (\App\Exceptions\AttendanceAlreadyRecordedException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'ATTENDANCE_ALREADY_RECORDED', 'message' => $e->getMessage()],
            ], 422);
        });

        $exceptions->render(function (\App\Exceptions\InternshipNotActiveException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'INTERNSHIP_NOT_ACTIVE', 'message' => $e->getMessage()],
            ], 422);
        });

        $exceptions->render(function (\App\Exceptions\OutsideAllowedLocationException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'OUTSIDE_ALLOWED_LOCATION', 'message' => $e->getMessage()],
            ], 422);
        });

        $exceptions->render(function (\App\Exceptions\InternNotAssignedToMentorException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'INTERN_NOT_ASSIGNED', 'message' => $e->getMessage()],
            ], 403);
        });

        $exceptions->render(function (\App\Exceptions\UnauthorizedTaskTransitionException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'UNAUTHORIZED_TRANSITION', 'message' => $e->getMessage()],
            ], 403);
        });

        $exceptions->render(function (\App\Exceptions\UnauthorizedDocumentAccessException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_AVAILABLE', 'message' => $e->getMessage()],
            ], 422);
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'UNAUTHENTICATED', 'message' => 'Non authentifié.'],
            ], 401);
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'UNAUTHORIZED', 'message' => 'Action non autorisée.'],
            ], 403);
        });


        $exceptions->render(function (\App\Exceptions\PermissionAlreadyReviewedException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'PERMISSION_ALREADY_REVIEWED', 'message' => $e->getMessage()],
            ], 422);
        });

        $exceptions->render(function (\App\Exceptions\OverlappingPermissionException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'OVERLAPPING_PERMISSION', 'message' => $e->getMessage()],
            ], 422);
        });

        $exceptions->render(function (\App\Exceptions\DocumentAlreadyRequestedException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_ALREADY_REQUESTED', 'message' => $e->getMessage()],
            ], 422);
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Les données envoyées sont invalides.',
                    'details' => $e->errors(),
                ],
            ], 422);
        });
    })->create();