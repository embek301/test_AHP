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
        Schema::create('tt_rekomendasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->constrained('tm_guru');
            $table->foreignId('periode_evaluasi_id')->constrained('tt_periode_evaluasi');
            $table->text('konten');
            $table->foreignId('dibuat_oleh')->constrained('users');
            $table->enum('status', ['draft', 'disetujui', 'ditolak', 'implementasi']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_rekomendasi');
    }
};
