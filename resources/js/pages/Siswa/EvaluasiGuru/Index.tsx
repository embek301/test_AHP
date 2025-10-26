import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Calendar, CheckCircle, CircleAlert, GraduationCap, Search } from 'lucide-react';

// Interface definitions
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

interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: 'draft' | 'aktif' | 'selesai';
}

interface MataPelajaran {
    id: number;
    nama: string;
    aktif: boolean;
}

interface Stats {
    total_guru: number;
    completed: number;
    remaining: number;
    completion_percentage: number;
}

interface IndexProps extends PageProps {
    periodeAktif?: PeriodeEvaluasi;
    guruList: Guru[];
    completedEvaluasi: {[guruId: number]: number}; // Map dari guru_id ke evaluasi_id
    mataPelajaran: MataPelajaran[];
    stats: Stats;
    filters: {
        search?: string;
        mata_pelajaran_id?: number;
    };
    errors?: {
        [key: string]: string;
    };
    message?: string;
}

export default function EvaluasiGuruIndex({ 
    periodeAktif, 
    guruList = [], 
    completedEvaluasi = {}, 
    mataPelajaran = [],
    stats,
    filters,
    errors,
    message 
}: IndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedMataPelajaran, setSelectedMataPelajaran] = useState<string>(
        filters.mata_pelajaran_id ? String(filters.mata_pelajaran_id) : 'all'
    );
    
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        
        if (errors) {
            Object.keys(errors).forEach(key => {
                toast.error(errors[key]);
            });
        }
    }, [message, errors]);
    
    const handleSearch = () => {
        router.get(route('evaluasi-guru.index'), {
            search: searchQuery,
            mata_pelajaran_id: selectedMataPelajaran !== 'all' ? parseInt(selectedMataPelajaran) : undefined,
        }, {
            preserveState: true,
            replace: true
        });
    };
    
    const handleMataPelajaranChange = (value: string) => {
        setSelectedMataPelajaran(value);
        router.get(route('evaluasi-guru.index'), {
            search: searchQuery,
            mata_pelajaran_id: value !== 'all' ? parseInt(value) : undefined,
        }, {
            preserveState: true,
            replace: true
        });
    };
    
    // Check if a guru has been evaluated
    const isGuruEvaluated = (guruId: number) => {
        return completedEvaluasi.hasOwnProperty(guruId);
    };
    
    // Navigate to create form
    const goToCreateForm = (guruId: number) => {
        router.get(route('evaluasi-guru.create', guruId));
    };
    
    // Navigate to view/edit form
    const goToViewForm = (guruId: number) => {
        // Pastikan periode aktif tersedia
        if (!periodeAktif) {
            toast.error('Tidak ada periode evaluasi aktif');
            return;
        }
        
        // Ambil ID evaluasi dari map
        const evaluasiId = completedEvaluasi[guruId];
        
        if (!evaluasiId) {
            toast.error('Data evaluasi tidak ditemukan');
            return;
        }
        
        router.get(route('evaluasi-guru.show', evaluasiId));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Evaluasi Guru',
            href: route('evaluasi-guru.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Evaluasi Guru" />
            <Toaster position="top-right" richColors />
            
            <div className="space-y-6 p-4">
                {/* Header Section */}
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-6">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold mb-2">Form Evaluasi Guru</h1>
                        <p className="text-gray-600 mb-4">
                            Silakan evaluasi kinerja guru Anda sesuai dengan kriteria yang telah ditentukan.
                            Evaluasi ini akan membantu meningkatkan kualitas pengajaran di sekolah kita.
                        </p>
                        
                        {/* Progress bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span>Progress Evaluasi</span>
                                <span className="font-medium">{stats.completion_percentage}% Selesai</span>
                            </div>
                            <Progress value={stats.completion_percentage} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Total: {stats.total_guru} guru</span>
                                <span>Selesai: {stats.completed}/{stats.total_guru}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Periode Aktif */}
                {periodeAktif ? (
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="font-medium">Periode Aktif: {periodeAktif.judul}</h2>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(periodeAktif.tanggal_mulai), 'dd MMM yyyy', { locale: id })} - {format(new Date(periodeAktif.tanggal_selesai), 'dd MMM yyyy', { locale: id })}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <CircleAlert className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="font-medium">Tidak Ada Periode Evaluasi Aktif</h2>
                                <p className="text-sm text-gray-500">
                                    Saat ini tidak ada periode evaluasi yang aktif. Silakan hubungi administrator.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Filter & Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="search" className="text-sm font-medium mb-2 block">Cari Guru</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Cari berdasarkan nama atau NIP..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-64">
                                <label htmlFor="mata_pelajaran" className="text-sm font-medium mb-2 block">Filter Mata Pelajaran</label>
                                <Select value={selectedMataPelajaran} onValueChange={handleMataPelajaranChange}>
                                    <SelectTrigger id="mata_pelajaran">
                                        <SelectValue placeholder="Pilih mata pelajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                                        {mataPelajaran.map((mapel) => (
                                            <SelectItem key={mapel.id} value={mapel.id.toString()}>
                                                {mapel.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="self-end">
                                <Button onClick={handleSearch}>
                                    Cari
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* List of Guru */}
                {guruList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guruList.map((guru) => {
                            const isEvaluated = isGuruEvaluated(guru.id);
                            
                            return (
                                <Card key={guru.id} className={`overflow-hidden border transition-all hover:shadow-md ${isEvaluated ? 'border-green-200' : 'border-gray-200'}`}>
                                    <div className={`h-1 w-full ${isEvaluated ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg font-semibold">{guru.user.name}</CardTitle>
                                            {isEvaluated && (
                                                <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800">
                                                    <CheckCircle className="mr-1 h-3 w-3" /> Sudah Dievaluasi
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="flex items-center">
                                            <span className="font-medium text-gray-600">{guru.nip}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {guru.mata_pelajaran ? (
                                                // Periksa apakah mata_pelajaran adalah array
                                                Array.isArray(guru.mata_pelajaran) && guru.mata_pelajaran.length > 0 ? (
                                                    guru.mata_pelajaran.map((mapel) => (
                                                        <Badge key={mapel.id} variant="outline" className="bg-blue-50 text-blue-700">
                                                            {mapel.nama}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    // Type guard untuk memastikan objek memiliki properti nama
                                                    typeof guru.mata_pelajaran === 'object' && 
                                                    guru.mata_pelajaran !== null && 
                                                    'nama' in guru.mata_pelajaran ? (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                            {(guru.mata_pelajaran as {id: number, nama: string}).nama}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">Format mata pelajaran tidak valid</span>
                                                    )
                                                )
                                            ) : (
                                                <span className="text-xs text-gray-500">Belum ada mata pelajaran</span>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t bg-gray-50 pt-3">
                                        {isEvaluated ? (
                                            <Button  className="w-full" onClick={() => goToViewForm(guru.id)}>
                                                Lihat Evaluasi
                                            </Button>
                                        ) : (
                                            periodeAktif && (
                                                <Button className="w-full" onClick={() => goToCreateForm(guru.id)}>
                                                    Evaluasi Guru
                                                </Button>
                                            )
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <GraduationCap className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Tidak Ada Guru</h3>
                        <p className="text-gray-500 max-w-sm">
                            Tidak ada guru yang ditemukan berdasarkan kriteria pencarian saat ini. Coba ubah filter atau kata kunci pencarian Anda.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}