import { Head, router } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Calendar, ChevronLeft, PenLine, User } from 'lucide-react';
import { useState } from 'react';

interface UserData {
    id: number;
    name: string;
    email: string;
}

interface Guru {
    id: number;
    user: UserData;
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: string;
}

interface Rekomendasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    konten: string;
    dibuat_oleh: number;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    guru: Guru;
    periode_evaluasi: PeriodeEvaluasi;
    pembuat: UserData;
}

interface RekomendasiShowProps extends PageProps {
    rekomendasi: Rekomendasi;
}

export default function RekomendasiShow({ rekomendasi }: RekomendasiShowProps) {
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<'draft' | 'published'>(rekomendasi.status === 'published' ? 'draft' : 'published');
    
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
            title: 'Detail Rekomendasi',
            href: route('rekomendasi.show', rekomendasi.id),
        },
    ];

    // Format tanggal
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Fungsi untuk mengubah status rekomendasi
    const handleChangeStatus = () => {
        router.put(
            route('rekomendasi.change-status', rekomendasi.id),
            { status: newStatus },
            {
                onSuccess: () => {
                    toast.success(`Rekomendasi berhasil ${newStatus === 'published' ? 'dipublikasikan' : 'disimpan sebagai draft'}`);
                    setIsStatusDialogOpen(false);
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Terjadi kesalahan saat mengubah status rekomendasi');
                    setIsStatusDialogOpen(false);
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Rekomendasi" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-blue-800">Detail Rekomendasi</h1>
                        <p className="mt-2 text-blue-600">Lihat detail rekomendasi pengembangan untuk {rekomendasi.guru.user.name}</p>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl">
                    <div className="mb-4 flex items-center justify-between">
                        <Button 
                            variant="outline" 
                            onClick={() => router.visit(route('rekomendasi.index'))}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Kembali ke Daftar
                        </Button>
                        
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => router.visit(route('rekomendasi.edit', rekomendasi.id))}
                                className="flex items-center gap-2"
                            >
                                <PenLine className="h-4 w-4" />
                                Edit
                            </Button>
                            
                            <Button 
                                variant={rekomendasi.status === 'published' ? 'secondary' : 'default'} 
                                onClick={() => {
                                    setNewStatus(rekomendasi.status === 'published' ? 'draft' : 'published');
                                    setIsStatusDialogOpen(true);
                                }}
                            >
                                {rekomendasi.status === 'published' ? 'Set ke Draft' : 'Publikasikan'}
                            </Button>
                        </div>
                    </div>
                    
                    <Card className="shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl">
                                    Rekomendasi untuk {rekomendasi.guru.user.name}
                                </CardTitle>
                                <CardDescription>
                                    Periode: {rekomendasi.periode_evaluasi.judul}
                                </CardDescription>
                            </div>
                            <Badge variant={rekomendasi.status === 'published' ? 'success' : 'secondary'}>
                                {rekomendasi.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <User className="h-4 w-4" />
                                        <span>Dibuat oleh</span>
                                    </div>
                                    <div className="font-medium">{rekomendasi.pembuat.name}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        <span>Tanggal dibuat</span>
                                    </div>
                                    <div className="font-medium">{formatDate(rekomendasi.created_at)}</div>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <h3 className="mb-2 font-semibold">Isi Rekomendasi:</h3>
                                <div className="rounded-md border border-gray-200 bg-white p-4">
                                    <div className="whitespace-pre-wrap">{rekomendasi.konten}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alert Dialog untuk konfirmasi perubahan status */}
            <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {newStatus === 'published' ? 'Publikasikan Rekomendasi' : 'Ubah ke Draft'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {newStatus === 'published' 
                                ? 'Rekomendasi yang dipublikasikan akan terlihat oleh guru terkait. Lanjutkan?' 
                                : 'Mengubah status menjadi draft akan menyembunyikan rekomendasi dari guru. Lanjutkan?'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleChangeStatus}
                            className={newStatus === 'published' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                        >
                            {newStatus === 'published' ? 'Publikasikan' : 'Ubah ke Draft'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}