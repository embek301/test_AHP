import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
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
import {
    Calendar,
    CheckCircle,
    CircleAlert,
    FileText,
    Filter,
    GraduationCap,
    Search,
    UserCheck
} from 'lucide-react';

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
    }[];
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

interface EvaluasiFormIndexProps extends PageProps {
    periodeAktif?: PeriodeEvaluasi;
    guruList: Guru[];
    completedEvaluasi: number[];
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

export default function EvaluasiFormIndex({ 
    periodeAktif, 
    guruList = [], 
    completedEvaluasi = [], 
    mataPelajaran = [],
    stats,
    filters,
    errors,
    message 
}: EvaluasiFormIndexProps) {
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
        router.get(route('kepsek.evaluasi-form.index'), {
            search: searchQuery,
            mata_pelajaran_id: selectedMataPelajaran ? parseInt(selectedMataPelajaran) : undefined,
        }, {
            preserveState: true,
            replace: true
        });
    };
    
    const handleMataPelajaranChange = (value: string) => {
        setSelectedMataPelajaran(value);
        router.get(route('kepsek.evaluasi-form.index'), {
            search: searchQuery,
            mata_pelajaran_id: value !== 'all' ? parseInt(value) : undefined,
        }, {
            preserveState: true,
            replace: true
        });
    };
    
    // Check if a guru has been evaluated
    const isGuruEvaluated = (guruId: number) => {
        return completedEvaluasi.includes(guruId);
    };
    
    // Navigate to create form
    const goToCreateForm = (guruId: number) => {
        router.get(route('kepsek.evaluasi-form.create', guruId));
    };
    
    // Navigate to view/edit form
    const goToViewForm = (guruId: number) => {
        // Pastikan periode aktif tersedia
        if (!periodeAktif) {
            toast.error("Tidak ada periode evaluasi aktif");
            return;
        }
        
       router.get(route('kepsek.evaluasi-form.show', guruId));
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
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Evaluasi Guru" />
            <Toaster position="top-right" richColors />
            
            <div className="p-4 space-y-6">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-indigo-800">Form Evaluasi Guru</h1>
                        <p className="mt-2 text-indigo-600">Lakukan evaluasi terhadap kinerja guru sebagai pengawas sekolah</p>
                    </div>
                </div>
                
                {/* Periode Aktif */}
                {periodeAktif ? (
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                            <Calendar className="h-10 w-10 text-green-500" />
                            <div>
                                <h2 className="text-lg font-semibold text-green-800">Periode Evaluasi Aktif: {periodeAktif.judul}</h2>
                                <p className="text-sm text-green-600">
                                    {format(new Date(periodeAktif.tanggal_mulai), 'dd MMMM yyyy')} - {format(new Date(periodeAktif.tanggal_selesai), 'dd MMMM yyyy')}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                            <CircleAlert className="h-10 w-10 text-red-500" />
                            <div>
                                <h2 className="text-lg font-semibold text-red-800">Tidak Ada Periode Evaluasi Aktif</h2>
                                <p className="text-sm text-red-600">
                                    Saat ini tidak ada periode evaluasi yang aktif. Silakan hubungi admin untuk mengaktifkan periode evaluasi.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
                                <GraduationCap className="h-5 w-5" />
                                Total Guru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-700">{stats.total_guru}</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
                                <UserCheck className="h-5 w-5" />
                                Sudah Dievaluasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5" />
                                Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-amber-700 text-sm">{stats.completion_percentage}% selesai</span>
                                <span className="text-amber-700 text-sm">{stats.completed}/{stats.total_guru}</span>
                            </div>
                            <Progress value={stats.completion_percentage} className="h-2" />
                        </CardContent>
                    </Card>
                </div>
                
                {/* Search and Filter */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cari Guru</CardTitle>
                        <CardDescription>Cari guru untuk dievaluasi berdasarkan nama atau NIP</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-7">
                                <div className="flex items-center">
                                    <Input
                                        placeholder="Cari berdasarkan nama atau NIP..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full"
                                    />
                                    <Button 
                                        variant="default" 
                                        onClick={handleSearch}
                                        className="ml-2"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="md:col-span-5">
                                <div className="flex items-center">
                                    <div className="relative w-full">
                                        <Select 
                                            value={selectedMataPelajaran} 
                                            onValueChange={handleMataPelajaranChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <div className="flex items-center">
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    <SelectValue placeholder="Filter Mata Pelajaran" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                                                {mataPelajaran.map((mp) => (
                                                    <SelectItem key={mp.id} value={mp.id.toString()}>
                                                        {mp.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Guru List */}
                {guruList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guruList.map((guru) => {
                            const isEvaluated = isGuruEvaluated(guru.id);
                            
                            return (
                                <Card 
                                    key={guru.id} 
                                    className={`border overflow-hidden hover:shadow-md transition-all ${isEvaluated ? 'border-green-200' : 'border-gray-200'}`}
                                >
                                    <div className={`h-1 w-full ${isEvaluated ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg font-semibold">{guru.user.name}</CardTitle>
                                            {isEvaluated && (
                                                <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Sudah Dievaluasi
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="flex items-center">
                                            <span className="font-medium text-gray-600">{guru.nip}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Array.isArray(guru.mata_pelajaran) && guru.mata_pelajaran.length > 0 ? (
                                                guru.mata_pelajaran.map((mapel) => (
                                                    <Badge key={mapel.id} variant="outline" className="bg-blue-50 text-blue-700">
                                                        {mapel.nama}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-500">Belum ada mata pelajaran</span>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        {isEvaluated ? (
                                            <Button 
                                                className="w-full" 
                                                onClick={() => goToViewForm(guru.id)}
                                            >
                                                Lihat Evaluasi
                                            </Button>
                                        ) : (
                                            <Button 
                                                className="w-full" 
                                                onClick={() => goToCreateForm(guru.id)}
                                                disabled={!periodeAktif}
                                            >
                                                Evaluasi Guru
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Tidak ada guru yang ditemukan</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Coba ubah filter atau kata kunci pencarian Anda
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}