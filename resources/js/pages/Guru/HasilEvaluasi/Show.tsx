import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { ArrowLeft, Calendar, ChartBar, FileBarChart, FileText, Star, User } from 'lucide-react';

// Interfaces
interface HasilEvaluasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    nilai_siswa: number | null;
    nilai_rekan: number | null;
    nilai_pengawas: number | null;
    nilai_akhir: number | null;
    created_at: string;
    updated_at: string;
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: 'draft' | 'aktif' | 'selesai';
}

interface GuruProfile {
    id: number;
    nip: string;
    user: {
        name: string;
        email: string;
    };
    mata_pelajaran: {
        id: number;
        nama: string;
    };
}

interface DetailKategori {
    id: number;
    kategori: string;
    deskripsi?: string;
    rata_rata: number;
    kriteria: {
        id: number;
        nama: string;
        deskripsi: string;
        urutan?: number;
        bobot?: number;
        nilai_siswa?: number;
        nilai_rekan?: number;
        nilai_pengawas?: number;
        nilai_rata_rata: number;
    }[];
}

interface Rekomendasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    komentar: string;
    created_at: string;
    updated_at: string;
}

interface HasilEvaluasiShowProps extends PageProps {
    hasilEvaluasi: HasilEvaluasi;
    periodeEvaluasi: PeriodeEvaluasi;
    profileGuru: GuruProfile;
    detailKategori: DetailKategori[];
    riwayatNilai: {
        periode_id: number;
        periode_judul: string;
        nilai_akhir: number | null;
        tanggal_selesai: string;
    }[];
    rekomendasi?: Rekomendasi;
    message?: string;
    error?: string;
}

