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
            $table->enum('status', ['draft', 'selesai'])->default('draft')->after('guru_id');

            // Tambahkan kolom komentar_umum yang bersifat opsional
            $table->text('komentar_umum')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tt_evaluasi', function (Blueprint $table) {
            $table->dropColumn(['status', 'komentar_umum']);
        });
    }
};
