<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Warranty;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService
{
    private const DEFAULT_TAX_RATE = 20.00;
    private const WARRANTY_DURATION_MONTHS = 2;
    private const WARRANTY_TERMS = 'Garantie boutique de 2 mois couvrant les défauts de fabrication. Sont exclus : dommages physiques, oxydation, usure normale, et toute modification non autorisée par la boutique.';

    /**
     * Crée une vente complète avec ses items, son client et son bon de garantie.
     * Toutes les opérations sont dans une transaction atomique.
     */
    public function create(array $data, int $userId): Sale
    {
        return DB::transaction(function () use ($data, $userId) {
            // 1. Récupérer tous les produits concernés avec lock anti-race-condition
            $productIds = collect($data['items'])->pluck('product_id')->unique();
            $products = Product::whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // 2. Vérifier le stock pour chaque item
            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => ["Produit ID {$item['product_id']} introuvable."],
                    ]);
                }

                if ($product->stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stock insuffisant pour « {$product->name} » (disponible : {$product->stock}, demandé : {$item['quantity']})."],
                    ]);
                }
            }

            // 3. Trouver ou créer le client
            $customer = $this->findOrCreateCustomer($data['customer']);

            // 4. Calculs des totaux (utilise le prix saisi par le vendeur, ou le prix produit par défaut)
            $subtotal = collect($data['items'])->sum(
                fn ($item) => ($item['unit_price'] ?? $products[$item['product_id']]->price) * $item['quantity']
            );
            $taxRate = $this->resolveTaxRate($data);
            $tax = round($subtotal * ($taxRate / 100), 2);
            $total = round($subtotal + $tax, 2);

            // 5. Création de la vente
            $sale = Sale::create([
                'customer_id' => $customer->id,
                'user_id' => $userId,
                'subtotal' => $subtotal,
                'tax_rate' => $taxRate,
                'tax' => $tax,
                'total' => $total,
                'status' => 'completed',
            ]);

            // 6. Création des sale_items avec les IMEI saisis par le vendeur
            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];
                $imeis = $item['imeis'];

             $salePrice = $item['unit_price'] ?? $product->price;

                foreach ($imeis as $imei) {
                    $sale->items()->create([
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_storage' => $product->storage,
                        'quantity' => 1,
                        'unit_price' => $salePrice,
                        'line_total' => $salePrice,
                        'imei' => $imei,
                    ]);
                }

                // Décrément atomique du stock
                $product->decrement('stock', $item['quantity']);
            }

            // 7. Génération automatique du bon de garantie (3 mois)
            $today = Carbon::today();
            Warranty::create([
                'sale_id' => $sale->id,
                'warranty_number' => $this->generateWarrantyNumber(),
                'issued_at' => $today,
                'expires_at' => $today->copy()->addMonths(self::WARRANTY_DURATION_MONTHS),
                'duration_months' => self::WARRANTY_DURATION_MONTHS,
                'terms' => self::WARRANTY_TERMS,
            ]);

            return $sale->load(['customer', 'user', 'items.product', 'warranty']);
        });
    }

    /**
     * Trouve un client existant par phone ou email, ou en crée un nouveau.
     * Si aucun identifiant unique n'est fourni, crée toujours un nouveau client
     * pour éviter d'écraser un client existant par erreur.
     */
    private function findOrCreateCustomer(array $customerData): Customer
    {
        $hasPhone = ! empty($customerData['phone']);
        $hasEmail = ! empty($customerData['email']);

        // Si pas d'identifiant unique, on crée toujours un nouveau client
        if (! $hasPhone && ! $hasEmail) {
            return Customer::create($customerData);
        }

        // Recherche par phone OU email (clés d'unicité métier)
        $query = Customer::query();
        if ($hasPhone) {
            $query->orWhere('phone', $customerData['phone']);
        }
        if ($hasEmail) {
            $query->orWhere('email', $customerData['email']);
        }

        $customer = $query->first();

        if ($customer) {
            // Mise à jour avec les nouvelles données fournies (filtre les vides)
            $customer->fill(array_filter($customerData))->save();
            return $customer;
        }

        return Customer::create($customerData);
    }

    /**
     * Résout le taux de TVA à appliquer.
     * - Si apply_tax === false, on force à 0%
     * - Sinon, on prend le tax_rate fourni, ou la valeur par défaut
     */
    private function resolveTaxRate(array $data): float
    {
        if (isset($data['apply_tax']) && $data['apply_tax'] === false) {
            return 0.00;
        }

        if (isset($data['tax_rate']) && is_numeric($data['tax_rate'])) {
            return (float) $data['tax_rate'];
        }

        return self::DEFAULT_TAX_RATE;
    }

    /**
     * Génère un numéro de garantie unique au format GAR-YYYY-XXXXXX.
     */
    private function generateWarrantyNumber(): string
    {
        do {
            $number = sprintf('GAR-%s-%06d', date('Y'), random_int(100000, 999999));
        } while (Warranty::where('warranty_number', $number)->exists());

        return $number;
    }
}