export default function HasilEvaluasiShow({
    hasilEvaluasi,
    periodeEvaluasi,
    profileGuru,
    detailKategori,
    riwayatNilai,
    rekomendasi,
    message,
    error,
}: HasilEvaluasiShowProps) {
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (message) {
            toast.success(message);
        }

        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    const handleBack = () => {
        router.get(route('hasil-evaluasi-saya.index'));
    };

    const getScoreClass = (nilai: number) => {
        if (nilai >= 4) return 'text-green-600';
        if (nilai >= 3) return 'text-blue-600';
        if (nilai >= 2) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBgClass = (nilai: number) => {
        if (nilai >= 4) return 'bg-green-100';
        if (nilai >= 3) return 'bg-blue-100';
        if (nilai >= 2) return 'bg-amber-100';
        return 'bg-red-100';
    };

    const formatNilai = (nilai: number | null | undefined): string => {
        if (nilai === null || nilai === undefined) return '-';
        const numValue = typeof nilai === 'string' ? parseFloat(nilai) : nilai;
        return isNaN(numValue) ? '-' : numValue.toFixed(2);
    };

    // Helper function to safely convert to number
    const toNumber = (value: any): number | null => {
        if (value === null || value === undefined) return null;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? null : num;
    };

    // Convert values to numbers for safe usage
    const nilaiSiswa = toNumber(hasilEvaluasi.nilai_siswa);
    const nilaiRekan = toNumber(hasilEvaluasi.nilai_rekan);
    const nilaiPengawas = toNumber(hasilEvaluasi.nilai_pengawas);
    const nilaiAkhir = toNumber(hasilEvaluasi.nilai_akhir);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Hasil Evaluasi Saya',
            href: route('hasil-evaluasi-saya.index'),
        },
        {
            title: `Detail Hasil - ${periodeEvaluasi.judul}`,
            href: route('hasil-evaluasi-saya.show', hasilEvaluasi.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Hasil Evaluasi - ${periodeEvaluasi.judul}`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4">
                {/* Header with back button */}
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={handleBack} className="mr-4">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Detail Hasil Evaluasi</h1>
                        <p className="text-gray-500">{periodeEvaluasi.judul}</p>
                    </div>
                </div>

                {/* Period Info Card */}
                <Card>
                    <CardContent className="flex flex-col items-start justify-between p-6 md:flex-row md:items-center">
                        <div className="mb-4 flex items-center md:mb-0">
                            <Calendar className="mr-4 h-10 w-10 text-indigo-500" />
                            <div>
                                <p className="text-lg font-medium">{periodeEvaluasi.judul}</p>
                                <p className="text-gray-500">
                                    {format(new Date(periodeEvaluasi.tanggal_mulai), 'dd MMMM yyyy', { locale: id })} -{' '}
                                    {format(new Date(periodeEvaluasi.tanggal_selesai), 'dd MMMM yyyy', { locale: id })}
                                </p>
                            </div>
                        </div>
                        <Badge
                            className={`${
                                periodeEvaluasi.status === 'aktif'
                                    ? 'border-green-200 bg-green-100 text-green-800'
                                    : 'border-blue-200 bg-blue-100 text-blue-800'
                            }`}
                        >
                            {periodeEvaluasi.status === 'aktif' ? 'Aktif' : 'Selesai'}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Score Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-800">Nilai dari Siswa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nilaiSiswa !== null ? (
                                <div className="flex items-end justify-between">
                                    <span className={`text-3xl font-bold ${getScoreClass(nilaiSiswa)}`}>{nilaiSiswa.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500">dari 5.00</span>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic">Belum ada nilai</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800">Nilai dari Rekan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nilaiRekan !== null ? (
                                <div className="flex items-end justify-between">
                                    <span className={`text-3xl font-bold ${getScoreClass(nilaiRekan)}`}>{nilaiRekan.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500">dari 5.00</span>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic">Belum ada nilai</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-800">Nilai dari Kepala Sekolah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nilaiPengawas !== null ? (
                                <div className="flex items-end justify-between">
                                    <span className={`text-3xl font-bold ${getScoreClass(nilaiPengawas)}`}>{nilaiPengawas.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500">dari 5.00</span>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic">Belum ada nilai</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">Nilai Akhir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nilaiAkhir !== null ? (
                                <div className="flex items-end justify-between">
                                    <span className={`text-3xl font-bold ${getScoreClass(nilaiAkhir)}`}>{nilaiAkhir.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500">dari 5.00</span>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic">Belum ada nilai akhir</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                        <TabsTrigger value="overview">
                            <FileBarChart className="mr-2 h-4 w-4" />
                            Ringkasan
                        </TabsTrigger>
                        <TabsTrigger value="detail">
                            <FileText className="mr-2 h-4 w-4" />
                            Detail Penilaian
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <ChartBar className="mr-2 h-4 w-4" />
                            Riwayat Nilai
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left panel - Guru info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-indigo-500" />
                                        Informasi Guru
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nama</p>
                                        <p className="font-medium">{profileGuru.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">NIP</p>
                                        <p className="font-medium">{profileGuru.nip}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Mata Pelajaran</p>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {profileGuru.mata_pelajaran ? (
                                                Array.isArray(profileGuru.mata_pelajaran) && profileGuru.mata_pelajaran.length > 0 ? (
                                                    profileGuru.mata_pelajaran.map((mapel) => (
                                                        <Badge key={mapel.id} variant="outline" className="bg-blue-50 text-blue-700">
                                                            {mapel.nama}
                                                        </Badge>
                                                    ))
                                                ) : typeof profileGuru.mata_pelajaran === 'object' &&
                                                  profileGuru.mata_pelajaran !== null &&
                                                  'nama' in profileGuru.mata_pelajaran ? (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                        {(profileGuru.mata_pelajaran as { id: number; nama: string }).nama}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-500">Format mata pelajaran tidak valid</span>
                                                )
                                            ) : (
                                                <span className="text-xs text-gray-500">Belum ada mata pelajaran</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Right panel - Category performance */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-amber-500" />
                                        Performa per Kategori
                                    </CardTitle>
                                    <CardDescription>Ringkasan nilai per kategori penilaian</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {detailKategori.length > 0 ? (
                                        detailKategori.map((kategori) => (
                                            <div key={kategori.id} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-medium">{kategori.kategori}</p>
                                                    <p className={`text-lg font-semibold ${getScoreClass(kategori.rata_rata)}`}>
                                                        {kategori.rata_rata.toFixed(2)}
                                                    </p>
                                                </div>
                                                <Progress value={kategori.rata_rata * 20} className="h-2" />

                                                {/* Top performing sub-criteria */}
                                                <div className="mt-3 grid grid-cols-1 gap-2">
                                                    {kategori.kriteria
                                                        .sort((a, b) => b.nilai_rata_rata - a.nilai_rata_rata)
                                                        .slice(0, 3)
                                                        .map((kriteria) => (
                                                            <div
                                                                key={kriteria.id}
                                                                className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm transition-colors hover:bg-gray-100"
                                                            >
                                                                <span className="flex items-center gap-2 text-gray-700">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                                                                    {kriteria.nama}
                                                                </span>
                                                                <span className={`font-semibold ${getScoreClass(kriteria.nilai_rata_rata)}`}>
                                                                    {kriteria.nilai_rata_rata.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    {kategori.kriteria.length > 3 && (
                                                        <button
                                                            onClick={() => setActiveTab('detail')}
                                                            className="p-2 text-left text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                                        >
                                                            +{kategori.kriteria.length - 3} sub kriteria lainnya →
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <p>Belum ada data penilaian</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Rekomendasi dari kepala sekolah */}
                            {rekomendasi && (
                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-indigo-500" />
                                            Rekomendasi dari Kepala Sekolah
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <p className="whitespace-pre-wrap">{rekomendasi.komentar}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Detail Tab */}
                    <TabsContent value="detail" className="space-y-4">
                        {detailKategori.map((kategori) => (
                            <Card key={kategori.id}>
                                <CardHeader>
                                    <CardTitle>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span>{kategori.kategori}</span>
                                                {kategori.deskripsi && <p className="mt-1 text-sm font-normal text-gray-500">{kategori.deskripsi}</p>}
                                            </div>
                                            <Badge className={`${getScoreBgClass(kategori.rata_rata)} shrink-0 text-sm`}>
                                                Rata-rata: {kategori.rata_rata.toFixed(2)}
                                            </Badge>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {kategori.kriteria.length > 0 ? (
                                            kategori.kriteria.map((subKriteria, index) => (
                                                <div key={subKriteria.id} className="rounded-lg border p-4 transition-colors hover:border-indigo-300">
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                                                                    {index + 1}
                                                                </span>
                                                                <h4 className="font-medium">{subKriteria.nama}</h4>
                                                            </div>
                                                            {subKriteria.deskripsi && (
                                                                <p className="mt-2 ml-8 text-sm text-gray-500">{subKriteria.deskripsi}</p>
                                                            )}
                                                        </div>
                                                        <Badge className={`${getScoreBgClass(subKriteria.nilai_rata_rata)} ml-4 shrink-0 text-sm`}>
                                                            {subKriteria.nilai_rata_rata.toFixed(2)}
                                                        </Badge>
                                                    </div>

                                                    {/* Progress bar untuk visualisasi */}
                                                    <div className="mb-3 ml-8">
                                                        <Progress value={subKriteria.nilai_rata_rata * 20} className="h-2" />
                                                    </div>

                                                    {/* Breakdown nilai per sumber */}
                                                    <div className="mt-4 ml-8 grid grid-cols-3 gap-2 text-sm">
                                                        <div className="rounded-md border border-purple-100 bg-purple-50 p-3">
                                                            <div className="mb-1 flex items-center gap-1">
                                                                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                                                <p className="font-medium text-purple-700">Nilai Siswa</p>
                                                            </div>
                                                            <p className="text-lg font-bold text-purple-900">
                                                                {formatNilai(subKriteria.nilai_siswa)}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
                                                            <div className="mb-1 flex items-center gap-1">
                                                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                                <p className="font-medium text-blue-700">Nilai Rekan</p>
                                                            </div>
                                                            <p className="text-lg font-bold text-blue-900">{formatNilai(subKriteria.nilai_rekan)}</p>
                                                        </div>
                                                        <div className="rounded-md border border-amber-100 bg-amber-50 p-3">
                                                            <div className="mb-1 flex items-center gap-1">
                                                                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                                                <p className="font-medium text-amber-700">Nilai Kepsek</p>
                                                            </div>
                                                            <p className="text-lg font-bold text-amber-900">
                                                                {formatNilai(subKriteria.nilai_pengawas)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-gray-500">
                                                <p>Belum ada sub kriteria untuk kategori ini</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ChartBar className="h-5 w-5 text-indigo-500" />
                                    Riwayat Nilai
                                </CardTitle>
                                <CardDescription>Perkembangan nilai evaluasi Anda dari berbagai periode</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {riwayatNilai.length > 1 ? (
                                    <div className="space-y-4">
                                        {/* Chart will be rendered here if needed */}
                                        <div className="flex h-64 w-full items-center justify-center bg-gray-50">
                                            <p className="text-sm text-gray-500">Grafik riwayat nilai akan ditampilkan di sini</p>
                                        </div>

                                        <div className="space-y-2">
                                            {riwayatNilai
                                                .sort((a, b) => new Date(b.tanggal_selesai).getTime() - new Date(a.tanggal_selesai).getTime())
                                                .map((item, index) => (
                                                    <div
                                                        key={item.periode_id}
                                                        className={`flex items-center justify-between rounded-lg p-3 ${
                                                            item.periode_id === periodeEvaluasi.id
                                                                ? 'border-2 border-indigo-200 bg-indigo-50'
                                                                : 'border'
                                                        }`}
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.periode_judul}
                                                                {item.periode_id === periodeEvaluasi.id && (
                                                                    <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">
                                                                        Saat ini
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {format(new Date(item.tanggal_selesai), 'dd MMMM yyyy', { locale: id })}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            {item.nilai_akhir !== null ? (
                                                                <span
                                                                    className={`rounded-md px-3 py-1 text-lg font-bold ${getScoreBgClass(
                                                                        item.nilai_akhir,
                                                                    )}`}
                                                                >
                                                                    {item.nilai_akhir.toFixed(2)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-500">Tidak ada nilai</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        <p>Belum ada riwayat nilai dari periode lain untuk dibandingkan.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
