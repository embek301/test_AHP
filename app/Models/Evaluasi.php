<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluasi extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'tt_evaluasi';

    /**
     * Atribut yang dapat diisi (fillable).
     *
     * @var array
     */
    protected $fillable = [
        'periode_evaluasi_id',
        'evaluator_id',
        'guru_id',
        'status',
        'jenis',            // Kolom baru untuk jenis evaluasi
        'komentar_umum',
    ];

    /**
     * Mendapatkan periode evaluasi yang terkait.
     */
    public function periodeEvaluasi(): BelongsTo
    {
        return $this->belongsTo(PeriodeEvaluasi::class, 'periode_evaluasi_id');
    }

    /**
     * Mendapatkan evaluator (user) yang melakukan evaluasi.
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    /**
     * Mendapatkan guru yang dievaluasi.
     */
    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    /**
     * Mendapatkan detail evaluasi.
     */
    public function detailEvaluasi(): HasMany
    {
        return $this->hasMany(DetailEvaluasi::class, 'evaluasi_id');
    }
}