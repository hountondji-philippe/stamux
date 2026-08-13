<?php

namespace App\Http\Controllers\Api;

use App\Actions\Event\ListEventsAction;
use App\Actions\Event\PublishEventAction;
use App\DTOs\PublishEventData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Event\PublishEventRequest;
use App\Http\Resources\EventResource;
use App\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function __construct(
        private PublishEventAction $publishEventAction,
        private ListEventsAction $listEventsAction,
        private EventRepositoryInterface $events,
    ) {
    }

    public function store(PublishEventRequest $request): JsonResponse
    {
        Gate::authorize('publish', \App\Models\Event::class);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $imagePath = $file->storeAs('events', $filename, 'public');
        }

        $data = PublishEventData::fromArray(array_merge($request->validated(), [
            'author_id' => auth()->id(),
            'image_path' => $imagePath,
        ]));

        $event = $this->publishEventAction->execute($data);

        return response()->json([
            'success' => true,
            'data' => new EventResource($event),
        ], 201);
    }

    public function index(): JsonResponse
    {
        $events = $this->listEventsAction->execute(auth()->user());

        return response()->json([
            'success' => true,
            'data' => EventResource::collection($events),
            'meta' => [
                'total' => $events->total(),
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $event = $this->events->find($id);

        return response()->json([
            'success' => true,
            'data' => new EventResource($event),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $event = $this->events->find($id);

        Gate::authorize('update', $event);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string', 'max:5000'],
            'audience' => ['sometimes', \Illuminate\Validation\Rule::enum(\App\Enums\EventAudience::class)],
            'is_pinned' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:8192'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            if ($event->image_path) {
                Storage::disk('public')->delete($event->image_path);
            }
            $file = $request->file('image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $validated['image_path'] = $file->storeAs('events', $filename, 'public');
        } elseif ($request->boolean('remove_image') && $event->image_path) {
            Storage::disk('public')->delete($event->image_path);
            $validated['image_path'] = null;
        }

        unset($validated['image'], $validated['remove_image']);

        $updated = $this->events->update($event, $validated);

        return response()->json([
            'success' => true,
            'data' => new EventResource($updated),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $event = $this->events->find($id);

        Gate::authorize('delete', $event);

        if ($event->image_path) {
            Storage::disk('public')->delete($event->image_path);
        }

        $this->events->delete($event);

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Publication supprimée avec succès.'],
        ]);
    }
}