<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hasil Evaluasi Guru</title>
    <style>
        /* Reset margins and set base font */
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            margin: 1cm;
            color: #333;
        }
        
        /* Header with logo and text side by side */
        .header {
            width: 100%;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
            padding-bottom: 10px;
        }
        
        .header-kop {
            text-align: center;
            margin-bottom: 5px;
        }
        
        .header-kop .logo {
            width: 80px;
            height: auto;
        }
        
        .header-kop .title {
            font-size: 16pt;
            font-weight: bold;
            color: #1e3a8a;
            margin: 5px 0;
        }
        
        .header-kop .subtitle {
            font-size: 8pt;
            margin: 3px 0;
        }
        
        .doc-title {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            padding: 10px;
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            margin: 15px 0;
        }
        
        /* Section styling */
        .section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-weight: bold;
            color: #1e40af;
            font-size: 12pt;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .info-table {
            margin-bottom: 15px;
        }
        
        .info-table td {
            padding: 5px 0;
            vertical-align: top;
        }
        
        .info-label {
            width: 25%;
            font-weight: bold;
            color: #475569;
        }
        
        .info-divider {
            width: 2%;
            text-align: center;
        }
        
        .criteria-table {
            border: 1px solid #cbd5e1;
            margin: 10px 0;
        }
        
        .criteria-table th, 
        .criteria-table td {
            border: 1px solid #cbd5e1;
            padding: 8px;
        }
        
        .criteria-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #334155;
            text-align: center;
        }
        
        .criteria-table td {
            vertical-align: middle;
        }
        
        .criteria-main {
            background-color: #f8fafc;
            font-weight: bold;
        }
        
        .criteria-sub {
            padding-left: 20px;
        }
        
        /* Score display */
        .score-container {
            display: block;
            text-align: center;
            margin: 20px 0;
        }
        
        .score-box {
            display: inline-block;
            width: 70px;
            height: 70px;
            line-height: 70px;
            text-align: center;
            font-size: 20pt;
            font-weight: bold;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            margin-right: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .score-category {
            display: inline-block;
            padding: 5px 15px;
            font-weight: bold;
            border-radius: 5px;
            vertical-align: middle;
        }
        
        /* Notes section */
        .notes-title {
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
        }
        
        .notes-box {
            border: 1px solid #e2e8f0;
            padding: 10px;
            background-color: #f8fafc;
            border-radius: 5px;
            min-height: 60px;
        }
        
        /* Footer */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 8pt;
            text-align: center;
            color: #64748b;
            padding: 5px;
            border-top: 1px solid #e2e8f0;
        }
        
        /* Signature */
        .signature {
            margin-top: 30px;
            text-align: right;
        }
        
        .signature-date {
            margin-bottom: 50px;
        }
        
        .signature-name {
            border-top: 1px solid #000;
            display: inline-block;
            padding-top: 5px;
            font-weight: bold;
            min-width: 200px;
            text-align: center;
        }
        
        /* Utility classes */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        /* Colors */
        .text-red { color: #b91c1c; }
        .text-orange { color: #c2410c; }
        .text-yellow { color: #a16207; }
        .text-blue { color: #1e40af; }
        .text-green { color: #15803d; }
        
        .bg-red { 
            background-color: #fee2e2; 
            border: 1px solid #fecaca;
        }
        .bg-orange { 
            background-color: #ffedd5; 
            border: 1px solid #fed7aa;
        }
        .bg-yellow { 
            background-color: #fef3c7; 
            border: 1px solid #fde68a;
        }
        .bg-blue { 
            background-color: #dbeafe; 
            border: 1px solid #bfdbfe;
        }
        .bg-green { 
            background-color: #dcfce7; 
            border: 1px solid #bbf7d0;
        }
        
        /* Page break utility */
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <!-- Static header - not fixed positioned -->
    <div class="header">
        <div class="header-kop">
            <img src="https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-destra.png" alt="Logo" class="logo">
            <div class="title">SMK IGASAR PINDAD BANDUNG</div>
            <div class="subtitle">Jl. Cisaranten Kulon No.17, Cisaranten Kulon, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293</div>
            <div class="subtitle">Telp: (022) 7800587 | Email: smkigasarpindad@gmail.com</div>
        </div>
    </div>
    
    <div class="doc-title">HASIL EVALUASI KINERJA GURU</div>

    <!-- Informasi Guru & Periode -->
    <div class="section">
        <div class="section-title">INFORMASI UMUM</div>
        <table class="info-table">
            <tr>
                <td class="info-label">NIP</td>
                <td class="info-divider">:</td>
                <td>{{ $evaluasi->guru->nip }}</td>
            </tr>
            <tr>
                <td class="info-label">Nama Guru</td>
                <td class="info-divider">:</td>
                <td>{{ $evaluasi->guru->user->name }}</td>
            </tr>
            <tr>
                <td class="info-label">Mata Pelajaran</td>
                <td class="info-divider">:</td>
                <td>
                    @if(isset($evaluasi->guru->mataPelajaran))
                        @if(is_array($evaluasi->guru->mataPelajaran) || $evaluasi->guru->mataPelajaran instanceof \Illuminate\Support\Collection)
                            {{ $evaluasi->guru->mataPelajaran->pluck('nama')->join(', ') }}
                        @else
                            {{ $evaluasi->guru->mataPelajaran->nama }}
                        @endif
                    @else
                        -
                    @endif
                </td>
            </tr>
            <tr>
                <td class="info-label">Periode Evaluasi</td>
                <td class="info-divider">:</td>
                <td>{{ $periodeEvaluasi->judul }}</td>
            </tr>
            <tr>
                <td class="info-label">Tanggal Evaluasi</td>
                <td class="info-divider">:</td>
                <td>{{ \Carbon\Carbon::parse($evaluasi->created_at)->locale('id')->isoFormat('D MMMM YYYY') }}</td>
            </tr>
            <tr>
                <td class="info-label">Evaluator</td>
                <td class="info-divider">:</td>
                <td>{{ $evaluasi->evaluator->name }} ({{ ucfirst($evaluasi->jenis) }})</td>
            </tr>
        </table>
    </div>

    <!-- Hasil Evaluasi -->
    <div class="section">
        <div class="section-title">HASIL PENILAIAN</div>
        
        <div class="score-container">
            <div class="score-box">{{ number_format($nilaiRataRata, 1) }}</div>
            <div class="score-category 
                @if($nilaiRataRata >= 4.5) text-green bg-green
                @elseif($nilaiRataRata >= 3.5) text-blue bg-blue
                @elseif($nilaiRataRata >= 2.5) text-yellow bg-yellow
                @elseif($nilaiRataRata >= 1.5) text-orange bg-orange
                @else text-red bg-red
                @endif">
                @if($nilaiRataRata >= 4.5) Sangat Baik
                @elseif($nilaiRataRata >= 3.5) Baik
                @elseif($nilaiRataRata >= 2.5) Cukup
                @elseif($nilaiRataRata >= 1.5) Kurang
                @else Sangat Kurang
                @endif
            </div>
        </div>

        <table class="criteria-table">
            <thead>
                <tr>
                    <th width="5%">No</th>
                    <th width="40%">Kriteria Penilaian</th>
                    <th width="15%">Bobot</th>
                    <th width="15%">Nilai</th>
                    <th width="25%">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $no = 1;
                @endphp
                @foreach($detailByKategori as $kategori => $details)
                    @foreach($details as $detail)
                        @if($detail->subKriteria)
                            {{-- Jika ada sub kriteria, tampilkan sub kriteria --}}
                            <tr class="criteria-sub">
                                <td class="text-center">{{ $no++ }}</td>
                                <td class="criteria-sub">
                                    <span style="color: #7c3aed; font-size: 9pt; display: block; margin-bottom: 2px;">
                                        {{ $detail->kriteria->nama }}
                                    </span>
                                    {{ $detail->subKriteria->nama }}
                                </td>
                                <td class="text-center">{{ $detail->subKriteria->bobot }}%</td>
                                <td class="text-center"><strong>{{ number_format($detail->nilai, 1) }}</strong></td>
                                <td class="text-center">
                                    @if($detail->nilai >= 4.5)
                                        <span class="text-green">Sangat Baik</span>
                                    @elseif($detail->nilai >= 3.5)
                                        <span class="text-blue">Baik</span>
                                    @elseif($detail->nilai >= 2.5)
                                        <span class="text-yellow">Cukup</span>
                                    @elseif($detail->nilai >= 1.5)
                                        <span class="text-orange">Kurang</span>
                                    @else
                                        <span class="text-red">Sangat Kurang</span>
                                    @endif
                                </td>
                            </tr>
                        @else
                            {{-- Jika tidak ada sub kriteria, tampilkan kriteria utama --}}
                            <tr>
                                <td class="text-center">{{ $no++ }}</td>
                                <td>{{ $detail->kriteria->nama }}</td>
                                <td class="text-center">{{ $detail->kriteria->bobot }}%</td>
                                <td class="text-center"><strong>{{ number_format($detail->nilai, 1) }}</strong></td>
                                <td class="text-center">
                                    @if($detail->nilai >= 4.5)
                                        <span class="text-green">Sangat Baik</span>
                                    @elseif($detail->nilai >= 3.5)
                                        <span class="text-blue">Baik</span>
                                    @elseif($detail->nilai >= 2.5)
                                        <span class="text-yellow">Cukup</span>
                                    @elseif($detail->nilai >= 1.5)
                                        <span class="text-orange">Kurang</span>
                                    @else
                                        <span class="text-red">Sangat Kurang</span>
                                    @endif
                                </td>
                            </tr>
                        @endif
                    @endforeach
                @endforeach
            </tbody>
        </table>

        <!-- Catatan dan Komentar -->
        <div>
            <div class="notes-title">Catatan dan Saran Perbaikan:</div>
            <div class="notes-box">
                @php
                    $hasComments = false;
                @endphp
                
                @foreach($detailByKategori as $kategori => $details)
                    @foreach($details as $detail)
                        @if($detail->komentar)
                            @php
                                $hasComments = true;
                            @endphp
                            <p>
                                <strong>
                                    @if($detail->subKriteria)
                                        {{ $detail->kriteria->nama }} - {{ $detail->subKriteria->nama }}
                                    @else
                                        {{ $detail->kriteria->nama }}
                                    @endif
                                    :
                                </strong> 
                                {{ $detail->komentar }}
                            </p>
                        @endif
                    @endforeach
                @endforeach

                @if(!$hasComments)
                    <p><em>Tidak ada catatan khusus.</em></p>
                @endif
            </div>
        </div>
        
        <!-- Komentar Umum -->
        @if(isset($evaluasi->komentar_umum) && $evaluasi->komentar_umum)
        <div style="margin-top: 15px;">
            <div class="notes-title">Komentar Umum:</div>
            <div class="notes-box">
                <p>{{ $evaluasi->komentar_umum }}</p>
            </div>
        </div>
        @endif
    </div>

    <!-- Tanda Tangan -->
    <div class="signature">
        <div class="signature-date">
            Bandung, {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM YYYY') }}
        </div>
        <div class="signature-name">
            {{ $evaluasi->evaluator->name }}
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        Dokumen ini dicetak pada tanggal {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM YYYY') }} | Sistem Evaluasi Kinerja Guru SMK Igasar Pindad Bandung
    </div>
</body>
</html>