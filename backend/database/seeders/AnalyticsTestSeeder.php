<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Warranty;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AnalyticsTestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (! $admin) {
            $this->command->error('Aucun admin trouvé. Lance d\'abord DatabaseSeeder.');
            return;
        }

        $products = Product::all();
        if ($products->count() < 3) {
            $this->command->error('Au moins 3 produits requis.');
            return;
        }

        // Crée 5 clients de test
        $customers = collect([
            ['name' => 'Lina Mansouri', 'phone' => '+212 661 111 111', 'email' => 'lina@test.com'],
            ['name' => 'Karim Bennani', 'phone' => '+212 662 222 222', 'email' => 'karim@test.com'],
            ['name' => 'Yasmine Rachidi', 'phone' => '+212 663 333 333', 'email' => 'yas@test.com'],
            ['name' => 'Mohamed Alaoui', 'phone' => '+212 664 444 444', 'email' => 'mo@test.com'],
            ['name' => 'Fatima Idrissi', 'phone' => '+212 665 555 555', 'email' => 'fati@test.com'],
        ])->map(fn ($data) => Customer::firstOrCreate(['phone' => $data['phone']], $data));

        $totalSales = 0;
        $totalRevenue = 0.0;

        // Génère des ventes sur les 14 derniers mois (pour tester aussi l'année précédente)
        for ($monthsAgo = 14; $monthsAgo >= 0; $monthsAgo--) {
            $monthDate = Carbon::now()->subMonths($monthsAgo);

            // Croissance progressive : plus on est récent, plus il y a de ventes
            $salesThisMonth = match (true) {
                $monthsAgo > 12 => random_int(3, 8),    // Année précédente : faible
                $monthsAgo > 6  => random_int(8, 15),   // Il y a 6-12 mois : moyen
                $monthsAgo > 2  => random_int(15, 25),  // Il y a 2-6 mois : bon
                default         => random_int(20, 35),  // Récent : excellent
            };

            for ($i = 0; $i < $salesThisMonth; $i++) {
                // Date aléatoire dans le mois
                $randomDay = random_int(1, $monthDate->daysInMonth);
                $randomHour = random_int(9, 19);
                $saleDate = $monthDate->copy()->setDay($randomDay)->setTime($randomHour, random_int(0, 59));

                $customer = $customers->random();
                $itemsCount = random_int(1, 3);
                $subtotal = 0.0;

                $sale = Sale::create([
                    'reference' => 'V' . str_pad((string) ($totalSales + 1), 7, '0', STR_PAD_LEFT) . random_int(10, 99),
                    'customer_id' => $customer->id,
                    'user_id' => $admin->id,
                    'subtotal' => 0,
                    'tax_rate' => 20.00,
                    'tax' => 0,
                    'total' => 0,
                    'status' => 'completed',
                    'created_at' => $saleDate,
                    'updated_at' => $saleDate,
                ]);

                // Items
                $usedProductIds = [];
                for ($j = 0; $j < $itemsCount; $j++) {
                    $product = $products->whereNotIn('id', $usedProductIds)->random();
                    $usedProductIds[] = $product->id;
                    $qty = random_int(1, 2);

                    for ($k = 0; $k < $qty; $k++) {
                        SaleItem::create([
                            'sale_id' => $sale->id,
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'product_storage' => $product->storage,
                            'quantity' => 1,
                            'unit_price' => $product->price,
                            'line_total' => $product->price,
                            'imei' => '35' . str_pad((string) random_int(0, 9999999999999), 13, '0', STR_PAD_LEFT),
                            'created_at' => $saleDate,
                            'updated_at' => $saleDate,
                        ]);
                        $subtotal += (float) $product->price;
                    }
                }

                $tax = round($subtotal * 0.20, 2);
                $total = round($subtotal + $tax, 2);

                $sale->update([
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'total' => $total,
                ]);

                // Bon de garantie
                Warranty::create([
                    'sale_id' => $sale->id,
                    'warranty_number' => sprintf('GAR-%s-%06d', $saleDate->year, random_int(100000, 999999)),
                    'issued_at' => $saleDate->toDateString(),
                    'expires_at' => $saleDate->copy()->addMonths(24)->toDateString(),
                    'duration_months' => 24,
                    'terms' => 'Garantie constructeur 24 mois.',
                    'created_at' => $saleDate,
                    'updated_at' => $saleDate,
                ]);

                $totalSales++;
                $totalRevenue += $total;
            }
        }

        $this->command->info("✅ {$totalSales} ventes générées sur 15 mois");
        $this->command->info('💰 Revenu total : ' . number_format($totalRevenue, 2, ',', ' ') . ' €');
    }
}