<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MataPelajaran extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'tm_mata_pelajaran';

    /**
     * Atribut yang dapat diisi (fillable).
     *
     * @var array
     */
    protected $fillable = [
        'nama',
        'kode',
    ];

    /**
     * Mendapatkan relasi dengan guru.
     */
    public function guru(): HasMany
    {
        return $this->hasMany(Guru::class, 'mata_pelajaran_id');
    }
}