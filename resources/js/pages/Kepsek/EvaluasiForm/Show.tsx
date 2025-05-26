import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { ArrowLeft, Calendar, FileText, GraduationCap } from 'lucide-react';

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

export default function ShowEvaluasi({ guru, kriteriaList, periodeEvaluasi, evaluasi, message, error }: ShowEvaluasiProps) {
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
        router.get(route('kepsek.evaluasi-form.index'));
    };

    // Handle export button
    const handleExport = () => {
        router.get(route('kepsek.evaluasi-form.export', evaluasi.id));
    };

    const downloadPdf = (evaluasiId: number | string) => {
        window.open(`/kepsek/evaluasi-form/${evaluasiId}/export`, '_blank');
    };

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Evaluasi ${guru.user.name}`} />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" className="mr-4" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Detail Hasil Evaluasi</h1>
                            <p className="text-gray-500">Periode: {periodeEvaluasi.judul}</p>
                        </div>
                    </div>
                    <Button onClick={() => downloadPdf(evaluasi.id)} className="bg-green-600 hover:bg-green-700">
                        <FileText className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                </div>

                {/* Info Card */}
                <Card className="mb-6">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <GraduationCap className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <CardTitle>{guru.user.name}</CardTitle>
                                <CardDescription className="flex flex-col">
                                    <span>NIP: {guru.nip}</span>
                                    <span>Email: {guru.user.email}</span>
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="mb-1 flex items-center text-sm text-gray-500">
                                    <Calendar className="mr-1 h-4 w-4" />
                                    Tanggal Evaluasi:
                                </div>
                                <div>{format(new Date(evaluasi.created_at), 'dd MMMM yyyy')}</div>
                                <div className="text-xs text-gray-500">
                                    Terakhir diperbarui: {format(new Date(evaluasi.updated_at), 'dd MMMM yyyy, HH:mm')}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
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
        </AppLayout>
    );
}
