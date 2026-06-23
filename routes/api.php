<?php

// routes/api.php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EquipmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

Route::prefix('v1')->name('api.v1.')->group(function () {
    // Equipment (Barang) CRUD endpoints — kebab-case
    Route::apiResource('equipments', EquipmentController::class)
        ->parameters(['equipments' => 'equipment']);

    // Orders endpoints
    Route::get('orders', [\App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::post('orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
    Route::patch('orders/{order:order_number}/approve', [\App\Http\Controllers\Api\OrderController::class, 'approvePayment']);
    Route::patch('orders/{order:order_number}/reject', [\App\Http\Controllers\Api\OrderController::class, 'rejectPayment']);
    Route::patch('orders/{order:order_number}/handover', [\App\Http\Controllers\Api\OrderController::class, 'processHandover']);
    Route::get('orders/{order:order_number}/calculate-return', [\App\Http\Controllers\Api\OrderController::class, 'calculateReturn']);
    Route::post('orders/{order:order_number}/return', [\App\Http\Controllers\Api\OrderController::class, 'processReturn']);
    Route::patch('orders/{order:order_number}/mark-shortfall-paid', [\App\Http\Controllers\Api\OrderController::class, 'markShortfallPaid']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [\App\Http\Controllers\Api\PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [\App\Http\Controllers\Api\PasswordResetController::class, 'reset']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $user->load('customerProfile');
        $user->order_count = \App\Models\Order::where('user_id', $user->id)
            ->where('order_status', 'completed')
            ->count();
        return response()->json($user);
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::post('/client-booking', [\App\Http\Controllers\Client\BookingController::class, 'store']);
    Route::get('/my-orders', function (\Illuminate\Http\Request $request) {
        $orders = \App\Models\Order::where('user_id', $request->user()->id)
            ->with(['items.equipment.images'])
            ->latest()
            ->get();
        return response()->json(['success' => true, 'data' => $orders]);
    });
});

Route::get('/categories', function() {
    return response()->json(\App\Models\Category::all());
});