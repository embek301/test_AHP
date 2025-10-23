import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { BarChart3, Calendar, ChevronRight, FileBarChart, Star } from 'lucide-react';

// Interface untuk data yang diterima dari backend
interface HasilEvaluasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    nilai_siswa: number | string | null;
    nilai_rekan: number | string | null;
    nilai_pengawas: number | string | null;
    nilai_akhir: number | string | null;
    periode_evaluasi: {
        id: number;
        judul: string;
        tanggal_mulai: string;
        tanggal_selesai: string;
        status: 'draft' | 'aktif' | 'selesai';
    };
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

interface HasilEvaluasiStats {
    total_periode: number;
    rata_rata_nilai: number | null;
    perkembangan: 'naik' | 'tetap' | 'turun' | null;
    persentase_perkembangan: number | null;
}

interface HasilEvaluasiIndexProps extends PageProps {
    hasilEvaluasiList: HasilEvaluasi[];
    periodeList: PeriodeEvaluasi[];
    profileGuru: GuruProfile;
    stats: HasilEvaluasiStats;
    message?: string;
    error?: string;
}

export default function HasilEvaluasiIndex({
    hasilEvaluasiList = [],
    periodeList = [],
    profileGuru,
    stats,
    message,
    error,
}: HasilEvaluasiIndexProps) {
    useEffect(() => {
        if (message) {
            toast.success(message);
        }

        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    // ✅ Perbaikan fungsi formatNilai agar tidak error toFixed
    const formatNilai = (nilai: number | string | null): string => {
        if (nilai === null || nilai === undefined || nilai === '') return '-';
        const num = Number(nilai);
        return isNaN(num) ? '-' : num.toFixed(2);
    };

    // Fungsi untuk menentukan warna badge berdasarkan status
    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'selesai':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200';
        }
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
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hasil Evaluasi Saya" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4">
                {/* Header section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-indigo-800">Hasil Evaluasi Kinerja</h1>
                        <p className="mt-2 text-indigo-600">
                            Lihat hasil dan perkembangan evaluasi kinerja Anda dari berbagai periode
                        </p>
                    </div>
                </div>

                {/* Profile dan statistik */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Kartu profil */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Profil Guru
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

                    {/* Kartu statistik */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-indigo-500" />
                                Ringkasan Evaluasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <p className="text-sm text-blue-600">Total Periode Evaluasi</p>
                                    <p className="text-3xl font-bold text-blue-700">{stats.total_periode}</p>
                                </div>

                                <div className="rounded-lg bg-indigo-50 p-4">
                                    <p className="text-sm text-indigo-600">Rata-rata Nilai</p>
                                    <p className="text-3xl font-bold text-indigo-700">
                                        {stats.rata_rata_nilai ? stats.rata_rata_nilai.toFixed(2) : '-'}
                                    </p>
                                </div>
                            </div>

                            {stats.perkembangan && (
                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-gray-600">Perkembangan dari periode sebelumnya</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`${
                                                stats.perkembangan === 'naik'
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : stats.perkembangan === 'turun'
                                                    ? 'bg-red-100 text-red-800 border-red-200'
                                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}
                                        >
                                            {stats.perkembangan === 'naik'
                                                ? '↑ Naik'
                                                : stats.perkembangan === 'turun'
                                                ? '↓ Turun'
                                                : '→ Tetap'}
                                            {stats.persentase_perkembangan
                                                ? ` ${stats.persentase_perkembangan.toFixed(1)}%`
                                                : ''}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Daftar hasil evaluasi */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileBarChart className="h-5 w-5 text-indigo-500" />
                            Daftar Hasil Evaluasi
                        </CardTitle>
                        <CardDescription>
                            Daftar hasil evaluasi kinerja Anda dari berbagai periode evaluasi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableCaption>Daftar hasil evaluasi kinerja</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Periode Evaluasi</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Nilai Siswa</TableHead>
                                    <TableHead>Nilai Rekan</TableHead>
                                    <TableHead>Nilai Kepala Sekolah</TableHead>
                                    <TableHead className="text-right">Nilai Akhir</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hasilEvaluasiList.length > 0 ? (
                                    hasilEvaluasiList.map((hasil) => (
                                        <TableRow key={hasil.id}>
                                            <TableCell>
                                                <div>
                                                    {hasil.periode_evaluasi.judul}
                                                    <Badge
                                                        variant="outline"
                                                        className={`ml-2 ${getStatusBadgeStyle(hasil.periode_evaluasi.status)}`}
                                                    >
                                                        {hasil.periode_evaluasi.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {format(new Date(hasil.periode_evaluasi.tanggal_mulai), 'dd MMM yyyy', { locale: id })} -{' '}
                                                    {format(new Date(hasil.periode_evaluasi.tanggal_selesai), 'dd MMM yyyy', { locale: id })}
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatNilai(hasil.nilai_siswa)}</TableCell>
                                            <TableCell>{formatNilai(hasil.nilai_rekan)}</TableCell>
                                            <TableCell>{formatNilai(hasil.nilai_pengawas)}</TableCell>
                                            <TableCell className="font-bold text-right">
                                                {hasil.nilai_akhir !== null ? (
                                                    <span
                                                        className={`rounded-md px-2 py-1 ${
                                                            Number(hasil.nilai_akhir) >= 4
                                                                ? 'bg-green-100 text-green-800'
                                                                : Number(hasil.nilai_akhir) >= 3
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : Number(hasil.nilai_akhir) >= 2
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {formatNilai(hasil.nilai_akhir)}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={route('hasil-evaluasi-saya.show', hasil.id)}>
                                                        Detail <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            Belum ada hasil evaluasi.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {periodeList.some(periode => periode.status === 'aktif') && !hasilEvaluasiList.some(hasil => hasil.periode_evaluasi.status === 'aktif') && (
                        <CardFooter className="border-t bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <p className="text-sm font-medium">Ada periode evaluasi yang sedang aktif</p>
                                    <p className="text-xs text-gray-500">
                                        Laporan hasil evaluasi akan tersedia setelah periode evaluasi selesai
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('evaluasi-rekan.index')}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Evaluasi Rekan
                                    </Link>
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* Periode yang belum memiliki hasil */}
                {periodeList.filter(periode => 
                    periode.status === 'selesai' && 
                    !hasilEvaluasiList.some(hasil => hasil.periode_evaluasi_id === periode.id)
                ).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-amber-500" />
                                Periode Evaluasi Lainnya
                            </CardTitle>
                            <CardDescription>
                                Periode evaluasi yang telah selesai namun belum memiliki hasil evaluasi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {periodeList
                                    .filter(periode => 
                                        periode.status === 'selesai' && 
                                        !hasilEvaluasiList.some(hasil => hasil.periode_evaluasi_id === periode.id)
                                    )
                                    .map(periode => (
                                        <div key={periode.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <p className="font-medium">{periode.judul}</p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(periode.tanggal_mulai), 'dd MMM yyyy', { locale: id })} -{' '}
                                                    {format(new Date(periode.tanggal_selesai), 'dd MMM yyyy', { locale: id })}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={getStatusBadgeStyle(periode.status)}>
                                                {periode.status}
                                            </Badge>
                                        </div>
                                    ))
                                }
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
