<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
        'name' => ['sometimes', 'required', 'string', 'max:255'],
        'brand' => ['sometimes', 'required', 'in:Apple iPhone,Samsung,Oppo,Xiaomi'],
        'category' => ['sometimes', 'required', 'in:premium,midrange,entry'],
        'storage' => ['sometimes', 'required', 'string', 'max:50'],
        'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
        'stock' => ['sometimes', 'required', 'integer', 'min:0'],
        'color' => ['sometimes', 'required', 'string', 'max:50'],
        'description' => ['nullable', 'string', 'max:1000'],
        'is_new' => ['nullable', 'boolean'],
        'image_path' => ['nullable', 'string', 'max:255'],
    ];
    }
public function messages(): array
{
    return [
        'brand.in' => 'La marque doit être Apple iPhone, Samsung, Oppo ou Xiaomi.',
        'color.max' => 'Le nom de la couleur est trop long.',
    ];
}
}
