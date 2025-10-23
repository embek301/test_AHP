<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\DetailEvaluasi;
use App\Models\Evaluasi;
use App\Models\Guru;
use App\Models\HasilEvaluasi;
use App\Models\Kriteria;
use App\Models\PeriodeEvaluasi;
use App\Models\Rekomendasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HasilEvaluasiController extends Controller
{
    /**
     * Menampilkan daftar hasil evaluasi guru yang sedang login
     */
    public function index()
    {
        // Dapatkan ID guru dari user yang sedang login
        $user = Auth::user();
        $guru = Guru::where('user_id', $user->id)->firstOrFail();
        
        // Ambil hasil evaluasi untuk guru ini
        $hasilEvaluasiList = HasilEvaluasi::with('periodeEvaluasi')
            ->where('guru_id', $guru->id)
            ->orderBy('id', 'desc')
            ->get();
        
        // Ambil semua periode evaluasi yang telah selesai untuk ditampilkan
        $periodeList = PeriodeEvaluasi::where('status', 'selesai')
            ->orWhere('status', 'aktif')
            ->orderBy('tanggal_selesai', 'desc')
            ->get();
        
        // Hitung statistik
        $stats = [
            'total_periode' => $hasilEvaluasiList->count(),
            'rata_rata_nilai' => $hasilEvaluasiList->avg('nilai_akhir'),
            'perkembangan' => null,
            'persentase_perkembangan' => null,
        ];
        
        // Jika ada lebih dari 1 hasil evaluasi, hitung perkembangan
        if ($hasilEvaluasiList->count() >= 2) {
            $hasil = $hasilEvaluasiList->sortByDesc(function ($hasil) {
                return $hasil->periodeEvaluasi->tanggal_selesai;
            })->values();
            
            $nilaiTerbaru = $hasil[0]->nilai_akhir;
            $nilaiSebelumnya = $hasil[1]->nilai_akhir;
            
            if ($nilaiTerbaru !== null && $nilaiSebelumnya !== null) {
                $selisih = $nilaiTerbaru - $nilaiSebelumnya;
                
                if ($selisih > 0) {
                    $stats['perkembangan'] = 'naik';
                } elseif ($selisih < 0) {
                    $stats['perkembangan'] = 'turun';
                } else {
                    $stats['perkembangan'] = 'tetap';
                }
                
                // Hitung persentase perkembangan jika sebelumnya tidak nol
                if ($nilaiSebelumnya > 0) {
                    $stats['persentase_perkembangan'] = ($selisih / $nilaiSebelumnya) * 100;
                }
            }
        }
        
        return Inertia::render('Guru/HasilEvaluasi/Index', [
            'hasilEvaluasiList' => $hasilEvaluasiList,
            'periodeList' => $periodeList,
            'profileGuru' => $guru->load(['user', 'mataPelajaran']),
            'stats' => $stats,
        ]);
    }

    /**
     * Menampilkan detail hasil evaluasi tertentu
     */
    public function show($id)
{
    $user = Auth::user();
    $guru = Guru::where('user_id', $user->id)->firstOrFail();
    
    $hasilEvaluasi = HasilEvaluasi::findOrFail($id);
    
    if ($hasilEvaluasi->guru_id !== $guru->id) {
        return redirect()->route('hasil-evaluasi-saya.index')
            ->with('error', 'Anda tidak memiliki akses untuk melihat hasil evaluasi ini');
    }
    
    // Cast numeric values explicitly
    $hasilEvaluasi->nilai_siswa = $hasilEvaluasi->nilai_siswa !== null ? (float) $hasilEvaluasi->nilai_siswa : null;
    $hasilEvaluasi->nilai_rekan = $hasilEvaluasi->nilai_rekan !== null ? (float) $hasilEvaluasi->nilai_rekan : null;
    $hasilEvaluasi->nilai_pengawas = $hasilEvaluasi->nilai_pengawas !== null ? (float) $hasilEvaluasi->nilai_pengawas : null;
    $hasilEvaluasi->nilai_akhir = $hasilEvaluasi->nilai_akhir !== null ? (float) $hasilEvaluasi->nilai_akhir : null;
    
    $periodeEvaluasi = PeriodeEvaluasi::findOrFail($hasilEvaluasi->periode_evaluasi_id);
    
    $detailKategori = $this->getDetailKategoriPenilaian($guru->id, $periodeEvaluasi->id);
    
    $riwayatNilai = HasilEvaluasi::where('guru_id', $guru->id)
        ->join('tt_periode_evaluasi', 'tt_hasil_evaluasi.periode_evaluasi_id', '=', 'tt_periode_evaluasi.id')
        ->select(
            'tt_periode_evaluasi.id as periode_id',
            'tt_periode_evaluasi.judul as periode_judul',
            'tt_hasil_evaluasi.nilai_akhir',
            'tt_periode_evaluasi.tanggal_selesai'
        )
        ->orderBy('tt_periode_evaluasi.tanggal_selesai', 'desc')
        ->get()
        ->map(function ($item) {
            $item->nilai_akhir = $item->nilai_akhir !== null ? (float) $item->nilai_akhir : null;
            return $item;
        });
    
    $rekomendasi = Rekomendasi::where('guru_id', $guru->id)
        ->where('periode_evaluasi_id', $periodeEvaluasi->id)
        ->first();
    
    return Inertia::render('Guru/HasilEvaluasi/Show', [
        'hasilEvaluasi' => $hasilEvaluasi,
        'periodeEvaluasi' => $periodeEvaluasi,
        'profileGuru' => $guru->load(['user', 'mataPelajaran']),
        'detailKategori' => $detailKategori,
        'riwayatNilai' => $riwayatNilai,
        'rekomendasi' => $rekomendasi,
    ]);
}
 /**
 * Mengambil detail kategori penilaian untuk guru pada periode tertentu
 */
/**
 * Mengambil detail kategori penilaian untuk guru pada periode tertentu
 */
private function getDetailKategoriPenilaian($guruId, $periodeId)
{
    // Ambil semua kriteria utama dengan sub kriteria
    $kriteriaList = Kriteria::where('aktif', true)
        ->with(['subKriteria' => function ($query) {
            $query->where('aktif', true)->orderBy('urutan');
        }])
        ->orderBy('nama')
        ->get();
    
    // Ambil evaluasi dari tiga sumber: siswa, rekan, dan kepala sekolah
    $evaluasiSiswa = Evaluasi::where('guru_id', $guruId)
        ->where('periode_evaluasi_id', $periodeId)
        ->whereHas('evaluator', function ($query) {
            $query->whereHas('roles', function ($q) {
                $q->where('name', 'siswa');
            });
        })
        ->with('detailEvaluasi')
        ->get();
    
    $evaluasiRekan = Evaluasi::where('guru_id', $guruId)
        ->where('periode_evaluasi_id', $periodeId)
        ->whereHas('evaluator', function ($query) {
            $query->whereHas('roles', function ($q) {
                $q->where('name', 'guru');
            });
        })
        ->with('detailEvaluasi')
        ->get();
    
    $evaluasiKepsek = Evaluasi::where('guru_id', $guruId)
        ->where('periode_evaluasi_id', $periodeId)
        ->whereHas('evaluator', function ($query) {
            $query->whereHas('roles', function ($q) {
                $q->where('name', 'kepala_sekolah');
            });
        })
        ->with('detailEvaluasi')
        ->get();
    
    // Hasil pengelompokan
    $hasil = [];
    
    // Iterasi untuk setiap kriteria utama
    foreach ($kriteriaList as $kriteria) {
        $subKriteriaDetail = [];
        $totalRataRataKriteria = 0;
        $jumlahSubKriteria = 0;
        
        // Iterasi untuk setiap sub kriteria
        foreach ($kriteria->subKriteria as $subKriteria) {
            $nilaiSiswa = $this->hitungRataRataNilaiSubKriteria($evaluasiSiswa, $subKriteria->id);
            $nilaiRekan = $this->hitungRataRataNilaiSubKriteria($evaluasiRekan, $subKriteria->id);
            $nilaiPengawas = $this->hitungRataRataNilaiSubKriteria($evaluasiKepsek, $subKriteria->id);
            
            // Hitung rata-rata dari ketiga sumber
            $nilai = [];
            if ($nilaiSiswa !== null) $nilai[] = (float) $nilaiSiswa;
            if ($nilaiRekan !== null) $nilai[] = (float) $nilaiRekan;
            if ($nilaiPengawas !== null) $nilai[] = (float) $nilaiPengawas;
            
            $nilaiRataRata = count($nilai) > 0 ? array_sum($nilai) / count($nilai) : 0;
            
            if ($nilaiRataRata > 0) {
                $totalRataRataKriteria += $nilaiRataRata;
                $jumlahSubKriteria++;
            }
            
            $subKriteriaDetail[] = [
                'id' => $subKriteria->id,
                'nama' => $subKriteria->nama,
                'deskripsi' => $subKriteria->deskripsi,
                'urutan' => $subKriteria->urutan,
                'bobot' => (float) $subKriteria->bobot,
                'nilai_siswa' => $nilaiSiswa !== null ? (float) $nilaiSiswa : null,
                'nilai_rekan' => $nilaiRekan !== null ? (float) $nilaiRekan : null,
                'nilai_pengawas' => $nilaiPengawas !== null ? (float) $nilaiPengawas : null,
                'nilai_rata_rata' => (float) $nilaiRataRata,
            ];
        }
        
        $rataRataKriteria = $jumlahSubKriteria > 0 ? $totalRataRataKriteria / $jumlahSubKriteria : 0;
        
        $hasil[] = [
            'id' => $kriteria->id,
            'kategori' => $kriteria->nama,
            'deskripsi' => $kriteria->deskripsi,
            'rata_rata' => (float) $rataRataKriteria,
            'kriteria' => $subKriteriaDetail, // These are sub-criteria
        ];
    }
    
    // Urutkan berdasarkan rata-rata nilai (dari tinggi ke rendah)
    usort($hasil, function ($a, $b) {
        return $b['rata_rata'] <=> $a['rata_rata'];
    });
    
    return $hasil;
}

/**
 * Menghitung rata-rata nilai untuk sub kriteria tertentu dari kumpulan evaluasi
 */
private function hitungRataRataNilaiSubKriteria($evaluasi, $subKriteriaId)
{
    $nilai = [];
    
    foreach ($evaluasi as $e) {
        foreach ($e->detailEvaluasi as $detail) {
            if ($detail->sub_kriteria_id === $subKriteriaId) {
                $nilai[] = (float) $detail->nilai;
            }
        }
    }
    
    return count($nilai) > 0 ? array_sum($nilai) / count($nilai) : null;
}

}