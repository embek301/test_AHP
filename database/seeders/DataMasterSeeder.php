<?php


namespace Database\Seeders;

use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Guru;
use App\Models\SiswaKelas;
use App\Models\User;
use App\Models\Kriteria;
use Illuminate\Database\Seeder;

class DataMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Mata Pelajaran
        $mataPelajaran = [
            ['nama' => 'Matematika', 'kode' => 'MTK'],
            ['nama' => 'Bahasa Indonesia', 'kode' => 'BIN'],
            ['nama' => 'Bahasa Inggris', 'kode' => 'BIG'],
            ['nama' => 'IPA', 'kode' => 'IPA'],
            ['nama' => 'IPS', 'kode' => 'IPS'],
        ];

        foreach ($mataPelajaran as $mp) {
            MataPelajaran::create($mp);
        }

        // Seed Kelas
        $kelas = [
            ['nama' => 'Kelas 10A', 'tahun_akademik' => '2025/2026'],
            ['nama' => 'Kelas 10B', 'tahun_akademik' => '2025/2026'],
            ['nama' => 'Kelas 11A', 'tahun_akademik' => '2025/2026'],
            ['nama' => 'Kelas 11B', 'tahun_akademik' => '2025/2026'],
            ['nama' => 'Kelas 12A', 'tahun_akademik' => '2025/2026'],
        ];

        foreach ($kelas as $k) {
            Kelas::create($k);
        }

        // Seed Data Guru
        $guruData = [
            [
                'user_id' => User::where('email', 'budi@sekolah.com')->first()->id,
                'nip' => '19850612200901',
                'mata_pelajaran_id' => MataPelajaran::where('kode', 'MTK')->first()->id,
                'tanggal_bergabung' => '2009-01-15',
            ],
            [
                'user_id' => User::where('email', 'siti@sekolah.com')->first()->id,
                'nip' => '19880823201101',
                'mata_pelajaran_id' => MataPelajaran::where('kode', 'BIN')->first()->id,
                'tanggal_bergabung' => '2011-01-10',
            ],
            [
                'user_id' => User::where('email', 'agus@sekolah.com')->first()->id,
                'nip' => '19770510200501',
                'mata_pelajaran_id' => MataPelajaran::where('kode', 'IPA')->first()->id,
                'tanggal_bergabung' => '2005-01-20',
            ],
        ];

        foreach ($guruData as $g) {
            Guru::create($g);
        }

        // Assign siswa ke kelas
        $siswaKelas = [
            [
                'user_id' => User::where('email', 'andi@sekolah.com')->first()->id,
                'kelas_id' => Kelas::where('nama', 'Kelas 10A')->first()->id,
            ],
            [
                'user_id' => User::where('email', 'dewi@sekolah.com')->first()->id,
                'kelas_id' => Kelas::where('nama', 'Kelas 10A')->first()->id,
            ],
            [
                'user_id' => User::where('email', 'rudi@sekolah.com')->first()->id,
                'kelas_id' => Kelas::where('nama', 'Kelas 11A')->first()->id,
            ],
            [
                'user_id' => User::where('email', 'lina@sekolah.com')->first()->id,
                'kelas_id' => Kelas::where('nama', 'Kelas 11B')->first()->id,
            ],
            [
                'user_id' => User::where('email', 'doni@sekolah.com')->first()->id,
                'kelas_id' => Kelas::where('nama', 'Kelas 12A')->first()->id,
            ],
        ];

        foreach ($siswaKelas as $sk) {
            SiswaKelas::create($sk);
        }

        // Seed Kriteria Evaluasi
        $kriteria = [
            [
                'nama' => 'Kemampuan Mengajar',
                'deskripsi' => 'Kemampuan menyampaikan materi dengan jelas dan mudah dipahami',
                'bobot' => 0.25,
                'aktif' => true,
            ],
            [
                'nama' => 'Penguasaan Materi',
                'deskripsi' => 'Tingkat pemahaman dan penguasaan materi yang diajarkan',
                'bobot' => 0.25,
                'aktif' => true,
            ],
            [
                'nama' => 'Kedisiplinan',
                'deskripsi' => 'Ketepatan waktu dan kepatuhan terhadap tata tertib sekolah',
                'bobot' => 0.15,
                'aktif' => true,
            ],
            [
                'nama' => 'Interaksi dengan Siswa',
                'deskripsi' => 'Kemampuan berinteraksi dan membangun hubungan dengan siswa',
                'bobot' => 0.20,
                'aktif' => true,
            ],
            [
                'nama' => 'Pengembangan Diri',
                'deskripsi' => 'Upaya pengembangan diri dan inovasi dalam pengajaran',
                'bobot' => 0.15,
                'aktif' => true,
            ],
        ];

        foreach ($kriteria as $k) {
            Kriteria::create($k);
        }
    }
}