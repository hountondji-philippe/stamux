<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessagingController extends Controller
{
    private const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/webm',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm',
        'application/pdf',
    ];

    private const MAX_SIZE_KB = 25600;

    public function index()
    {
        $user = Auth::user();

        $conversations = Conversation::whereHas('users', fn ($q) => $q->where('users.id', $user->id))
            ->with(['users:id,name,role,avatar_path', 'lastMessage.sender:id,name'])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($conv) use ($user) {
                $participant = $conv->participants()->where('user_id', $user->id)->first();
                $unread = Message::where('conversation_id', $conv->id)
                    ->where('sender_id', '!=', $user->id)
                    ->when($participant?->last_read_at, fn ($q) => $q->where('created_at', '>', $participant->last_read_at))
                    ->count();

                return [
                    'id' => $conv->id,
                    'type' => $conv->type,
                    'participants' => $conv->users->where('id', '!=', $user->id)->values(),
                    'last_message' => $conv->lastMessage,
                    'unread_count' => $unread,
                    'updated_at' => $conv->last_message_at,
                ];
            });

        return response()->json(['success' =>true, 'data' => $conversations]);
    }

    public function messages(Conversation $conversation)
    {
        $this->authorizeParticipant($conversation);
        $messages = $conversation->messages()->with('sender:id,name,role')->get();
        return response()->json(['success' =>true, 'data' => $messages]);
    }

    public function store(Request $request, Conversation $conversation)
    {
        $this->authorizeParticipant($conversation);

        $validated = $request->validate([
            'body' => ['nullable', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:' . self::MAX_SIZE_KB, 'mimetypes:' .implode(',', self::ALLOWED_MIMES)],
            'is_voice_note' => ['nullable', 'boolean'],
        ]);

        if (empty($validated['body']) && !$request->hasFile('attachment')) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Le message est vide.'],
            ], 422);
        }

        $data = [
            'sender_id' => Auth::id(),
            'body' => $validated['body'] ?? null,
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('messages', $filename, 'public');

            $mime = $file->getMimeType();
            $isVoiceNote = $request->boolean('is_voice_note');

            // Le detecteur MIME serveur (libmagic) classe presque tous les
            // .webm comme video/webm meme quand il n'y a qu'une piste audio.
            // On fait donc confiance au flag explicite envoye par le front
            // plutot qu'au sniffing du contenu quand il est present.
            $type = match (true) {
                $isVoiceNote => 'audio',
                str_starts_with($mime, 'image/') => 'image',
                str_starts_with($mime, 'video/') => 'video',
                str_starts_with($mime, 'audio/') => 'audio',
                $mime === 'application/pdf' => 'pdf',
                default => 'file',
            };

            $data['attachment_path'] = $path;
            $data['attachment_type'] = $type;
            $data['attachment_name'] = $file->getClientOriginalName();
            $data['attachment_size'] = $file->getSize();
        }

        $message = $conversation->messages()->create($data);

        $conversation->update(['last_message_at' => now()]);

        return response()->json(['success' =>true, 'data' => $message->load('sender:id,name,role')], 201);
    }

    public function markRead(Conversation $conversation)
    {
        $this->authorizeParticipant($conversation);
        $conversation->participants()->where('user_id', Auth::id())->update(['last_read_at'=> now()]);
        return response()->json(['success' =>true]);
    }

    public function start(Request $request)
    {
        $validated = $request->validate(['user_id' => 'required|exists:users,id']);
        $me = Auth::id();
        $other = $validated['user_id'];

        $existing = Conversation::where('type', 'direct')
            ->whereHas('users', fn ($q) => $q->where('users.id', $me))
            ->whereHas('users', fn ($q) => $q->where('users.id', $other))
            ->first();

        if ($existing) {
            return response()->json(['success' => true, 'data' => $existing]);
        }

        $conversation = Conversation::create(['type' => 'direct']);
        $conversation->users()->attach([$me, $other]);

        return response()->json(['success' =>true, 'data' => $conversation], 201);
    }

    public function unreadCount()
    {
        $user = Auth::user();

        $count = DB::table('messages')
            ->join('conversation_participants', 'messages.conversation_id', '=', 'conversation_participants.conversation_id')
            ->where('conversation_participants.user_id', $user->id)
            ->where('messages.sender_id', '!=', $user->id)
            ->where(function ($q) {
                $q->whereColumn('messages.created_at', '>', 'conversation_participants.last_read_at')
                    ->orWhereNull('conversation_participants.last_read_at');
            })
            ->count();

        return response()->json(['success' =>true, 'data' => ['unread' => $count]]);
    }

    private function authorizeParticipant(Conversation $conversation): void
    {
        abort_unless(
            $conversation->users()->where('users.id', Auth::id())->exists(),
            403,
            "Vous n'avez pas acces a cette conversation."
        );
    }
}