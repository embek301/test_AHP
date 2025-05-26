<?php

namespace App\Http\Controllers;

use App\Models\DetailEvaluasi;
use App\Models\Evaluasi;
use App\Models\Guru;
use App\Models\HasilEvaluasi;
use App\Models\PeriodeEvaluasi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\HasilEvaluasiExport;
use App\Exports\AllHasilEvaluasiExport;
use Carbon\Carbon;

class HasilEvaluasiController extends Controller
{
    /**
     * Display a listing of hasil evaluasi.
     */
    public function index(Request $request)
    {
        // Filter berdasarkan periode jika ada
        $periodeId = $request->input('periode_id');
        $query = HasilEvaluasi::with(['guru.user', 'periodeEvaluasi']);

        // dd($query);

        if ($periodeId) {
            $query->where('periode_evaluasi_id', $periodeId);
        }

        $hasilEvaluasi = $query->get()->map(function ($hasil) {
            // Ambil statistik jumlah evaluator
            $totalEvaluasi = $this->getEvaluatorCounts($hasil->guru_id, $hasil->periode_evaluasi_id);

            return array_merge($hasil->toArray(), [
                'total_evaluasi' => $totalEvaluasi
            ]);
        });

        // Load semua periode untuk filter
        $periodeEvaluasi = PeriodeEvaluasi::orderBy('tanggal_mulai', 'desc')->get();

        // Hitung statistik untuk dashboard
        $stats = [
            'totalHasil' => HasilEvaluasi::count(),
            'totalGuru' => HasilEvaluasi::distinct('guru_id')->count('guru_id'),
            'periodeAktif' => PeriodeEvaluasi::where('status', 'aktif')->count(),
            'nilaiRataRata' => HasilEvaluasi::avg('nilai_akhir') ?: 0,
        ];

        return Inertia::render('HasilEvaluasi/index', [
            'hasilEvaluasi' => $hasilEvaluasi,
            'periodeEvaluasi' => $periodeEvaluasi,
            'stats' => $stats,
            'filters' => [
                'periode_id' => $periodeId,
            ]
        ]);
    }

    /**
     * Get detail of a specific hasil evaluasi.
     */
    public function detail(HasilEvaluasi $hasilEvaluasi)
    {
        // Load data guru dan periode
        $guru = Guru::with('user')->find($hasilEvaluasi->guru_id);
        $periode = PeriodeEvaluasi::find($hasilEvaluasi->periode_evaluasi_id);

        // Get detail kriteria evaluations
        $detailKriteria = $this->getDetailKriteria($hasilEvaluasi->guru_id, $hasilEvaluasi->periode_evaluasi_id);

        // Get evaluator counts
        $evaluatorCounts = $this->getEvaluatorCounts($hasilEvaluasi->guru_id, $hasilEvaluasi->periode_evaluasi_id);

        // Get comments
        $komentar = $this->getKomentar($hasilEvaluasi->guru_id, $hasilEvaluasi->periode_evaluasi_id);

        return response()->json([
            'guru' => $guru,
            'periode' => $periode,
            'hasil' => $hasilEvaluasi,
            'detail_kriteria' => $detailKriteria,
            'evaluator_counts' => $evaluatorCounts,
            'komentar' => $komentar,
        ]);
    }

