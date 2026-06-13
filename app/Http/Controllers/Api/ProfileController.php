<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone_number' => 'nullable|string|max:20',
            'instagram' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:8',
        ]);

        // Update basic user info
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        
        $user->save();

        // Update customer profile
        $customerProfile = $user->customerProfile;
        if ($customerProfile) {
            $customerProfile->phone_number = $validated['phone_number'];
            if (isset($validated['instagram'])) {
                $customerProfile->instagram = $validated['instagram'];
            }
            $customerProfile->save();
        } else {
            $user->customerProfile()->create([
                'phone_number' => $validated['phone_number'],
                'instagram' => $validated['instagram'] ?? null,
                'registration_date' => now(),
            ]);
        }

        $user->load('customerProfile');
        $user->order_count = \App\Models\Order::where('user_id', $user->id)
            ->where('order_status', 'completed')
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user
        ]);
    }
}
