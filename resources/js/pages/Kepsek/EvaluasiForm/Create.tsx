import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { ChevronLeft, GraduationCap } from 'lucide-react';

import KepsekEvaluasiForm from './KepsekEvaluasiForm';

// Interfaces
export interface User {
    id: number;
    name: string;
    email: string;
}

export interface MataPelajaran {
    id: number;
    nama: string;
    kode: string;
}

export interface Guru {
    id: number;
    nip: string;
    user_id: number;
    user: User;
    mata_pelajaran?: MataPelajaran;
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
    sub_kriteria?: SubKriteria[];  // Changed to sub_kriteria (snake_case) to match backend
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
}

interface CreateEvaluasiProps extends PageProps {
    guru: Guru;
    kriteriaList: Kriteria[];
    periodeAktif: PeriodeEvaluasi;
    message?: string;
    error?: string;
}

export default function CreateEvaluasi({ guru, kriteriaList, periodeAktif, message, error }: CreateEvaluasiProps) {
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    const handleBack = () => {
        router.get(route('kepsek.evaluasi-form.index'));
    };

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
            title: 'Evaluasi Baru',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Evaluasi ${guru.user.name}`} />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                <div className="flex items-center mb-6">
                    <Button variant="outline" size="icon" className="mr-4" onClick={handleBack}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Form Evaluasi Guru</h1>
                        <p className="text-gray-500">Periode: {periodeAktif.judul}</p>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <CardTitle>{guru.user.name}</CardTitle>
                                <CardDescription className="flex flex-col gap-1">
                                    <span>NIP: {guru.nip}</span>
                                    <span>Email: {guru.user.email}</span>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {guru.mata_pelajaran ? (
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                {guru.mata_pelajaran.nama}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">
                                                Belum ada mata pelajaran
                                            </span>
                                        )}
                                    </div>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <KepsekEvaluasiForm
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