<?php

namespace App\Http\Requests\InternshipDateChange;

use Illuminate\Foundation\Http\FormRequest;

class RequestInternshipDateChangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isIntern();
    }

    public function rules(): array
    {
        return [
            'requested_start_date' => ['required', 'date'],
            'requested_end_date' => ['required', 'date', 'after_or_equal:requested_start_date'],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
