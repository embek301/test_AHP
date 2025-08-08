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
        // Real siswa data from SMP Penida Katapang (extracted from Excel)
        $siswaData = [
            // Kelas 7A (29 siswa)
            ['nama' => 'ADHA REVANDI', 'kelas' => '7A', 'nisn' => '242507001'],
            ['nama' => 'AHMAD MAULANA', 'kelas' => '7A', 'nisn' => '242507003'],
            ['nama' => 'AIRA', 'kelas' => '7A', 'nisn' => '242507004'],
            ['nama' => 'AIRA PUTRI KIRANI', 'kelas' => '7A', 'nisn' => '242507005'],
            ['nama' => 'ALFINA RAMADANI', 'kelas' => '7A', 'nisn' => '242507006'],
            ['nama' => 'AZKA AURELIA SALSABILA TOGAS', 'kelas' => '7A', 'nisn' => '242507008'],
            ['nama' => 'AZRA AURELIA SALSABILA TOGAS', 'kelas' => '7A', 'nisn' => '242507009'],
            ['nama' => 'BUNGA HENDRA KIRANA', 'kelas' => '7A', 'nisn' => '242507010'],
            ['nama' => 'DEFA ANUGERAH PUTRA P', 'kelas' => '7A', 'nisn' => '242507011'],
            ['nama' => 'FAJAR HIDAYAT', 'kelas' => '7A', 'nisn' => '242507012'],
            ['nama' => 'FAUZAN JULFI ABDUL FATAH', 'kelas' => '7A', 'nisn' => '242507013'],
            ['nama' => 'FERRO REFIAN SANJAYA', 'kelas' => '7A', 'nisn' => '242507014'],
            ['nama' => 'KESYIA NABILA', 'kelas' => '7A', 'nisn' => '242507015'],
            ['nama' => 'KURNIAWAN', 'kelas' => '7A', 'nisn' => '242507016'],
            ['nama' => 'LINTANG TRI ANDINI', 'kelas' => '7A', 'nisn' => '242507017'],
            ['nama' => 'MEYSHA PUTRI NURFAZIAH', 'kelas' => '7A', 'nisn' => '242507018'],
            ['nama' => 'MUHAMMAD KIKI PURNOMO', 'kelas' => '7A', 'nisn' => '242507019'],
            ['nama' => 'MUHAMMAD PAJRUL MISBAH', 'kelas' => '7A', 'nisn' => '242507020'],
            ['nama' => 'MUHAMMAD SULTAN SALY', 'kelas' => '7A', 'nisn' => '242507021'],
            ['nama' => 'MUHAMMAD ZAKI RAMLAN', 'kelas' => '7A', 'nisn' => '242507022'],
            ['nama' => 'NADIA KHOIRUNNISA APRILIA', 'kelas' => '7A', 'nisn' => '242507023'],
            ['nama' => 'NASRIL SEPTIANTO', 'kelas' => '7A', 'nisn' => '242507024'],
            ['nama' => 'NAZWA OLIVIA HERISTI', 'kelas' => '7A', 'nisn' => '242507025'],
            ['nama' => 'OKTAVIANI NURUL KHOTIMAH', 'kelas' => '7A', 'nisn' => '242507026'],
            ['nama' => 'PANJI RAHAYU', 'kelas' => '7A', 'nisn' => '242507027'],
            ['nama' => 'RIDWAN WIGUNA', 'kelas' => '7A', 'nisn' => '242507029'],
            ['nama' => 'WILDAN HAFIDI', 'kelas' => '7A', 'nisn' => '242507030'],
            ['nama' => 'HASBI MUHAMMAD HUDSON', 'kelas' => '7A', 'nisn' => '242507999'],
            ['nama' => 'VINO GILANG FAIRUL ROZZIQ', 'kelas' => '7A', 'nisn' => '242507998'],

            // Kelas 7B (28 siswa)
            ['nama' => 'ADIT FAJARUDIN', 'kelas' => '7B', 'nisn' => '242507031'],
            ['nama' => 'AILA YUCTRICIA FRANKY S', 'kelas' => '7B', 'nisn' => '242507033'],
            ['nama' => 'AKBAR FAUZI', 'kelas' => '7B', 'nisn' => '242507034'],
            ['nama' => 'ANDIN SITI NURMALA', 'kelas' => '7B', 'nisn' => '242507035'],
            ['nama' => 'ARKAN MAULANA RAMADHAN', 'kelas' => '7B', 'nisn' => '242507036'],
            ['nama' => 'DENAL FIRDAUS NUZALA', 'kelas' => '7B', 'nisn' => '242507037'],
            ['nama' => 'ELVINO GALANG PRASTIAN', 'kelas' => '7B', 'nisn' => '242507038'],
            ['nama' => 'FATUR ROHMAN PAMUNGKAS', 'kelas' => '7B', 'nisn' => '242507039'],
            ['nama' => 'IDHAM FATHAM MUBEINA', 'kelas' => '7B', 'nisn' => '242507040'],
            ['nama' => 'INDIRA DWI YANTI', 'kelas' => '7B', 'nisn' => '242507041'],
            ['nama' => 'INTAN PUTRI PRIYANI', 'kelas' => '7B', 'nisn' => '242507997'],
            ['nama' => 'LAILA DINA AGUSTINA', 'kelas' => '7B', 'nisn' => '242507042'],
            ['nama' => 'MUHAMMAD ALFAN AL ROHMAT', 'kelas' => '7B', 'nisn' => '242507044'],
            ['nama' => 'MUHAMMAD RIZKI', 'kelas' => '7B', 'nisn' => '242507045'],
            ['nama' => 'RANDY PRATAMA WIJAYA', 'kelas' => '7B', 'nisn' => '242507048'],
            ['nama' => 'RANGGA MAULANA YUSUF', 'kelas' => '7B', 'nisn' => '242507049'],
            ['nama' => 'RENITA YULIA RAHMAWATI', 'kelas' => '7B', 'nisn' => '242507050'],
            ['nama' => 'RICKY OKTAFIRMANSYAH', 'kelas' => '7B', 'nisn' => '242507996'],
            ['nama' => 'RIFALDI SOFIANA', 'kelas' => '7B', 'nisn' => '242507051'],
            ['nama' => 'RISSA RUBIYAH', 'kelas' => '7B', 'nisn' => '242507052'],
            ['nama' => 'RIVEN RIZKY RAMDANI', 'kelas' => '7B', 'nisn' => '242507053'],
            ['nama' => 'RYAISHA NAIZAM SODIQ SOMANTRI', 'kelas' => '7B', 'nisn' => '242507054'],
            ['nama' => 'SHYLFA FITRIANI NUR AZIZAH', 'kelas' => '7B', 'nisn' => '242507055'],
            ['nama' => 'SITI KHODIJAH', 'kelas' => '7B', 'nisn' => '242507056'],
            ['nama' => 'TIARA DEWI PUTRI', 'kelas' => '7B', 'nisn' => '242507057'],
            ['nama' => 'YOANITA SASKIAA RAMDANI', 'kelas' => '7B', 'nisn' => '242507995'],
            ['nama' => 'ZALFA SOFIANUR HUSNA', 'kelas' => '7B', 'nisn' => '242507058'],

            // Kelas 7C (27 siswa)
            ['nama' => 'ADITYA RIZKY RAMADHAN', 'kelas' => '7C', 'nisn' => '242507059'],
            ['nama' => 'AGUNG SETIAWAN', 'kelas' => '7C', 'nisn' => '242507060'],
            ['nama' => 'AINA TALITA ZAHRA', 'kelas' => '7C', 'nisn' => '242507061'],
            ['nama' => 'ANDINI PURNAMA SARI', 'kelas' => '7C', 'nisn' => '242507063'],
            ['nama' => 'AYATUL HUSNA NUR FADILAH', 'kelas' => '7C', 'nisn' => '242507064'],
            ['nama' => 'DESTI SETIAWATI', 'kelas' => '7C', 'nisn' => '242507066'],
            ['nama' => 'GIANT AL-FARO ZAELANI SIDIK', 'kelas' => '7C', 'nisn' => '242507067'],
            ['nama' => 'IKBAL RAMDHANI', 'kelas' => '7C', 'nisn' => '242507068'],
            ['nama' => 'JOHAR AWALUDIN', 'kelas' => '7C', 'nisn' => '242507069'],
            ['nama' => 'LILIANA RAHMA SALSABILA', 'kelas' => '7C', 'nisn' => '242507070'],
            ['nama' => 'MOCHAMMAD CLEO SAVERO AFFANDI', 'kelas' => '7C', 'nisn' => '242507071'],
            ['nama' => 'MUHAMMAD FAUZI SUGIANTO', 'kelas' => '7C', 'nisn' => '242507072'],
            ['nama' => 'MUHAMMAD RESTU', 'kelas' => '7C', 'nisn' => '242507073'],
            ['nama' => 'MUHAMAD RIZKI WIJAYA', 'kelas' => '7C', 'nisn' => '242507090'],
            ['nama' => 'MUHAMMAD SANDI FEBRIAN', 'kelas' => '7C', 'nisn' => '242507074'],
            ['nama' => 'NAZWA SEPTIANI', 'kelas' => '7C', 'nisn' => '242507075'],
            ['nama' => 'RAKA ADITYA PRATAMA', 'kelas' => '7C', 'nisn' => '242507076'],
            ['nama' => 'RATNA AURA MUSLIHAH', 'kelas' => '7C', 'nisn' => '242507077'],
            ['nama' => 'REDIYANTO SETIA MULYANA', 'kelas' => '7C', 'nisn' => '242507078'],
            ['nama' => 'RINDU RAYNA RINDIANI', 'kelas' => '7C', 'nisn' => '242507079'],
            ['nama' => 'RISTI DWI RAHMAWATI', 'kelas' => '7C', 'nisn' => '242507080'],
            ['nama' => 'SALSA SABILA', 'kelas' => '7C', 'nisn' => '242507081'],
            ['nama' => 'SATRIA WIBAWA', 'kelas' => '7C', 'nisn' => '242507082'],
            ['nama' => 'SILVIA MURNI', 'kelas' => '7C', 'nisn' => '242507083'],
            ['nama' => 'TRISTAN WIDIANTORO', 'kelas' => '7C', 'nisn' => '242507085'],
            ['nama' => 'ZAHIRA HERALIANA PUTRI', 'kelas' => '7C', 'nisn' => '242507086'],
            ['nama' => 'NAILUL RAHMADANI', 'kelas' => '7C', 'nisn' => '242507993'],

            // Kelas 8A (31 siswa)
            ['nama' => 'AADILAH NUR AZMI', 'kelas' => '8A', 'nisn' => '232407036'],
            ['nama' => 'ADITYA SYAHPUTRA', 'kelas' => '8A', 'nisn' => '232407001'],
            ['nama' => 'AKASAH NURAZIZAH', 'kelas' => '8A', 'nisn' => '232407002'],
            ['nama' => 'AZKI HAIKAL MALIK', 'kelas' => '8A', 'nisn' => '232407004'],
            ['nama' => 'AZKIYA DINAR FAHIRA', 'kelas' => '8A', 'nisn' => '232407005'],
            ['nama' => 'BRYANT ANDRIANSYAH', 'kelas' => '8A', 'nisn' => '232407006'],
            ['nama' => 'DICKA EGA BUDIADI', 'kelas' => '8A', 'nisn' => '232407079'],
            ['nama' => 'FATHIR MAULANA YUSUF', 'kelas' => '8A', 'nisn' => '232407010'],
            ['nama' => 'FITRI NOVIANTI', 'kelas' => '8A', 'nisn' => '232407011'],
            ['nama' => 'IHSAN FAUZAAN FARHANNUDIN', 'kelas' => '8A', 'nisn' => '232407012'],
            ['nama' => 'KAHFA QORI NUR ALFIANI', 'kelas' => '8A', 'nisn' => '232407013'],
            ['nama' => 'MAURIN ISNAINI', 'kelas' => '8A', 'nisn' => '232407016'],
            ['nama' => 'MONA RAMA CINTA', 'kelas' => '8A', 'nisn' => '232407118'],
            ['nama' => 'MUHAMAD HILMI HAIKAL FIRDAUS', 'kelas' => '8A', 'nisn' => '232407017'],
            ['nama' => 'MUHAMMAD AZZAM JAMALUDIN', 'kelas' => '8A', 'nisn' => '232407018'],
            ['nama' => 'MUHAMAD RISMAN PRATAMA', 'kelas' => '8A', 'nisn' => '232407090'],
            ['nama' => 'MUHAMMAD IKHSAN', 'kelas' => '8A', 'nisn' => '232407091'],
            ['nama' => 'MUHAMMAD RISKI', 'kelas' => '8A', 'nisn' => '232407019'],
            ['nama' => 'NAIMA ANDRIYANI', 'kelas' => '8A', 'nisn' => '232407020'],
            ['nama' => 'NAJWA SEPTIANI WARDANA', 'kelas' => '8A', 'nisn' => '232407021'],
            ['nama' => 'NOVITA RIYANTI', 'kelas' => '8A', 'nisn' => '232407022'],
            ['nama' => 'PUTRI AYU HERDIAN', 'kelas' => '8A', 'nisn' => '232407023'],
            ['nama' => 'RADITH PRATAMA', 'kelas' => '8A', 'nisn' => '232407024'],
            ['nama' => 'REZKY ADITTYA PRAYOGA', 'kelas' => '8A', 'nisn' => '232407025'],
            ['nama' => 'RIZKY FAUZAN KHAIRUL ANAM', 'kelas' => '8A', 'nisn' => '232407027'],
            ['nama' => 'SABTIA HAZNA KIRANA', 'kelas' => '8A', 'nisn' => '232407028'],
            ['nama' => 'SANI SETIAWAN', 'kelas' => '8A', 'nisn' => '232407029'],
            ['nama' => 'SASKIA NABILA MAHARANI', 'kelas' => '8A', 'nisn' => '232407030'],
            ['nama' => 'SIGIT MUHAMAD AZUKHRUF', 'kelas' => '8A', 'nisn' => '232407031'],
            ['nama' => 'TITIN MUTIA SARI', 'kelas' => '8A', 'nisn' => '232407034'],
            ['nama' => 'M.KHOIRUL RIZQI', 'kelas' => '8A', 'nisn' => '232407992'],

            // Kelas 8B (30 siswa) - excluding duplicate
            ['nama' => 'ADILLA RIZKY YUSUF HILABY', 'kelas' => '8B', 'nisn' => '232407037'],
            ['nama' => 'AMELIA OKTAVIANI', 'kelas' => '8B', 'nisn' => '232407038'],
            ['nama' => 'ARVAN DEVA PRATAMA', 'kelas' => '8B', 'nisn' => '232407040'],
            ['nama' => 'ASEP NURRAMDAN', 'kelas' => '8B', 'nisn' => '242508087'],
            ['nama' => 'AWALUDIN RAMDHANI', 'kelas' => '8B', 'nisn' => '232407041'],
            ['nama' => 'AZRIL PUTRA PRATAMA', 'kelas' => '8B', 'nisn' => '232407042'],
            ['nama' => 'BUNGA SAQIRA RAMADHANI', 'kelas' => '8B', 'nisn' => '232407111'],
            ['nama' => 'DERRY PUTRA IRAWAN', 'kelas' => '8B', 'nisn' => '232407043'],
            ['nama' => 'FANZI PEBRIANSAH', 'kelas' => '8B', 'nisn' => '232407046'],
            ['nama' => 'GANI ALANSYAH', 'kelas' => '8B', 'nisn' => '232407047'],
            ['nama' => 'KARINA PUTRI DIANRA', 'kelas' => '8B', 'nisn' => '232407049'],
            ['nama' => 'KEVIN PIERO SONA', 'kelas' => '8B', 'nisn' => '232407050'],
            ['nama' => 'MARSHA REGINA PUTRI', 'kelas' => '8B', 'nisn' => '232407051'],
            ['nama' => 'MELAN NABILA', 'kelas' => '8B', 'nisn' => '232407052'],
            ['nama' => 'MIKO ANGGA FEBRIANSYAH', 'kelas' => '8B', 'nisn' => '232407053'],
            ['nama' => 'M. FATIH ASSEGAF', 'kelas' => '8B', 'nisn' => '232407991'],
            ['nama' => 'M.RESKI ABDILLAH', 'kelas' => '8B', 'nisn' => '232407990'],
            ['nama' => 'MUHAMMAD RIFFA', 'kelas' => '8B', 'nisn' => '232407056'],
            ['nama' => 'NAQIYYA SALSABILA VIRANIA', 'kelas' => '8B', 'nisn' => '232407057'],
            ['nama' => 'NUR MAIDAH', 'kelas' => '8B', 'nisn' => '232407058'],
            ['nama' => 'PUTRI NUR FHADILLAH', 'kelas' => '8B', 'nisn' => '232407059'],
            ['nama' => 'PUTRI PILYAN NUGRAHA', 'kelas' => '8B', 'nisn' => '232407060'],
            ['nama' => 'RIFQI JANUAR ARYA NUGRAHA', 'kelas' => '8B', 'nisn' => '232407061'],
            ['nama' => 'RIZKY ROHMAN KUSTIA', 'kelas' => '8B', 'nisn' => '232407062'],
            ['nama' => 'SELPIA HANDAYANI', 'kelas' => '8B', 'nisn' => '232407064'],
            ['nama' => 'SINTYA CANDRAYANI', 'kelas' => '8B', 'nisn' => '242508088'],
            ['nama' => 'SUCI APRILIANI', 'kelas' => '8B', 'nisn' => '232407068'],
            ['nama' => 'TIYA SUSANTI', 'kelas' => '8B', 'nisn' => '232407069'],
            ['nama' => 'ZAHIRA NURAINI', 'kelas' => '8B', 'nisn' => '232407071'],
            ['nama' => 'SHIFA ALFIYYAH', 'kelas' => '8B', 'nisn' => '232407113'],

            // Kelas 8C (31 siswa)
            ['nama' => 'ANNISA SYAQIRA', 'kelas' => '8C', 'nisn' => '232407072'],
            ['nama' => 'ANNISA SYIFA NURHASANAH', 'kelas' => '8C', 'nisn' => '232407073'],
            ['nama' => 'APRILIA JAYANTI', 'kelas' => '8C', 'nisn' => '232407074'],
            ['nama' => 'AZKHA PUTERA RAMDHANI', 'kelas' => '8C', 'nisn' => '232407076'],
            ['nama' => 'BAGAS', 'kelas' => '8C', 'nisn' => '232407077'],
            ['nama' => 'DESVITA REGINA PUTRI', 'kelas' => '8C', 'nisn' => '232407078'],
            ['nama' => 'DERISA DWI ALLZAHRA', 'kelas' => '8C', 'nisn' => '232407008'],
            ['nama' => 'JEANY ANANTA PUTRI', 'kelas' => '8C', 'nisn' => '232407083'],
            ['nama' => 'MAULINA FEBY SALSABILA', 'kelas' => '8C', 'nisn' => '232407085'],
            ['nama' => 'MUHAMAD FADLAN', 'kelas' => '8C', 'nisn' => '232407087'],
            ['nama' => 'MUHAMAD REZKY ADITYA', 'kelas' => '8C', 'nisn' => '232407089'],
            ['nama' => 'MUHAMMAD RASYA RASIDIK', 'kelas' => '8C', 'nisn' => '232407092'],
            ['nama' => 'NABILA AZZAHRA', 'kelas' => '8C', 'nisn' => '232407093'],
            ['nama' => 'NAUFAL MUHAMAD ALIF SALEH', 'kelas' => '8C', 'nisn' => '232407094'],
            ['nama' => 'NOVIASARI KASIBAH NAYLA', 'kelas' => '8C', 'nisn' => '232407095'],
            ['nama' => 'NURSITI JULIANI', 'kelas' => '8C', 'nisn' => '232407096'],
            ['nama' => 'RAFFI PRATAMA', 'kelas' => '8C', 'nisn' => '232407097'],
            ['nama' => 'RAKA PUTRA PRATAMA', 'kelas' => '8C', 'nisn' => '232407098'],
            ['nama' => 'REGINA DAMAYANTI', 'kelas' => '8C', 'nisn' => '232407099'],
            ['nama' => 'RENA KUSNANDAR', 'kelas' => '8C', 'nisn' => '232407100'],
            ['nama' => 'RISKA AMELIA', 'kelas' => '8C', 'nisn' => '232407026'],
            ['nama' => 'RIZKY ADITYA RABANI', 'kelas' => '8C', 'nisn' => '232407101'],
            ['nama' => 'RYANSYAH SURYANTO', 'kelas' => '8C', 'nisn' => '232407102'],
            ['nama' => 'SALWA SETIANI', 'kelas' => '8C', 'nisn' => '232407103'],
            ['nama' => 'SAPTIAN NUGRAHA', 'kelas' => '8C', 'nisn' => '232407104'],
            ['nama' => 'SIDIK AWALUDIN', 'kelas' => '8C', 'nisn' => '232407105'],
            ['nama' => 'SINDI NOVITASARI', 'kelas' => '8C', 'nisn' => '232407106'],
            ['nama' => 'SYAFA FADILAH', 'kelas' => '8C', 'nisn' => '232407108'],
            ['nama' => 'WANDA SARI WAHYUNI', 'kelas' => '8C', 'nisn' => '232407109'],
            ['nama' => 'ZAHIRA THANTIKA ASMARA', 'kelas' => '8C', 'nisn' => '232407115'],
            ['nama' => 'JESSICA AMANDA FADILA', 'kelas' => '8C', 'nisn' => '232407989'],

            // Kelas 9A (31 siswa)
            ['nama' => 'Ade Risman Diansyah', 'kelas' => '9A', 'nisn' => '232408112'],
            ['nama' => 'Aditya Dwi Surya', 'kelas' => '9A', 'nisn' => '222307001'],
            ['nama' => 'Aji Kurnia', 'kelas' => '9A', 'nisn' => '222307002'],
            ['nama' => 'Amellia', 'kelas' => '9A', 'nisn' => '222307003'],
            ['nama' => 'Aziz Alfiansyah', 'kelas' => '9A', 'nisn' => '222307006'],
            ['nama' => 'Diki Abdul Rahman', 'kelas' => '9A', 'nisn' => '222307009'],
            ['nama' => 'Haide Theda Nizar Firdaus', 'kelas' => '9A', 'nisn' => '232408111'],
            ['nama' => 'Insan Kamil', 'kelas' => '9A', 'nisn' => '222307011'],
            ['nama' => 'Kevin Eka Prayoga', 'kelas' => '9A', 'nisn' => '222307013'],
            ['nama' => 'Khoerul Adzam Maulidan', 'kelas' => '9A', 'nisn' => '222307115'],
            ['nama' => 'Krisna Segi Komara', 'kelas' => '9A', 'nisn' => '222307014'],
            ['nama' => 'Mega Sulistya Lestari', 'kelas' => '9A', 'nisn' => '222307015'],
            ['nama' => 'Muchamad Fazry Aldi Nugraha', 'kelas' => '9A', 'nisn' => '222307016'],
            ['nama' => 'Muhamad Rifky Ramdani', 'kelas' => '9A', 'nisn' => '222307018'],
            ['nama' => 'Muhammad Galang', 'kelas' => '9A', 'nisn' => '222307019'],
            ['nama' => 'Muhammad Irfan Maulana', 'kelas' => '9A', 'nisn' => '232408119'],
            ['nama' => 'Muhammad Satrio', 'kelas' => '9A', 'nisn' => '222307020'],
            ['nama' => 'Nadia Fitriani Ningsih', 'kelas' => '9A', 'nisn' => '222307021'],
            ['nama' => 'Nasyandra Nur Rizkyah', 'kelas' => '9A', 'nisn' => '222307109'],
            ['nama' => 'Nazhar Ali Akbar', 'kelas' => '9A', 'nisn' => '222307034'],
            ['nama' => 'Nazwa Lintang Rizkyani', 'kelas' => '9A', 'nisn' => '222307022'],
            ['nama' => 'Niecco Lukman Putra Pratama', 'kelas' => '9A', 'nisn' => '222307023'],
            ['nama' => 'Novika Sari', 'kelas' => '9A', 'nisn' => '222307024'],
            ['nama' => 'Quinsha Putri Az-zahra', 'kelas' => '9A', 'nisn' => '222307025'],
            ['nama' => 'Renata Putri Nursifa', 'kelas' => '9A', 'nisn' => '222307027'],
            ['nama' => 'Revy Mulia Ramadhan', 'kelas' => '9A', 'nisn' => '222307028'],
            ['nama' => 'Rizki Hidayat', 'kelas' => '9A', 'nisn' => '222307029'],
            ['nama' => 'Rudy Ramdanu Sofyan', 'kelas' => '9A', 'nisn' => '222307030'],
            ['nama' => 'Salsa Ayu Desvita', 'kelas' => '9A', 'nisn' => '222307031'],
            ['nama' => 'Salsa Ayu Sabila', 'kelas' => '9A', 'nisn' => '222307116'],
            ['nama' => 'Yadi Darmawan', 'kelas' => '9A', 'nisn' => '222307033'],

            // Kelas 9B (29 siswa)
            ['nama' => 'Ahmad Ghofirin', 'kelas' => '9B', 'nisn' => '222307035'],
            ['nama' => 'Akmal Nurjaman', 'kelas' => '9B', 'nisn' => '222307119'],
            ['nama' => 'Al Fadhil Purnama', 'kelas' => '9B', 'nisn' => '222307036'],
            ['nama' => 'Alfiani Alifatun Zahra', 'kelas' => '9B', 'nisn' => '222307037'],
            ['nama' => 'Cica Rostika', 'kelas' => '9B', 'nisn' => '222307039'],
            ['nama' => 'Citra Pujiawati', 'kelas' => '9B', 'nisn' => '222307040'],
            ['nama' => 'Della Anggun Danuarta', 'kelas' => '9B', 'nisn' => '222307065'],
            ['nama' => 'Denis Pandiansyah', 'kelas' => '9B', 'nisn' => '222307041'],
            ['nama' => 'Desty Siti Anggraeni', 'kelas' => '9B', 'nisn' => '222307042'],
            ['nama' => 'Elvira Shelomita A', 'kelas' => '9B', 'nisn' => '222307043'],
            ['nama' => 'Fadhlan Dhavin Tsabitah', 'kelas' => '9B', 'nisn' => '222307044'],
            ['nama' => 'Izza Sabilla', 'kelas' => '9B', 'nisn' => '222307067'],
            ['nama' => 'Leana Nurfadila', 'kelas' => '9B', 'nisn' => '222307045'],
            ['nama' => 'Marrysa Febriana Putri', 'kelas' => '9B', 'nisn' => '222307047'],
            ['nama' => 'Muhamad Haikal Fazri', 'kelas' => '9B', 'nisn' => '222307118'],
            ['nama' => 'Muhammad Jammaludin', 'kelas' => '9B', 'nisn' => '222307120'],
            ['nama' => 'Muhamad Raya Cahyana', 'kelas' => '9B', 'nisn' => '222307049'],
            ['nama' => 'Muhamad Rizal Ramadhan', 'kelas' => '9B', 'nisn' => '222307050'],
            ['nama' => 'Muhammad Restu Fadillah', 'kelas' => '9B', 'nisn' => '222307051'],
            ['nama' => 'Nabila Nandita Novyanti', 'kelas' => '9B', 'nisn' => '222307052'],
            ['nama' => 'Najwa Lathifah Putri Kinanti', 'kelas' => '9B', 'nisn' => '222307053'],
            ['nama' => 'Raihan Nugraha', 'kelas' => '9B', 'nisn' => '222307056'],
            ['nama' => 'Rifqi Firmansyah', 'kelas' => '9B', 'nisn' => '232408113'],
            ['nama' => 'Reza Ilham Saputra', 'kelas' => '9B', 'nisn' => '222307057'],
            ['nama' => 'Rizal Ahmad Mulyanto', 'kelas' => '9B', 'nisn' => '222307058'],
            ['nama' => 'Rizka Aulia', 'kelas' => '9B', 'nisn' => '222307059'],
            ['nama' => 'Salsa Melani Putri', 'kelas' => '9B', 'nisn' => '222307061'],
            ['nama' => 'Teguh Zulfikar', 'kelas' => '9B', 'nisn' => '222307062'],
            ['nama' => 'Yanti Uniati', 'kelas' => '9B', 'nisn' => '222307064'],

            // Kelas 9C (30 siswa)
            ['nama' => 'Adinda Savaira Nasiha', 'kelas' => '9C', 'nisn' => '222307068'],
            ['nama' => 'Airlangga Abdurrohman', 'kelas' => '9C', 'nisn' => '222307069'],
            ['nama' => 'Albert Iman Shaputra Gulo', 'kelas' => '9C', 'nisn' => '222307070'],
            ['nama' => 'Alfi Ramadhani Nurfalah', 'kelas' => '9C', 'nisn' => '222307071'],
            ['nama' => 'ALIF INDRA NUGRAHA', 'kelas' => '9C', 'nisn' => '222307072'],
            ['nama' => 'Alya Kusnadila', 'kelas' => '9C', 'nisn' => '222307073'],
            ['nama' => 'Anggun Ade Lia', 'kelas' => '9C', 'nisn' => '222307004'],
            ['nama' => 'Arkaira Rizu', 'kelas' => '9C', 'nisn' => '222307110'],
            ['nama' => 'Byantara Nadif Irmawan', 'kelas' => '9C', 'nisn' => '222307074'],
            ['nama' => 'Dara Agustin', 'kelas' => '9C', 'nisn' => '222307075'],
            ['nama' => 'Devillo Dziqril Hakim', 'kelas' => '9C', 'nisn' => '222307077'],
            ['nama' => 'Dhiya Dzikra Aurelia', 'kelas' => '9C', 'nisn' => '222307078'],
            ['nama' => 'Feyza Rizky Mulyeni', 'kelas' => '9C', 'nisn' => '222307079'],
            ['nama' => 'Helmi Nizar Maulana Mukhtazir', 'kelas' => '9C', 'nisn' => '222307080'],
            ['nama' => 'Mira Atmirah', 'kelas' => '9C', 'nisn' => '222307082'],
            ['nama' => 'Muhammad Al Hafidzi. L', 'kelas' => '9C', 'nisn' => '222307083'],
            ['nama' => 'Muhammad Raffi Aditiya', 'kelas' => '9C', 'nisn' => '222307119'],
            ['nama' => 'Muhammad Yusuf Shifa', 'kelas' => '9C', 'nisn' => '222307084'],
            ['nama' => 'Nabil Fairel', 'kelas' => '9C', 'nisn' => '222307085'],
            ['nama' => 'Neng Juliah', 'kelas' => '9C', 'nisn' => '222307087'],
            ['nama' => 'Rafli Andriandi', 'kelas' => '9C', 'nisn' => '222307088'],
            ['nama' => 'Ravael Ramadhan', 'kelas' => '9C', 'nisn' => '222307090'],
            ['nama' => 'Reihan Andriansyah', 'kelas' => '9C', 'nisn' => '222307091'],
            ['nama' => 'Rendi Hairul Azri', 'kelas' => '9C', 'nisn' => '222307092'],
            ['nama' => 'Rizka Saleha', 'kelas' => '9C', 'nisn' => '222307094'],
            ['nama' => 'Rizky Aditya Muhamad Sutisna', 'kelas' => '9C', 'nisn' => '222307095'],
            ['nama' => 'Sheren Nur Azahra', 'kelas' => '9C', 'nisn' => '222307096'],
            ['nama' => 'Vidiansyah', 'kelas' => '9C', 'nisn' => '222307098'],
            ['nama' => 'Wilda Athiyyah', 'kelas' => '9C', 'nisn' => '222307099'],
            ['nama' => 'Wina Rahmadani', 'kelas' => '9C', 'nisn' => '222307100'],
        ];

        foreach ($siswaData as $siswa) {
            // Create user account for student
            $user = User::create([
                'name' => $siswa['nama'],
                'email' => $this->generateStudentEmail($siswa['nama']),
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

        $this->command->info('Real siswa data from SMP Penida Katapang created successfully! Total: ' . count($siswaData) . ' students');
    }

    /**
     * Generate consistent email format for students
     */
    private function generateStudentEmail($nama)
    {
        // Convert to lowercase and replace spaces with dots
        $email = strtolower($nama);
        $email = str_replace(' ', '.', $email);
        $email = str_replace('-', '.', $email);
        
        // Remove special characters except dots
        $email = preg_replace('/[^a-z0-9.]/', '', $email);
        
        // Remove multiple consecutive dots
        $email = preg_replace('/\.+/', '.', $email);
        
        // Remove leading/trailing dots
        $email = trim($email, '.');
        
        $baseEmail = $email . '@siswa.smppenidakatapang.sch.id';
        
        // Check if email already exists and add suffix if needed
        $suffix = 2;
        $finalEmail = $baseEmail;
        while (User::where('email', $finalEmail)->exists()) {
            $finalEmail = $email . '.' . $suffix . '@siswa.smppenidakatapang.sch.id';
            $suffix++;
        }
        
        return $finalEmail;
    }
}
