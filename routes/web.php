<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::middleware(['guest',])->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('welcome');
});
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard.home');
    Route::get('home', function () {
        return Inertia::render('home');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
