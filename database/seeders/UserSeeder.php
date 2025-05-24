<?php


namespace Database\Seeders;

use App\Models\User;
use App\Models\Guru;
use App\Models\MataPelajaran;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@sekolah.com',
            'password' => Hash::make('admin123'),
        ]);
        $admin->assignRole('admin');

        // Kepala Sekolah
        $kepalaSekolah = User::create([
            'name' => 'Kepala Sekolah',
            'email' => 'kepsek@sekolah.com',
            'password' => Hash::make('kepsek123'),
        ]);
        $kepalaSekolah->assignRole('kepala_sekolah');

        // Guru-guru
        $guru1 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@sekolah.com',
            'password' => Hash::make('guru123'),
        ]);
        $guru1->assignRole('guru');

        $guru2 = User::create([
            'name' => 'Siti Aminah',
            'email' => 'siti@sekolah.com',
            'password' => Hash::make('guru123'),
        ]);
        $guru2->assignRole('guru');

        $guru3 = User::create([
            'name' => 'Agus Prasetyo',
            'email' => 'agus@sekolah.com',
            'password' => Hash::make('guru123'),
        ]);
        $guru3->assignRole('guru');

        // Siswa-siswa
        $siswa1 = User::create([
            'name' => 'Andi Rahman',
            'email' => 'andi@sekolah.com',
            'password' => Hash::make('siswa123'),
        ]);
        $siswa1->assignRole('siswa');

        $siswa2 = User::create([
            'name' => 'Dewi Lestari',
            'email' => 'dewi@sekolah.com',
            'password' => Hash::make('siswa123'),
        ]);
        $siswa2->assignRole('siswa');

        $siswa3 = User::create([
            'name' => 'Rudi Hermawan',
            'email' => 'rudi@sekolah.com',
            'password' => Hash::make('siswa123'),
        ]);
        $siswa3->assignRole('siswa');

        $siswa4 = User::create([
            'name' => 'Lina Putri',
            'email' => 'lina@sekolah.com',
            'password' => Hash::make('siswa123'),
        ]);
        $siswa4->assignRole('siswa');

        $siswa5 = User::create([
            'name' => 'Doni Kusuma',
            'email' => 'doni@sekolah.com',
            'password' => Hash::make('siswa123'),
        ]);
        $siswa5->assignRole('siswa');
    }
}