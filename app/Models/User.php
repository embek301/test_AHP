<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles, Notifiable;

    /**
     * Properti untuk menyertakan relasi secara otomatis saat dikonversi ke array/JSON
     */
    protected $appends = [];
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];
    protected $hidden = [
        'password',
        'remember_token',
    ];
    /**
     * Relasi yang otomatis disertakan saat konversi ke array/JSON
     */
    protected $with = ['siswaKelas.kelas'];

    /**
     * Relasi dengan SiswaKelas
     */
    public function siswaKelas(): HasMany
    {
        return $this->hasMany(SiswaKelas::class, 'user_id');
    }

    /**
     * Getter untuk attribute role_names
     * 
     * @return array
     */
    public function getRoleNamesAttribute()
    {
        return $this->roles->pluck('name')->toArray();
    }

    /**
     * Convert the model instance to an array.
     *
     * @return array
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Ensure siswaKelas is always an array
        if (isset($array['siswa_kelas'])) {
            $array['siswa_kelas'] = (array) $array['siswa_kelas'];
        }
        
        return $array;
    }
}
