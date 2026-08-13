<?php
namespace App\Http\Requests\Permission;
use Illuminate\Foundation\Http\FormRequest;
class RequestPermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isIntern();
    }
    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
    public function messages(): array
    {
        return [
            'start_date.after_or_equal' => 'La date de debut doit etre aujourd\'hui ou dans le futur.',
            'end_date.after_or_equal' => 'La date de fin doit etre apres ou egale a la date de debut.',
            'reason.required' => 'Le motif de la demande est requis.',
        ];
    }
}