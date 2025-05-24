<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/inactive-account', [AuthenticatedSessionController::class, 'inactiveAccount'])
    ->name('inactive-account');


Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');



    Route::middleware(['role:admin'])->group(function (){
        Route::prefix('admin')->group(function (){
           Route::prefix('users')->group(function(){
            Route::get('', [UserController::class, 'index'])->name('users.index');
            Route::post('', [UserController::class, 'store'])->name('users.store');
            Route::post('update/{user}', [UserController::class, 'update'])->name('users.update');
            Route::post('{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
           });
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
