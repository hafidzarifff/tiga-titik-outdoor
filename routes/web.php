<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EquipmentController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Client\CatalogController;
use App\Http\Controllers\Client\HomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Client Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/catalog/{id}', [CatalogController::class, 'show'])->name('catalog.show');

Route::get('/cart', function () { return \Inertia\Inertia::render('Client/Cart'); })->name('cart');
Route::get('/login', function () { return \Inertia\Inertia::render('Client/Auth/Login'); })->name('login');
Route::get('/forgot-password', function () { return \Inertia\Inertia::render('Client/Auth/ForgotPassword'); })->middleware('guest')->name('password.request');
Route::get('/reset-password/{token}', function (string $token) { 
    return \Inertia\Inertia::render('Client/Auth/ResetPassword', ['token' => $token, 'email' => request('email')]); 
})->middleware('guest')->name('password.reset');
Route::get('/register', function () { 
    $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
    return \Inertia\Inertia::render('Client/Auth/Register', ['settings' => $settings]); 
})->name('register');
Route::get('/profile', function () { return \Inertia\Inertia::render('Client/Profile/Index'); })->name('profile');
Route::get('/bantuan', [App\Http\Controllers\Client\HelpCenterController::class, 'index'])->name('help.index');

Route::prefix('booking')->name('client.booking.')->group(function () {
    Route::get('/', [BookingController::class, 'index'])->name('index');
    Route::get('/create', [BookingController::class, 'create'])->name('create');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->group(function () {
    // Guest-only (login form)
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Authenticated admin-only
    Route::middleware(['auth', 'is_admin'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::post('/notifications/mark-read', [DashboardController::class, 'markNotificationRead'])->name('notifications.mark-read');

        // Equipment (Katalog Alat) — CRUD via REST API, Inertia only serves the SPA page
        Route::get('equipment', [EquipmentController::class, 'index'])->name('equipment.index');

        // Categories (Kategori)
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);

        // Orders (Kelola Pesanan)
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
        Route::get('/orders/{id}/receipt', [OrderController::class, 'receipt'])->name('orders.receipt');
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');

        // Customers (Data Pelanggan)
        Route::get('/customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index'])->name('customers.index');

        // Admin Profile
        Route::get('/profile', [\App\Http\Controllers\Admin\ProfileController::class, 'index'])->name('profile');
        Route::post('/profile', [\App\Http\Controllers\Admin\ProfileController::class, 'update'])->name('profile.update');
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('admin.settings.index');
        Route::post('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('admin.settings.update');
    });
});
