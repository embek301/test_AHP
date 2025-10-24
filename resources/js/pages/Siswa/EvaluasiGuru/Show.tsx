import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';

import SiswaEvaluasiForm from './SiswaEvaluasiForm';

// Interfaces
interface User {
    id: number;
    name: string;
    email: string;
}

interface MataPelajaran {
    id: number;
    nama: string;
    kode: string;
}

interface Guru {
    id: number;
    nip: string;
    user_id: number;
    user: User;
    mata_pelajaran?: MataPelajaran | MataPelajaran[];
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
    sub_kriteria_id?: number | null;
    nilai: number;
    komentar?: string;
}

interface Evaluasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    evaluator_id: number;
    status: 'draft' | 'selesai';
    komentar_umum?: string;
    created_at: string;
    updated_at: string;
    detail_evaluasi: DetailEvaluasi[];
}

interface ShowProps extends PageProps {
    evaluasi: Evaluasi;
    guru: Guru;
    periodeEvaluasi: PeriodeEvaluasi;
    kriteriaList: Kriteria[];
    message?: string;
    error?: string;
}

export default function Show({ evaluasi, guru, periodeEvaluasi, kriteriaList, message, error }: ShowProps) {
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Evaluasi Guru',
            href: route('evaluasi-guru.index'),
        },
        {
            title: 'Detail Evaluasi',
            href: route('evaluasi-guru.show', evaluasi.id),
        },
    ];

    const handleEdit = () => {
        router.get(route('evaluasi-guru.edit', evaluasi.id));
    };
    
    const handleBack = () => {
        router.get(route('evaluasi-guru.index'));
    };

    const handleExport = () => {
        window.open(route('evaluasi-guru.export', evaluasi.id), '_blank');
    };

    // Helper function to render mata pelajaran
    const renderMataPelajaran = () => {
        if (!guru.mata_pelajaran) {
            return <span className="text-xs text-gray-500">-</span>;
        }

        if (Array.isArray(guru.mata_pelajaran)) {
            if (guru.mata_pelajaran.length === 0) {
                return <span className="text-xs text-gray-500">-</span>;
            }
            return guru.mata_pelajaran.map((mapel) => (
                <span 
                    key={mapel.id} 
                    className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                >
                    {mapel.nama}
                </span>
            ));
        }

        // Single object
        return (
            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                {guru.mata_pelajaran.nama}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Evaluasi - ${guru.user.name}`} />
            <Toaster position="top-right" richColors />
            
            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleBack}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Detail Evaluasi Guru</h1>
                    </div>
                    <div className="flex gap-2">
                        {periodeEvaluasi.status === 'aktif' && evaluasi.status !== 'selesai' && (
                            <Button onClick={handleEdit}>
                                Edit Evaluasi
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleExport}>
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
                                    <p className="text-sm text-gray-500">Mata Pelajaran</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {renderMataPelajaran()}
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
                                        {format(new Date(periodeEvaluasi.tanggal_mulai), 'dd MMM yyyy')} - {format(new Date(periodeEvaluasi.tanggal_selesai), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status Periode</p>
                                    <span className={`px-2 py-1 text-xs rounded-full capitalize
                                        ${periodeEvaluasi.status === 'aktif' ? 'bg-green-100 text-green-800' : 
                                        periodeEvaluasi.status === 'selesai' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-amber-100 text-amber-800'}`}
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
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`px-2 py-1 text-xs rounded-full capitalize
                                        ${evaluasi.status === 'selesai' ? 'bg-green-100 text-green-800' : 
                                        'bg-amber-100 text-amber-800'}`}
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
                                <SiswaEvaluasiForm
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