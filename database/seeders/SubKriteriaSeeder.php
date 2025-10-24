<?php

namespace Database\Seeders;

use App\Models\Kriteria;
use App\Models\SubKriteria;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class SubKriteriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('tm_sub_kriteria')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Creating sub kriteria...');
        // Sub kriteria untuk "Kemampuan Mengajar"
        $kemampuanMengajar = Kriteria::where('nama', 'Kemampuan Mengajar')->first();
        if ($kemampuanMengajar) {
            $subKriteria = [
                [
                    'nama' => 'Penyampaian Materi',
                    'deskripsi' => 'Kemampuan menyampaikan materi dengan jelas dan sistematis',
                    'bobot' => 30,
                    'urutan' => 1,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Penggunaan Metode Mengajar',
                    'deskripsi' => 'Variasi dan efektivitas metode pembelajaran yang digunakan',
                    'bobot' => 25,
                    'urutan' => 2,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Penggunaan Media Pembelajaran',
                    'deskripsi' => 'Kemampuan menggunakan media dan alat bantu mengajar',
                    'bobot' => 25,
                    'urutan' => 3,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Pemberian Contoh',
                    'deskripsi' => 'Kemampuan memberikan contoh yang relevan dan mudah dipahami',
                    'bobot' => 20,
                    'urutan' => 4,
                    'aktif' => true,
                ],
            ];

            foreach ($subKriteria as $sk) {
                SubKriteria::create(array_merge($sk, ['kriteria_id' => $kemampuanMengajar->id]));
            }
        }

        // Sub kriteria untuk "Penguasaan Materi"
        $penguasaanMateri = Kriteria::where('nama', 'Penguasaan Materi')->first();
        if ($penguasaanMateri) {
            $subKriteria = [
                [
                    'nama' => 'Kedalaman Materi',
                    'deskripsi' => 'Tingkat kedalaman pemahaman materi yang diajarkan',
                    'bobot' => 35,
                    'urutan' => 1,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Update Pengetahuan',
                    'deskripsi' => 'Kemampuan mengikuti perkembangan terbaru dalam bidang yang diajarkan',
                    'bobot' => 30,
                    'urutan' => 2,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Kemampuan Menjawab Pertanyaan',
                    'deskripsi' => 'Kemampuan menjawab pertanyaan siswa dengan tepat',
                    'bobot' => 35,
                    'urutan' => 3,
                    'aktif' => true,
                ],
            ];

            foreach ($subKriteria as $sk) {
                SubKriteria::create(array_merge($sk, ['kriteria_id' => $penguasaanMateri->id]));
            }
        }

        // Sub kriteria untuk "Kedisiplinan"
        $kedisiplinan = Kriteria::where('nama', 'Kedisiplinan')->first();
        if ($kedisiplinan) {
            $subKriteria = [
                [
                    'nama' => 'Ketepatan Waktu Masuk',
                    'deskripsi' => 'Ketepatan waktu masuk ke kelas',
                    'bobot' => 40,
                    'urutan' => 1,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Kehadiran',
                    'deskripsi' => 'Tingkat kehadiran dan absensi',
                    'bobot' => 35,
                    'urutan' => 2,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Penyelesaian Tugas Administratif',
                    'deskripsi' => 'Ketepatan waktu dalam menyelesaikan tugas administratif',
                    'bobot' => 25,
                    'urutan' => 3,
                    'aktif' => true,
                ],
            ];

            foreach ($subKriteria as $sk) {
                SubKriteria::create(array_merge($sk, ['kriteria_id' => $kedisiplinan->id]));
            }
        }

        // Sub kriteria untuk "Interaksi dengan Siswa"
        $interaksi = Kriteria::where('nama', 'Interaksi dengan Siswa')->first();
        if ($interaksi) {
            $subKriteria = [
                [
                    'nama' => 'Komunikasi',
                    'deskripsi' => 'Kemampuan berkomunikasi dengan siswa',
                    'bobot' => 30,
                    'urutan' => 1,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Motivasi',
                    'deskripsi' => 'Kemampuan memotivasi siswa dalam belajar',
                    'bobot' => 30,
                    'urutan' => 2,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Empati',
                    'deskripsi' => 'Kepedulian terhadap kondisi dan kesulitan siswa',
                    'bobot' => 20,
                    'urutan' => 3,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Pengelolaan Kelas',
                    'deskripsi' => 'Kemampuan mengelola kelas dengan baik',
                    'bobot' => 20,
                    'urutan' => 4,
                    'aktif' => true,
                ],
            ];

            foreach ($subKriteria as $sk) {
                SubKriteria::create(array_merge($sk, ['kriteria_id' => $interaksi->id]));
            }
        }

        // Sub kriteria untuk "Pengembangan Diri"
        $pengembanganDiri = Kriteria::where('nama', 'Pengembangan Diri')->first();
        if ($pengembanganDiri) {
            $subKriteria = [
                [
                    'nama' => 'Inovasi Pembelajaran',
                    'deskripsi' => 'Upaya mengembangkan metode pembelajaran baru',
                    'bobot' => 40,
                    'urutan' => 1,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Pelatihan dan Workshop',
                    'deskripsi' => 'Partisipasi dalam pelatihan dan pengembangan kompetensi',
                    'bobot' => 30,
                    'urutan' => 2,
                    'aktif' => true,
                ],
                [
                    'nama' => 'Penelitian dan Publikasi',
                    'deskripsi' => 'Keterlibatan dalam penelitian dan publikasi ilmiah',
                    'bobot' => 30,
                    'urutan' => 3,
                    'aktif' => true,
                ],
            ];

            foreach ($subKriteria as $sk) {
                SubKriteria::create(array_merge($sk, ['kriteria_id' => $pengembanganDiri->id]));
            }
        }
         $this->command->info('Sub kriteria created successfully.');
    }
    
}