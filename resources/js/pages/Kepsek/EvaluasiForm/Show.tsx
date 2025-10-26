import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';

import KepsekEvaluasiForm from './KepsekEvaluasiForm';

// Interfaces
interface User {
    id: number;
    name: string;
    email: string;
}

interface Guru {
    id: number;
    nip: string;
    user_id: number;
    user: User;
    mata_pelajaran: {
        id: number;
        nama: string;
    }[];
}

interface SubKriteria {
    id: number;
    kriteria_id: number;
    nama: string;
    deskripsi: string;
    bobot: number;
    urutan: number;
    aktif: boolean;
}

interface Kriteria {
    id: number;
    nama: string;
    deskripsi: string;
    kategori: string;
    bobot: number;
    aktif: boolean;
    sub_kriteria?: SubKriteria[];
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: 'draft' | 'aktif' | 'selesai';
}

interface DetailEvaluasi {
    kriteria_id: number;
    nilai: number;
    komentar?: string;
}

interface Evaluasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    evaluator_id: number;
    status: 'draft' | 'selesai';
    created_at: string;
    updated_at: string;
    detail_evaluasi: DetailEvaluasi[];
}

interface ShowEvaluasiProps extends PageProps {
    guru: Guru;
    kriteriaList: Kriteria[];
    periodeEvaluasi: PeriodeEvaluasi;
    evaluasi: Evaluasi;
    message?: string;
    error?: string;
}

export default function ShowEvaluasi({ 
    guru, 
    kriteriaList, 
    periodeEvaluasi, 
    evaluasi, 
    message, 
    error 
}: ShowEvaluasiProps) {
    // Effect for toast notifications
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    // Breadcrumbs for navigation
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Form Evaluasi',
            href: route('kepsek.evaluasi-form.index'),
        },
        {
            title: 'Detail Evaluasi',
            href: '#',
        },
    ];

    const handleEdit = () => {
        router.get(route('kepsek.evaluasi-form.edit', evaluasi.id));
    };

    const handleBack = () => {
        router.get(route('kepsek.evaluasi-form.index'));
    };

    const downloadPdf = () => {
        if (!evaluasi || !evaluasi.id) {
            toast.error('ID Evaluasi tidak ditemukan');
            return;
        }
        window.open(`/kepsek/evaluasi-form/${evaluasi.id}/export`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Evaluasi ${guru.user.name}`} />
            <Toaster position="top-right" richColors />

            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Detail Hasil Evaluasi</h1>
                    </div>
                    <div className="flex gap-2">
                        {periodeEvaluasi.status === 'aktif' && evaluasi.status !== 'selesai' && (
                            <Button onClick={handleEdit}>
                                Edit Evaluasi
                            </Button>
                        )}
                        <Button variant="outline" onClick={downloadPdf}>
                            <FileText className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar dengan informasi */}
                    <div className="space-y-6">
                        {/* Informasi Guru */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-indigo-600" />
                                    Informasi Guru
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Nama</p>
                                    <p className="font-medium">{guru.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">NIP</p>
                                    <p className="font-medium">{guru.nip}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium break-all text-sm leading-relaxed">
                                        {guru.user.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Mata Pelajaran</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {guru.mata_pelajaran && guru.mata_pelajaran.length > 0 ? (
                                            guru.mata_pelajaran.map((mapel) => (
                                                <span
                                                    key={mapel.id}
                                                    className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                                                >
                                                    {mapel.nama}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">-</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informasi Periode */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                    Periode Evaluasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Judul Periode</p>
                                    <p className="font-medium">{periodeEvaluasi.judul}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium">
                                        {format(new Date(periodeEvaluasi.tanggal_mulai), 'dd MMM yyyy')} -{' '}
                                        {format(new Date(periodeEvaluasi.tanggal_selesai), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status Periode</p>
                                    <span
                                        className={`inline-block px-2 py-1 text-xs rounded-full capitalize
                                        ${
                                            periodeEvaluasi.status === 'aktif'
                                                ? 'bg-green-100 text-green-800'
                                                : periodeEvaluasi.status === 'selesai'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {periodeEvaluasi.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Evaluasi */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                    Status Evaluasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal Evaluasi</p>
                                    <p className="font-medium">
                                        {format(new Date(evaluasi.created_at), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span
                                        className={`inline-block px-2 py-1 text-xs rounded-full capitalize
                                        ${
                                            evaluasi.status === 'selesai'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {evaluasi.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Terakhir Diperbarui</p>
                                    <p className="font-medium">
                                        {format(new Date(evaluasi.updated_at), 'dd MMM yyyy, HH:mm')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main content - form evaluasi dalam mode view */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden">
                            <CardContent className="p-6">
                                <KepsekEvaluasiForm
                                    guru={guru}
                                    kriteriaList={kriteriaList}
                                    periodeAktif={periodeEvaluasi}
                                    evaluasi={evaluasi}
                                    mode="view"
                                    onClose={handleBack}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}