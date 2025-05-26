<?php


namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\User;
use App\Models\MataPelajaran;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class GuruController extends Controller
{
    /**
     * Display a listing of guru.
     */
    public function index()
    {
        $guru = Guru::with(['user', 'mataPelajaran', 'evaluasi', 'hasilEvaluasi'])->get();
        $mataPelajaran = MataPelajaran::where('is_active', true)->get();
        
        return Inertia::render('Guru/index', [
            'guru' => $guru,
            'mataPelajaran' => $mataPelajaran,
        ]);
    }

    /**
     * Store a newly created guru in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nip' => ['required', 'string', 'max:20', 'unique:tm_guru,nip'],
            'mata_pelajaran_id' => ['required', 'exists:tm_mata_pelajaran,id'],
            'tanggal_bergabung' => ['required', 'date'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        // Buat user baru
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        // Assign role guru
        $user->assignRole('guru');

        // Buat data guru
        $guru = Guru::create([
            'user_id' => $user->id,
            'nip' => $request->nip,
            'mata_pelajaran_id' => $request->mata_pelajaran_id,
            'tanggal_bergabung' => $request->tanggal_bergabung,
        ]);
        
        return redirect()->route('guru.index')
                        ->with('message', 'Data guru berhasil ditambahkan.');
    }

    /**
     * Update the specified guru in storage.
     */
    public function update(Request $request, Guru $guru)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($guru->user_id)],
            'nip' => ['required', 'string', 'max:20', Rule::unique('tm_guru', 'nip')->ignore($guru->id)],
            'mata_pelajaran_id' => ['required', 'exists:tm_mata_pelajaran,id'],
            'tanggal_bergabung' => ['required', 'date'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        // Update user terkait
        $user = User::find($guru->user_id);
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Jika ada password baru
        if ($request->password) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        // Update data guru
        $guru->update([
            'nip' => $request->nip,
            'mata_pelajaran_id' => $request->mata_pelajaran_id,
            'tanggal_bergabung' => $request->tanggal_bergabung,
        ]);
        
        return redirect()->route('guru.index')
                        ->with('message', 'Data guru berhasil diperbarui.');
    }

    /**
     * Toggle active status for user of the guru.
     */
    public function toggleActive(Guru $guru)
    {
        $user = User::find($guru->user_id);
        $user->update([
            'is_active' => !$user->is_active,
        ]);
        
        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->route('guru.index')
                        ->with('message', "Akun guru {$user->name} berhasil {$status}.");
    }

    /**
     * Remove the specified guru from storage.
     */
    public function destroy(Guru $guru)
    {
        // Periksa apakah guru memiliki data evaluasi
        if ($guru->evaluasi()->count() > 0 || $guru->hasilEvaluasi()->count() > 0) {
            return redirect()->route('guru.index')
                            ->with('error', 'Guru tidak dapat dihapus karena memiliki data evaluasi.');
        }
        
        // Simpan id user untuk dihapus setelah guru
        $userId = $guru->user_id;
        
        // Hapus guru
        $guru->delete();
        
        // Hapus user terkait
        User::destroy($userId);
        
        return redirect()->route('guru.index')
                        ->with('message', 'Data guru berhasil dihapus.');
    }
}