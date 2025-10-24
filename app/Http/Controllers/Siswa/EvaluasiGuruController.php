<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\DetailEvaluasi;
use App\Models\Evaluasi;
use App\Models\Guru;
use App\Models\Kriteria;
use App\Models\MataPelajaran;
use App\Models\PeriodeEvaluasi;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EvaluasiGuruController extends Controller
{
    /**
     * Menampilkan form untuk membuat evaluasi baru
     */
    public function create(Request $request, $guruId)
    {
        $guru = Guru::with(['user', 'mataPelajaran'])->findOrFail($guruId);
        
        // Dapatkan periode aktif
        $periodeAktif = PeriodeEvaluasi::where('status', 'aktif')->firstOrFail();
        
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
            return redirect()->route('evaluasi-guru.show', $evaluasi->id);
        }
        
        return Inertia::render('Siswa/EvaluasiGuru/Create', [
            'guru' => $guru,
            'kriteriaList' => $kriteriaList,
            'periodeAktif' => $periodeAktif,
        ]);
    }

    /**
     * Menyimpan evaluasi baru
     */
    public function store(Request $request)
    {
        \Log::info('Request data received:', $request->all());
        
        $request->validate([
            'guru_id' => 'required|exists:tm_guru,id',
            'periode_evaluasi_id' => 'required|exists:tt_periode_evaluasi,id',
            'status' => 'required|in:draft,selesai',
            'komentar_umum' => 'nullable|string|max:1000',
            'detail_evaluasi' => 'required|array|min:1',
            'detail_evaluasi.*.kriteria_id' => 'required|exists:tm_kriteria,id',
            'detail_evaluasi.*.sub_kriteria_id' => 'nullable|exists:tm_sub_kriteria,id',
            'detail_evaluasi.*.nilai' => 'required|numeric|min:1|max:5',
            'detail_evaluasi.*.komentar' => 'nullable|string|max:255',
        ]);
        
        $user = Auth::user();
        
        // Periksa apakah periode masih aktif
        $periode = PeriodeEvaluasi::findOrFail($request->periode_evaluasi_id);
        if ($periode->status !== 'aktif') {
            return redirect()->back()->with('error', 'Periode evaluasi tidak aktif');
        }
        
        // Periksa apakah sudah pernah membuat evaluasi untuk guru ini pada periode ini
        $existingEvaluasi = Evaluasi::where('evaluator_id', $user->id)
            ->where('guru_id', $request->guru_id)
            ->where('periode_evaluasi_id', $request->periode_evaluasi_id)
            ->first();
            
        if ($existingEvaluasi) {
            return redirect()->route('evaluasi-guru.show', $existingEvaluasi->id)
                ->with('message', 'Evaluasi sudah ada');
        }
        
        DB::beginTransaction();
        
        try {
            // Buat evaluasi baru dengan komentar_umum
            $evaluasi = Evaluasi::create([
                'guru_id' => $request->guru_id,
                'periode_evaluasi_id' => $request->periode_evaluasi_id,
                'evaluator_id' => $user->id,
                'status' => $request->status,
                'jenis' => 'siswa', // Jenis evaluasi dari siswa
                'komentar_umum' => $request->komentar_umum,
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
            
            DB::commit();
            
            \Log::info('Transaction committed successfully');
            
            return redirect()->route('evaluasi-guru.show', $evaluasi->id)
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
            return redirect()->route('evaluasi-guru.index')
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
        
        return Inertia::render('Siswa/EvaluasiGuru/Show', [
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
        
        // Pemeriksaan keamanan: hanya tampilkan jika pengguna adalah evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('evaluasi-guru.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit evaluasi ini');
        }
        
        // Pemeriksaan apakah evaluasi masih bisa diedit
        if ($evaluasi->status === 'selesai') {
            return redirect()->route('evaluasi-guru.show', $id)
                ->with('error', 'Evaluasi dengan status selesai tidak dapat diedit');
        }
        
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        if ($periodeEvaluasi->status !== 'aktif') {
            return redirect()->route('evaluasi-guru.show', $id)
                ->with('error', 'Evaluasi dari periode yang tidak aktif tidak dapat diedit');
        }
        
        $guru = Guru::with(['user', 'mataPelajaran'])->findOrFail($evaluasi->guru_id);
        
        // Dapatkan daftar kriteria dengan sub kriteria
        $kriteriaList = Kriteria::with(['subKriteria' => function ($query) {
            $query->where('aktif', true)->orderBy('urutan');
        }])
            ->where('aktif', true)
            ->orderBy('nama')
            ->get();
        
        return Inertia::render('Siswa/EvaluasiGuru/Edit', [
            'guru' => $guru,
            'kriteriaList' => $kriteriaList,
            'periodeAktif' => $periodeEvaluasi,
            'evaluasi' => $evaluasi,
        ]);
    }

    /**
     * Update evaluasi yang ada
     */
    public function update(Request $request, $id)
    {
        $evaluasi = Evaluasi::findOrFail($id);
        
        // Pemeriksaan keamanan: hanya jika pengguna adalah evaluator
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('evaluasi-guru.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit evaluasi ini');
        }
        
        // Validasi request
        $request->validate([
            'status' => 'required|in:draft,selesai',
            'komentar_umum' => 'nullable|string|max:1000',
            'detail_evaluasi' => 'required|array|min:1',
            'detail_evaluasi.*.kriteria_id' => 'required|exists:tm_kriteria,id',
            'detail_evaluasi.*.sub_kriteria_id' => 'nullable|exists:tm_sub_kriteria,id',
            'detail_evaluasi.*.nilai' => 'required|numeric|min:1|max:5',
            'detail_evaluasi.*.komentar' => 'nullable|string|max:255',
        ]);
        
        // Periksa apakah evaluasi masih dapat diedit
        if ($evaluasi->status === 'selesai') {
            return redirect()->back()->with('error', 'Evaluasi dengan status selesai tidak dapat diubah');
        }
        
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        if ($periodeEvaluasi->status !== 'aktif') {
            return redirect()->back()->with('error', 'Evaluasi dari periode yang tidak aktif tidak dapat diubah');
        }
        
        DB::beginTransaction();
        
        try {
            // Update evaluasi
            $evaluasi->status = $request->status;
            $evaluasi->komentar_umum = $request->komentar_umum;
            $evaluasi->save();
            
            // Hapus semua detail evaluasi lama
            DetailEvaluasi::where('evaluasi_id', $evaluasi->id)->delete();
            
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
            
            DB::commit();
            
            return redirect()->route('evaluasi-guru.show', $evaluasi->id)
                ->with('message', $request->status === 'selesai' 
                    ? 'Evaluasi berhasil diperbarui dan diselesaikan' 
                    : 'Evaluasi berhasil diperbarui sebagai draft');
                    
        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error('Error updating evaluasi: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->with('error', 'Gagal memperbarui evaluasi: ' . $e->getMessage());
        }
    }

    // Methods lainnya tetap sama...
    public function index(Request $request)
    {
        $user = Auth::user();
        $siswa = SiswaKelas::where('user_id', $user->id)->firstOrFail();
        
        $periodeAktif = PeriodeEvaluasi::where('status', 'aktif')->first();
        
        $query = Guru::with(['user', 'mataPelajaran']);
        
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%");
                })->orWhere('nip', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('mata_pelajaran_id') && !empty($request->mata_pelajaran_id)) {
            $mapelId = $request->mata_pelajaran_id;
            $query->where('mata_pelajaran_id', $mapelId);
        }
        
        $guruList = $query->get();
        
        $completedEvaluasi = [];
        if ($periodeAktif) {
            $evaluasiList = Evaluasi::where('evaluator_id', $user->id)
                ->where('periode_evaluasi_id', $periodeAktif->id)
                ->get(['id', 'guru_id']);
                
            foreach ($evaluasiList as $evaluasi) {
                $completedEvaluasi[$evaluasi->guru_id] = $evaluasi->id;
            }
        }
        
        $mataPelajaran = MataPelajaran::where('is_active', true)
            ->orderBy('nama')
            ->get();
        
        $stats = [
            'total_guru' => $guruList->count(),
            'completed' => count($completedEvaluasi),
            'remaining' => $guruList->count() - count($completedEvaluasi),
            'completion_percentage' => $guruList->count() > 0 
                ? round((count($completedEvaluasi) / $guruList->count()) * 100) 
                : 0
        ];
        
        return Inertia::render('Siswa/EvaluasiGuru/Index', [
            'periodeAktif' => $periodeAktif,
            'guruList' => $guruList,
            'completedEvaluasi' => $completedEvaluasi,
            'mataPelajaran' => $mataPelajaran,
            'stats' => $stats,
            'filters' => $request->only(['search', 'mata_pelajaran_id']),
        ]);
    }

    public function export($id)
    {
        $evaluasi = Evaluasi::with(['detailEvaluasi.kriteria', 'detailEvaluasi.subKriteria', 'guru.user', 'evaluator.roles'])->findOrFail($id);
        
        if ($evaluasi->evaluator_id !== Auth::id()) {
            return redirect()->route('evaluasi-guru.index')
                ->with('error', 'Anda tidak memiliki akses untuk melihat evaluasi ini');
        }
        
        $periodeEvaluasi = PeriodeEvaluasi::findOrFail($evaluasi->periode_evaluasi_id);
        
        $detailByKategori = [
            'Semua Kriteria' => $evaluasi->detailEvaluasi
        ];
        
        $nilaiPerKategori = [
            'Semua Kriteria' => array_sum($evaluasi->detailEvaluasi->pluck('nilai')->toArray()) / count($evaluasi->detailEvaluasi)
        ];
        
        $nilaiRataRata = 0;
        $totalNilai = 0;
        $totalKriteria = 0;
        foreach ($detailByKategori as $kategori => $details) {
            foreach ($details as $detail) {
                $totalNilai += $detail->nilai;
                $totalKriteria++;
            }
        }
        if ($totalKriteria > 0) {
            $nilaiRataRata = $totalNilai / $totalKriteria;
        }
        
        $pdf = PDF::loadView('pdf.evaluasi-guru', [
            'evaluasi' => $evaluasi,
            'periodeEvaluasi' => $periodeEvaluasi,
            'detailByKategori' => $detailByKategori,
            'nilaiPerKategori' => $nilaiPerKategori,
            'nilaiRataRata' => $nilaiRataRata,
        ]);
        
        return $pdf->download('evaluasi-guru-' . $evaluasi->id . '.pdf');
    }
    
    public function viewByGuru($guruId)
    {
        $user = Auth::user();
        $periodeAktif = PeriodeEvaluasi::where('status', 'aktif')->first();
        
        if (!$periodeAktif) {
            return redirect()->route('evaluasi-guru.index')
                ->with('error', 'Tidak ada periode evaluasi aktif');
        }
        
        $evaluasi = Evaluasi::where('evaluator_id', $user->id)
            ->where('guru_id', $guruId)
            ->where('periode_evaluasi_id', $periodeAktif->id)
            ->first();
        
        if (!$evaluasi) {
            return redirect()->route('evaluasi-guru.index')
                ->with('error', 'Data evaluasi tidak ditemukan');
        }
        
        return redirect()->route('evaluasi-guru.show', $evaluasi->id);
    }
}