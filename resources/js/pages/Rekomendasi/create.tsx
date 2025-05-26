import { Head } from '@inertiajs/react';
import { Toaster } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Award } from 'lucide-react';
import RekomendasiForm from './RekomendasiForm';

interface Guru {
    id: number;
    user: {
        id: number;
        name: string;
    };
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
}

interface RekomendasiCreateProps extends PageProps {
    guru: Guru[];
    periodeEvaluasi: PeriodeEvaluasi[];
    selectedGuruId?: number | string | null;
    selectedPeriodeId?: number | string | null;
}

export default function RekomendasiCreate({ guru, periodeEvaluasi, selectedGuruId, selectedPeriodeId }: RekomendasiCreateProps) {
    // Breadcrumbs untuk navigasi
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Rekomendasi',
            href: route('rekomendasi.index'),
        },
        {
            title: 'Tambah Rekomendasi',
            href: route('rekomendasi.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Rekomendasi" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-blue-800">Tambah Rekomendasi Baru</h1>
                        <p className="mt-2 text-blue-600">Buat rekomendasi pengembangan untuk guru berdasarkan hasil evaluasi</p>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-600" />
                                Form Rekomendasi
                            </CardTitle>
                            <CardDescription>
                                Isi formulir berikut untuk membuat rekomendasi baru
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RekomendasiForm 
                                mode="create" 
                                rekomendasi={null} 
                                guru={guru} 
                                periodeEvaluasi={periodeEvaluasi}
                                selectedGuruId={selectedGuruId}
                                selectedPeriodeId={selectedPeriodeId}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}