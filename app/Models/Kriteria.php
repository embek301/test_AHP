<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kriteria extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'tm_kriteria';

    /**
     * Atribut yang dapat diisi (fillable).
     *
     * @var array
     */
    protected $fillable = [
        'nama',
        'deskripsi',
        'bobot',
        'aktif',
    ];

    /**
     * Atribut yang harus dikonversi menjadi tipe data tertentu.
     *
     * @var array
     */
    protected $casts = [
        'bobot' => 'decimal:2',
        'aktif' => 'boolean',
    ];

    /**
     * Mendapatkan detail evaluasi yang terkait dengan kriteria.
     */
    public function detailEvaluasi(): HasMany
    {
        return $this->hasMany(DetailEvaluasi::class, 'kriteria_id');
    }
}