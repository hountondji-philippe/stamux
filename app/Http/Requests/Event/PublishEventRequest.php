<?php

namespace App\Http\Requests\Event;

use App\Enums\EventAudience;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PublishEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:5000'],
            'audience' => ['required', Rule::enum(EventAudience::class)],
            'is_pinned' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:8192'],
        ];
    }
}