<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class KelasController extends Controller
{
    /**
     * Display a listing of the kelas.
     */
    public function index()
    {
        // Load kelas dengan relasi siswaKelas
        $kelas = Kelas::with('siswaKelas.user')->get();
        
        // Tambahkan debugging untuk memeriksa data di server
        \Log::debug('Kelas data:', ['kelas' => $kelas->toArray()]);
        
        return Inertia::render('Kelas/index', [
            'kelas' => $kelas,
        ]);
    }

    /**
     * Store a newly created kelas in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'tahun_akademik' => ['required', 'string', 'max:255'],
        ]);

        $kelas = Kelas::create([
            'nama' => $request->nama,
            'tahun_akademik' => $request->tahun_akademik,
        ]);
        
        return redirect()->route('kelas.index')
                        ->with('message', 'Kelas berhasil ditambahkan.');
    }

    /**
     * Display the specified kelas.
     */
    public function show(Kelas $kela)
    {
        return Inertia::render('Kelas/Show', [
            'kelas' => $kela->load(['siswaKelas.user']),
        ]);
    }

    /**
     * Update the specified kelas in storage.
     */
    public function update(Request $request, Kelas $kela)
    {
        $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'tahun_akademik' => ['required', 'string', 'max:255'],
        ]);

        $kela->update([
            'nama' => $request->nama,
            'tahun_akademik' => $request->tahun_akademik,
        ]);
        
        return redirect()->route('kelas.index')
                        ->with('message', 'Kelas berhasil diperbarui.');
    }

    /**
     * Remove the specified kelas from storage.
     */
    public function destroy(Kelas $kela)
    {
        // Check if there are students in this class
        if ($kela->siswaKelas()->count() > 0) {
            return redirect()->route('kelas.index')
                            ->with('error', 'Kelas tidak dapat dihapus karena masih memiliki siswa.');
        }
        
        $kela->delete();
        
        return redirect()->route('kelas.index')
                        ->with('message', 'Kelas berhasil dihapus.');
    }
}
