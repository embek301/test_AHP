<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\Rekomendasi;
use App\Models\PeriodeEvaluasi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RekomendasiController extends Controller
{
    /**
     * Tampilkan daftar rekomendasi
     */
    public function index(Request $request)
    {
        // Filter berdasarkan periode jika ada
        $periodeId = $request->input('periode_id');
        $guruId = $request->input('guru_id');
        
        // Gunakan eager loading yang lebih eksplisit
        $rekomendasiQuery = Rekomendasi::query();
        
        // Eager load relasi
        $rekomendasiQuery->with(['guru.user', 'pembuat']);
        
        // Load periode_evaluasi secara terpisah untuk memastikan data terload
        $rekomendasiQuery->with('periodeEvaluasi');
        
        // Filter data jika ada
        if ($periodeId && $periodeId !== '_all') {
            $rekomendasiQuery->where('periode_evaluasi_id', $periodeId);
        }
        
        if ($guruId && $guruId !== '_all') {
            $rekomendasiQuery->where('guru_id', $guruId);
        }
        
        // Ambil data rekomendasi
        $rekomendasi = $rekomendasiQuery->orderBy('created_at', 'desc')->get();
        
        // Log untuk debugging
        \Log::info('Rekomendasi loaded:', [
            'count' => $rekomendasi->count(),
            'has_periode' => $rekomendasi->first() ? ($rekomendasi->first()->periodeEvaluasi ? true : false) : 'no data'
        ]);
        
        // Muat secara manual periode evaluasi yang tidak terload
        foreach ($rekomendasi as $item) {
            if (!$item->periodeEvaluasi) {
                $periode = PeriodeEvaluasi::find($item->periode_evaluasi_id);
                if ($periode) {
                    // Isi relasi secara manual
                    $item->setRelation('periodeEvaluasi', $periode);
                    \Log::info('Manually loaded periode for rekomendasi ' . $item->id);
                } else {
                    \Log::warning('Periode not found for rekomendasi ' . $item->id . ' with periode_id ' . $item->periode_evaluasi_id);
                }
            }
        }
        
        // Load data guru dan periode untuk filter
        $guru = Guru::with('user')->get();
        $periodeEvaluasi = PeriodeEvaluasi::orderBy('tanggal_mulai', 'desc')->get();
        
        return Inertia::render('Rekomendasi/index', [
            'rekomendasi' => $rekomendasi,
            'guru' => $guru,
            'periodeEvaluasi' => $periodeEvaluasi,
            'filters' => [
                'periode_id' => $periodeId && $periodeId !== '_all' ? $periodeId : null,
                'guru_id' => $guruId && $guruId !== '_all' ? $guruId : null,
            ]
        ]);
    }

    /**
     * Tampilkan form tambah rekomendasi
     */
    public function create(Request $request)
    {
        $guruId = $request->input('guru_id');
        $periodeId = $request->input('periode_id');

        $guru = Guru::with('user')->get();
        $periodeEvaluasi = PeriodeEvaluasi::where('status', 'aktif')
            ->orderBy('tanggal_mulai', 'desc')
            ->get();

        return Inertia::render('Rekomendasi/create', [
            'guru' => $guru,
            'periodeEvaluasi' => $periodeEvaluasi,
            'selectedGuruId' => $guruId,
            'selectedPeriodeId' => $periodeId,
        ]);
    }

    /**
     * Simpan rekomendasi baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guru_id' => 'required|exists:tm_guru,id',
            'periode_evaluasi_id' => 'required|exists:tt_periode_evaluasi,id',
            'konten' => 'required|string|min:10',
        ], [
            'guru_id.required' => 'Guru wajib dipilih',
            'periode_evaluasi_id.required' => 'Periode evaluasi wajib dipilih',
            'konten.required' => 'Konten rekomendasi wajib diisi',
            'konten.min' => 'Konten rekomendasi minimal 10 karakter',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Rekomendasi::create([
            'guru_id' => $request->guru_id,
            'periode_evaluasi_id' => $request->periode_evaluasi_id,
            'konten' => $request->konten,
            'dibuat_oleh' => Auth::id(),
            'status' => 'draft',
        ]);

        return redirect()->route('rekomendasi.index')
            ->with('message', 'Rekomendasi berhasil disimpan');
    }

    /**
     * Tampilkan form edit rekomendasi
     */
    public function edit(Rekomendasi $rekomendasi)
    {
        // Hanya pembuat rekomendasi atau admin yang dapat mengedit
        if (Auth::user()->roles[0]->name !== 'admin' && $rekomendasi->dibuat_oleh !== Auth::id()) {
            return redirect()->route('rekomendasi.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit rekomendasi ini');
        }

        $guru = Guru::with('user')->get();
        $periodeEvaluasi = PeriodeEvaluasi::orderBy('tanggal_mulai', 'desc')->get();

        return Inertia::render('Rekomendasi/edit', [
            'rekomendasi' => $rekomendasi,
            'guru' => $guru,
            'periodeEvaluasi' => $periodeEvaluasi,
        ]);
    }

    /**
     * Update rekomendasi
     */
    public function update(Request $request, Rekomendasi $rekomendasi)
    {
        // Hanya pembuat rekomendasi atau admin yang dapat mengedit
        if (Auth::user()->roles[0]->name !== 'admin' && $rekomendasi->dibuat_oleh !== Auth::id()) {
            return redirect()->route('rekomendasi.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit rekomendasi ini');
        }

        $validator = Validator::make($request->all(), [
            'konten' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $rekomendasi->update([
            'konten' => $request->konten,
        ]);

        return redirect()->route('rekomendasi.index')
            ->with('message', 'Rekomendasi berhasil diperbarui');
    }

    /**
     * Ubah status rekomendasi
     */
    public function changeStatus(Request $request, Rekomendasi $rekomendasi)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,disetujui,ditolak,implementasi',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $rekomendasi->update([
            'status' => $request->status,
        ]);

        $statusLabels = [
            'draft' => 'disimpan sebagai draft',
            'disetujui' => 'disetujui',
            'ditolak' => 'ditolak',
            'implementasi' => 'diubah ke status implementasi'
        ];

        $statusText = $statusLabels[$request->status] ?? 'diperbarui';

        return back()->with('message', "Rekomendasi berhasil $statusText");
    }

    /**
     * Hapus rekomendasi
     */
    public function destroy(Rekomendasi $rekomendasi)
    {
        // Hanya pembuat rekomendasi atau admin yang dapat menghapus
        if (Auth::user()->roles[0]->name !== 'admin' && $rekomendasi->dibuat_oleh !== Auth::id()) {
            return redirect()->route('rekomendasi.index')
                ->with('error', 'Anda tidak memiliki akses untuk menghapus rekomendasi ini');
        }

        $rekomendasi->delete();

        return back()->with('message', 'Rekomendasi berhasil dihapus');
    }

    /**
     * Lihat detail rekomendasi
     */
    public function show(Rekomendasi $rekomendasi)
    {
        $rekomendasi->load(['guru.user', 'periodeEvaluasi', 'pembuat']);

        return Inertia::render('Rekomendasi/show', [
            'rekomendasi' => $rekomendasi
        ]);
    }
}