    /**
     * Export hasil evaluasi to Excel.
     */
    public function export(HasilEvaluasi $hasilEvaluasi)
    {
        try {
            // Load data guru dan periode
            $guru = Guru::with('user')->find($hasilEvaluasi->guru_id);
            $periode = PeriodeEvaluasi::find($hasilEvaluasi->periode_evaluasi_id);

            // Get detail kriteria evaluations
            $detailKriteria = $this->getDetailKriteria($hasilEvaluasi->guru_id, $hasilEvaluasi->periode_evaluasi_id);

            // Get evaluator counts
            $evaluatorCounts = $this->getEvaluatorCounts($hasilEvaluasi->guru_id, $hasilEvaluasi->periode_evaluasi_id);

            // Format nama file yang aman
            $guruName = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($guru->user->name));
            $fileName = 'hasil_evaluasi_' . $guruName . '_' . date('Ymd_His') . '.xlsx';

            // Return Excel download dengan header yang benar
            return Excel::download(
                new HasilEvaluasiExport($hasilEvaluasi, $detailKriteria, $evaluatorCounts),
                $fileName,
                \Maatwebsite\Excel\Excel::XLSX,
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                    'Cache-Control' => 'max-age=0',
                    'Pragma' => 'public',
                    'Expires' => '0',
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Error exporting hasil evaluasi: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Redirect back dengan error message
            return redirect()->back()->with('error', 'Gagal mengunduh file: ' . $e->getMessage());
        }
    }

    /**
     * Export all hasil evaluasi to Excel.
     */
    public function exportAll(Request $request)
    {
        try {
            // Filter berdasarkan periode jika ada
            $periodeId = $request->input('periode_id');

            $fileName = 'semua_hasil_evaluasi_' . date('Ymd_His') . '.xlsx';

            if ($periodeId) {
                $periode = PeriodeEvaluasi::find($periodeId);
                if ($periode) {
                    $periodeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($periode->judul));
                    $fileName = 'hasil_evaluasi_periode_' . $periodeName . '_' . date('Ymd_His') . '.xlsx';
                }
            }

            return Excel::download(
                new AllHasilEvaluasiExport($periodeId),
                $fileName,
                \Maatwebsite\Excel\Excel::XLSX,
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                    'Cache-Control' => 'max-age=0',
                    'Pragma' => 'public',
                    'Expires' => '0',
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Error exporting all hasil evaluasi: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()->with('error', 'Gagal mengunduh file: ' . $e->getMessage());
        }
    }

    /**
     * Get detail evaluasi per kriteria.
     */
    private function getDetailKriteria($guruId, $periodeId)
    {
        // Get all evaluations for this guru in this period
        $evaluasiIds = Evaluasi::where('guru_id', $guruId)
            ->where('periode_evaluasi_id', $periodeId)
            ->pluck('id')
            ->toArray();

        if (empty($evaluasiIds)) {
            return [];
        }

        // Query to get aggregated data per kriteria
        return DB::table('tt_detail_evaluasi')
            ->join('tm_kriteria', 'tt_detail_evaluasi.kriteria_id', '=', 'tm_kriteria.id')
            ->join('tt_evaluasi', 'tt_detail_evaluasi.evaluasi_id', '=', 'tt_evaluasi.id')
            ->join('users', 'tt_evaluasi.evaluator_id', '=', 'users.id')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('model_has_roles.model_type', 'App\\Models\\User')
            ->select(
                'tt_detail_evaluasi.kriteria_id',
                'tm_kriteria.nama as kriteria_nama',
                'tm_kriteria.bobot as kriteria_bobot',
                DB::raw('AVG(CASE WHEN roles.name = "siswa" THEN tt_detail_evaluasi.nilai ELSE NULL END) as nilai_rata_siswa'),
                DB::raw('AVG(CASE WHEN roles.name = "guru" THEN tt_detail_evaluasi.nilai ELSE NULL END) as nilai_rata_rekan'),
                DB::raw('AVG(CASE WHEN roles.name = "kepala_sekolah" OR roles.name = "kepsek" THEN tt_detail_evaluasi.nilai ELSE NULL END) as nilai_pengawas'),
                DB::raw('AVG(tt_detail_evaluasi.nilai) as nilai_rata_akhir')
            )
            ->whereIn('tt_detail_evaluasi.evaluasi_id', $evaluasiIds)
            ->groupBy('tt_detail_evaluasi.kriteria_id', 'tm_kriteria.nama', 'tm_kriteria.bobot')
            ->get()
            ->toArray();
    }

