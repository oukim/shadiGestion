<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\Warranty;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DemoSalesSeeder extends Seeder
{
    private array $usedReferences = [];
        public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (! $admin) {
            $this->command->error('Aucun admin trouvé. Lance UserSeeder d\'abord.');
            return;
        }

        $products = Product::all();
        if ($products->isEmpty()) {
            $this->command->error('Aucun produit. Lance ProductSeeder d\'abord.');
            return;
        }

        // Noms marocains pour les clients
        $customers = [
            ['name' => 'Karim Benani', 'phone' => '+212 661 123 456', 'email' => 'karim.b@gmail.com'],
            ['name' => 'Fatima Zahra Alami', 'phone' => '+212 662 234 567', 'email' => 'fz.alami@gmail.com'],
            ['name' => 'Mohammed Idrissi', 'phone' => '+212 663 345 678', 'email' => null],
            ['name' => 'Yasmine Tazi', 'phone' => '+212 664 456 789', 'email' => 'yasmine.t@hotmail.com'],
            ['name' => 'Omar El Khattabi', 'phone' => '+212 665 567 890', 'email' => null],
            ['name' => 'Salma Bennani', 'phone' => '+212 666 678 901', 'email' => 'salma.b@gmail.com'],
            ['name' => 'Hicham Berrada', 'phone' => '+212 667 789 012', 'email' => 'hicham.b@gmail.com'],
            ['name' => 'Nadia Chraibi', 'phone' => '+212 668 890 123', 'email' => null],
            ['name' => 'Youssef Lahlou', 'phone' => '+212 669 901 234', 'email' => 'youssef.l@gmail.com'],
            ['name' => 'Amina Ouazzani', 'phone' => '+212 670 012 345', 'email' => null],
        ];

        $createdCount = 0;
    
        DB::transaction(function () use ($products, $customers, $admin, &$createdCount) {
            // Génère des ventes sur les 6 derniers mois
            for ($monthsAgo = 5; $monthsAgo >= 0; $monthsAgo--) {
                // Plus de ventes pour les mois récents
                $salesInMonth = match (true) {
                    $monthsAgo === 0 => rand(8, 12),
                    $monthsAgo === 1 => rand(6, 10),
                    $monthsAgo === 2 => rand(5, 8),
                    default => rand(3, 6),
                };

                for ($i = 0; $i < $salesInMonth; $i++) {
                    // Date aléatoire dans le mois
                    $saleDate = Carbon::now()
                        ->subMonths($monthsAgo)
                        ->startOfMonth()
                        ->addDays(rand(0, 27))
                        ->addHours(rand(9, 19))
                        ->addMinutes(rand(0, 59));

                    // Client aléatoire (peut être un récurrent)
                    $customerData = $customers[array_rand($customers)];
                    $customer = Customer::firstOrCreate(
                        ['phone' => $customerData['phone']],
                        $customerData
                    );

                    // 1 à 3 produits dans la vente
                    $itemCount = rand(1, 3);
                    $selectedProducts = $products->random($itemCount);

                    // Choisir aléatoirement TVA ou pas (70% avec TVA)
                    $applyTax = rand(1, 100) <= 70;
                    $taxRate = $applyTax ? 20.00 : 0.00;

                    $subtotal = 0;
                    foreach ($selectedProducts as $product) {
                        $qty = rand(1, 2);
                        $subtotal += $product->price * $qty;
                    }
                    $tax = round($subtotal * ($taxRate / 100), 2);
                    $total = round($subtotal + $tax, 2);

                    // Crée la vente
                  // 🆕 Génère une référence unique en évitant les collisions
$reference = $this->generateUniqueReference();
$this->usedReferences[] = $reference;

// Crée la vente
$sale = Sale::create([
    'reference' => $reference, // 🆕 référence fournie manuellement
    'customer_id' => $customer->id,
    'user_id' => $admin->id,
    'subtotal' => $subtotal,
    'tax_rate' => $taxRate,
    'tax' => $tax,
    'total' => $total,
    'status' => 'completed',
    'created_at' => $saleDate,
    'updated_at' => $saleDate,
]);

                    // Sale items avec IMEI uniques
                    foreach ($selectedProducts as $product) {
                        $qty = rand(1, 2);
                        for ($q = 0; $q < $qty; $q++) {
                            $imei = $this->generateUniqueImei();
                            $sale->items()->create([
                                'product_id' => $product->id,
                                'product_name' => $product->name,
                                'product_storage' => $product->storage,
                                'quantity' => 1,
                                'unit_price' => $product->price,
                                'line_total' => $product->price,
                                'imei' => $imei,
                            ]);
                        }
                    }

                    // Garantie
                    Warranty::create([
                        'sale_id' => $sale->id,
                        'warranty_number' => $this->generateWarrantyNumber($saleDate),
                        'issued_at' => $saleDate->copy()->startOfDay(),
                        'expires_at' => $saleDate->copy()->startOfDay()->addMonths(24),
                        'duration_months' => 24,
                        'terms' => 'Garantie constructeur de 24 mois.',
                    ]);

                    $createdCount++;
                }
            }
        });

        $this->command->info("✅ {$createdCount} ventes de démo créées.");
    }

    private function generateUniqueImei(): string
    {
        do {
            $imei = '35';
            for ($i = 0; $i < 13; $i++) {
                $imei .= random_int(0, 9);
            }
        } while (\App\Models\SaleItem::where('imei', $imei)->exists());

        return $imei;
    }
private function generateUniqueReference(): string
{
    do {
        $reference = 'V' . random_int(1000000, 9999999);
    } while (
        in_array($reference, $this->usedReferences, true) ||
        \App\Models\Sale::where('reference', $reference)->exists()
    );

    return $reference;
}
    private function generateWarrantyNumber(Carbon $date): string
    {
        do {
            $number = sprintf('GAR-%s-%06d', $date->format('Y'), random_int(100000, 999999));
        } while (Warranty::where('warranty_number', $number)->exists());

        return $number;
    }
}