<?php

namespace App\Actions\Event;

use App\DTOs\PublishEventData;
use App\Enums\EventAudience;
use App\Enums\UserRole;
use App\Models\Event;
use App\Models\User;
use App\Notifications\EventPublishedNotification;
use App\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class PublishEventAction
{
    public function __construct(
        private EventRepositoryInterface $events,
    ) {
    }

    public function execute(PublishEventData $data): Event
    {
        $event = $this->events->create([
            'id' => (string) Str::uuid(),
            'author_id' => $data->author_id,
            'title' => $data->title,
            'content' => $data->content,
            'image_path' => $data->image_path,
            'audience' => $data->audience,
            'is_pinned' => $data->is_pinned ?? false,
            'published_at' => now(),
        ]);

        $this->notifyAudience($event);

        return $event;
    }

    private function notifyAudience(Event $event): void
    {
        $audience = $event->audience instanceof EventAudience ? $event->audience->value : $event->audience;

        $query = User::query();

        if ($audience === EventAudience::Interns->value) {
            $query->where('role', UserRole::Intern->value);
        } elseif ($audience === EventAudience::Mentors->value) {
            $query->where('role', UserRole::Mentor->value);
        }

        $query->chunk(50, function ($users) use ($event) {
            Notification::send($users, new EventPublishedNotification($event));
        });
    }
}