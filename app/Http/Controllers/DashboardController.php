<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Guru;
use App\Models\SiswaKelas;
use App\Models\PeriodeEvaluasi;
use App\Models\HasilEvaluasi;
use App\Models\Evaluasi;
use App\Models\Kriteria;
use App\Models\Kelas;
use App\Models\DetailEvaluasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $roles = $user->roles->pluck('name')->toArray();
        
        $dashboardData = [];
        
        if (in_array('admin', $roles)) {
            $dashboardData = $this->getAdminData();
        } elseif (in_array('kepala_sekolah', $roles)) {
            $dashboardData = $this->getKepalaSekolahData();
        } elseif (in_array('guru', $roles)) {
            $dashboardData = $this->getGuruData($user);
        } elseif (in_array('siswa', $roles)) {
            $dashboardData = $this->getSiswaData($user);
        }
        
        return Inertia::render('dashboard', [
            'dashboardData' => $dashboardData
        ]);
    }
    
    private function getAdminData()
    {
        // Statistics
        $totalUsers = User::count();
        $totalGuru = Guru::count();
        $evaluasiAktif = PeriodeEvaluasi::where('status', 'aktif')->count();
        $evaluasiSelesai = PeriodeEvaluasi::where('status', 'selesai')->count();
        
        // Chart data - Top 5 guru berdasarkan nilai rata-rata
        $topGuru = HasilEvaluasi::select('guru_id', DB::raw('AVG(nilai_akhir) as avg_nilai'))
            ->with('guru.user')
            ->groupBy('guru_id')
            ->orderBy('avg_nilai', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->guru->user->name ?? 'Tidak diketahui',
                    'nilai' => round($item->avg_nilai, 2)
                ];
            });
        
        // Trend evaluasi 6 bulan terakhir
        $trendEvaluasi = HasilEvaluasi::select(
                DB::raw('MONTH(created_at) as bulan'),
                DB::raw('YEAR(created_at) as tahun'),
                DB::raw('AVG(nilai_akhir) as avg_nilai')
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('tahun', 'bulan')
            ->orderBy('tahun', 'asc')
            ->orderBy('bulan', 'asc')
            ->get()
            ->map(function ($item) {
                $monthNames = [
                    1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                    5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                    9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
                ];
                return [
                    'bulan' => $monthNames[$item->bulan],
                    'nilai' => round($item->avg_nilai, 2)
                ];
            });
        
        // Recent activities
        $recentActivities = [
            [
                'type' => 'periode_created',
                'message' => 'Periode Evaluasi baru dibuat',
                'time' => PeriodeEvaluasi::latest()->first()?->created_at?->diffForHumans() ?? '1 hari yang lalu',
                'icon' => 'calendar'
            ],
            [
                'type' => 'guru_added',
                'message' => 'Guru baru ditambahkan ke sistem',
                'time' => Guru::latest()->first()?->created_at?->diffForHumans() ?? '2 hari yang lalu',
                'icon' => 'user'
            ]
        ];
        
        return [
            'totalUsers' => $totalUsers,
            'totalGuru' => $totalGuru,
            'evaluasiAktif' => $evaluasiAktif,
            'evaluasiSelesai' => $evaluasiSelesai,
            'chartData' => [
                'perbandinganGuru' => $topGuru,
                'trendEvaluasi' => $trendEvaluasi
            ],
            'recentActivities' => $recentActivities
        ];
    }
    
    private function getKepalaSekolahData()
    {
        $totalGuru = Guru::count();
        $evaluasiAktif = PeriodeEvaluasi::where('status', 'aktif')->count();
        $evaluasiSelesai = PeriodeEvaluasi::where('status', 'selesai')->count();
        
        // Hitung rekomendasi berdasarkan hasil evaluasi yang ada komentar
        $rekomendasi = HasilEvaluasi::whereNotNull('created_at')->count();
        
        // Chart data sama seperti admin
        $topGuru = HasilEvaluasi::select('guru_id', DB::raw('AVG(nilai_akhir) as avg_nilai'))
            ->with('guru.user')
            ->groupBy('guru_id')
            ->orderBy('avg_nilai', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->guru->user->name ?? 'Tidak diketahui',
                    'nilai' => round($item->avg_nilai, 2)
                ];
            });
        
        // Distribution data untuk pie chart berdasarkan tabel evaluasi
        $evaluasiStats = [
            ['name' => 'Siswa', 'value' => Evaluasi::count()], // Sesuaikan dengan logic yang tepat
            ['name' => 'Rekan Guru', 'value' => Evaluasi::count()],
            ['name' => 'Kepala Sekolah', 'value' => Evaluasi::count()]
        ];
        
        // Guru yang membutuhkan perhatian (nilai < 4.0)
        $guruPerhatian = HasilEvaluasi::select('guru_id', DB::raw('AVG(nilai_akhir) as avg_nilai'))
            ->with('guru.user', 'guru.mataPelajaran')
            ->groupBy('guru_id')
            ->having('avg_nilai', '<', 4.0)
            ->orderBy('avg_nilai', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->guru->user->name ?? 'Tidak diketahui',
                    'mata_pelajaran' => $item->guru->mataPelajaran->nama ?? 'Tidak ada',
                    'nilai' => round($item->avg_nilai, 2)
                ];
            });
        
        return [
            'totalGuru' => $totalGuru,
            'evaluasiAktif' => $evaluasiAktif,
            'evaluasiSelesai' => $evaluasiSelesai,
            'rekomendasi' => $rekomendasi,
            'chartData' => [
                'perbandinganGuru' => $topGuru,
                'evaluasiDistribution' => $evaluasiStats
            ],
            'guruPerhatian' => $guruPerhatian
        ];
    }
    
    private function getGuruData($user)
    {
        $guru = Guru::where('user_id', $user->id)->first();
        
        if (!$guru) {
            return [
                'evaluasiAktif' => 0,
                'hasilEvaluasi' => 0,
                'rataRataNilai' => 0,
                'chartData' => [
                    'kriteriaEvaluasi' => [],
                    'trendNilai' => []
                ],
                'areaImprovement' => []
            ];
        }
        
        $evaluasiAktif = PeriodeEvaluasi::where('status', 'aktif')->count();
        $hasilEvaluasi = HasilEvaluasi::where('guru_id', $guru->id)->count();
        $rataRataNilai = HasilEvaluasi::where('guru_id', $guru->id)->avg('nilai_akhir') ?? 0;
        
        // Detail evaluasi per kriteria - menggunakan tabel yang benar
        $kriteriaEvaluasi = DB::table('tt_detail_evaluasi as de')
            ->join('tm_kriteria as k', 'de.kriteria_id', '=', 'k.id')
            ->join('tt_evaluasi as e', 'de.evaluasi_id', '=', 'e.id')
            ->where('e.guru_id', $guru->id)
            ->select('k.nama', DB::raw('AVG(de.nilai) as avg_nilai'))
            ->groupBy('k.id', 'k.nama')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->nama,
                    'nilai' => round($item->avg_nilai, 2)
                ];
            });
        
        // Trend nilai 6 bulan terakhir
        $trendNilai = HasilEvaluasi::where('guru_id', $guru->id)
            ->select(
                DB::raw('MONTH(created_at) as bulan'),
                DB::raw('AVG(nilai_akhir) as avg_nilai')
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(function ($item) {
                $monthNames = [
                    1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                    5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                    9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
                ];
                return [
                    'bulan' => $monthNames[$item->bulan],
                    'nilai' => round($item->avg_nilai, 2)
                ];
            });
        
        // Area improvement berdasarkan kriteria dengan nilai terendah
        $areaImprovement = DB::table('tt_detail_evaluasi as de')
            ->join('tm_kriteria as k', 'de.kriteria_id', '=', 'k.id')
            ->join('tt_evaluasi as e', 'de.evaluasi_id', '=', 'e.id')
            ->where('e.guru_id', $guru->id)
            ->select('k.nama', DB::raw('AVG(de.nilai) as avg_nilai'))
            ->groupBy('k.id', 'k.nama')
            ->orderBy('avg_nilai', 'asc')
            ->limit(3)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->nama,
                    'percentage' => round(($item->avg_nilai / 5) * 100, 0),
                    'suggestion' => $this->getImprovementSuggestion($item->nama)
                ];
            });
        
        return [
            'evaluasiAktif' => $evaluasiAktif,
            'hasilEvaluasi' => $hasilEvaluasi,
            'rataRataNilai' => round($rataRataNilai, 2),
            'chartData' => [
                'kriteriaEvaluasi' => $kriteriaEvaluasi,
                'trendNilai' => $trendNilai
            ],
            'areaImprovement' => $areaImprovement
        ];
    }
    
    private function getSiswaData($user)
    {
        $siswaKelas = SiswaKelas::where('user_id', $user->id)->first();
        
        if (!$siswaKelas) {
            return [
                'evaluasiAktif' => 0,
                'kelasSaya' => [],
                'guruUntukEvaluasi' => []
            ];
        }
        
        $evaluasiAktif = PeriodeEvaluasi::where('status', 'aktif')->count();
        
        // Mendapatkan kelas siswa - menggunakan tabel yang benar
        $kelasSaya = DB::table('tt_siswa_kelas as sk')
            ->join('tm_kelas as k', 'sk.kelas_id', '=', 'k.id')
            ->where('sk.user_id', $user->id)
            ->select('k.id', 'k.nama', 'k.tahun_akademik')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'kelas' => [
                        'id' => $item->id,
                        'nama' => $item->nama,
                        'tahun_akademik' => $item->tahun_akademik
                    ]
                ];
            });
        
        // Guru yang perlu dievaluasi - perlu disesuaikan dengan struktur tabel yang ada
        // Karena tidak ada relasi langsung antara kelas dan guru, ini perlu disesuaikan dengan bisnis logic
        $guruUntukEvaluasi = DB::table('tm_guru as g')
            ->join('users as u', 'g.user_id', '=', 'u.id')
            ->join('tm_mata_pelajaran as mp', 'g.mata_pelajaran_id', '=', 'mp.id')
            ->leftJoin('tt_evaluasi as e', function($join) use ($user) {
                $join->on('e.guru_id', '=', 'g.id')
                     ->where('e.evaluator_id', $user->id);
            })
            ->select(
                'g.id',
                'u.name as nama_guru',
                'mp.nama as mata_pelajaran',
                DB::raw('CASE WHEN e.id IS NULL THEN "Belum Dievaluasi" ELSE "Sudah Dievaluasi" END as status_evaluasi')
            )
            ->distinct()
            ->limit(10) // Batasi untuk demo
            ->get();
        
        return [
            'evaluasiAktif' => $evaluasiAktif,
            'kelasSaya' => $kelasSaya,
            'guruUntukEvaluasi' => $guruUntukEvaluasi
        ];
    }
    
    private function getImprovementSuggestion($kriteria)
    {
        $suggestions = [
            'Kedisiplinan' => 'Tingkatkan kedisiplinan dalam kehadiran dan penyelesaian tugas',
            'Kemampuan Mengajar' => 'Variasikan metode pengajaran dan gunakan media pembelajaran interaktif',
            'Penguasaan Materi' => 'Perdalam penguasaan materi melalui studi lanjut dan pelatihan',
            'Interaksi dengan Siswa' => 'Tingkatkan komunikasi dan pendekatan personal dengan siswa',
            'Pengembangan Diri' => 'Ikuti pelatihan dan kembangkan metode pengajaran baru',
            'Komunikasi' => 'Tingkatkan kemampuan komunikasi dengan siswa dan rekan kerja',
            'Metodologi' => 'Kembangkan variasi metode pembelajaran yang lebih menarik',
            'Profesionalisme' => 'Tingkatkan sikap profesional dalam bekerja'
        ];
        
        return $suggestions[$kriteria] ?? 'Terus tingkatkan kualitas dalam aspek ini';
    }
}
