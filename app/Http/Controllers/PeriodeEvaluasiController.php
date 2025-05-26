<?php

namespace App\Http\Controllers;

use App\Models\PeriodeEvaluasi;
use App\Models\Evaluasi;
use App\Models\HasilEvaluasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PeriodeEvaluasiController extends Controller
{
    /**
     * Display a listing of the periode evaluasi.
     */
    public function index()
    {
        $periodeEvaluasi = PeriodeEvaluasi::withCount(['evaluasi', 'hasilEvaluasi'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Load stats untuk dashboard
        $activeCount = PeriodeEvaluasi::where('status', 'aktif')->count();
        $completedCount = PeriodeEvaluasi::where('status', 'selesai')->count();
        $draftCount = PeriodeEvaluasi::where('status', 'draft')->count();
        
        return Inertia::render('PeriodeEvaluasi/index', [
            'periodeEvaluasi' => $periodeEvaluasi,
            'stats' => [
                'active' => $activeCount,
                'completed' => $completedCount,
                'draft' => $draftCount,
                'total' => $periodeEvaluasi->count(),
            ],
        ]);
    }

    /**
     * Store a newly created periode evaluasi in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'status' => ['required', 'in:draft,aktif,selesai'],
        ]);

        // Jika status active, pastikan tidak ada periode lain yang aktif
        if ($request->status === 'aktif') {
            $activeCount = PeriodeEvaluasi::where('status', 'aktif')->count();
            if ($activeCount > 0) {
                return back()->withErrors(['status' => 'Hanya boleh ada satu periode evaluasi yang aktif']);
            }
        }

        $periodeEvaluasi = PeriodeEvaluasi::create([
            'judul' => $request->judul,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'status' => $request->status,
        ]);
        
        return redirect()->route('periode-evaluasi.index')
                        ->with('message', 'Periode evaluasi berhasil ditambahkan.');
    }

    /**
     * Update the specified periode evaluasi in storage.
     */
    public function update(Request $request, PeriodeEvaluasi $periodeEvaluasi)
    {
        $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'status' => ['required', 'in:draft,aktif,selesai'],
        ]);

        // Jika mengubah status menjadi active, pastikan tidak ada periode lain yang aktif
        if ($request->status === 'aktif' && $periodeEvaluasi->status !== 'aktif') {
            $activeCount = PeriodeEvaluasi::where('status', 'aktif')->count();
            if ($activeCount > 0) {
                return back()->withErrors(['status' => 'Hanya boleh ada satu periode evaluasi yang aktif']);
            }
        }

        $periodeEvaluasi->update([
            'judul' => $request->judul,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'status' => $request->status,
        ]);
        
        return redirect()->route('periode-evaluasi.index')
                        ->with('message', 'Periode evaluasi berhasil diperbarui.');
    }

    /**
     * Change the status of a periode evaluasi.
     */
    public function changeStatus(Request $request, PeriodeEvaluasi $periodeEvaluasi)
    {
        $request->validate([
            'status' => ['required', 'in:draft,aktif,selesai'],
        ]);

        // Jika mengubah status menjadi active, pastikan tidak ada periode lain yang aktif
        if ($request->status === 'aktif' && $periodeEvaluasi->status !== 'aktif') {
            $activeCount = PeriodeEvaluasi::where('status', 'aktif')->count();
            if ($activeCount > 0) {
                return back()->withErrors(['error' => 'Hanya boleh ada satu periode evaluasi yang aktif']);
            }
        }

        $periodeEvaluasi->update([
            'status' => $request->status,
        ]);
        
        return redirect()->route('periode-evaluasi.index')
                        ->with('message', "Status periode evaluasi berhasil diubah menjadi {$request->status}.");
    }

    /**
     * Remove the specified periode evaluasi from storage.
     */
    public function destroy(PeriodeEvaluasi $periodeEvaluasi)
    {
        // Periksa apakah periode evaluasi memiliki evaluasi atau hasil evaluasi
        if ($periodeEvaluasi->evaluasi()->count() > 0 || $periodeEvaluasi->hasilEvaluasi()->count() > 0) {
            return redirect()->route('periode-evaluasi.index')
                            ->with('error', 'Periode evaluasi tidak dapat dihapus karena memiliki data evaluasi terkait.');
        }
        
        // Hapus periode evaluasi
        $periodeEvaluasi->delete();
        
        return redirect()->route('periode-evaluasi.index')
                        ->with('message', 'Periode evaluasi berhasil dihapus.');
    }

    /**
     * Get summary statistics for the specified periode evaluasi.
     */
    public function getSummary(PeriodeEvaluasi $periodeEvaluasi)
    {
        // Hitung jumlah evaluasi
        $evaluasiCount = $periodeEvaluasi->evaluasi()->count();
        
        // Hitung jumlah hasil evaluasi
        $hasilEvaluasiCount = $periodeEvaluasi->hasilEvaluasi()->count();
        
        // Hitung jumlah guru yang dievaluasi
        $guruCount = Evaluasi::where('periode_evaluasi_id', $periodeEvaluasi->id)
                            ->distinct('guru_id')
                            ->count('guru_id');
        
        // Hitung jumlah siswa yang berpartisipasi dalam evaluasi
        $siswaCount = HasilEvaluasi::where('periode_evaluasi_id', $periodeEvaluasi->id)
                                ->distinct('user_id')
                                ->count('user_id');
        
        // Hitung rata-rata skor evaluasi
        $averageScore = HasilEvaluasi::where('periode_evaluasi_id', $periodeEvaluasi->id)
                                    ->avg('total_skor');
        
        return response()->json([
            'evaluasi_count' => $evaluasiCount,
            'hasil_evaluasi_count' => $hasilEvaluasiCount,
            'guru_count' => $guruCount,
            'siswa_count' => $siswaCount,
            'average_score' => $averageScore ? round($averageScore, 2) : 0,
        ]);
    }
}