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
        
        // Get list of guru
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
        
        // Get kriteria list with sub kriteria
        $kriteriaList = Kriteria::with(['subKriteria' => function ($query) {
            $query->where('aktif', true)->orderBy('urutan');
        }])
            ->where('aktif', true)
            ->orderBy('nama')
            ->get();
        
        // Check if evaluasi already exists
        $user = Auth::user();
        $evaluasi = Evaluasi::with(['detailEvaluasi.subKriteria'])
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
        \Log::info('Kepsek Request data received:', $request->all());
        
        $request->validate([
            'guru_id' => 'required|exists:tm_guru,id',
            'periode_evaluasi_id' => 'required|exists:tt_periode_evaluasi,id',
            'detail_evaluasi' => 'required|array',
            'detail_evaluasi.*.kriteria_id' => 'required|exists:tm_kriteria,id',
            'detail_evaluasi.*.sub_kriteria_id' => 'nullable|exists:tm_sub_kriteria,id',
            'detail_evaluasi.*.nilai' => 'required|numeric|min:1|max:5',
            'detail_evaluasi.*.komentar' => 'nullable|string',
            'status' => 'required|in:draft,selesai',
            'komentar_umum' => 'nullable|string',
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
                'jenis' => 'kepsek',
            ]);
            
            \Log::info('Kepsek Evaluasi created with ID: ' . $evaluasi->id);
            
            // Create detail evaluasi
            foreach ($request->detail_evaluasi as $index => $detail) {
                $detailData = [
                    'evaluasi_id' => $evaluasi->id,
                    'kriteria_id' => $detail['kriteria_id'],
                    'sub_kriteria_id' => $detail['sub_kriteria_id'] ?? null,
                    'nilai' => $detail['nilai'],
                    'komentar' => $detail['komentar'] ?? null,
                ];
                
                \Log::info("Creating kepsek detail evaluasi [$index]:", $detailData);
                
                DetailEvaluasi::create($detailData);
            }
            
            // Add komentar umum if exists
            if ($request->komentar_umum) {
                DetailEvaluasi::create([
                    'evaluasi_id' => $evaluasi->id,
                    'kriteria_id' => null,
                    'sub_kriteria_id' => null,
                    'nilai' => 0,
                    'komentar' => $request->komentar_umum,
                ]);
                
                \Log::info('Komentar umum created');
            }
            
            DB::commit();
            
            \Log::info('Transaction committed successfully');
            
            return redirect()->route('kepsek.evaluasi-form.show', $evaluasi->id)
                ->with('message', $request->status === 'selesai' 
                    ? 'Evaluasi berhasil disimpan dan diselesaikan' 
                    : 'Evaluasi berhasil disimpan sebagai draft');
                    
        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error('Error storing kepsek evaluasi: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->with('error', 'Gagal menyimpan evaluasi: ' . $e->getMessage());
        }
    }
    
    /**
     * Display the specified evaluasi.
     */
    /**
 * Display the specified evaluasi.
 */
/**
 * Display the specified evaluasi.
 */
