<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Guru\EvaluasiRekanController;
use App\Http\Controllers\GuruController;
use App\Http\Controllers\HasilEvaluasiController;
use App\Http\Controllers\Kepsek\EvaluasiFormController;
use App\Http\Controllers\KriteriaController;
use App\Http\Controllers\MataPelajaranController;
use App\Http\Controllers\PeriodeEvaluasiController;
use App\Http\Controllers\RekomendasiController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubKriteriaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('hasil-evaluasi')->group(function () {
        Route::get('', [HasilEvaluasiController::class, 'index'])->name('hasil-evaluasi.index');
        Route::get('/{hasilEvaluasi}/detail', [HasilEvaluasiController::class, 'detail'])->name('hasil-evaluasi.detail');
        Route::post('calculate', [HasilEvaluasiController::class, 'calculateAndSave'])
            ->name('hasil-evaluasi.calculate');
    });
    Route::get('/hasil-evaluasi/{hasilEvaluasi}/export', [HasilEvaluasiController::class, 'export'])->name('hasil-evaluasi.export');
    Route::get('/hasil-evaluasi/export-all', [HasilEvaluasiController::class, 'exportAll'])->name('hasil-evaluasi.export-all');

    Route::prefix('guru')->group(function () {
        Route::get('', [GuruController::class, 'index'])->name('guru.index');
        Route::post('', [GuruController::class, 'store'])->name('guru.store');
        Route::post('{guru}', [GuruController::class, 'update'])->name('guru.update');
        Route::put('{guru}/toggle-active', [GuruController::class, 'toggleActive'])->name('guru.toggle-active');
        Route::delete('{guru}', [GuruController::class, 'destroy'])->name('guru.destroy');
    });

    Route::middleware(['role:admin'])->group(function () {
        Route::prefix('admin')->group(function () {
            Route::prefix('users')->group(function () {
                Route::get('', [UserController::class, 'index'])->name('users.index');
                Route::post('', [UserController::class, 'store'])->name('users.store');
                Route::post('update/{user}', [UserController::class, 'update'])->name('users.update');
                Route::post('{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
            });

            Route::prefix('kelas')->group(function () {
                Route::get('', [App\Http\Controllers\KelasController::class, 'index'])->name('kelas.index');
                Route::post('', [App\Http\Controllers\KelasController::class, 'store'])->name('kelas.store');
                Route::get('{kela}', [App\Http\Controllers\KelasController::class, 'show'])->name('kelas.show');
                Route::post('{kela}/update', [App\Http\Controllers\KelasController::class, 'update'])->name('kelas.update');
                Route::delete('{kela}/delete', [App\Http\Controllers\KelasController::class, 'destroy'])->name('kelas.destroy');
            });

            Route::prefix('siswa')->group(function () {
                Route::get('', [SiswaController::class, 'index'])->name('siswa.index');
                Route::post('', [SiswaController::class, 'store'])->name('siswa.store');
                Route::patch('/{siswa}', [SiswaController::class, 'update'])->name('siswa.update');
                Route::patch('/{siswa}/toggle-active', [SiswaController::class, 'toggleActive'])->name('siswa.toggleActive');
                Route::patch('/{siswa}/reset-password', [SiswaController::class, 'resetPassword'])->name('siswa.resetPassword');
                Route::post('/{siswa}/assign-kelas', [SiswaController::class, 'assignKelas'])->name('siswa.assignKelas');
                Route::delete('/{siswa}/remove-from-kelas', [SiswaController::class, 'removeFromKelas'])->name('siswa.removeFromKelas');
            });

            Route::prefix('mata-pelajaran')->group(function () {
                Route::get('', [MataPelajaranController::class, 'index'])->name('mata-pelajaran.index');
                Route::post('', [MataPelajaranController::class, 'store'])->name('mata-pelajaran.store');
                Route::post('/{mataPelajaran}', [MataPelajaranController::class, 'update'])->name('mata-pelajaran.update');
                Route::put('/{mataPelajaran}/toggle-active', [MataPelajaranController::class, 'toggleActive'])->name('mata-pelajaran.toggle-active');
                Route::delete('/{mataPelajaran}', [MataPelajaranController::class, 'destroy'])->name('mata-pelajaran.destroy');
            });

            Route::prefix('periode-evaluasi')->group(function () {
                Route::get('', [PeriodeEvaluasiController::class, 'index'])->name('periode-evaluasi.index');
                Route::post('', [PeriodeEvaluasiController::class, 'store'])->name('periode-evaluasi.store');
                Route::put('/{periodeEvaluasi}', [PeriodeEvaluasiController::class, 'update'])->name('periode-evaluasi.update');
                Route::put('/{periodeEvaluasi}/change-status', [PeriodeEvaluasiController::class, 'changeStatus'])->name('periode-evaluasi.change-status');
                Route::delete('/{periodeEvaluasi}', [PeriodeEvaluasiController::class, 'destroy'])->name('periode-evaluasi.destroy');
                Route::get('/{periodeEvaluasi}/summary', [PeriodeEvaluasiController::class, 'getSummary'])->name('periode-evaluasi.summary');
            });

            Route::prefix('kriteria')->name('kriteria.')->group(function () {
                Route::get('', [KriteriaController::class, 'index'])->name('index');
                Route::post('', [KriteriaController::class, 'store'])->name('store');
                Route::put('/{kriteria}', [KriteriaController::class, 'update'])->name('update');
                Route::put('/{kriteria}/toggle-active', [KriteriaController::class, 'toggleActive'])->name('toggle-active');
                Route::delete('/{kriteria}', [KriteriaController::class, 'destroy'])->name('destroy');
                
                // SUB KRITERIA ROUTES (nested under kriteria)
                Route::prefix('{kriteria}/sub-kriteria')->name('sub-kriteria.')->group(function () {
                    Route::get('', [SubKriteriaController::class, 'index'])->name('index');
                    Route::post('', [SubKriteriaController::class, 'store'])->name('store');
                    Route::put('/{subKriteria}', [SubKriteriaController::class, 'update'])->name('update');
                    Route::put('/{subKriteria}/toggle-active', [SubKriteriaController::class, 'toggleActive'])->name('toggle-active');
                    Route::delete('/{subKriteria}', [SubKriteriaController::class, 'destroy'])->name('destroy');
                    Route::post('/update-urutan', [SubKriteriaController::class, 'updateUrutan'])->name('update-urutan');
                });
            });
        }); // Penutup admin prefix
    }); // Penutup role:admin middleware

    Route::middleware(['role:kepala_sekolah'])->group(function () {
        Route::prefix('kepsek')->group(function () {
            Route::get('/evaluasi-form', [EvaluasiFormController::class, 'index'])->name('kepsek.evaluasi-form.index');
            Route::get('/evaluasi-form/create/{guruId}', [EvaluasiFormController::class, 'create'])->name('kepsek.evaluasi-form.create');
            Route::post('/evaluasi-form', [EvaluasiFormController::class, 'store'])->name('kepsek.evaluasi-form.store');
            Route::get('/evaluasi-form/{id}', [EvaluasiFormController::class, 'show'])->name('kepsek.evaluasi-form.show');
            Route::get('/evaluasi-form/{id}/edit', [EvaluasiFormController::class, 'edit'])->name('kepsek.evaluasi-form.edit');
            Route::put('/evaluasi-form/{id}', [EvaluasiFormController::class, 'update'])->name('kepsek.evaluasi-form.update');
            Route::get('/evaluasi-form/{id}/export', [EvaluasiFormController::class, 'export'])->name('kepsek.evaluasi-form.export');

            Route::prefix('rekomendasi')->group(function () {
                Route::get('', [RekomendasiController::class, 'index'])->name('rekomendasi.index');
                Route::get('/create', [RekomendasiController::class, 'create'])->name('rekomendasi.create');
                Route::post('', [RekomendasiController::class, 'store'])->name('rekomendasi.store');
                Route::get('/{rekomendasi}', [RekomendasiController::class, 'show'])->name('rekomendasi.show');
                Route::get('/{rekomendasi}/edit', [RekomendasiController::class, 'edit'])->name('rekomendasi.edit');
                Route::put('/{rekomendasi}', [RekomendasiController::class, 'update'])->name('rekomendasi.update');
                Route::put('/{rekomendasi}/change-status', [RekomendasiController::class, 'changeStatus'])->name('rekomendasi.change-status');
                Route::delete('/{rekomendasi}', [RekomendasiController::class, 'destroy'])->name('rekomendasi.destroy');
            });
        });
    });

    Route::middleware(['role:guru'])->group(function () {
        Route::get('/evaluasi-rekan', [EvaluasiRekanController::class, 'index'])
            ->name('evaluasi-rekan.index');
        Route::get('/evaluasi-rekan/create/{guruId}', [EvaluasiRekanController::class, 'create'])
            ->name('evaluasi-rekan.create');
        Route::post('/evaluasi-rekan', [EvaluasiRekanController::class, 'store'])
            ->name('evaluasi-rekan.store');
        Route::get('/evaluasi-rekan/{id}', [EvaluasiRekanController::class, 'show'])
            ->name('evaluasi-rekan.show');
        Route::get('/evaluasi-rekan/{id}/edit', [EvaluasiRekanController::class, 'edit'])
            ->name('evaluasi-rekan.edit');
        Route::put('/evaluasi-rekan/{id}', [EvaluasiRekanController::class, 'update'])
            ->name('evaluasi-rekan.update');
        Route::get('/hasil-evaluasi-saya', [App\Http\Controllers\Guru\HasilEvaluasiController::class, 'index'])
            ->name('hasil-evaluasi-saya.index');
        Route::get('/hasil-evaluasi-saya/{id}', [App\Http\Controllers\Guru\HasilEvaluasiController::class, 'show'])
            ->name('hasil-evaluasi-saya.show');
    });

    Route::middleware(['auth', 'role:siswa'])->prefix('evaluasi-guru')->name('evaluasi-guru.')->group(function () {
        Route::get('/', [App\Http\Controllers\Siswa\EvaluasiGuruController::class, 'index'])->name('index');
        Route::get('/create/{guruId}', [App\Http\Controllers\Siswa\EvaluasiGuruController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Siswa\EvaluasiGuruController::class, 'store'])->name('store');
        Route::get('/{id}', [App\Http\Controllers\Siswa\EvaluasiGuruController::class, 'show'])->name('show');
        Route::get('/{id}/edit', [App\Http\Controllers\Siswa\EvaluasiGuruController::class, 'edit'])->name('edit');
        Route::put('/{id}', [App\Http\Controllers\Siswa\EvaluasiGuruController::class, 'update'])->name('update');
        Route::get('/{id}/export', [App\Http\Controllers\Siswa\EvaluasiGuruController::class, 'export'])->name('export');
        Route::get('/guru/{guruId}', [App\Http\Controllers\Siswa\EvaluasiGuruController::class, 'viewByGuru'])->name('view-by-guru');
    });
}); // Penutup auth middleware

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
Route::get('/inactive-account', [AuthenticatedSessionController::class, 'inactiveAccount'])
    ->name('inactive-account');