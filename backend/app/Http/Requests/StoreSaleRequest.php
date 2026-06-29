<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // L'utilisateur doit être authentifié.
        // auth:sanctum middleware le garantit déjà sur la route,
        // mais on ajoute une vérification explicite pour la défense en profondeur.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer' => ['required', 'array'],
            'customer.name' => ['required', 'string', 'max:255'],
            'customer.phone' => ['nullable', 'string', 'max:30'],
            'customer.email' => ['nullable', 'email', 'max:255'],
            'customer.address' => ['nullable', 'string', 'max:500'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],

            // TVA optionnelle
            'apply_tax' => ['nullable', 'boolean'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],

            // IMEI : 15 chiffres exactement, un par exemplaire
            'items.*.imeis' => ['required', 'array', 'min:1'],
            'items.*.imeis.*' => ['required', 'string', 'regex:/^\d{15}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer.name.required' => 'Le nom du client est requis.',
            'items.required' => 'Au moins un article est requis pour la vente.',
            'items.min' => 'Au moins un article est requis pour la vente.',
            'items.*.product_id.exists' => 'Un des produits sélectionnés n\'existe pas.',
            'items.*.quantity.min' => 'La quantité doit être d\'au moins 1.',
            'tax_rate.numeric' => 'Le taux de TVA doit être un nombre.',
            'tax_rate.min' => 'Le taux de TVA ne peut pas être négatif.',
            'tax_rate.max' => 'Le taux de TVA ne peut pas dépasser 100%.',
            'items.*.imeis.required' => 'Vous devez saisir un IMEI pour chaque exemplaire.',
            'items.*.imeis.*.regex' => 'L\'IMEI doit contenir exactement 15 chiffres.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);
            $allImeis = [];

            foreach ($items as $i => $item) {
                $quantity = (int) ($item['quantity'] ?? 0);
                $imeis = $item['imeis'] ?? [];
                $imeiCount = count($imeis);

                // Vérif 1 : nombre d'IMEI = quantité
                if ($imeiCount !== $quantity) {
                    $validator->errors()->add(
                        "items.{$i}.imeis",
                        "Le nombre d'IMEI ({$imeiCount}) doit correspondre à la quantité ({$quantity})."
                    );
                }

                // Vérif 2 : pas de doublons dans CET item
                if (count($imeis) !== count(array_unique($imeis))) {
                    $validator->errors()->add(
                        "items.{$i}.imeis",
                        "Les IMEI doivent être uniques au sein du même article."
                    );
                }

                $allImeis = array_merge($allImeis, $imeis);
            }

            // Vérif 3 : pas de doublons ENTRE items dans la même vente
            $duplicates = array_diff_assoc($allImeis, array_unique($allImeis));
            if (! empty($duplicates)) {
                $duplicateList = implode(', ', array_unique($duplicates));
                $validator->errors()->add(
                    'items',
                    "Les IMEI suivants sont en double dans cette vente : {$duplicateList}"
                );
            }

            // Vérif 4 : aucun IMEI déjà utilisé dans la base (vente précédente)
            if (! empty($allImeis)) {
                $existing = \App\Models\SaleItem::whereIn('imei', $allImeis)
                    ->pluck('imei')
                    ->toArray();

                if (! empty($existing)) {
                    $existingList = implode(', ', $existing);
                    $validator->errors()->add(
                        'items',
                        "Les IMEI suivants ont déjà été vendus : {$existingList}"
                    );
                }
            }
        });
    }
}