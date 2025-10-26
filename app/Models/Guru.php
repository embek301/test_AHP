<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guru extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'tm_guru';

    /**
     * Atribut yang dapat diisi (fillable).
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'nip',
        'mata_pelajaran_id',
        'tanggal_bergabung',
    ];

    /**
     * Atribut yang harus dikonversi menjadi tipe data tertentu.
     *
     * @var array
     */
    protected $casts = [
        'tanggal_bergabung' => 'date',
    ];

    /**
     * Mendapatkan user yang terkait dengan guru.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mendapatkan mata pelajaran yang diajar oleh guru.
     */
    public function mataPelajaran(): BelongsTo
    {
        return $this->belongsTo(MataPelajaran::class, 'mata_pelajaran_id');
    }

    /**
     * Mendapatkan evaluasi guru.
     */
    public function evaluasi(): HasMany
    {
        return $this->hasMany(Evaluasi::class, 'guru_id');
    }

    /**
     * Mendapatkan hasil evaluasi guru.
     */
    public function hasilEvaluasi(): HasMany
    {
        return $this->hasMany(HasilEvaluasi::class, 'guru_id');
    }

    /**
     * Mendapatkan rekomendasi untuk guru.
     */
    public function rekomendasi(): HasMany
    {
        return $this->hasMany(Rekomendasi::class, 'guru_id');
    }
    public function subKriteria()
{
    return $this->hasMany(SubKriteria::class);
}
}