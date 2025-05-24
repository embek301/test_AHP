<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kelas extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'tm_kelas';

    /**
     * Atribut yang dapat diisi (fillable).
     *
     * @var array
     */
    protected $fillable = [
        'nama',
        'tahun_akademik',
    ];

    /**
     * Mendapatkan relasi dengan siswa kelas.
     */
    public function siswaKelas(): HasMany
    {
        return $this->hasMany(SiswaKelas::class, 'kelas_id');
    }
}