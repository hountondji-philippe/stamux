<?php

namespace App\Http\Requests\InternshipDateChange;

use Illuminate\Foundation\Http\FormRequest;

class ReviewInternshipDateChangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:approved,rejected'],
            'admin_comment' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