public function show(Request $request)
{
    // Ambil guru_id dari query parameter
    $guruId = $request->query('guru');
    
    if (!$guruId) {
        return redirect()->route('kepsek.evaluasi-form.index')
            ->with('error', 'ID Guru tidak ditemukan');
    }
    
    // Validasi guru exists
    $guru = Guru::with(['user', 'mataPelajaran'])->find($guruId);
    
    if (!$guru) {
        return redirect()->route('kepsek.evaluasi-form.index')
            ->with('error', 'Data guru tidak ditemukan');
    }
    
    // Get active periode evaluasi
    $periodeAktif = PeriodeEvaluasi::where('status', 'aktif')
        ->orderBy('created_at', 'desc')
        ->first();
    
    if (!$periodeAktif) {
        return redirect()->route('kepsek.evaluasi-form.index')
            ->with('error', 'Tidak ada periode evaluasi yang aktif');
    }
    
    // Get evaluasi based on guru_id, periode, and evaluator
    $evaluasi = Evaluasi::with([
        'detailEvaluasi.kriteria',
        'detailEvaluasi.subKriteria'
    ])
        ->where('guru_id', $guruId)
        ->where('periode_evaluasi_id', $periodeAktif->id)
        ->where('evaluator_id', Auth::id())
        ->where('jenis', 'kepsek') // Pastikan hanya evaluasi dari kepsek
        ->first();
    
    if (!$evaluasi) {
        return redirect()->route('kepsek.evaluasi-form.index')
            ->with('error', 'Evaluasi tidak ditemukan. Silakan buat evaluasi terlebih dahulu.');
    }
    
    // Security check: pastikan yang akses adalah evaluator yang bersangkutan
    if ($evaluasi->evaluator_id !== Auth::id()) {
        return redirect()->route('kepsek.evaluasi-form.index')
            ->with('error', 'Anda tidak memiliki akses untuk melihat evaluasi ini');
    }
    
    $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
    
    // Get kriteria list with sub kriteria
    $kriteriaList = Kriteria::with(['subKriteria' => function ($query) {
        $query->where('aktif', true)->orderBy('urutan');
    }])
        ->where('aktif', true)
        ->orderBy('nama')
        ->get();
    
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
        $evaluasi = Evaluasi::with([
            'detailEvaluasi.kriteria',
            'detailEvaluasi.subKriteria'
        ])->findOrFail($id);
        
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
        
        // Get kriteria list with sub kriteria
        $kriteriaList = Kriteria::with(['subKriteria' => function ($query) {
            $query->where('aktif', true)->orderBy('urutan');
        }])
            ->where('aktif', true)
            ->orderBy('nama')
            ->get();
        
        return Inertia::render('Kepsek/EvaluasiForm/Edit', [
            'guru' => $guru,
            'kriteriaList' => $kriteriaList,
            'periodeAktif' => $periodeEvaluasi,
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
            'detail_evaluasi.*.sub_kriteria_id' => 'nullable|exists:tm_sub_kriteria,id',
            'detail_evaluasi.*.nilai' => 'required|numeric|min:1|max:5',
            'detail_evaluasi.*.komentar' => 'nullable|string',
            'status' => 'required|in:draft,selesai',
            'komentar_umum' => 'nullable|string',
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
            
            // Delete old detail evaluasi (except komentar umum)
            DetailEvaluasi::where('evaluasi_id', $evaluasi->id)
                ->whereNotNull('kriteria_id')
                ->delete();
            
            // Create new detail evaluasi
            foreach ($request->detail_evaluasi as $detail) {
                DetailEvaluasi::create([
                    'evaluasi_id' => $evaluasi->id,
                    'kriteria_id' => $detail['kriteria_id'],
                    'sub_kriteria_id' => $detail['sub_kriteria_id'] ?? null,
                    'nilai' => $detail['nilai'],
                    'komentar' => $detail['komentar'] ?? null,
                ]);
            }
            
            // Update or create komentar umum
            DetailEvaluasi::updateOrCreate(
                [
                    'evaluasi_id' => $evaluasi->id,
                    'kriteria_id' => null,
                ],
                [
                    'sub_kriteria_id' => null,
                    'nilai' => 0,
                    'komentar' => $request->komentar_umum ?? null,
                ]
            );
            
            DB::commit();
            
            return redirect()->route('kepsek.evaluasi-form.show', $evaluasi->id)
                ->with('message', $request->status === 'selesai' 
                    ? 'Evaluasi berhasil diupdate dan diselesaikan' 
                    : 'Evaluasi berhasil diupdate sebagai draft');
                    
        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error('Error updating kepsek evaluasi: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->with('error', 'Gagal mengupdate evaluasi: ' . $e->getMessage());
        }
    }

    /**
     * Export the specified evaluasi to PDF.
     */
    public function export($id)
    {
        $evaluasi = Evaluasi::with(['detailEvaluasi.kriteria', 'detailEvaluasi.subKriteria', 'guru.user', 'periodeEvaluasi'])->findOrFail($id);
        
        // Security check: only export if the user is the evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('kepsek.evaluasi-form.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengekspor evaluasi ini');
        }
        
        // Calculate average score
        $totalScore = 0;
        $totalWeight = 0;
        
        foreach ($evaluasi->detailEvaluasi as $detail) {
            if ($detail->kriteria_id) {
                // Get weight from sub_kriteria if exists, otherwise from kriteria
                $weight = $detail->subKriteria 
                    ? ($detail->subKriteria->bobot / 100)
                    : ($detail->kriteria->bobot / 100);
                
                $weightedScore = $detail->nilai * $weight;
                $totalScore += $weightedScore;
                $totalWeight += $weight;
            }
        }
        
        $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;
        
        // Generate PDF
        $data = [
            'evaluasi' => $evaluasi,
            'averageScore' => $averageScore,
            'exportDate' => Carbon::now()->format('d F Y'),
            'scoreCategory' => $this->getScoreCategory($averageScore),
        ];
        
        $pdf = app('dompdf.wrapper');
        $pdf->loadView('exports.evaluasi_pdf', $data);
        
        $filename = 'evaluasi_' . str_replace(' ', '_', $evaluasi->guru->user->name) . '_' . Carbon::now()->format('Ymd_His') . '.pdf';
        
        return $pdf->stream($filename);
    }
    
    /**
     * Calculate hasil evaluasi for a guru in a periode.
     */
    private function calculateHasilEvaluasi($guruId, $periodeEvaluasiId)
    {
        // Get all completed evaluations for this guru in this periode
        $evaluasi = Evaluasi::with('detailEvaluasi.kriteria')
            ->where('guru_id', $guruId)
            ->where('periode_evaluasi_id', $periodeEvaluasiId)
            ->where('status', 'selesai')
            ->get();
        
        // Calculate scores by criteria and by evaluator type
        // This would typically be a complex calculation involving multiple queries
        // and possibly statistical functions
    }
    
    /**
     * Get score category based on score value.
     */
    private function getScoreCategory($score)
    {
        if ($score >= 4.5) {
            return ['name' => 'Sangat Baik', 'color' => 'green'];
        } elseif ($score >= 3.5) {
            return ['name' => 'Baik', 'color' => 'blue'];
        } elseif ($score >= 2.5) {
            return ['name' => 'Cukup', 'color' => 'yellow'];
        } elseif ($score >= 1.5) {
            return ['name' => 'Kurang', 'color' => 'orange'];
        } else {
            return ['name' => 'Sangat Kurang', 'color' => 'red'];
        }
    }
}