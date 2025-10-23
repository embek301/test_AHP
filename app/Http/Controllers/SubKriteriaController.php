<?php

namespace App\Http\Controllers;

use App\Models\SubKriteria;
use App\Models\Kriteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubKriteriaController extends Controller
{
    /**
     * Display sub kriteria for a specific kriteria
     */
    public function index(Request $request, $kriteriaId)
    {
        $kriteria = Kriteria::with(['subKriteria' => function($query) {
            $query->withCount('detailEvaluasi')->orderBy('urutan');
        }])->findOrFail($kriteriaId);

        $stats = [
            'total' => $kriteria->subKriteria->count(),
            'active' => $kriteria->subKriteria->where('aktif', true)->count(),
            'inactive' => $kriteria->subKriteria->where('aktif', false)->count(),
            'totalBobotAktif' => $kriteria->subKriteria->where('aktif', true)->sum('bobot'),
        ];

        return Inertia::render('SubKriteria/index', [
            'kriteria' => $kriteria,
            'subKriteria' => $kriteria->subKriteria,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created sub kriteria
     */
    public function store(Request $request, $kriteriaId)
    {
        $kriteria = Kriteria::findOrFail($kriteriaId);
        
        $request->validate([
            'nama' => 'required|string|min:3|max:100',
            'deskripsi' => 'nullable|string',
            'bobot' => 'required|numeric|min:0.01|max:100',
            'aktif' => 'boolean',
            'urutan' => 'nullable|integer',
        ]);

        // Validasi total bobot tidak melebihi 100
        if ($request->aktif ?? true) {
            $totalBobotAktif = SubKriteria::where('kriteria_id', $kriteriaId)
                ->where('aktif', true)
                ->sum('bobot');
            
            $newTotalBobot = $totalBobotAktif + $request->bobot;
            
            if ($newTotalBobot > 100) {
                return back()->withErrors([
                    'message' => 'Total bobot sub kriteria tidak boleh melebihi 100. Total bobot saat ini: ' . $newTotalBobot,
                ]);
            }
        }

        // Set urutan otomatis jika tidak diisi
        $urutan = $request->urutan ?? (SubKriteria::where('kriteria_id', $kriteriaId)->max('urutan') ?? 0) + 1;

        SubKriteria::create([
            'kriteria_id' => $kriteriaId,
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'bobot' => $request->bobot,
            'aktif' => $request->aktif ?? true,
            'urutan' => $urutan,
        ]);

        return redirect()->route('sub-kriteria.index', $kriteriaId)
            ->with('message', 'Sub kriteria berhasil ditambahkan');
    }

    /**
     * Update the specified sub kriteria
     */
    public function update(Request $request, $kriteriaId, SubKriteria $subKriteria)
    {
        // Pastikan sub kriteria milik kriteria yang benar
        if ($subKriteria->kriteria_id != $kriteriaId) {
            return back()->withErrors(['message' => 'Sub kriteria tidak ditemukan']);
        }

        $request->validate([
            'nama' => 'required|string|min:3|max:100',
            'deskripsi' => 'nullable|string',
            'bobot' => 'required|numeric|min:0.01|max:100',
            'aktif' => 'boolean',
            'urutan' => 'nullable|integer',
        ]);

        // Validasi total bobot
        if ($request->aktif ?? true) {
            $totalBobotAktif = SubKriteria::where('kriteria_id', $kriteriaId)
                ->where('aktif', true)
                ->where('id', '!=', $subKriteria->id)
                ->sum('bobot');
            
            $newTotalBobot = $totalBobotAktif + $request->bobot;
            
            if ($newTotalBobot > 100) {
                return back()->withErrors([
                    'message' => 'Total bobot sub kriteria tidak boleh melebihi 100. Total bobot saat ini: ' . $newTotalBobot,
                ]);
            }
        }

        // Cek apakah sub kriteria digunakan dalam evaluasi
        $isUsed = $subKriteria->detailEvaluasi()->count() > 0;
        
        if ($isUsed && $subKriteria->aktif && !($request->aktif ?? true)) {
            return back()->withErrors([
                'message' => 'Sub kriteria tidak dapat dinonaktifkan karena sedang digunakan dalam evaluasi',
            ]);
        }

        $subKriteria->update([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'bobot' => $request->bobot,
            'aktif' => $request->aktif ?? true,
            'urutan' => $request->urutan ?? $subKriteria->urutan,
        ]);

        return redirect()->route('sub-kriteria.index', $kriteriaId)
            ->with('message', 'Sub kriteria berhasil diperbarui');
    }

    /**
     * Toggle active status
     */
    public function toggleActive(Request $request, $kriteriaId, SubKriteria $subKriteria)
    {
        $request->validate([
            'aktif' => 'required|boolean',
        ]);

        // Jika akan diaktifkan, cek total bobot
        if ($request->aktif) {
            $totalBobotAktif = SubKriteria::where('kriteria_id', $kriteriaId)
                ->where('aktif', true)
                ->where('id', '!=', $subKriteria->id)
                ->sum('bobot');
            
            $newTotalBobot = $totalBobotAktif + $subKriteria->bobot;
            
            if ($newTotalBobot > 100) {
                return back()->withErrors([
                    'error' => 'Total bobot sub kriteria tidak boleh melebihi 100. Total bobot saat ini: ' . $newTotalBobot,
                ]);
            }
        } else {
            // Jika akan dinonaktifkan, cek apakah digunakan
            $isUsed = $subKriteria->detailEvaluasi()->count() > 0;
            
            if ($isUsed) {
                return back()->withErrors([
                    'error' => 'Sub kriteria tidak dapat dinonaktifkan karena sedang digunakan dalam evaluasi',
                ]);
            }
        }

        $subKriteria->update(['aktif' => $request->aktif]);

        return redirect()->route('sub-kriteria.index', $kriteriaId)
            ->with('message', 'Status sub kriteria berhasil diperbarui');
    }

    /**
     * Remove the specified sub kriteria
     */
    public function destroy($kriteriaId, SubKriteria $subKriteria)
    {
        // Cek apakah sub kriteria digunakan dalam evaluasi
        $isUsed = $subKriteria->detailEvaluasi()->count() > 0;
        
        if ($isUsed) {
            return back()->withErrors([
                'error' => 'Sub kriteria tidak dapat dihapus karena sedang digunakan dalam evaluasi',
            ]);
        }

        $subKriteria->delete();

        return redirect()->route('sub-kriteria.index', $kriteriaId)
            ->with('message', 'Sub kriteria berhasil dihapus');
    }

    /**
     * Update urutan sub kriteria (untuk drag & drop di masa depan)
     */
    public function updateUrutan(Request $request, $kriteriaId)
    {
        $request->validate([
            'urutan' => 'required|array',
            'urutan.*.id' => 'required|exists:tm_sub_kriteria,id',
            'urutan.*.urutan' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->urutan as $item) {
                SubKriteria::where('id', $item['id'])
                    ->where('kriteria_id', $kriteriaId)
                    ->update(['urutan' => $item['urutan']]);
            }
            DB::commit();

            return back()->with('message', 'Urutan sub kriteria berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Gagal memperbarui urutan sub kriteria']);
        }
    }
}