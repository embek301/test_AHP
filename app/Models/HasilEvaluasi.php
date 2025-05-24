<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HasilEvaluasi extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'tt_hasil_evaluasi';

    /**
     * Atribut yang dapat diisi (fillable).
     *
     * @var array
     */
    protected $fillable = [
        'guru_id',
        'periode_evaluasi_id',
        'nilai_siswa',
        'nilai_rekan',
        'nilai_pengawas',
        'nilai_akhir',
    ];

    /**
     * Atribut yang harus dikonversi menjadi tipe data tertentu.
     *
     * @var array
     */
    protected $casts = [
        'nilai_siswa' => 'decimal:2',
        'nilai_rekan' => 'decimal:2',
        'nilai_pengawas' => 'decimal:2',
        'nilai_akhir' => 'decimal:2',
    ];

    /**
     * Mendapatkan guru yang terkait.
     */
    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    /**
     * Mendapatkan periode evaluasi yang terkait.
     */
    public function periodeEvaluasi(): BelongsTo
    {
        return $this->belongsTo(PeriodeEvaluasi::class, 'periode_evaluasi_id');
    }
}