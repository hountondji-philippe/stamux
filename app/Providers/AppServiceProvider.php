<?php

namespace App\Providers;

use App\Models\Attendance;
use App\Models\Document;
use App\Models\Event;
use App\Models\Project;
use App\Models\Report;
use App\Models\Task;
use App\Models\User;
use App\Policies\AttendancePolicy;
use App\Policies\DocumentPolicy;
use App\Policies\EventPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\ReportPolicy;
use App\Policies\TaskPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoApiTransport;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        Gate::policy(Attendance::class, AttendancePolicy::class);
        Gate::policy(Report::class, ReportPolicy::class);
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
        Gate::policy(Document::class, DocumentPolicy::class);
        Gate::policy(Event::class, EventPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        Mail::extend('brevo', function () {
            return new BrevoApiTransport(config('services.brevo.key'));
        });
    }
}