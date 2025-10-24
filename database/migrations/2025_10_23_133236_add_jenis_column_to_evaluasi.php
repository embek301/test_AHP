<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tt_evaluasi', function (Blueprint $table) {
            // Add jenis column after evaluator_id
            $table->enum('jenis', ['siswa', 'rekan', 'kepsek', 'pengawas'])
                  ->after('evaluator_id')
                  ->nullable()
                  ->comment('Jenis evaluasi: siswa, rekan, kepsek, atau pengawas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tt_evaluasi', function (Blueprint $table) {
            $table->dropColumn('jenis');
        });
    }
};