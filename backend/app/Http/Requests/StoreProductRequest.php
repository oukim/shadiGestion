<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
         return [
        'name' => ['required', 'string', 'max:255'],
        'brand' => ['required', 'in:Apple iPhone,Samsung,Oppo,Xiaomi'], // 🆕 Liste restreinte
        'category' => ['required', 'in:premium,midrange,entry'],
        'storage' => ['required', 'string', 'max:50'],
        'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        'stock' => ['required', 'integer', 'min:0'],
        'color' => ['required', 'string', 'max:50'], // 🆕 Texte libre au lieu de hex
        'description' => ['nullable', 'string', 'max:1000'],
        'is_new' => ['nullable', 'boolean'],
        'image_path' => ['nullable', 'string', 'max:255'],
    ];
    }

    public function messages(): array
    {
        return [
        'name.required' => 'Le nom du produit est requis.',
        'brand.required' => 'La marque est requise.',
        'brand.in' => 'La marque doit être Apple iPhone, Samsung, Oppo ou Xiaomi.',
        'category.required' => 'La catégorie est requise.',
        'category.in' => 'Catégorie invalide.',
        'storage.required' => 'La capacité de stockage est requise.',
        'price.required' => 'Le prix est requis.',
        'price.min' => 'Le prix doit être positif.',
        'price.max' => 'Le prix est trop élevé.',
        'stock.required' => 'Le stock est requis.',
        'stock.min' => 'Le stock doit être positif ou nul.',
        'color.required' => 'La couleur est requise.',
        'color.max' => 'Le nom de la couleur est trop long.',
    ];
    }
}