<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the admin profile.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load('customerProfile');

        return Inertia::render('Admin/Profile/Index', [
            'adminProfile' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone_number' => $user->customerProfile?->phone_number ?? '-',
                'created_at' => $user->created_at->format('d/m/Y'),
            ]
        ]);
    }

    /**
     * Update the admin profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (isset($validated['phone_number'])) {
            $profile = $user->customerProfile;
            
            if ($profile) {
                $profile->update(['phone_number' => $validated['phone_number']]);
            } else {
                $user->customerProfile()->create([
                    'phone_number' => $validated['phone_number'],
                    'address' => '-', // Nilai default karena required di database
                    'identity_card_number' => '-', // Nilai default karena required di database
                ]);
            }
        }

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }
}
