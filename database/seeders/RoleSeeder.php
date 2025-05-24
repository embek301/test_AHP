<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat roles
        $adminRole = Role::create(['name' => 'admin']);
        $kepalaSekolahRole = Role::create(['name' => 'kepala_sekolah']);
        $guruRole = Role::create(['name' => 'guru']);
        $siswaRole = Role::create(['name' => 'siswa']);

        // Permission untuk Admin
        $adminPermissions = [
            'manage_users',
            'manage_roles',
            'manage_kelas',
            'manage_mata_pelajaran',
            'manage_guru',
            'create_periode_evaluasi',
            'manage_kriteria',
            'process_evaluasi_results',
            'view_all_evaluasi_results',
            'archive_periode_evaluasi',
        ];

        // Permission untuk Kepala Sekolah
        $kepalaSekolahPermissions = [
            'view_all_evaluasi_results', 
            'create_evaluasi', 
            'create_rekomendasi',
            'view_all_guru',
        ];

        // Permission untuk Guru
        $guruPermissions = [
            'view_own_evaluasi_results',
            'create_evaluasi',
            'view_own_profile',
        ];

        // Permission untuk Siswa
        $siswaPermissions = [
            'create_evaluasi',
            'view_own_profile',
        ];

        // Buat permissions dan assign ke role
        foreach ($adminPermissions as $permission) {
            $createdPermission = Permission::create(['name' => $permission]);
            $adminRole->givePermissionTo($createdPermission);
        }

        foreach ($kepalaSekolahPermissions as $permission) {
            // Cek apakah permission sudah ada
            $existingPermission = Permission::where('name', $permission)->first();
            if (!$existingPermission) {
                $existingPermission = Permission::create(['name' => $permission]);
            }
            $kepalaSekolahRole->givePermissionTo($existingPermission);
        }

        foreach ($guruPermissions as $permission) {
            // Cek apakah permission sudah ada
            $existingPermission = Permission::where('name', $permission)->first();
            if (!$existingPermission) {
                $existingPermission = Permission::create(['name' => $permission]);
            }
            $guruRole->givePermissionTo($existingPermission);
        }

        foreach ($siswaPermissions as $permission) {
            // Cek apakah permission sudah ada
            $existingPermission = Permission::where('name', $permission)->first();
            if (!$existingPermission) {
                $existingPermission = Permission::create(['name' => $permission]);
            }
            $siswaRole->givePermissionTo($existingPermission);
        }
    }
}