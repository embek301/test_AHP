<?php


namespace App\Http\Controllers;

use App\Models\MataPelajaran;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MataPelajaranController extends Controller
{
    /**
     * Display a listing of the mata pelajaran.
     */
    public function index()
    {
        // Load mata pelajaran dengan relasi guru
        $mataPelajaran = MataPelajaran::with('guru.user')->get();
        
        // Tambahkan debugging untuk memeriksa data di server
        \Log::debug('Mata Pelajaran data:', ['mataPelajaran' => $mataPelajaran->toArray()]);
        
        return Inertia::render('MataPelajaran/index', [
            'mataPelajaran' => $mataPelajaran,
        ]);
    }

    /**
     * Store a newly created mata pelajaran in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'kode' => ['required', 'string', 'max:20', 'unique:tm_mata_pelajaran,kode'],
            'deskripsi' => ['nullable', 'string'],
        ]);

        $mataPelajaran = MataPelajaran::create([
            'nama' => $request->nama,
            'kode' => $request->kode,
            'deskripsi' => $request->deskripsi,
            'is_active' => true,
        ]);
        
        return redirect()->route('mata-pelajaran.index')
                        ->with('message', 'Mata pelajaran berhasil ditambahkan.');
    }

    /**
     * Update the specified mata pelajaran in storage.
     */
    public function update(Request $request, MataPelajaran $mataPelajaran)
    {
        $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'kode' => ['required', 'string', 'max:20', Rule::unique('tm_mata_pelajaran', 'kode')->ignore($mataPelajaran->id)],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $mataPelajaran->update([
            'nama' => $request->nama,
            'kode' => $request->kode,
            'deskripsi' => $request->deskripsi,
            'is_active' => $request->is_active,
        ]);
        
        return redirect()->route('mata-pelajaran.index')
                        ->with('message', 'Mata pelajaran berhasil diperbarui.');
    }

    /**
     * Toggle active status for mata pelajaran.
     */
    public function toggleActive(MataPelajaran $mataPelajaran)
    {
        $mataPelajaran->update([
            'is_active' => !$mataPelajaran->is_active,
        ]);
        
        $status = $mataPelajaran->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->route('mata-pelajaran.index')
                        ->with('message', "Mata pelajaran berhasil {$status}.");
    }

    /**
     * Remove the specified mata pelajaran from storage.
     */
    public function destroy(MataPelajaran $mataPelajaran)
    {
        // Check if mata pelajaran is being used by guru
        if ($mataPelajaran->guru()->count() > 0) {
            return redirect()->route('mata-pelajaran.index')
                            ->with('error', 'Mata pelajaran tidak dapat dihapus karena masih digunakan oleh guru.');
        }
        
        $mataPelajaran->delete();
        
        return redirect()->route('mata-pelajaran.index')
                        ->with('message', 'Mata pelajaran berhasil dihapus.');
    }
}