    /**
     * Get evaluator counts per role.
     */
    private function getEvaluatorCounts($guruId, $periodeId)
    {
        $counts = DB::table('tt_evaluasi')
            ->join('users', 'tt_evaluasi.evaluator_id', '=', 'users.id')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('tt_evaluasi.guru_id', $guruId)
            ->where('tt_evaluasi.periode_evaluasi_id', $periodeId)
            ->where('model_has_roles.model_type', 'App\\Models\\User')
            ->select(
                DB::raw('SUM(CASE WHEN roles.name = "siswa" THEN 1 ELSE 0 END) as siswa'),
                DB::raw('SUM(CASE WHEN roles.name = "guru" THEN 1 ELSE 0 END) as rekan'),
                DB::raw('SUM(CASE WHEN roles.name = "kepala_sekolah" OR roles.name = "kepsek" THEN 1 ELSE 0 END) as pengawas')
            )
            ->first();

        return [
            'siswa' => $counts->siswa ?? 0,
            'rekan' => $counts->rekan ?? 0,
            'pengawas' => $counts->pengawas ?? 0,
        ];
    }

    /**
     * Get komentar from evaluations.
     */
    private function getKomentar($guruId, $periodeId)
    {
        $evaluasi = Evaluasi::with(['evaluator'])
            ->where('guru_id', $guruId)
            ->where('periode_evaluasi_id', $periodeId)
            ->get();

        $komentar = [
            'siswa' => [],
            'rekan' => [],
            'pengawas' => [],
        ];

        foreach ($evaluasi as $eval) {
            // Get komentar from detail evaluasi
            $detailKomentar = DetailEvaluasi::where('evaluasi_id', $eval->id)
                ->whereNotNull('komentar')
                ->where('komentar', '<>', '')
                ->pluck('komentar')
                ->toArray();

            if (!empty($detailKomentar)) {
                $role = $eval->evaluator->roles[0]->name ?? '';

                if ($role == 'siswa') {
                    $komentar['siswa'] = array_merge($komentar['siswa'], $detailKomentar);
                } elseif ($role == 'guru') {
                    $komentar['rekan'] = array_merge($komentar['rekan'], $detailKomentar);
                } elseif ($role == 'kepala_sekolah') {
                    $komentar['pengawas'] = array_merge($komentar['pengawas'], $detailKomentar);
                }
            }
        }

        return $komentar;
    }

