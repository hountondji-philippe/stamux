<?php

use App\Http\Controllers\Api\Admin\AdminAuditLogController;
use App\Http\Controllers\Api\Admin\AdminInternshipController;
use App\Http\Controllers\Api\Admin\AdminStatsController;
use App\Http\Controllers\Api\Admin\RolePermissionController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\InternshipFeedbackController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\InternshipController;

Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('forgot-password', [\App\Http\Controllers\Api\Auth\ForgotPasswordController::class, 'store'])->middleware('throttle:5,1');
        Route::post('reset-password', [\App\Http\Controllers\Api\Auth\ResetPasswordController::class, 'store'])->middleware('throttle:5,1');
        Route::get('invitation/{token}', [AuthController::class, 'checkInvitation'])->middleware('throttle:10,1');
        Route::post('invitation/accept', [AuthController::class, 'acceptInvitation'])->middleware('throttle:5,1');
        Route::post('setup-admin', [AuthController::class, 'setupAdmin'])->middleware('throttle:5,1');
    });

    Route::get('settings', [\App\Http\Controllers\Api\Admin\PlatformSettingsController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::prefix('me')->controller(MeController::class)->group(function () {
            Route::get('/', 'show');
            Route::patch('/', 'update');
            Route::post('avatar', 'uploadAvatar');
            Route::post('mfa', 'enableMfa');
            Route::patch('mfa/secret', 'updateMfaSecret');
            Route::get('notifications', 'notifications');
            Route::get('profile-overview', 'profileOverview');
            Route::patch('notifications/{id}/read', 'markOneNotificationRead');
            Route::delete('notifications/{id}', 'deleteOneNotification');
            Route::delete('notifications', 'deleteAllNotifications');
            Route::post('notifications/read', 'markNotificationsRead');
            Route::get('data-export', 'dataExport');
            Route::patch('password', 'updatePassword');
        });

        Route::prefix('messaging')->controller(\App\Http\Controllers\MessagingController::class)->group(function () {
            Route::get('/', 'index');
            Route::get('unread-count', 'unreadCount');
            Route::post('start', 'start');
            Route::get('{conversation}/messages', 'messages');
            Route::post('{conversation}/messages', 'store');
            Route::post('{conversation}/read', 'markRead');
        });

        Route::get('directory', [\App\Http\Controllers\Api\DirectoryController::class, 'index']);

        Route::prefix('feedback')->controller(InternshipFeedbackController::class)->group(function () {
            Route::post('/', 'store');
        });

        Route::prefix('internships')->controller(InternshipController::class)->group(function () {
            Route::get('mentor-overview', 'mentorOverview');
            Route::post('/', 'store');
            Route::get('/', 'index');
            Route::get('{id}', 'show');
            Route::get('{id}/projects-overview', 'internProjectsOverview');
            Route::post('{id}/terminate', 'terminate');
        });

        Route::prefix('attendance')->controller(AttendanceController::class)->group(function () {
            Route::post('/', 'store');
            Route::get('/', 'history');
            Route::get('dashboard', 'dashboard');
            Route::get('{internId}', 'byIntern');
            Route::patch('{id}/departure', 'recordDeparture');
            Route::patch('{id}', 'correct');
        });

        Route::prefix('permissions')->controller(PermissionController::class)->group(function () {
            Route::post('/', 'store');
            Route::get('/', 'history');
            Route::get('pending', 'pending');
            Route::post('{id}/review', 'review');
        });

        Route::prefix('internship-date-changes')->controller(\App\Http\Controllers\Api\InternshipDateChangeController::class)->group(function () {
            Route::post('/', 'store');
            Route::get('/', 'history');
            Route::get('pending', 'pending');
            Route::post('{id}/review', 'review');
        });

        Route::prefix('reports')->controller(ReportController::class)->group(function () {
            Route::post('/', 'store');
            Route::get('/', 'index');
            Route::get('pending', 'pending');
            Route::get('{id}', 'show');
            Route::patch('{id}', 'update');
            Route::delete('{id}', 'destroy');
            Route::post('{id}/validate', 'validateReport');
            Route::get('{id}/download', 'download');
        });

        Route::prefix('projects')->controller(ProjectController::class)->group(function () {
            Route::post('/', 'store');
            Route::get('/', 'index');
            Route::get('{id}', 'show');
            Route::patch('{id}', 'update');
            Route::post('{id}/assign', 'assign');
            Route::delete('{id}/assign/{internId}', 'unassign');
            Route::patch('{id}/progress', 'updateProgress');
            Route::post('{id}/evaluate/{internId}', 'evaluate');
        });

        Route::prefix('projects/{projectId}/tasks')->controller(TaskController::class)->group(function () {
            Route::post('/', 'store');
            Route::get('/', 'byProject');
        });

        Route::prefix('tasks')->controller(TaskController::class)->group(function () {
            Route::get('{id}', 'show');
            Route::patch('{id}', 'update');
            Route::patch('{id}/my-status', 'updateMyStatus');
            Route::delete('{id}', 'destroy');
        });

        Route::prefix('documents')->controller(DocumentController::class)->group(function () {
            Route::post('request', 'store');
            Route::get('/', 'index');
            Route::get('pending', 'pending');
            Route::post('{id}/mentor-validate', 'mentorValidate');
            Route::post('{id}/upload', 'upload');
            Route::post('{id}/reject', 'reject');
            Route::get('{id}/download', 'download');
            Route::get('{id}/download-file', 'downloadFile');
            Route::patch('{id}', 'update');
            Route::delete('{id}', 'destroy');
        });

        Route::prefix('events')->controller(EventController::class)->group(function () {
            Route::post('/', 'store');
            Route::get('/', 'index');
            Route::get('{id}', 'show');
            Route::patch('{id}', 'update');
            Route::delete('{id}', 'destroy');
        });

        Route::prefix('admin')->group(function () {
            Route::prefix('settings')->controller(\App\Http\Controllers\Api\Admin\PlatformSettingsController::class)->group(function () {
                Route::patch('/', 'update');
                Route::post('logo', 'uploadLogo');
                Route::post('favicon', 'uploadFavicon');
            });
            Route::prefix('users')->controller(AdminUserController::class)->group(function () {
                Route::get('/', 'index');
                Route::get('{id}/overview', 'overview');
                Route::patch('{id}/rate', 'rate');
                Route::post('/', 'store');
                Route::get('{id}', 'show');
                Route::patch('{id}', 'update');
                Route::delete('{id}', 'destroy');
                Route::post('{id}/assign-mentor', 'assignMentor');
                Route::post('{id}/terminate', 'terminate');
                Route::delete('{id}/purge', 'purge');
                Route::post('{id}/resend-invitation', 'resendInvitation')->middleware('throttle:10,1');
            });

            Route::prefix('internship-feedbacks')->controller(\App\Http\Controllers\Api\InternshipFeedbackController::class)->group(function () {
                Route::get('/', 'index');
            });
            Route::prefix('documents')->controller(DocumentController::class)->group(function () {
                Route::get('pending', 'adminPending');
            });

            Route::prefix('internships')->controller(AdminInternshipController::class)->group(function () {
                Route::patch('{internId}/dates', 'updateDates');
            });

            Route::prefix('audit-logs')->controller(AdminAuditLogController::class)->group(function () {
                Route::get('/', 'index');
            });

            Route::prefix('stats')->controller(AdminStatsController::class)->group(function () {
                Route::get('overview', 'overview');
                Route::get('attendance', 'attendance');
                Route::get('reports', 'reports');
                Route::get('documents', 'documents');
            });

            Route::prefix('role-permissions')->controller(RolePermissionController::class)->group(function () {
                Route::get('/', 'index');
                Route::patch('{id}', 'update');
            });

        });
    });
});