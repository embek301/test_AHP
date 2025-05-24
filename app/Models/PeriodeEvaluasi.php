<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PeriodeEvaluasi extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'tt_periode_evaluasi';

    /**
     * Atribut yang dapat diisi (fillable).
     *
     * @var array
     */
    protected $fillable = [
        'judul',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
    ];

    /**
     * Atribut yang harus dikonversi menjadi tipe data tertentu.
     *
     * @var array
     */
    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    /**
     * Mendapatkan evaluasi yang terkait dengan periode.
     */
    public function evaluasi(): HasMany
    {
        return $this->hasMany(Evaluasi::class, 'periode_evaluasi_id');
    }

    /**
     * Mendapatkan hasil evaluasi yang terkait dengan periode.
     */
    public function hasilEvaluasi(): HasMany
    {
        return $this->hasMany(HasilEvaluasi::class, 'periode_evaluasi_id');
    }

    /**
     * Mendapatkan rekomendasi yang terkait dengan periode.
     */
    public function rekomendasi(): HasMany
    {
        return $this->hasMany(Rekomendasi::class, 'periode_evaluasi_id');
    }
}