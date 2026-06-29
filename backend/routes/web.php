<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — Shadi Phone
|--------------------------------------------------------------------------
|
| Les fichiers statiques (JS, CSS, favicon) dans public/ sont servis
| nativement par Laravel. Cette route SPA fallback sert le frontend React
| pour toutes les autres URLs.
|
*/

Route::get('/{any?}', function () {
    return response()->file(public_path('build/index.html'));
})->where('any', '^(?!api).*$');