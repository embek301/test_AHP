<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class RealDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate tables first
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Truncate related tables
        DB::table('tt_siswa_kelas')->truncate();
        DB::table('tm_guru')->truncate();
        DB::table('users')->truncate();
        DB::table('tm_kelas')->truncate();
        DB::table('tm_mata_pelajaran')->truncate();
        
        // Reset foreign key constraints
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Creating real data for SMP Penida Katapang...');

        // Create roles first
        $this->createRoles();
        
        // Create mata pelajaran
        $this->createMataPelajaran();
        
        // Create kelas
        $this->createKelas();
        
        // Create guru data
        $this->createGuru();
        
        // Create siswa data
        $this->createSiswa();

        $this->command->info('Real data seeding completed!');
    }

    private function createRoles()
    {
        $roles = ['admin', 'kepala_sekolah', 'guru', 'siswa'];
        
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }

    protected function createMataPelajaran()
    {
        $mataPelajaran = [
            ['nama' => 'Bahasa Indonesia', 'kode' => 'BI'],
            ['nama' => 'Matematika', 'kode' => 'MAT'],
            ['nama' => 'IPA', 'kode' => 'IPA'],
            ['nama' => 'IPS', 'kode' => 'IPS'],
            ['nama' => 'Bahasa Inggris', 'kode' => 'ENG'],
            ['nama' => 'Pendidikan Agama', 'kode' => 'PAI'],
            ['nama' => 'Pendidikan Pancasila', 'kode' => 'PKN'],
            ['nama' => 'Seni Budaya', 'kode' => 'SBK'],
            ['nama' => 'PJOK', 'kode' => 'PJOK'],
            ['nama' => 'Bahasa Sunda', 'kode' => 'SUN'],
            ['nama' => 'Informatika', 'kode' => 'INF'],
            ['nama' => 'BK', 'kode' => 'BK'],
            ['nama' => 'Kepala Sekolah', 'kode' => 'KEPSEK'],
        ];

        foreach ($mataPelajaran as $mp) {
            DB::table('tm_mata_pelajaran')->insert([
                'nama' => $mp['nama'],
                'kode' => $mp['kode'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Mata pelajaran data created successfully.');
    }

    protected function createKelas()
    {
        $kelasList = [
            ['nama' => '7A', 'tahun_akademik' => '2024/2025'],
            ['nama' => '7B', 'tahun_akademik' => '2024/2025'],
            ['nama' => '7C', 'tahun_akademik' => '2024/2025'],
            ['nama' => '8A', 'tahun_akademik' => '2024/2025'],
            ['nama' => '8B', 'tahun_akademik' => '2024/2025'],
            ['nama' => '8C', 'tahun_akademik' => '2024/2025'],
            ['nama' => '9A', 'tahun_akademik' => '2024/2025'],
            ['nama' => '9B', 'tahun_akademik' => '2024/2025'],
            ['nama' => '9C', 'tahun_akademik' => '2024/2025'],
        ];

        foreach ($kelasList as $kelasData) {
            DB::table('tm_kelas')->insert([
                'nama' => $kelasData['nama'],
                'tahun_akademik' => $kelasData['tahun_akademik'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Kelas data created successfully.');
    }

    private function createGuru()
    {
        // Data guru real dari SMP Penida Katapang
        $guruData = [
            [
                'nama' => 'Hj. Kania Ratna Andaya, M.MPd',
                'email' => 'kania.ratna@smppenidakatapang.sch.id',
                'jabatan' => 'kepala_sekolah',
                'mata_pelajaran' => 'Kepala Sekolah',
                'nip' => '196501011990032001'
            ],
            [
                'nama' => 'Andri Samsul Rizal, S.Pd.I, M.Pd',
                'email' => 'andri.samsul@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Pendidikan Agama',
                'nip' => '198203152009011001'
            ],
            [
                'nama' => 'Evit Nurmala, S.Pd',
                'email' => 'evit.nurmala@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Pendidikan Pancasila',
                'nip' => '198505102010012002'
            ],
            [
                'nama' => 'Tati Rahmawati, S.Pd',
                'email' => 'tati.rahmawati@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Bahasa Indonesia',
                'nip' => '197808152003122003'
            ],
            [
                'nama' => 'Nurhayati',
                'email' => 'nurhayati@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Bahasa Indonesia',
                'nip' => '198012102008012004'
            ],
            [
                'nama' => 'Ridwan Kurniadi, S.Pd',
                'email' => 'ridwan.kurniadi@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Bahasa Inggris',
                'nip' => '198309252009011005'
            ],
            [
                'nama' => 'Sari Alif Budiman, S.Pd',
                'email' => 'sari.alif@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Matematika',
                'nip' => '198507142010012006'
            ],
            [
                'nama' => 'Kania Dwi Amelia, S.Pd',
                'email' => 'kania.dwi@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'IPA',
                'nip' => '198911182015042007'
            ],
            [
                'nama' => 'Siti Ainun Nuraini, S.Pd',
                'email' => 'siti.ainun@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'IPA',
                'nip' => '199201152017012008'
            ],
            [
                'nama' => 'Sinta Rosita, S.Pd',
                'email' => 'sinta.rosita@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'IPS',
                'nip' => '198806202011012009'
            ],
            [
                'nama' => 'Muhamad Fajar R, S.Pd',
                'email' => 'fajar.r@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'PJOK',
                'nip' => '199105232016011010'
            ],
            [
                'nama' => 'Neni Nuraeni, S.Pd',
                'email' => 'neni.nuraeni@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Seni Budaya',
                'nip' => '198704172012012011'
            ],
            [
                'nama' => 'Putri Shyarshema Azzahra',
                'email' => 'putri.shyar@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'BK',
                'nip' => '199403152019032012'
            ],
            [
                'nama' => 'Dika Tusyafera, MH',
                'email' => 'dika.tusya@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Informatika',
                'nip' => '199208302020121013'
            ],
            [
                'nama' => 'Tanti Khaerunnisa, S.Kom',
                'email' => 'tanti.khaer@smppenidakatapang.sch.id',
                'jabatan' => 'guru',
                'mata_pelajaran' => 'Bahasa Sunda',
                'nip' => '199512282021212014'
            ],
            // Staff non-guru
            [
                'nama' => 'Arsyad Arya Zain Wahidan',
                'email' => 'arsyad.arya@smppenidakatapang.sch.id',
                'jabatan' => 'admin',
                'mata_pelajaran' => null,
                'nip' => '199009152016031015'
            ],
            [
                'nama' => 'Acep Dadang S.Pd',
                'email' => 'acep.dadang@smppenidakatapang.sch.id',
                'jabatan' => 'admin',
                'mata_pelajaran' => null,
                'nip' => '198512202010011016'
            ],
            [
                'nama' => 'Rosmauli Oktaviani, S.Sos',
                'email' => 'rosmauli.okta@smppenidakatapang.sch.id',
                'jabatan' => 'admin',
                'mata_pelajaran' => null,
                'nip' => '198710282013022017'
            ],
            [
                'nama' => 'Agung Sarif Hidayatulloh',
                'email' => 'agung.sarif@smppenidakatapang.sch.id',
                'jabatan' => 'admin',
                'mata_pelajaran' => null,
                'nip' => '199401152018031018'
            ],
            [
                'nama' => 'Sofyan Firdaus, S.Ap, MT',
                'email' => 'sofyan.firdaus@smppenidakatapang.sch.id',
                'jabatan' => 'admin',
                'mata_pelajaran' => null,
                'nip' => '198906122014121019'
            ]
        ];

        foreach ($guruData as $guru) {
            // Create user account
            $user = User::create([
                'name' => $guru['nama'],
                'email' => $guru['email'],
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]);

            // Assign role
            if ($guru['jabatan'] === 'kepala_sekolah') {
                $user->assignRole('kepala_sekolah');
            } elseif ($guru['jabatan'] === 'guru') {
                $user->assignRole('guru');
            } else {
                $user->assignRole('admin');
            }

            // Create guru record for both guru and kepala_sekolah (all should have mata_pelajaran)
            if (in_array($guru['jabatan'], ['guru', 'kepala_sekolah']) && $guru['mata_pelajaran']) {
                $mataPelajaran = DB::table('tm_mata_pelajaran')
                    ->where('nama', $guru['mata_pelajaran'])
                    ->first();
                    
                if ($mataPelajaran) {
                    DB::table('tm_guru')->insert([
                        'user_id' => $user->id,
                        'nip' => $guru['nip'],
                        'mata_pelajaran_id' => $mataPelajaran->id,
                        'tanggal_bergabung' => now()->subYears(rand(1, 10)),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    private function createSiswa()
    {
        // Sample siswa data - in real implementation, this should be loaded from Excel
        $siswaData = [
            // Kelas 7A
            ['nama' => 'Ahmad Rizki Pratama', 'kelas' => '7A', 'nisn' => '2024001001'],
            ['nama' => 'Siti Nurhaliza', 'kelas' => '7A', 'nisn' => '2024001002'],
            ['nama' => 'Budi Santoso', 'kelas' => '7A', 'nisn' => '2024001003'],
            ['nama' => 'Dewi Sartika', 'kelas' => '7A', 'nisn' => '2024001004'],
            ['nama' => 'Eko Prasetyo', 'kelas' => '7A', 'nisn' => '2024001005'],
            
            // Kelas 7B
            ['nama' => 'Fitri Ramadhani', 'kelas' => '7B', 'nisn' => '2024002001'],
            ['nama' => 'Galih Permana', 'kelas' => '7B', 'nisn' => '2024002002'],
            ['nama' => 'Hani Kartika', 'kelas' => '7B', 'nisn' => '2024002003'],
            ['nama' => 'Ivan Ramadhan', 'kelas' => '7B', 'nisn' => '2024002004'],
            ['nama' => 'Jihan Putri', 'kelas' => '7B', 'nisn' => '2024002005'],
            
            // Kelas 8A  
            ['nama' => 'Karin Febrianti', 'kelas' => '8A', 'nisn' => '2023001001'],
            ['nama' => 'Lucky Firmansyah', 'kelas' => '8A', 'nisn' => '2023001002'],
            ['nama' => 'Maya Sari', 'kelas' => '8A', 'nisn' => '2023001003'],
            ['nama' => 'Nanda Pratama', 'kelas' => '8A', 'nisn' => '2023001004'],
            ['nama' => 'Olla Ramadani', 'kelas' => '8A', 'nisn' => '2023001005'],
            
            // Kelas 9A
            ['nama' => 'Panji Wicaksono', 'kelas' => '9A', 'nisn' => '2022001001'],
            ['nama' => 'Qori Aulia', 'kelas' => '9A', 'nisn' => '2022001002'],
            ['nama' => 'Reza Firmansyah', 'kelas' => '9A', 'nisn' => '2022001003'],
            ['nama' => 'Sari Dewi', 'kelas' => '9A', 'nisn' => '2022001004'],
            ['nama' => 'Taufik Hidayat', 'kelas' => '9A', 'nisn' => '2022001005'],
        ];

        foreach ($siswaData as $siswa) {
            // Create user account for student
            $user = User::create([
                'name' => $siswa['nama'],
                'email' => strtolower(str_replace(' ', '.', $siswa['nama'])) . '@siswa.smppenidakatapang.sch.id',
                'password' => Hash::make('siswa123'),
                'email_verified_at' => now(),
            ]);

            // Assign student role
            $user->assignRole('siswa');

            // Find kelas
            $kelas = DB::table('tm_kelas')->where('nama', $siswa['kelas'])->first();
            if ($kelas) {
                DB::table('tt_siswa_kelas')->insert([
                    'user_id' => $user->id,
                    'kelas_id' => $kelas->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Note: Siswa data above is sample data. In production, load actual data from Excel file.');
    }
}
