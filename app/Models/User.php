<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Mendapatkan data guru jika user adalah seorang guru.
     */
    public function guru()
    {
        return $this->hasOne(Guru::class);
    }

    /**
     * Mendapatkan kelas-kelas jika user adalah seorang siswa.
     */
    public function kelasAsSiswa()
    {
        return $this->hasMany(SiswaKelas::class, 'user_id');
    }

    /**
     * Mendapatkan evaluasi yang dilakukan oleh user.
     */
    public function evaluasiDilakukan()
    {
        return $this->hasMany(Evaluasi::class, 'evaluator_id');
    }

    /**
     * Mendapatkan rekomendasi yang dibuat oleh user.
     */
    public function rekomendasiDibuat()
    {
        return $this->hasMany(Rekomendasi::class, 'dibuat_oleh');
    }
}
