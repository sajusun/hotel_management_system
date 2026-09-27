<?php

use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return view('server-running');
});

Route::prefix('api/v1')->group(function () {});
