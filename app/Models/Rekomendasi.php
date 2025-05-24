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
        return $this->belongsTo(PeriodeEvaluasi::class, 'periode_evaluasi_id');
    }

    /**
     * Mendapatkan user yang membuat rekomendasi.
     */
    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}