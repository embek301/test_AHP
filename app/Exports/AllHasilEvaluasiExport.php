<?php

namespace App\Exports;

use App\Models\HasilEvaluasi;
use App\Models\PeriodeEvaluasi;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AllHasilEvaluasiExport implements FromCollection, WithHeadings, WithMapping, WithTitle, WithStyles, ShouldAutoSize, WithColumnFormatting
{
    protected $periodeId;

    /**
     * Constructor untuk export class.
     *
     * @param int|null $periodeId Optional filter by periode
     */
    public function __construct($periodeId = null)
    {
        $this->periodeId = $periodeId;
    }

    /**
     * Data yang akan ditampilkan di excel.
     */
    public function collection()
    {
        // Perbaiki eager loading dengan relasi yang benar
        $query = HasilEvaluasi::with([
            'guru.user',
            'periodeEvaluasi'
        ]);
        
        if ($this->periodeId) {
            $query->where('periode_evaluasi_id', $this->periodeId);
        }
        
        $hasilCollection = $query->get();
        
        // Tambahkan informasi evaluator counts
        return $hasilCollection->map(function ($hasil) {
            $hasil->total_evaluasi = $this->getEvaluatorCounts($hasil->guru_id, $hasil->periode_evaluasi_id);
            return $hasil;
        });
    }

    /**
     * Heading untuk file excel.
     */
    public function headings(): array
    {
        return [
            'ID',
            'NIP',
            'Nama Guru',
            'Email',
            'Periode Evaluasi',
            'Tanggal Mulai',
            'Tanggal Selesai',
            'Nilai Siswa',
            'Jumlah Evaluasi Siswa',
            'Nilai Rekan',
            'Jumlah Evaluasi Rekan',
            'Nilai Pengawas',
            'Jumlah Evaluasi Pengawas',
            'Nilai Akhir',
            'Kategori',
            'Tanggal Update',
        ];
    }

    /**
     * Format kolom tertentu.
     */
    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT, // Kolom NIP sebagai text
        ];
    }

    /**
     * Map data untuk format excel.
     */
    public function map($hasil): array
    {
        // Dapatkan nama kategori berdasarkan nilai akhir
        $kategori = $this->getNilaiCategory($hasil->nilai_akhir);
        
        // Handle periode evaluasi yang null - gunakan field yang benar
        $periodeJudul = 'N/A';
        $tanggalMulai = 'N/A';
        $tanggalSelesai = 'N/A';
        
        if ($hasil->periodeEvaluasi) {
            $periodeJudul = $hasil->periodeEvaluasi->judul ?? 'N/A';
            $tanggalMulai = $hasil->periodeEvaluasi->tanggal_mulai 
                ? Carbon::parse($hasil->periodeEvaluasi->tanggal_mulai)->format('d/m/Y') 
                : 'N/A';
            $tanggalSelesai = $hasil->periodeEvaluasi->tanggal_selesai 
                ? Carbon::parse($hasil->periodeEvaluasi->tanggal_selesai)->format('d/m/Y') 
                : 'N/A';
        }
        
        // Handle guru yang null - gunakan field yang benar
        $nip = 'N/A';
        $namaGuru = 'N/A';
        $emailGuru = 'N/A';
        
        if ($hasil->guru) {
            $nip = $hasil->guru->nip ?? 'N/A'; // Tidak perlu prefix apostrof karena sudah diformat di columnFormats
            if ($hasil->guru->user) {
                $namaGuru = $hasil->guru->user->name ?? 'N/A';
                $emailGuru = $hasil->guru->user->email ?? 'N/A';
            }
        }
        
        $tanggalUpdate = $hasil->updated_at 
            ? Carbon::parse($hasil->updated_at)->format('d/m/Y H:i')
            : 'N/A';

        return [
            $hasil->id ?? 0,
            $nip,
            $namaGuru,
            $emailGuru,
            $periodeJudul,
            $tanggalMulai,
            $tanggalSelesai,
            number_format($hasil->nilai_siswa ?? 0, 2),
            isset($hasil->total_evaluasi['siswa']) ? $hasil->total_evaluasi['siswa'] : 0,
            number_format($hasil->nilai_rekan ?? 0, 2),
            isset($hasil->total_evaluasi['rekan']) ? $hasil->total_evaluasi['rekan'] : 0,
            number_format($hasil->nilai_pengawas ?? 0, 2),
            isset($hasil->total_evaluasi['pengawas']) ? $hasil->total_evaluasi['pengawas'] : 0,
            number_format($hasil->nilai_akhir ?? 0, 2),
            $kategori,
            $tanggalUpdate,
        ];
    }

    /**
     * Judul worksheet.
     */
    public function title(): string
    {
        if ($this->periodeId) {
            $periode = PeriodeEvaluasi::find($this->periodeId);
            if ($periode && $periode->judul) {
                return 'Hasil Evaluasi - ' . substr($periode->judul, 0, 25);
            }
        }
        
        return 'Semua Hasil Evaluasi';
    }

    /**
     * Styling untuk excel.
     */
    public function styles(Worksheet $sheet)
    {
        $collection = $this->collection();
        $rowCount = $collection->count() + 1; // +1 for header
        
        return [
            // Style header
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E2E8F0'],
                ],
            ],
            // Style seluruh border
            'A1:P' . $rowCount => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Helper untuk get nilai category.
     */
    private function getNilaiCategory($nilai): string
    {
        $nilai = $nilai ?? 0; // Handle null values
        
        if ($nilai >= 90) {
            return 'Sangat Baik';
        } elseif ($nilai >= 80) {
            return 'Baik';
        } elseif ($nilai >= 70) {
            return 'Cukup';
        } elseif ($nilai >= 60) {
            return 'Kurang';
        } else {
            return 'Sangat Kurang';
        }
    }
    
    /**
     * Get evaluator counts per role.
     */
    private function getEvaluatorCounts($guruId, $periodeId)
    {
        // Handle case where guruId or periodeId might be null
        if (!$guruId || !$periodeId) {
            return [
                'siswa' => 0,
                'rekan' => 0,
                'pengawas' => 0,
            ];
        }
        
        try {
            $counts = \DB::table('tt_evaluasi')
                ->join('users', 'tt_evaluasi.evaluator_id', '=', 'users.id')
                ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->where('tt_evaluasi.guru_id', $guruId)
                ->where('tt_evaluasi.periode_evaluasi_id', $periodeId)
                ->where('model_has_roles.model_type', 'App\\Models\\User')
                ->select(
                    \DB::raw('SUM(CASE WHEN roles.name = "siswa" THEN 1 ELSE 0 END) as siswa'),
                    \DB::raw('SUM(CASE WHEN roles.name = "guru" THEN 1 ELSE 0 END) as rekan'),
                    \DB::raw('SUM(CASE WHEN roles.name = "kepala_sekolah" OR roles.name = "kepsek" THEN 1 ELSE 0 END) as pengawas')
                )
                ->first();
                
            return [
                'siswa' => $counts->siswa ?? 0,
                'rekan' => $counts->rekan ?? 0,
                'pengawas' => $counts->pengawas ?? 0,
            ];
        } catch (\Exception $e) {
            // Log error dan return default values
            \Log::error('Error getting evaluator counts: ' . $e->getMessage());
            return [
                'siswa' => 0,
                'rekan' => 0,
                'pengawas' => 0,
            ];
        }
    }
}