<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tm_sub_kriteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kriteria_id')->constrained('tm_kriteria')->onDelete('cascade');
            $table->string('nama', 100);
            $table->text('deskripsi')->nullable();
            $table->decimal('bobot', 5, 2)->default(0); // Bobot relatif terhadap kriteria induk
            $table->integer('urutan')->default(0); // Urutan tampilan
            $table->boolean('aktif')->default(true);
            $table->timestamps();
            
            $table->index('kriteria_id');
        });

        // Update tabel tt_detail_evaluasi untuk mendukung sub kriteria
        Schema::table('tt_detail_evaluasi', function (Blueprint $table) {
            $table->foreignId('sub_kriteria_id')->nullable()->after('kriteria_id')
                ->constrained('tm_sub_kriteria')->onDelete('cascade');
            
            $table->index('sub_kriteria_id');
        });
    }

    public function down(): void
    {
        Schema::table('tt_detail_evaluasi', function (Blueprint $table) {
            $table->dropForeign(['sub_kriteria_id']);
            $table->dropColumn('sub_kriteria_id');
        });
        
        Schema::dropIfExists('tm_sub_kriteria');
    }
};