import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { ChevronLeft, GraduationCap } from 'lucide-react';

import GuruEvaluasiForm from './GuruEvaluasiForm';

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
    mata_pelajaran?: MataPelajaran;  // ✅ Objek tunggal, bukan array
}

interface Kriteria {
    id: number;
    nama: string;
    deskripsi: string;
    bobot: number;
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: 'draft' | 'aktif' | 'selesai';
}

interface CreateEvaluasiProps extends PageProps {
    guru: Guru;
    kriteriaList: Kriteria[];
    periodeAktif: PeriodeEvaluasi;
    message?: string;
    error?: string;
}

export default function CreateEvaluasi({ guru, kriteriaList, periodeAktif, message, error }: CreateEvaluasiProps) {
    // Efek untuk notifikasi toast
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    // Handler tombol kembali
    const handleBack = () => {
        router.get(route('evaluasi-rekan.index'));
    };

    // Breadcrumbs untuk navigasi
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Evaluasi Rekan',
            href: route('evaluasi-rekan.index'),
        },
        {
            title: 'Evaluasi Baru',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Evaluasi Rekan - ${guru.user.name}`} />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header dengan tombol kembali */}
                <div className="mb-6 flex items-center">
                    <Button variant="outline" size="icon" className="mr-4" onClick={handleBack}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Form Evaluasi Rekan Guru</h1>
                        <p className="text-gray-500">Periode: {periodeAktif.judul}</p>
                    </div>
                </div>

                {/* Kartu Informasi Guru */}
                <Card className="mb-6">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                                <GraduationCap className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <CardTitle>{guru.user.name}</CardTitle>
                                <CardDescription className="flex flex-col gap-1">
                                    <span>NIP: {guru.nip}</span>
                                    <span>Email: {guru.user.email}</span>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {guru.mata_pelajaran ? (
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                {guru.mata_pelajaran.nama}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">Belum ada mata pelajaran</span>
                                        )}
                                    </div>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <GuruEvaluasiForm 
                            guru={guru} 
                            kriteriaList={kriteriaList} 
                            periodeAktif={periodeAktif} 
                            mode="create" 
                            onClose={handleBack} 
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}