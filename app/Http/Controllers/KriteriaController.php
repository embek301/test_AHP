<?php

namespace App\Http\Controllers;

use App\Models\Kriteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KriteriaController extends Controller
{
    /**
     * Display a listing of kriteria.
     */
    public function index()
    {
        // Load kriteria dengan relasi detail_evaluasi
        $kriteria = Kriteria::withCount('detailEvaluasi')->orderBy('nama')->get();
        
        // Hitung statistik untuk dashboard
        $totalKriteria = $kriteria->count();
        $activeKriteria = $kriteria->where('aktif', true)->count();
        $inactiveKriteria = $totalKriteria - $activeKriteria;
        $totalBobotAktif = $kriteria->where('aktif', true)->sum('bobot');
        
        return Inertia::render('Kriteria/index', [
            'kriteria' => $kriteria,
            'stats' => [
                'total' => $totalKriteria,
                'active' => $activeKriteria,
                'inactive' => $inactiveKriteria,
                'totalBobotAktif' => $totalBobotAktif,
            ],
        ]);
    }
    
    /**
     * Store a newly created kriteria in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama' => 'required|string|min:3|max:100',
            'deskripsi' => 'nullable|string',
            'bobot' => 'required|numeric|min:0.01|max:100',
            'aktif' => 'boolean',
        ]);
        
        // Jika kriteria aktif, validasi total bobot tidak melebihi 100
        if ($validatedData['aktif']) {
            $totalBobotAktif = Kriteria::where('aktif', true)->sum('bobot');
            $newTotalBobot = $totalBobotAktif + $validatedData['bobot'];
            
            if ($newTotalBobot > 100) {
                return redirect()->back()->withErrors([
                    'message' => 'Total bobot tidak boleh melebihi 100. Total bobot saat ini: ' . $newTotalBobot,
                ]);
            }
        }
        
        Kriteria::create($validatedData);
        
        return redirect()->route('kriteria.index')
            ->with('message', 'Kriteria evaluasi berhasil ditambahkan');
    }

    /**
     * Update the specified kriteria in storage.
     */
    public function update(Request $request, Kriteria $kriteria)
    {
        $validatedData = $request->validate([
            'nama' => 'required|string|min:3|max:100',
            'deskripsi' => 'nullable|string',
            'bobot' => 'required|numeric|min:0.01|max:100',
            'aktif' => 'boolean',
        ]);
        
        // Jika ada perubahan pada status aktif atau bobot dan akan aktif
        if ($validatedData['aktif']) {
            $totalBobotAktif = Kriteria::where('aktif', true)
                ->where('id', '!=', $kriteria->id)
                ->sum('bobot');
            
            $newTotalBobot = $totalBobotAktif + $validatedData['bobot'];
            
            if ($newTotalBobot > 100) {
                return redirect()->back()->withErrors([
                    'message' => 'Total bobot tidak boleh melebihi 100. Total bobot saat ini: ' . $newTotalBobot,
                ]);
            }
        }
        
        // Cek apakah kriteria digunakan dalam evaluasi
        $isUsed = $kriteria->detailEvaluasi()->count() > 0;
        
        // Jika digunakan dan status akan dinonaktifkan, tolak perubahan
        if ($isUsed && $kriteria->aktif && !$validatedData['aktif']) {
            return redirect()->back()->withErrors([
                'message' => 'Kriteria tidak dapat dinonaktifkan karena sedang digunakan dalam evaluasi',
            ]);
        }
        
        $kriteria->update($validatedData);
        
        return redirect()->route('kriteria.index')
            ->with('message', 'Kriteria evaluasi berhasil diperbarui');
    }

    /**
     * Toggle active status for kriteria.
     */
    public function toggleActive(Request $request, Kriteria $kriteria)
    {
        $validatedData = $request->validate([
            'aktif' => 'required|boolean',
        ]);
        
        // Jika akan diaktifkan, cek total bobot
        if ($validatedData['aktif']) {
            $totalBobotAktif = Kriteria::where('aktif', true)->where('id', '!=', $kriteria->id)->sum('bobot');
            $newTotalBobot = $totalBobotAktif + $kriteria->bobot;
            
            if ($newTotalBobot > 100) {
                return redirect()->back()->withErrors([
                    'error' => 'Total bobot kriteria tidak boleh melebihi 100. Total bobot saat ini: ' . $newTotalBobot,
                ]);
            }
        } else {
            // Jika akan dinonaktifkan, cek apakah digunakan
            $isUsed = $kriteria->detailEvaluasi()->count() > 0;
            
            if ($isUsed) {
                return redirect()->back()->withErrors([
                    'error' => 'Kriteria tidak dapat dinonaktifkan karena sedang digunakan dalam evaluasi',
                ]);
            }
        }
        
        $kriteria->update(['aktif' => $validatedData['aktif']]);
        
        return redirect()->route('kriteria.index')
            ->with('message', 'Status kriteria evaluasi berhasil diperbarui');
    }

    /**
     * Remove the specified kriteria from storage.
     */
    public function destroy(Kriteria $kriteria)
    {
        // Cek apakah kriteria digunakan dalam evaluasi
        $isUsed = $kriteria->detailEvaluasi()->count() > 0;
        
        if ($isUsed) {
            return redirect()->back()->withErrors([
                'error' => 'Kriteria tidak dapat dihapus karena sedang digunakan dalam evaluasi',
            ]);
        }
        
        $kriteria->delete();
        
        return redirect()->route('kriteria.index')
            ->with('message', 'Kriteria evaluasi berhasil dihapus');
    }
}