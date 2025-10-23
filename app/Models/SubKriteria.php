<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubKriteria extends Model
{
    use HasFactory;

    protected $table = 'tm_sub_kriteria';

    protected $fillable = [
        'kriteria_id',
        'nama',
        'deskripsi',
        'bobot',
        'urutan',
        'aktif',
    ];

    protected $casts = [
        'bobot' => 'decimal:2',
        'aktif' => 'boolean',
        'urutan' => 'integer',
    ];

    /**
     * Relasi ke kriteria induk
     */
    public function kriteria(): BelongsTo
    {
        return $this->belongsTo(Kriteria::class, 'kriteria_id');
    }

    /**
     * Relasi ke detail evaluasi
     */
    public function detailEvaluasi(): HasMany
    {
        return $this->hasMany(DetailEvaluasi::class, 'sub_kriteria_id');
    }
}