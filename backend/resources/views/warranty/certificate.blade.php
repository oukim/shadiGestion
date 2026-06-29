<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bon de garantie {{ $warranty->warranty_number }}</title>
    <style>
        @page { margin: 30px; size: A4; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
            color: #1A1A1A;
            font-size: 11px;
        }
        h1 { color: #F39200; font-size: 28px; margin: 0 0 5px 0; }
        h2 { color: #1A1A1A; font-size: 22px; margin: 30px 0 15px 0; text-align: center; }
        .header { border-bottom: 2px solid #1A1A1A; padding-bottom: 20px; margin-bottom: 24px; }
        .meta { font-size: 10px; color: #666; margin-top: 8px; }
        .meta .num { font-size: 13px; color: #000; font-weight: bold; }
        .info-block {
            background: #F6F8FB;
            padding: 14px;
            margin-bottom: 12px;
            border-radius: 4px;
        }
        .info-row { padding: 4px 0; font-size: 11px; }
        .info-row .k { color: #777; display: inline-block; width: 130px; }
        .info-row .v { color: #1A1A1A; font-weight: 500; }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .products-table th {
            background: #1A1A1A;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
        }
        .products-table td {
            padding: 10px;
            border-bottom: 1px solid #E5EAF1;
            font-size: 11px;
        }
        .products-table .price { text-align: right; font-weight: bold; }
        .total-line {
            background: #1A1A1A;
            color: white;
            padding: 12px;
            text-align: right;
            font-weight: bold;
            margin-top: 0;
            border-radius: 0 0 4px 4px;
        }
        .total-line .amount {
            color: #FFA940;
            font-size: 14px;
            font-family: 'Courier New', monospace;
        }
        .terms {
            background: #FFF8E6;
            border-left: 3px solid #F59E0B;
            padding: 12px 16px;
            font-size: 10px;
            color: #555;
            margin: 24px 0;
        }
        .signatures {
            margin-top: 40px;
            font-size: 10px;
        }
        .sig {
            display: inline-block;
            width: 45%;
            margin-right: 4%;
            text-align: center;
            border-top: 1.5px solid #1A1A1A;
            padding-top: 8px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>

<div class="header">
    <h1>Shadi PHONE</h1>
    <div style="font-size: 10px; color: #555;">@SHADI_PHONE · BOUTIQUE OFFICIELLE</div>
    <div class="meta">
        <div class="num">N° {{ $warranty->warranty_number }}</div>
        <div>Émis le {{ $warranty->issued_at->translatedFormat('d F Y') }}</div>
        <div>Vente N° {{ $sale->reference }}</div>
    </div>
</div>

<h2>BON DE GARANTIE</h2>
<div style="text-align: center; font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 30px;">
    Certificat officiel · {{ $warranty->duration_months }} mois
</div>

<div class="info-block">
    <strong style="color: #F39200; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Informations client</strong>
    <div class="info-row" style="margin-top: 8px;"><span class="k">Nom :</span> <span class="v">{{ $customer->name }}</span></div>
    <div class="info-row"><span class="k">Téléphone :</span> <span class="v">{{ $customer->phone ?: '—' }}</span></div>
    <div class="info-row"><span class="k">Email :</span> <span class="v">{{ $customer->email ?: '—' }}</span></div>
</div>

<div class="info-block">
    <strong style="color: #F39200; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Validité de garantie</strong>
    <div class="info-row" style="margin-top: 8px;"><span class="k">Date d'achat :</span> <span class="v">{{ $warranty->issued_at->translatedFormat('d F Y') }}</span></div>
    <div class="info-row"><span class="k">Fin de garantie :</span> <span class="v">{{ $warranty->expires_at->translatedFormat('d F Y') }}</span></div>
    <div class="info-row"><span class="k">Durée :</span> <span class="v">{{ $warranty->duration_months }} mois (constructeur)</span></div>
</div>

<table class="products-table">
    <thead>
        <tr>
            <th style="width: 40%;">Modèle</th>
            <th style="width: 30%;">IMEI</th>
            <th style="width: 10%;">Qté</th>
            <th style="width: 20%; text-align: right;">Prix</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($items as $item)
            <tr>
                <td>
                    <strong>{{ $item->product_name }}</strong><br>
                    <span style="color: #888; font-size: 10px;">{{ $item->product_storage }}</span>
                </td>
                <td style="font-family: 'Courier New', monospace;">{{ $item->imei }}</td>
                <td>{{ $item->quantity }}×</td>
                <td class="price">{{ number_format((float) $item->line_total, 2, ',', ' ') }} DH</td>
            </tr>
        @endforeach
    </tbody>
</table>

@if ((float) $sale->tax > 0)
    <div style="text-align: right; padding: 8px 12px; font-size: 11px; background: white;">
        Sous-total HT : <strong>{{ number_format((float) $sale->subtotal, 2, ',', ' ') }} DH</strong>
    </div>
    <div style="text-align: right; padding: 8px 12px; font-size: 11px; background: white;">
        TVA ({{ number_format((float) $sale->tax_rate, 2, ',', ' ') }}%) : <strong>{{ number_format((float) $sale->tax, 2, ',', ' ') }} DH</strong>
    </div>
    <div class="total-line">
        TOTAL TTC : <span class="amount">{{ number_format((float) $sale->total, 2, ',', ' ') }} DH</span>
    </div>
@else
    <div class="total-line">
        TOTAL (HT - sans TVA) : <span class="amount">{{ number_format((float) $sale->total, 2, ',', ' ') }} DH</span>
    </div>
@endif

<!-- <div class="terms">
    <strong>Conditions de garantie.</strong>
   {{ $warranty->terms ?: 'Garantie boutique de 3 mois couvrant les défauts de fabrication. Sont exclus : dommages physiques, oxydation, usure normale, et toute modification non autorisée par la boutique.' }}
           Pour toute réclamation, présentez ce bon accompagné de la facture d'origine.

</div> -->

<div class="signatures">
    <div class="sig">Signature client</div>
    <div class="sig">Cachet & signature vendeur</div>
</div>

</body>
</html>