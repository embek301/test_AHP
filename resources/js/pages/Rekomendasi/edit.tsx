import { Head } from '@inertiajs/react';
import { Toaster } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Award } from 'lucide-react';
import RekomendasiForm from './RekomendasiForm';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Guru {
    id: number;
    user: User;
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
}

interface Rekomendasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    konten: string;
    status: 'draft' | 'published';
    guru: Guru;
    periodeEvaluasi: PeriodeEvaluasi;
}

interface RekomendasiEditProps extends PageProps {
    rekomendasi: Rekomendasi;
    guru: Guru[];
    periodeEvaluasi: PeriodeEvaluasi[];
}

export default function RekomendasiEdit({ rekomendasi, guru, periodeEvaluasi }: RekomendasiEditProps) {
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
            title: 'Edit Rekomendasi',
            href: route('rekomendasi.edit', rekomendasi.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Rekomendasi" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-blue-800">Edit Rekomendasi</h1>
                        <p className="mt-2 text-blue-600">Perbarui rekomendasi pengembangan untuk {rekomendasi.guru.user.name}</p>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-600" />
                                Edit Rekomendasi
                            </CardTitle>
                            <CardDescription>
                                <div className="space-y-1">
                                    <p><strong>Guru:</strong> {rekomendasi.guru.user.name}</p>
                                    <p><strong>Periode:</strong> {rekomendasi.periodeEvaluasi.judul}</p>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RekomendasiForm 
                                mode="edit" 
                                rekomendasi={rekomendasi} 
                                guru={guru} 
                                periodeEvaluasi={periodeEvaluasi}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}