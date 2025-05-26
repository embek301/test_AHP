<?php

namespace App\Http\Controllers\Kepsek;

use Carbon\Carbon;
use App\Models\Guru;
use Inertia\Inertia;
use App\Models\Evaluasi;
use App\Models\Kriteria;
use Barryvdh\DomPDF\PDF;
use Illuminate\Http\Request;
use App\Models\DetailEvaluasi;
use App\Models\PeriodeEvaluasi;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class EvaluasiFormController extends Controller
{
    /**
     * Display a listing of evaluasi forms for kepsek.
     */
    public function index(Request $request)
    {
        // Get active periode evaluasi
        $periodeAktif = PeriodeEvaluasi::where('status', 'aktif')
            ->orderBy('created_at', 'desc')
            ->first();
        
        // Get list of guru - PERBAIKAN: load dengan relasi yang lebih lengkap
        $guruQuery = Guru::with(['user', 'mataPelajaran'])
            ->whereHas('user', function ($query) {
                $query->where('is_active', true);
            });
    
        // Handle filter mata pelajaran
        $mataPelajaranId = $request->input('mata_pelajaran_id');
        if ($mataPelajaranId) {
            $guruQuery->whereHas('mataPelajaran', function ($query) use ($mataPelajaranId) {
                $query->where('tm_mata_pelajaran.id', $mataPelajaranId);
            });
        }
        
        // Handle search query
        $searchQuery = $request->input('search');
        if ($searchQuery) {
            $guruQuery->whereHas('user', function ($query) use ($searchQuery) {
                $query->where('name', 'like', "%{$searchQuery}%");
            })->orWhere('nip', 'like', "%{$searchQuery}%");
        }
        
        $guruList = $guruQuery->orderBy('created_at', 'desc')->get();
        
        // Get current user
        $user = Auth::user();
        
        // Get evaluasi that have been completed by kepsek in current periode
        $completedEvaluasi = [];
        
        if ($periodeAktif) {
            $completedEvaluasi = Evaluasi::where('evaluator_id', $user->id)
                ->where('periode_evaluasi_id', $periodeAktif->id)
                ->pluck('guru_id')
                ->toArray();
        }
        
        // Get all mata pelajaran for filter
        $mataPelajaran = \App\Models\MataPelajaran::where('is_active', true)
            ->orderBy('nama')
            ->get();
        
        // Get stats
        $stats = [
            'total_guru' => $guruList->count(),
            'completed' => count($completedEvaluasi),
            'remaining' => $guruList->count() - count($completedEvaluasi),
            'completion_percentage' => $guruList->count() > 0 
                ? round((count($completedEvaluasi) / $guruList->count()) * 100) 
                : 0,
        ];
        
        return Inertia::render('Kepsek/EvaluasiForm/index', [
            'periodeAktif' => $periodeAktif,
            'guruList' => $guruList,
            'completedEvaluasi' => $completedEvaluasi,
            'mataPelajaran' => $mataPelajaran,
            'filters' => [
                'search' => $searchQuery,
                'mata_pelajaran_id' => $mataPelajaranId,
            ],
            'stats' => $stats,
        ]);
    }
    
    /**
     * Show the form for creating a new evaluasi.
     */
    public function create(Request $request, $guruId)
    {
        // Get guru details
        $guru = Guru::with(['user', 'mataPelajaran'])->findOrFail($guruId);
        
        // Get active periode evaluasi
        $periodeAktif = PeriodeEvaluasi::where('status', 'aktif')
            ->orderBy('created_at', 'desc')
            ->first();
        
        if (!$periodeAktif) {
            return redirect()->route('kepsek.evaluasi-form.index')
                ->with('error', 'Tidak ada periode evaluasi yang aktif saat ini.');
        }
        
        // Get kriteria list
        $kriteriaList = Kriteria::where('aktif', true)
            ->orderBy('nama')
            ->get();
        
        // Check if evaluasi already exists
        $user = Auth::user();
        $evaluasi = Evaluasi::with('detailEvaluasi')
            ->where('guru_id', $guruId)
            ->where('periode_evaluasi_id', $periodeAktif->id)
            ->where('evaluator_id', $user->id)
            ->first();
        
        // If evaluasi exists, redirect to show
        if ($evaluasi) {
            return redirect()->route('kepsek.evaluasi-form.show', $evaluasi->id);
        }
        
        return Inertia::render('Kepsek/EvaluasiForm/Create', [
            'guru' => $guru,
            'periodeAktif' => $periodeAktif,
            'kriteriaList' => $kriteriaList,
        ]);
    }
    
    /**
     * Store a newly created evaluasi in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'guru_id' => 'required|exists:tm_guru,id',
            'periode_evaluasi_id' => 'required|exists:tt_periode_evaluasi,id',
            'detail_evaluasi' => 'required|array',
            'detail_evaluasi.*.kriteria_id' => 'required|exists:tm_kriteria,id',
            'detail_evaluasi.*.nilai' => 'required|numeric|min:1|max:100',
            'detail_evaluasi.*.komentar' => 'nullable|string',
            'status' => 'required|in:draft,selesai',
        ]);
        
        $user = Auth::user();
        
        // Check if evaluasi already exists
        $existingEvaluasi = Evaluasi::where('guru_id', $request->guru_id)
            ->where('periode_evaluasi_id', $request->periode_evaluasi_id)
            ->where('evaluator_id', $user->id)
            ->first();
            
        if ($existingEvaluasi) {
            return redirect()->route('kepsek.evaluasi-form.show', $existingEvaluasi->id)
                ->with('message', 'Evaluasi sudah ada');
        }
        
        DB::beginTransaction();
        
        try {
            // Create evaluasi
            $evaluasi = Evaluasi::create([
                'guru_id' => $request->guru_id,
                'periode_evaluasi_id' => $request->periode_evaluasi_id,
                'evaluator_id' => $user->id,
                'status' => $request->status,
            ]);
            
            // Create detail evaluasi
            foreach ($request->detail_evaluasi as $detail) {
                DetailEvaluasi::create([
                    'evaluasi_id' => $evaluasi->id,
                    'kriteria_id' => $detail['kriteria_id'],
                    'nilai' => $detail['nilai'],
                    'komentar' => $detail['komentar'] ?? null,
                ]);
            }
            
            // If status selesai, recalculate the hasil_evaluasi
            if ($request->status === 'selesai') {
                $this->calculateHasilEvaluasi($request->guru_id, $request->periode_evaluasi_id);
            }
            
            DB::commit();
            
            return redirect()->route('kepsek.evaluasi-form.show', $evaluasi->id)
                ->with('message', $request->status === 'selesai' 
                    ? 'Evaluasi berhasil disimpan dan diselesaikan' 
                    : 'Evaluasi berhasil disimpan sebagai draft');
                    
        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()->back()
                ->with('error', 'Gagal menyimpan evaluasi: ' . $e->getMessage());
        }
    }
    
    /**
     * Display the specified evaluasi.
     */
    public function show($id)
    {
        $evaluasi = Evaluasi::with('detailEvaluasi')->findOrFail($id);
        
        // Security check: only show if the user is the evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('kepsek.evaluasi-form.index')
                ->with('error', 'Anda tidak memiliki akses untuk melihat evaluasi ini');
        }
        
        $guru = Guru::with(['user', 'mataPelajaran'])->findOrFail($evaluasi->guru_id);
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        
        // Get kriteria list with details
        $kriteriaList = Kriteria::where('aktif', true)->orderBy('nama')->get();
        
        return Inertia::render('Kepsek/EvaluasiForm/Show', [
            'guru' => $guru,
            'kriteriaList' => $kriteriaList,
            'periodeEvaluasi' => $periodeEvaluasi,
            'evaluasi' => $evaluasi,
        ]);
    }
    
    /**
     * Show the form for editing the specified evaluasi.
     */
    public function edit($id)
    {
        $evaluasi = Evaluasi::with('detailEvaluasi')->findOrFail($id);
        
        // Security check: only edit if the user is the evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('kepsek.evaluasi-form.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit evaluasi ini');
        }
        
        $guru = Guru::with(['user', 'mataPelajaran'])->findOrFail($evaluasi->guru_id);
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        
        // Check if periode is still active
        if ($periodeEvaluasi->status !== 'aktif') {
            return redirect()->route('kepsek.evaluasi-form.show', $evaluasi->id)
                ->with('error', 'Periode evaluasi sudah tidak aktif, tidak dapat mengedit evaluasi');
        }
        
        // Get kriteria list
        $kriteriaList = Kriteria::where('aktif', true)->orderBy('nama')->get();
        
        return Inertia::render('Kepsek/EvaluasiForm/Edit', [
            'guru' => $guru,
            'kriteriaList' => $kriteriaList,
            'periodeEvaluasi' => $periodeEvaluasi,
            'evaluasi' => $evaluasi,
        ]);
    }
    
    /**
     * Update the specified evaluasi in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'detail_evaluasi' => 'required|array',
            'detail_evaluasi.*.kriteria_id' => 'required|exists:tm_kriteria,id',
            'detail_evaluasi.*.nilai' => 'required|numeric|min:1|max:100',
            'detail_evaluasi.*.komentar' => 'nullable|string',
            'status' => 'required|in:draft,selesai',
        ]);
        
        $evaluasi = Evaluasi::findOrFail($id);
        
        // Security check: only update if the user is the evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('kepsek.evaluasi-form.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengupdate evaluasi ini');
        }
        
        // Check if periode is still active
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        if ($periodeEvaluasi->status !== 'aktif') {
            return redirect()->route('kepsek.evaluasi-form.show', $evaluasi->id)
                ->with('error', 'Periode evaluasi sudah tidak aktif, tidak dapat mengupdate evaluasi');
        }
        
        DB::beginTransaction();
        
        try {
            // Update evaluasi status
            $evaluasi->status = $request->status;
            $evaluasi->save();
            
            // Update detail evaluasi
            foreach ($request->detail_evaluasi as $detail) {
                // Find or create detail
                $detailModel = DetailEvaluasi::updateOrCreate(
                    [
                        'evaluasi_id' => $evaluasi->id,
                        'kriteria_id' => $detail['kriteria_id'],
                    ],
                    [
                        'nilai' => $detail['nilai'],
                        'komentar' => $detail['komentar'] ?? null,
                    ]
                );
            }
            
            // If status selesai, recalculate the hasil_evaluasi
            if ($request->status === 'selesai') {
                $this->calculateHasilEvaluasi($evaluasi->guru_id, $evaluasi->periode_evaluasi_id);
            }
            
            DB::commit();
            
            return redirect()->route('kepsek.evaluasi-form.show', $evaluasi->id)
                ->with('message', $request->status === 'selesai' 
                    ? 'Evaluasi berhasil diupdate dan diselesaikan' 
                    : 'Evaluasi berhasil diupdate sebagai draft');
                    
        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()->back()
                ->with('error', 'Gagal mengupdate evaluasi: ' . $e->getMessage());
        }
    }

    /**
     * Export the specified evaluasi to PDF.
     */
    public function export($id)
    {
        $evaluasi = Evaluasi::with(['detailEvaluasi.kriteria', 'guru.user', 'periodeEvaluasi'])->findOrFail($id);
        
        // Security check: only export if the user is the evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('kepsek.evaluasi-form.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengekspor evaluasi ini');
        }
        
        // Calculate average score
        $totalScore = 0;
        $totalWeight = 0;
        
        foreach ($evaluasi->detailEvaluasi as $detail) {
            $weight = $detail->kriteria->bobot / 100; // Convert percent to decimal
            $weightedScore = $detail->nilai * $weight;
            $totalScore += $weightedScore;
            $totalWeight += $weight;
        }
        
        $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;
        
        // Generate PDF
        $data = [
            'evaluasi' => $evaluasi,
            'averageScore' => $averageScore,
            'exportDate' => Carbon::now()->format('d F Y'),
            'scoreCategory' => $this->getScoreCategory($averageScore),
        ];
        
        // Perbaikan: Inject PDF sebagai dependency, bukan menggunakan static method
        $pdf = app('dompdf.wrapper');
        $pdf->loadView('exports.evaluasi_pdf', $data);
        
        // Buka PDF di tab baru menggunakan stream
        $filename = 'evaluasi_' . str_replace(' ', '_', $evaluasi->guru->user->name) . '_' . Carbon::now()->format('Ymd_His') . '.pdf';
        
        // Stream PDF (buka di tab baru)
        return $pdf->stream($filename);
    }
    
    /**
     * Calculate hasil evaluasi for a guru in a periode.
     */
    private function calculateHasilEvaluasi($guruId, $periodeEvaluasiId)
    {
        // Your calculation logic here...
        // This is a placeholder - you would implement your actual calculation logic
        
        // Example of how this might start:
        // 1. Get all completed evaluations for this guru in this periode
        $evaluasi = Evaluasi::with('detailEvaluasi.kriteria')
            ->where('guru_id', $guruId)
            ->where('periode_evaluasi_id', $periodeEvaluasiId)
            ->where('status', 'selesai')
            ->get();
        
        // 2. Calculate scores by criteria and by evaluator type
        // 3. Calculate weighted scores
        // 4. Update or create the hasil_evaluasi record
        
        // This would typically be a complex calculation involving multiple queries
        // and possibly statistical functions
    }
    
    /**
     * Get score category based on score value.
     */
    private function getScoreCategory($score)
    {
        if ($score >= 90) {
            return ['name' => 'Sangat Baik', 'color' => 'green'];
        } elseif ($score >= 80) {
            return ['name' => 'Baik', 'color' => 'blue'];
        } elseif ($score >= 70) {
            return ['name' => 'Cukup', 'color' => 'yellow'];
        } elseif ($score >= 60) {
            return ['name' => 'Kurang', 'color' => 'orange'];
        } else {
            return ['name' => 'Sangat Kurang', 'color' => 'red'];
        }
    }
}