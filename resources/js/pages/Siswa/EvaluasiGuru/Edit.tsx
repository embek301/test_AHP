import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { ChevronLeft, GraduationCap } from 'lucide-react';

import SiswaEvaluasiForm from './SiswaEvaluasiForm';

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
    mata_pelajaran?: {
        id: number;
        nama: string;
    };
}

interface Kriteria {
    id: number;
    nama: string;
    deskripsi: string;
    kategori: string;
    bobot: number;
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
    komentar_umum?: string;
    detail_evaluasi: DetailEvaluasi[];
}

interface EditEvaluasiProps extends PageProps {
    guru: Guru;
    kriteriaList: Kriteria[];
    periodeAktif: PeriodeEvaluasi;
    evaluasi: Evaluasi;
    message?: string;
    error?: string;
}

export default function EditEvaluasi({ guru, kriteriaList, periodeAktif, evaluasi, message, error }: EditEvaluasiProps) {
    // Effect for toast notifications
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    // Handle back button
    const handleBack = () => {
        router.get(route('evaluasi-guru.index'));
    };
    
    // Handle untuk melihat detail
    const handleViewDetail = () => {
        router.get(route('evaluasi-guru.show', evaluasi.id));
    };

    // Breadcrumbs for navigation
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Form Evaluasi Guru',
            href: route('evaluasi-guru.index'),
        },
        {
            title: 'Edit Evaluasi',
            href: route('evaluasi-guru.edit', evaluasi.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Evaluasi - ${guru.user.name}`} />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header dengan tombol kembali */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" className="mr-4" onClick={handleBack}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Form Evaluasi Guru</h1>
                            <p className="text-gray-500">
                                Periode: {periodeAktif.judul}
                            </p>
                        </div>
                    </div>
                    <div>
                        <Button variant="outline" onClick={handleViewDetail}>
                            Lihat Detail
                        </Button>
                    </div>
                </div>

                {/* Kartu Informasi Guru */}
                <Card className="mb-6">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <CardTitle>{guru.user.name}</CardTitle>
                                <CardDescription className="flex flex-col">
                                    <span>NIP: {guru.nip}</span>
                                    <span>Email: {guru.user.email}</span>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {guru.mata_pelajaran ? (
                                            // Periksa apakah mata_pelajaran adalah array
                                            Array.isArray(guru.mata_pelajaran) && guru.mata_pelajaran.length > 0 ? (
                                                guru.mata_pelajaran.map((mapel) => (
                                                    <span key={mapel.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {mapel.nama}
                                                    </span>
                                                ))
                                            ) : (
                                                // Type guard untuk memastikan objek memiliki properti nama
                                                typeof guru.mata_pelajaran === 'object' && 
                                                guru.mata_pelajaran !== null && 
                                                'nama' in guru.mata_pelajaran ? (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {(guru.mata_pelajaran as {id: number, nama: string}).nama}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-500">Format mata pelajaran tidak valid</span>
                                                )
                                            )
                                        ) : (
                                            <span className="text-xs text-gray-500">Belum ada mata pelajaran</span>
                                        )}
                                    </div>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <SiswaEvaluasiForm
                            guru={guru}
                            kriteriaList={kriteriaList}
                            periodeAktif={periodeAktif}
                            evaluasi={evaluasi}
                            mode="edit"
                            onClose={handleBack}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}