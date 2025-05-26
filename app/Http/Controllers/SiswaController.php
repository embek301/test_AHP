<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Kelas;
use App\Models\SiswaKelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class SiswaController extends Controller
{
    /**
     * Display a listing of the siswa.
     */
    public function index()
    {
        // Ensure we're using proper eager loading with explicit columns
        $siswa = User::role('siswa')
                    ->with(['siswaKelas.kelas', 'roles'])
                    ->get()
                    ->each(function($user) {
                        // Force cast siswaKelas to array for consistency
                        $user->siswaKelas = $user->siswaKelas->toArray();
                    });
        
        return Inertia::render('Siswa/index', [
            'siswa' => $siswa,
            'kelas' => Kelas::all(),
        ]);
    }

    /**
     * Store a newly created siswa in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'kelas_id' => ['nullable', 'exists:tm_kelas,id'],
        ]);

        // Buat user dengan role siswa
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make('password'), // Default password
            'is_active' => true,
        ]);
        
        // Assign role 'siswa'
        $user->assignRole('siswa');
        
        // Jika kelas_id ada, tambahkan siswa ke kelas
        if ($request->kelas_id) {
            SiswaKelas::create([
                'user_id' => $user->id,
                'kelas_id' => $request->kelas_id,
            ]);
        }
        
        return redirect()->route('siswa.index')
                        ->with('message', 'Siswa berhasil ditambahkan.');
    }

    /**
     * Update the specified siswa in storage.
     */
    public function update(Request $request, User $siswa)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($siswa->id)],
            'is_active' => ['boolean'],
        ]);

        $siswa->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->is_active,
        ]);
        
        return redirect()->route('siswa.index')
                        ->with('message', 'Informasi siswa berhasil diperbarui.');
    }

    /**
     * Toggle active status for siswa.
     */
    public function toggleActive(User $siswa)
    {
        $siswa->update([
            'is_active' => !$siswa->is_active,
        ]);
        
        $status = $siswa->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->route('siswa.index')
                        ->with('message', "Akun siswa berhasil {$status}.");
    }

    /**
     * Reset password siswa to default.
     */
    public function resetPassword(User $siswa)
    {
        $siswa->update([
            'password' => Hash::make('password'), // Default password
        ]);
        
        return redirect()->route('siswa.index')
                        ->with('message', 'Password siswa berhasil direset.');
    }
    
    /**
     * Assign siswa to a class.
     */
    public function assignKelas(Request $request, User $siswa)
    {
        $request->validate([
            'kelas_id' => ['required', 'exists:tm_kelas,id'],
        ]);
        
        // Cek apakah siswa sudah terdaftar di kelas yang sama
        $existingAssignment = SiswaKelas::where('user_id', $siswa->id)
                                ->where('kelas_id', $request->kelas_id)
                                ->first();
        
        if ($existingAssignment) {
            return redirect()->route('siswa.index')
                            ->with('error', 'Siswa sudah terdaftar di kelas ini.');
        }
        
        // Tambahkan siswa ke kelas
        SiswaKelas::create([
            'user_id' => $siswa->id,
            'kelas_id' => $request->kelas_id,
        ]);
        
        return redirect()->route('siswa.index')
                        ->with('message', 'Siswa berhasil ditambahkan ke kelas.');
    }
    
    /**
     * Remove siswa from a class.
     */
    public function removeFromKelas(Request $request, User $siswa)
    {
        $request->validate([
            'siswa_kelas_id' => ['required'],
        ]);
        
        $siswaKelas = SiswaKelas::findOrFail($request->siswa_kelas_id);
        
        // Validasi apakah siswa_kelas milik siswa ini
        if ($siswaKelas->user_id !== $siswa->id) {
            return redirect()->route('siswa.index')
                            ->with('error', 'Data tidak valid.');
        }
        
        $siswaKelas->delete();
        
        return redirect()->route('siswa.index')
                        ->with('message', 'Siswa berhasil dihapus dari kelas.');
    }
}
