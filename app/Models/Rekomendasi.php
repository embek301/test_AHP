<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rekomendasi extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'tt_rekomendasi';

    /**
     * Status yang tersedia untuk rekomendasi
     */
    const STATUS_DRAFT = 'draft';
    const STATUS_DISETUJUI = 'disetujui';
    const STATUS_DITOLAK = 'ditolak';
    const STATUS_IMPLEMENTASI = 'implementasi';

    /**
     * Atribut yang dapat diisi (fillable).
     *
     * @var array
     */
    protected $fillable = [
        'guru_id',
        'periode_evaluasi_id',
        'konten',
        'dibuat_oleh',
        'status',
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
        // Pastikan nama tabel dan kolom foreign key sudah benar
        return $this->belongsTo(PeriodeEvaluasi::class, 'periode_evaluasi_id');
    }

    /**
     * Mendapatkan user yang membuat rekomendasi.
     */
    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
    
    /**
     * Mendapatkan daftar status yang valid untuk rekomendasi.
     */
    public static function getValidStatuses(): array
    {
        return [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_DISETUJUI => 'Disetujui',
            self::STATUS_DITOLAK => 'Ditolak',
            self::STATUS_IMPLEMENTASI => 'Implementasi',
        ];
    }

     public function getPeriodeJudulAttribute()
    {
        return $this->periodeEvaluasi ? $this->periodeEvaluasi->judul : 'Periode tidak tersedia';
    }
}