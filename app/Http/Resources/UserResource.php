<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'is_active' => $this->is_active,
            'siswaKelas' => $this->whenLoaded('siswaKelas', function() {
                return $this->siswaKelas->map(function($siswaKelas) {
                    $kelasData = null;
                    
                    // Pengecekan manual apakah relasi kelas sudah dimuat
                    if ($siswaKelas->relationLoaded('kelas') && $siswaKelas->kelas) {
                        $kelasData = [
                            'id' => $siswaKelas->kelas->id,
                            'nama' => $siswaKelas->kelas->nama,
                            'tahun_akademik' => $siswaKelas->kelas->tahun_akademik,
                        ];
                    }
                    
                    return [
                        'id' => $siswaKelas->id,
                        'user_id' => $siswaKelas->user_id,
                        'kelas_id' => $siswaKelas->kelas_id,
                        'kelas' => $kelasData,
                    ];
                });
            }, []),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
