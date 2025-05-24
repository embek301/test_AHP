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
        Schema::create('tt_detail_evaluasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluasi_id')->constrained('tt_evaluasi');
            $table->foreignId('kriteria_id')->constrained('tm_kriteria');
            $table->decimal('nilai', 5, 2);
            $table->text('komentar')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_detail_evaluasi');
    }
};