    /**
     * Menghitung dan menyimpan hasil evaluasi untuk periode dan guru tertentu
     */
    public function calculateAndSave(Request $request)
    {
        $request->validate([
            'periode_id' => 'required|exists:tt_periode_evaluasi,id',
            'guru_id' => 'nullable|exists:tm_guru,id',
        ]);

        $periodeId = $request->periode_id;
        $guruId = $request->guru_id;

        DB::beginTransaction();
        try {
            // Jika guru_id disediakan, hitung hanya untuk guru tersebut
            // Jika tidak, hitung untuk semua guru di periode tersebut
            if ($guruId) {
                $this->generateHasilForGuruAndPeriode($guruId, $periodeId);
                $guru = Guru::with('user')->find($guruId);
                $message = "Hasil evaluasi untuk guru " . $guru->user->name . " berhasil dihitung";
            } else {
                // Mendapatkan semua guru yang memiliki evaluasi di periode tersebut
                $guruIds = Evaluasi::where('periode_evaluasi_id', $periodeId)
                    ->select('guru_id')
                    ->distinct()
                    ->get()
                    ->pluck('guru_id')
                    ->toArray();

                $countProcessed = 0;
                foreach ($guruIds as $id) {
                    if ($this->generateHasilForGuruAndPeriode($id, $periodeId)) {
                        $countProcessed++;
                    }
                }

                $message = "Berhasil menghitung hasil evaluasi untuk $countProcessed guru";
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghitung hasil evaluasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate hasil evaluasi untuk guru dan periode tertentu
     */
    private function generateHasilForGuruAndPeriode($guruId, $periodeId)
    {
        // Cek apakah sudah ada hasil evaluasi untuk guru dan periode tersebut
        $existingHasil = HasilEvaluasi::where('guru_id', $guruId)
            ->where('periode_evaluasi_id', $periodeId)
            ->first();

        // Hitung nilai rata-rata dari siswa
        $nilaiSiswa = DB::table('tt_evaluasi as e')
            ->join('users as u', 'e.evaluator_id', '=', 'u.id')
            ->join('tt_detail_evaluasi as de', 'e.id', '=', 'de.evaluasi_id')
            ->join('tm_kriteria as k', 'de.kriteria_id', '=', 'k.id')
            ->join('model_has_roles as mr', 'u.id', '=', 'mr.model_id')
            ->join('roles as r', 'mr.role_id', '=', 'r.id')
            ->where('e.guru_id', $guruId)
            ->where('e.periode_evaluasi_id', $periodeId)
            ->where('r.name', 'siswa')  // Gunakan nama role, bukan ID
            ->where('mr.model_type', 'App\\Models\\User')  // Pastikan tipe model benar
            ->select(DB::raw('AVG(de.nilai) as nilai_rata'))
            ->first();

        // Debugging - cek nama role yang sebenarnya dan jumlah data
        \Log::info("Mencari data evaluasi untuk guru_id: $guruId, periode_id: $periodeId");

        // Cek apakah ada data evaluasi dari siswa
        $countSiswa = DB::table('tt_evaluasi as e')
            ->join('users as u', 'e.evaluator_id', '=', 'u.id')
            ->join('model_has_roles as mr', 'u.id', '=', 'mr.model_id')
            ->join('roles as r', 'mr.role_id', '=', 'r.id')
            ->where('e.guru_id', $guruId)
            ->where('e.periode_evaluasi_id', $periodeId)
            ->where('r.name', 'siswa')
            ->where('mr.model_type', 'App\\Models\\User')
            ->count();

        \Log::info("Jumlah evaluasi dari siswa: $countSiswa");

        // Debug roles yang tersedia
        $availableRoles = DB::table('roles')->pluck('name')->toArray();
        \Log::info("Available roles: " . implode(", ", $availableRoles));

        // Hitung nilai rata-rata dari rekan guru
        $nilaiRekan = DB::table('tt_evaluasi as e')
            ->join('users as u', 'e.evaluator_id', '=', 'u.id')
            ->join('tt_detail_evaluasi as de', 'e.id', '=', 'de.evaluasi_id')
            ->join('tm_kriteria as k', 'de.kriteria_id', '=', 'k.id')
            ->join('model_has_roles as mr', 'u.id', '=', 'mr.model_id')
            ->join('roles as r', 'mr.role_id', '=', 'r.id')
            ->where('e.guru_id', $guruId)
            ->where('e.periode_evaluasi_id', $periodeId)
            ->where('r.name', 'guru')  // Gunakan nama role, bukan ID
            ->where('mr.model_type', 'App\\Models\\User')  // Pastikan tipe model benar
            ->select(DB::raw('AVG(de.nilai) as nilai_rata'))
            ->first();

        // Hitung nilai rata-rata dari kepala sekolah
        $nilaiPengawas = DB::table('tt_evaluasi as e')
            ->join('users as u', 'e.evaluator_id', '=', 'u.id')
            ->join('tt_detail_evaluasi as de', 'e.id', '=', 'de.evaluasi_id')
            ->join('tm_kriteria as k', 'de.kriteria_id', '=', 'k.id')
            ->join('model_has_roles as mr', 'u.id', '=', 'mr.model_id')
            ->join('roles as r', 'mr.role_id', '=', 'r.id')
            ->where('e.guru_id', $guruId)
            ->where('e.periode_evaluasi_id', $periodeId)
            ->where(function ($query) {
                $query->where('r.name', 'kepala_sekolah')
                    ->orWhere('r.name', 'kepsek'); // Coba nama alternatif
            })
            ->where('mr.model_type', 'App\\Models\\User')  // Pastikan tipe model benar
            ->select(DB::raw('AVG(de.nilai) as nilai_rata'))
            ->first();

        // Ambil nilai dengan bobot sesuai konfigurasi
        $configBobot = [
            'siswa' => 30, // 30% dari nilai siswa
            'rekan' => 30, // 30% dari nilai rekan
            'pengawas' => 40, // 40% dari nilai kepala sekolah
        ];

        // PENTING: Pastikan nilai yang NULL dikonversi menjadi 0
        $nilai_siswa = $nilaiSiswa && $nilaiSiswa->nilai_rata !== null ? (float)$nilaiSiswa->nilai_rata : 0.0;
        $nilai_rekan = $nilaiRekan && $nilaiRekan->nilai_rata !== null ? (float)$nilaiRekan->nilai_rata : 0.0;
        $nilai_pengawas = $nilaiPengawas && $nilaiPengawas->nilai_rata !== null ? (float)$nilaiPengawas->nilai_rata : 0.0;

        \Log::info("Nilai yang dikalkulasi - Siswa: $nilai_siswa, Rekan: $nilai_rekan, Pengawas: $nilai_pengawas");

        // Hanya hitung nilai akhir jika ada setidaknya satu nilai
        if ($nilai_siswa > 0 || $nilai_rekan > 0 || $nilai_pengawas > 0) {
            $totalBobot = 0;
            $nilai_akhir = 0;

            if ($nilai_siswa > 0) {
                $nilai_akhir += ($nilai_siswa * $configBobot['siswa'] / 100);
                $totalBobot += $configBobot['siswa'];
            }

            if ($nilai_rekan > 0) {
                $nilai_akhir += ($nilai_rekan * $configBobot['rekan'] / 100);
                $totalBobot += $configBobot['rekan'];
            }

            if ($nilai_pengawas > 0) {
                $nilai_akhir += ($nilai_pengawas * $configBobot['pengawas'] / 100);
                $totalBobot += $configBobot['pengawas'];
            }

            // Jika totalBobot kurang dari 100%, sesuaikan nilai akhir
            if ($totalBobot > 0 && $totalBobot < 100) {
                $nilai_akhir = $nilai_akhir * (100 / $totalBobot);
            }
        } else {
            $nilai_akhir = 0;
        }

        \Log::info("Nilai akhir: $nilai_akhir");

        try {
            // Update atau buat hasil evaluasi baru
            if ($existingHasil) {
                $existingHasil->nilai_siswa = $nilai_siswa;
                $existingHasil->nilai_rekan = $nilai_rekan;
                $existingHasil->nilai_pengawas = $nilai_pengawas;
                $existingHasil->nilai_akhir = $nilai_akhir;
                $existingHasil->save();
                \Log::info("Updated existing hasil evaluasi with ID: {$existingHasil->id}");
            } else {
                // Gunakan create dengan explicit casting ke nilai non-null
                $hasilEvaluasi = new HasilEvaluasi();
                $hasilEvaluasi->guru_id = $guruId;
                $hasilEvaluasi->periode_evaluasi_id = $periodeId;
                $hasilEvaluasi->nilai_siswa = $nilai_siswa;
                $hasilEvaluasi->nilai_rekan = $nilai_rekan;
                $hasilEvaluasi->nilai_pengawas = $nilai_pengawas;
                $hasilEvaluasi->nilai_akhir = $nilai_akhir;
                $hasilEvaluasi->save();
                \Log::info("Created new hasil evaluasi with ID: {$hasilEvaluasi->id}");
            }

            return true;
        } catch (\Exception $e) {
            \Log::error("Error saving hasil evaluasi: " . $e->getMessage());
            throw $e;
        }
    }
}
