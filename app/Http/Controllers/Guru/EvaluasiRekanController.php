<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\Evaluasi;
use App\Models\Kriteria;
use App\Models\DetailEvaluasi;
use App\Models\PeriodeEvaluasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EvaluasiRekanController extends Controller
{
    /**
     * Menampilkan daftar guru untuk dievaluasi
     */
    public function index(Request $request)
    {
        // Dapatkan periode evaluasi aktif
        $periodeAktif = PeriodeEvaluasi::where('status', 'aktif')
            ->orderBy('created_at', 'desc')
            ->first();
        
        // Dapatkan informasi guru saat ini
        $user = Auth::user();
        $currentGuru = Guru::where('user_id', $user->id)->first();
        
        if (!$currentGuru) {
            return redirect()->route('dashboard')
                ->with('error', 'Anda tidak terdaftar sebagai guru.');
        }
        
        // Dapatkan daftar guru untuk dievaluasi (kecuali diri sendiri)
        $guruQuery = Guru::with(['user', 'mataPelajaran'])
            ->whereHas('user', function ($query) {
                $query->where('is_active', true);
            })
            ->where('id', '!=', $currentGuru->id);
    
        // Filter berdasarkan mata pelajaran
        $mataPelajaranId = $request->input('mata_pelajaran_id');
        if ($mataPelajaranId) {
            $guruQuery->whereHas('mataPelajaran', function ($query) use ($mataPelajaranId) {
                $query->where('tm_mata_pelajaran.id', $mataPelajaranId);
            });
        }
        
        // Filter berdasarkan pencarian
        $searchQuery = $request->input('search');
        if ($searchQuery) {
            $guruQuery->whereHas('user', function ($query) use ($searchQuery) {
                $query->where('name', 'like', "%{$searchQuery}%");
            })->orWhere('nip', 'like', "%{$searchQuery}%");
        }
        
        $guruList = $guruQuery->orderBy('created_at', 'desc')->get();
        
        // Dapatkan evaluasi yang telah diselesaikan pada periode saat ini
        $completedEvaluasi = [];
        
        if ($periodeAktif) {
            $completedEvaluasi = Evaluasi::where('evaluator_id', $user->id)
                ->where('periode_evaluasi_id', $periodeAktif->id)
                ->get(['id', 'guru_id'])
                ->keyBy('guru_id')
                ->map(function ($item) {
                    return $item->id;
                })
                ->toArray();
        }
        
        // Dapatkan semua mata pelajaran untuk filter
        $mataPelajaran = \App\Models\MataPelajaran::where('is_active', true)
            ->orderBy('nama')
            ->get();
        
        // Hitung statistik
        $stats = [
            'total_guru' => $guruList->count(),
            'completed' => count($completedEvaluasi),
            'remaining' => $guruList->count() - count($completedEvaluasi),
            'completion_percentage' => $guruList->count() > 0 
                ? round((count($completedEvaluasi) / $guruList->count()) * 100) 
                : 0,
        ];
        
        return Inertia::render('Guru/EvaluasiRekan/Index', [
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
     * Menampilkan form untuk membuat evaluasi baru
     */
    public function create(Request $request, $guruId)
    {
        // Dapatkan detail guru
        $guru = Guru::with(['user', 'mataPelajaran'])->findOrFail($guruId);
        
        // Dapatkan periode evaluasi aktif
        $periodeAktif = PeriodeEvaluasi::where('status', 'aktif')
            ->orderBy('created_at', 'desc')
            ->first();
        
        if (!$periodeAktif) {
            return redirect()->route('evaluasi-rekan.index')
                ->with('error', 'Tidak ada periode evaluasi yang aktif saat ini.');
        }
        
        // Dapatkan daftar kriteria dengan sub kriteria yang aktif
        $kriteriaList = Kriteria::with(['subKriteria' => function ($query) {
            $query->where('aktif', true)->orderBy('urutan');
        }])
            ->where('aktif', true)
            ->orderBy('nama')
            ->get();
        
        // Periksa apakah evaluasi sudah ada
        $user = Auth::user();
        $evaluasi = Evaluasi::with(['detailEvaluasi.subKriteria'])
            ->where('guru_id', $guruId)
            ->where('periode_evaluasi_id', $periodeAktif->id)
            ->where('evaluator_id', $user->id)
            ->first();
        
        // Jika evaluasi sudah ada, arahkan ke halaman show
        if ($evaluasi) {
            return redirect()->route('evaluasi-rekan.show', $evaluasi->id);
        }
        
        return Inertia::render('Guru/EvaluasiRekan/Create', [
            'guru' => $guru,
            'periodeAktif' => $periodeAktif,
            'kriteriaList' => $kriteriaList,
        ]);
    }

    /**
     * Menyimpan evaluasi baru ke database
     */
    public function store(Request $request)
    {
        // Debug: Log request data
        \Log::info('Request data received:', $request->all());
        
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
        
        // Periksa apakah guru saat ini mengevaluasi dirinya sendiri
        $currentGuru = Guru::where('user_id', $user->id)->first();
        if ($currentGuru && $currentGuru->id == $request->guru_id) {
            return redirect()->back()->with('error', 'Anda tidak dapat mengevaluasi diri sendiri');
        }
        
        // Periksa apakah evaluasi sudah ada
        $existingEvaluasi = Evaluasi::where('guru_id', $request->guru_id)
            ->where('periode_evaluasi_id', $request->periode_evaluasi_id)
            ->where('evaluator_id', $user->id)
            ->first();
            
        if ($existingEvaluasi) {
            return redirect()->route('evaluasi-rekan.show', $existingEvaluasi->id)
                ->with('message', 'Evaluasi sudah ada');
        }
        
        DB::beginTransaction();
        
        try {
            // Buat evaluasi baru
            $evaluasi = Evaluasi::create([
                'guru_id' => $request->guru_id,
                'periode_evaluasi_id' => $request->periode_evaluasi_id,
                'evaluator_id' => $user->id,
                'status' => $request->status,
                'jenis' => 'rekan', // Tetapkan jenis sebagai evaluasi rekan
            ]);
            
            \Log::info('Evaluasi created with ID: ' . $evaluasi->id);
            
            // Buat detail evaluasi
            foreach ($request->detail_evaluasi as $index => $detail) {
                $detailData = [
                    'evaluasi_id' => $evaluasi->id,
                    'kriteria_id' => $detail['kriteria_id'],
                    'sub_kriteria_id' => $detail['sub_kriteria_id'] ?? null,
                    'nilai' => $detail['nilai'],
                    'komentar' => $detail['komentar'] ?? null,
                ];
                
                \Log::info("Creating detail evaluasi [$index]:", $detailData);
                
                DetailEvaluasi::create($detailData);
            }
            
            // Tambahkan komentar umum jika ada
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
            
            return redirect()->route('evaluasi-rekan.show', $evaluasi->id)
                ->with('message', $request->status === 'selesai' 
                    ? 'Evaluasi berhasil disimpan dan diselesaikan' 
                    : 'Evaluasi berhasil disimpan sebagai draft');
                    
        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error('Error storing evaluasi: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->with('error', 'Gagal menyimpan evaluasi: ' . $e->getMessage());
        }
    }

    /**
     * Menampilkan evaluasi yang dipilih
     */
    public function show($id)
    {
        $evaluasi = Evaluasi::with([
            'detailEvaluasi.kriteria',
            'detailEvaluasi.subKriteria'
        ])->findOrFail($id);
        
        // Pemeriksaan keamanan: hanya tampilkan jika pengguna adalah evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('evaluasi-rekan.index')
                ->with('error', 'Anda tidak memiliki akses untuk melihat evaluasi ini');
        }
        
        $guru = Guru::with(['user', 'mataPelajaran'])->findOrFail($evaluasi->guru_id);
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        
        // Dapatkan daftar kriteria dengan sub kriteria
        $kriteriaList = Kriteria::with(['subKriteria' => function ($query) {
            $query->where('aktif', true)->orderBy('urutan');
        }])
            ->where('aktif', true)
            ->orderBy('nama')
            ->get();
        
        return Inertia::render('Guru/EvaluasiRekan/Show', [
            'guru' => $guru,
            'kriteriaList' => $kriteriaList,
            'periodeEvaluasi' => $periodeEvaluasi,
            'evaluasi' => $evaluasi,
        ]);
    }

    /**
     * Menampilkan form untuk mengedit evaluasi
     */
    public function edit($id)
    {
        $evaluasi = Evaluasi::with([
            'detailEvaluasi.kriteria',
            'detailEvaluasi.subKriteria'
        ])->findOrFail($id);
        
        // Pemeriksaan keamanan: hanya edit jika pengguna adalah evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('evaluasi-rekan.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit evaluasi ini');
        }
        
        $guru = Guru::with(['user', 'mataPelajaran'])->findOrFail($evaluasi->guru_id);
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        
        // Periksa apakah periode masih aktif
        if ($periodeEvaluasi->status !== 'aktif') {
            return redirect()->route('evaluasi-rekan.show', $evaluasi->id)
                ->with('error', 'Periode evaluasi sudah tidak aktif, tidak dapat mengedit evaluasi');
        }
        
        // Dapatkan daftar kriteria dengan sub kriteria
        $kriteriaList = Kriteria::with(['subKriteria' => function ($query) {
            $query->where('aktif', true)->orderBy('urutan');
        }])
            ->where('aktif', true)
            ->orderBy('nama')
            ->get();
        
        return Inertia::render('Guru/EvaluasiRekan/Edit', [
            'guru' => $guru,
            'kriteriaList' => $kriteriaList,
            'periodeEvaluasi' => $periodeEvaluasi,
            'evaluasi' => $evaluasi,
        ]);
    }

    /**
     * Memperbarui evaluasi yang dipilih di database
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
        
        // Pemeriksaan keamanan: hanya update jika pengguna adalah evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('evaluasi-rekan.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengupdate evaluasi ini');
        }
        
        // Periksa apakah periode masih aktif
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        if ($periodeEvaluasi->status !== 'aktif') {
            return redirect()->route('evaluasi-rekan.show', $evaluasi->id)
                ->with('error', 'Periode evaluasi sudah tidak aktif, tidak dapat mengupdate evaluasi');
        }
        
        DB::beginTransaction();
        
        try {
            // Update status evaluasi
            $evaluasi->status = $request->status;
            $evaluasi->save();
            
            // Hapus detail evaluasi lama (kecuali komentar umum)
            DetailEvaluasi::where('evaluasi_id', $evaluasi->id)
                ->whereNotNull('kriteria_id')
                ->delete();
            
            // Buat detail evaluasi baru
            foreach ($request->detail_evaluasi as $detail) {
                DetailEvaluasi::create([
                    'evaluasi_id' => $evaluasi->id,
                    'kriteria_id' => $detail['kriteria_id'],
                    'sub_kriteria_id' => $detail['sub_kriteria_id'] ?? null,
                    'nilai' => $detail['nilai'],
                    'komentar' => $detail['komentar'] ?? null,
                ]);
            }
            
            // Update atau create komentar umum
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
            
            return redirect()->route('evaluasi-rekan.show', $evaluasi->id)
                ->with('message', $request->status === 'selesai' 
                    ? 'Evaluasi berhasil diupdate dan diselesaikan' 
                    : 'Evaluasi berhasil diupdate sebagai draft');
                    
        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error('Error updating evaluasi: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->with('error', 'Gagal mengupdate evaluasi: ' . $e->getMessage());
        }
    }
}