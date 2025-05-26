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
    rata_rata: number;
    kriteria: {
        id: number;
        nama: string;
        deskripsi: string;
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
    const [activeTab, setActiveTab] = useState("overview");

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
        if (nilai >= 4) return "text-green-600";
        if (nilai >= 3) return "text-blue-600";
        if (nilai >= 2) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBgClass = (nilai: number) => {
        if (nilai >= 4) return "bg-green-100";
        if (nilai >= 3) return "bg-blue-100";
        if (nilai >= 2) return "bg-amber-100";
        return "bg-red-100";
    };

    const formatNilai = (nilai: number | null | undefined): string => {
        if (nilai === null || nilai === undefined) return '-';
        return nilai.toFixed(2);
    };

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
                    <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center p-6">
                        <div className="flex items-center mb-4 md:mb-0">
                            <Calendar className="h-10 w-10 text-indigo-500 mr-4" />
                            <div>
                                <p className="font-medium text-lg">{periodeEvaluasi.judul}</p>
                                <p className="text-gray-500">
                                    {format(new Date(periodeEvaluasi.tanggal_mulai), 'dd MMMM yyyy', { locale: id })} -{' '}
                                    {format(new Date(periodeEvaluasi.tanggal_selesai), 'dd MMMM yyyy', { locale: id })}
                                </p>
                            </div>
                        </div>
                        <Badge className={`${periodeEvaluasi.status === 'aktif' ? 
                            'bg-green-100 text-green-800 border-green-200' : 
                            'bg-blue-100 text-blue-800 border-blue-200'}`}
                        >
                            {periodeEvaluasi.status === 'aktif' ? 'Aktif' : 'Selesai'}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-800">Nilai dari Siswa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasilEvaluasi.nilai_siswa !== null ? (
                                <div className="flex items-end justify-between">
                                    <span className={`text-3xl font-bold ${getScoreClass(hasilEvaluasi.nilai_siswa)}`}>
                                        {hasilEvaluasi.nilai_siswa.toFixed(2)}
                                    </span>
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
                            {hasilEvaluasi.nilai_rekan !== null ? (
                                <div className="flex items-end justify-between">
                                    <span className={`text-3xl font-bold ${getScoreClass(hasilEvaluasi.nilai_rekan)}`}>
                                        {hasilEvaluasi.nilai_rekan.toFixed(2)}
                                    </span>
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
                            {hasilEvaluasi.nilai_pengawas !== null ? (
                                <div className="flex items-end justify-between">
                                    <span className={`text-3xl font-bold ${getScoreClass(hasilEvaluasi.nilai_pengawas)}`}>
                                        {hasilEvaluasi.nilai_pengawas.toFixed(2)}
                                    </span>
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
                            {hasilEvaluasi.nilai_akhir !== null ? (
                                <div className="flex items-end justify-between">
                                    <span className={`text-3xl font-bold ${getScoreClass(hasilEvaluasi.nilai_akhir)}`}>
                                        {hasilEvaluasi.nilai_akhir.toFixed(2)}
                                    </span>
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
                            <FileBarChart className="h-4 w-4 mr-2" />
                            Ringkasan
                        </TabsTrigger>
                        <TabsTrigger value="detail">
                            <FileText className="h-4 w-4 mr-2" />
                            Detail Penilaian
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <ChartBar className="h-4 w-4 mr-2" />
                            Riwayat Nilai
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                                ) : (
                                                    typeof profileGuru.mata_pelajaran === 'object' &&
                                                    profileGuru.mata_pelajaran !== null &&
                                                    'nama' in profileGuru.mata_pelajaran ? (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                            {(profileGuru.mata_pelajaran as { id: number; nama: string }).nama}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">Format mata pelajaran tidak valid</span>
                                                    )
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
                                    <CardDescription>
                                        Ringkasan nilai per kategori penilaian
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {detailKategori.map(kategori => (
                                        <div key={kategori.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{kategori.kategori}</p>
                                                <p className={`font-semibold ${getScoreClass(kategori.rata_rata)}`}>
                                                    {kategori.rata_rata.toFixed(2)}
                                                </p>
                                            </div>
                                            <Progress value={kategori.rata_rata * 20} className="h-2" /> {/* Konversi nilai 0-5 ke 0-100 */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {kategori.kriteria.slice(0, 4).map(kriteria => (
                                                    <div key={kriteria.id} className="text-sm flex justify-between">
                                                        <span className="text-gray-600">{kriteria.nama}</span>
                                                        <span className={getScoreClass(kriteria.nilai_rata_rata)}>
                                                            {kriteria.nilai_rata_rata.toFixed(1)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {kategori.kriteria.length > 4 && (
                                                    <div className="text-sm text-blue-500">
                                                        +{kategori.kriteria.length - 4} kriteria lainnya
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
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
                        {detailKategori.map(kategori => (
                            <Card key={kategori.id}>
                                <CardHeader>
                                    <CardTitle>
                                        <div className="flex items-center justify-between">
                                            <span>{kategori.kategori}</span>
                                            <Badge className={`${getScoreBgClass(kategori.rata_rata)} text-sm`}>
                                                Rata-rata: {kategori.rata_rata.toFixed(2)}
                                            </Badge>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {kategori.kriteria.map(kriteria => (
                                            <div key={kriteria.id} className="rounded-lg border p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{kriteria.nama}</h4>
                                                        <p className="text-sm text-gray-500">{kriteria.deskripsi}</p>
                                                    </div>
                                                    <Badge className={`${getScoreBgClass(kriteria.nilai_rata_rata)} text-sm`}>
                                                        {kriteria.nilai_rata_rata.toFixed(2)}
                                                    </Badge>
                                                </div>
                                                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                                                    <div className="rounded-md bg-purple-50 p-2">
                                                        <p className="text-purple-700">Nilai Siswa</p>
                                                        <p className="font-semibold text-purple-900">
                                                            {formatNilai(kriteria.nilai_siswa)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-md bg-blue-50 p-2">
                                                        <p className="text-blue-700">Nilai Rekan</p>
                                                        <p className="font-semibold text-blue-900">
                                                            {formatNilai(kriteria.nilai_rekan)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-md bg-amber-50 p-2">
                                                        <p className="text-amber-700">Nilai Kepala Sekolah</p>
                                                        <p className="font-semibold text-amber-900">
                                                            {formatNilai(kriteria.nilai_pengawas)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                                <CardDescription>
                                    Perkembangan nilai evaluasi Anda dari berbagai periode
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {riwayatNilai.length > 1 ? (
                                    <div className="space-y-4">
                                        {/* Chart will be rendered here if needed */}
                                        <div className="h-64 w-full bg-gray-50 flex items-center justify-center">
                                            <p className="text-sm text-gray-500">Grafik riwayat nilai akan ditampilkan di sini</p>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {riwayatNilai
                                                .sort((a, b) => new Date(b.tanggal_selesai).getTime() - new Date(a.tanggal_selesai).getTime())
                                                .map((item, index) => (
                                                    <div
                                                        key={item.periode_id}
                                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                                            item.periode_id === periodeEvaluasi.id
                                                                ? 'border-2 border-indigo-200 bg-indigo-50'
                                                                : 'border'
                                                        }`}
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.periode_judul}
                                                                {item.periode_id === periodeEvaluasi.id && (
                                                                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
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
                                                                    className={`text-lg font-bold px-3 py-1 rounded-md ${getScoreBgClass(
                                                                        item.nilai_akhir
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
                                    <div className="text-center py-8 text-gray-500">
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