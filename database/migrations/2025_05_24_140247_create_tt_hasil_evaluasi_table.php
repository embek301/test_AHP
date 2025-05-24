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
        Schema::create('tt_hasil_evaluasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->constrained('tm_guru');
            $table->foreignId('periode_evaluasi_id')->constrained('tt_periode_evaluasi');
            $table->decimal('nilai_siswa', 5, 2);
            $table->decimal('nilai_rekan', 5, 2);
            $table->decimal('nilai_pengawas', 5, 2);
            $table->decimal('nilai_akhir', 5, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_hasil_evaluasi');
    }
};
