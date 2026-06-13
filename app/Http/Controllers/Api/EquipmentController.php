<?php

// app/Http/Controllers/Api/EquipmentController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEquipmentRequest;
use App\Http\Requests\Admin\UpdateEquipmentRequest;
use App\Models\Equipment;
use App\Models\EquipmentImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EquipmentController extends Controller
{
    /**
     * Display a listing of the equipments.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);

        $equipments = Equipment::with(['category', 'images'])
            ->withSum(['orderItems as rent_count' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('order_status', 'completed');
                });
            }], 'qty')
            ->latest()
            ->paginate((int) $perPage);

        // Get Top 5 Equipment IDs for 'Terlaris' badge
        $top5Ids = Equipment::withSum(['orderItems as rent_count' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('order_status', 'completed');
                });
            }], 'qty')
            ->orderByDesc('rent_count')
            ->limit(5)
            ->pluck('id')
            ->toArray();

        $equipments->getCollection()->transform(function ($equipment) use ($top5Ids) {
            $equipment->is_top_rated = in_array($equipment->id, $top5Ids) && $equipment->rent_count > 0;
            return $equipment;
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar alat berhasil dimuat.',
            'data'    => $equipments,
        ], 200);
    }

    /**
     * Store a newly created equipment in storage.
     */
    public function store(StoreEquipmentRequest $request): JsonResponse
    {
        try {
            $equipment = DB::transaction(function () use ($request) {
                $validated = $request->validated();

                // Generate slug from name
                $validated['slug'] = Str::slug($request->name);

                // Remove non-model keys before create
                unset($validated['images'], $validated['delete_images']);

                $equipment = Equipment::create($validated);

                // Handle multiple image uploads
                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $index => $file) {
                        $path = $file->store('equipments', 'public');

                        $equipment->images()->create([
                            'image_path' => $path,
                            'sort_order' => $index,
                        ]);
                    }
                }

                return $equipment;
            });

            $equipment->load(['category', 'images']);

            return response()->json([
                'success' => true,
                'message' => 'Alat berhasil ditambahkan.',
                'data'    => $equipment,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Equipment store failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data alat.',
            ], 500);
        }
    }

    /**
     * Display the specified equipment.
     */
    public function show(Equipment $equipment): JsonResponse
    {
        $equipment->load(['category', 'images']);
        $equipment->loadSum(['orderItems as rent_count' => function ($query) {
            $query->whereHas('order', function ($q) {
                $q->where('order_status', 'completed');
            });
        }], 'qty');

        return response()->json([
            'success' => true,
            'message' => 'Detail alat berhasil dimuat.',
            'data'    => $equipment,
        ], 200);
    }

    /**
     * Update the specified equipment in storage.
     */
    public function update(UpdateEquipmentRequest $request, Equipment $equipment): JsonResponse
    {
        try {
            $equipment = DB::transaction(function () use ($request, $equipment) {
                $validated = $request->validated();

                // Regenerate slug if name is being updated
                if ($request->has('name')) {
                    $validated['slug'] = Str::slug($request->name);
                }

                // Remove non-model keys before update
                $deleteImageIds = $validated['delete_images'] ?? [];
                unset($validated['images'], $validated['delete_images']);

                $equipment->update($validated);

                // Handle image deletions
                if (!empty($deleteImageIds)) {
                    $imagesToDelete = EquipmentImage::where('equipment_id', $equipment->id)
                        ->whereIn('id', $deleteImageIds)
                        ->get();

                    foreach ($imagesToDelete as $image) {
                        if (Storage::disk('public')->exists($image->image_path)) {
                            Storage::disk('public')->delete($image->image_path);
                        }
                        $image->delete();
                    }
                }

                // Handle new image uploads
                if ($request->hasFile('images')) {
                    // Determine the next sort_order
                    $maxSortOrder = $equipment->images()->max('sort_order') ?? -1;

                    foreach ($request->file('images') as $file) {
                        $maxSortOrder++;
                        $path = $file->store('equipments', 'public');

                        $equipment->images()->create([
                            'image_path' => $path,
                            'sort_order' => $maxSortOrder,
                        ]);
                    }
                }

                return $equipment;
            });

            $equipment->load(['category', 'images']);

            return response()->json([
                'success' => true,
                'message' => 'Alat berhasil diperbarui.',
                'data'    => $equipment,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Equipment update failed: ' . $e->getMessage(), [
                'equipment_id' => $equipment->id,
                'trace'        => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui data alat.',
            ], 500);
        }
    }

    /**
     * Remove the specified equipment from storage (soft delete).
     */
    public function destroy(Equipment $equipment): JsonResponse
    {
        try {
            DB::transaction(function () use ($equipment) {
                // Clean up image files from storage before soft-deleting
                // (The DB records cascade on hard delete, but soft delete doesn't trigger cascade.
                //  We clean files proactively; image records stay for potential restore.)
                foreach ($equipment->images as $image) {
                    if (Storage::disk('public')->exists($image->image_path)) {
                        Storage::disk('public')->delete($image->image_path);
                    }
                }

                $equipment->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Alat berhasil dihapus.',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Equipment destroy failed: ' . $e->getMessage(), [
                'equipment_id' => $equipment->id,
                'trace'        => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data alat.',
            ], 500);
        }
    }
}
