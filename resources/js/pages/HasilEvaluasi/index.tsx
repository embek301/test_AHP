import { Head, router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Award, BarChart3, EyeIcon, FileSpreadsheet, GraduationCap, LineChart, MoreHorizontal, Star } from 'lucide-react';

import HasilEvaluasiDetail from './HasilEvaluasiDetail';

// Tipe untuk Guru
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
}

// Tipe untuk Periode Evaluasi
interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: 'draft' | 'aktif' | 'selesai';
}

// Tipe untuk HasilEvaluasi
interface HasilEvaluasi {
    id: number;
    guru_id: number;
    guru: Guru;
    periode_evaluasi_id: number;
    periode_evaluasi: PeriodeEvaluasi;
    nilai_siswa: number;
    nilai_rekan: number;
    nilai_pengawas: number;
    nilai_akhir: number;
    created_at: string;
    updated_at: string;
    total_evaluasi?: {
        siswa: number;
        rekan: number;
        pengawas: number;
    };
}

// Props untuk komponen HasilEvaluasi
interface HasilEvaluasiIndexProps extends PageProps {
    hasilEvaluasi: HasilEvaluasi[];
    periodeEvaluasi: PeriodeEvaluasi[];
    stats?: {
        totalHasil: number;
        totalGuru: number;
        periodeAktif: number;
        nilaiRataRata: number;
    };
    message?: string;
    error?: string;
    filters?: {
        periode_id?: number;
    };
}

export default function HasilEvaluasiIndex({ hasilEvaluasi = [], periodeEvaluasi = [], stats, message, error, filters }: HasilEvaluasiIndexProps) {
    // Initialize with empty array as fallback to prevent undefined errors
    const hasilEvaluasiData = Array.isArray(hasilEvaluasi) ? hasilEvaluasi : [];
    const periodeData = Array.isArray(periodeEvaluasi) ? periodeEvaluasi : [];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [activeHasilEvaluasi, setActiveHasilEvaluasi] = useState<HasilEvaluasi | null>(null);

    // Filter periode
    const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | undefined>(
        filters?.periode_id || periodeData.find((p) => p.status === 'aktif')?.id,
    );

    // Tambahkan state search global
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // State tambahan
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    // Implementasi debounce tanpa lodash
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    // Tampilkan notifikasi jika ada message atau error dari server
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    // Fungsi untuk membuka detail hasil evaluasi
    const handleViewDetail = (hasil: HasilEvaluasi) => {
        setActiveHasilEvaluasi(hasil);
        setIsDetailDialogOpen(true);
    };

    // Fungsi untuk melakukan filter berdasarkan periode
    const handlePeriodeChange = (periodeId: string) => {
        const id = periodeId === 'all' ? undefined : parseInt(periodeId);
        setSelectedPeriodeId(id);

        router.get(route('hasil-evaluasi.index'), { periode_id: id }, { preserveState: true });
    };

    // Handler untuk menghitung hasil evaluasi
    const handleCalculateResults = async (periodeId: number, guruId?: number) => {
        setIsCalculating(true);

        try {
            const response = await axios.post(route('hasil-evaluasi.calculate'), {
                periode_id: periodeId,
                guru_id: guruId,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Refresh halaman untuk mendapatkan data terbaru
                router.reload();
            } else {
                toast.error(response.data.message || 'Gagal menghitung hasil evaluasi');
            }
        } catch (error) {
            console.error('Error calculating results:', error);
            toast.error('Terjadi kesalahan saat menghitung hasil evaluasi');
        } finally {
            setIsCalculating(false);
            setIsDialogOpen(false);
        }
    };

    // Helper function untuk mendapatkan kategori nilai
    const getNilaiCategory = (
        nilai: number | string | null | undefined,
    ): {
        category: 'sangat-baik' | 'baik' | 'cukup' | 'kurang' | 'sangat-kurang';
        label: string;
        color: string;
    } => {
        // Konversi ke number terlebih dahulu
        const numValue = typeof nilai === 'string' ? parseFloat(nilai) : Number(nilai || 0);

        if (numValue >= 90) {
            return { category: 'sangat-baik', label: 'Sangat Baik', color: 'bg-green-500' };
        } else if (numValue >= 80) {
            return { category: 'baik', label: 'Baik', color: 'bg-blue-500' };
        } else if (numValue >= 70) {
            return { category: 'cukup', label: 'Cukup', color: 'bg-yellow-500' };
        } else if (numValue >= 60) {
            return { category: 'kurang', label: 'Kurang', color: 'bg-orange-500' };
        } else {
            return { category: 'sangat-kurang', label: 'Sangat Kurang', color: 'bg-red-500' };
        }
    };

    // Helper function untuk formatting nilai
    const formatNilai = (nilai: number | string | null | undefined): string => {
        if (nilai === null || nilai === undefined) return '-';

        // Konversi ke number terlebih dahulu
        const numValue = typeof nilai === 'string' ? parseFloat(nilai) : Number(nilai);

        // Periksa apakah hasil konversi adalah angka yang valid
        if (isNaN(numValue)) return '-';

        // Format angka dengan 2 digit desimal
        return numValue.toFixed(2);
    };

    const handleExportDirect = (hasilId: number) => {
        try {
            // Langsung redirect ke URL export tanpa menggunakan Axios
            window.location.href = route('hasil-evaluasi.export', hasilId);

            // Optional: bisa tambahkan toast info
            toast.info('Memulai download...');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal mengunduh file');
        }
    };

    const handleExportAllDirect = () => {
        try {
            // Buat URL dengan parameter periode jika ada
            const params = selectedPeriodeId ? `?periode_id=${selectedPeriodeId}` : '';
            window.location.href = route('hasil-evaluasi.export-all') + params;

            toast.info('Memulai download...');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal mengunduh file');
        }
    };

    // Gunakan useMemo untuk memfilter data hanya ketika perlu
    const filteredData = useMemo(() => {
        let filtered = [...hasilEvaluasiData];

        // Filter berdasarkan periode yang dipilih
        if (selectedPeriodeId) {
            filtered = filtered.filter((hasil) => hasil.periode_evaluasi_id === selectedPeriodeId);
        }

        // Filter berdasarkan pencarian
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase().trim();

            filtered = filtered.filter((hasil) => {
                // Cari di nama guru
                if (hasil.guru.user.name?.toLowerCase().includes(query)) {
                    return true;
                }

                // Cari di NIP guru
                if (hasil.guru.nip?.toLowerCase().includes(query)) {
                    return true;
                }

                // Cari di email guru
                if (hasil.guru.user.email?.toLowerCase().includes(query)) {
                    return true;
                }

                // Cari di judul periode
                if (hasil.periode_evaluasi.judul?.toLowerCase().includes(query)) {
                    return true;
                }

                return false;
            });
        }

        return filtered;
    }, [hasilEvaluasiData, debouncedSearchQuery, selectedPeriodeId]);

    // Definisi kolom untuk tabel
    const columns: ColumnDef<HasilEvaluasi>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Pilih semua"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Pilih baris"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: 'guru',
            header: 'Guru',
            cell: ({ row }) => {
                const hasil = row.original;
                return (
                    <div className="flex flex-col">
                        <div className="font-medium">{hasil.guru.user.name}</div>
                        <div className="text-muted-foreground text-sm">{hasil.guru.nip}</div>
                    </div>
                );
            },
        },
        {
            id: 'periode',
            header: 'Periode Evaluasi',
            cell: ({ row }) => {
                const hasil = row.original;
                return (
                    <div className="flex flex-col">
                        <div className="font-medium">{hasil.periode_evaluasi.judul}</div>
                        <div className="text-muted-foreground text-xs">
                            {format(new Date(hasil.periode_evaluasi.tanggal_mulai), 'dd MMM yyyy')} -{' '}
                            {format(new Date(hasil.periode_evaluasi.tanggal_selesai), 'dd MMM yyyy')}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'nilai_siswa',
            header: 'Siswa',
            cell: ({ row }) => {
                const nilai = row.getValue('nilai_siswa') as number;
                const total = row.original.total_evaluasi?.siswa || 0;

                return (
                    <div className="flex flex-col">
                        <div className="font-medium">{formatNilai(nilai)}</div>
                        <div className="text-muted-foreground text-xs">{total} evaluasi</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'nilai_rekan',
            header: 'Rekan',
            cell: ({ row }) => {
                const nilai = row.getValue('nilai_rekan') as number;
                const total = row.original.total_evaluasi?.rekan || 0;

                return (
                    <div className="flex flex-col">
                        <div className="font-medium">{formatNilai(nilai)}</div>
                        <div className="text-muted-foreground text-xs">{total} evaluasi</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'nilai_pengawas',
            header: 'Pengawas',
            cell: ({ row }) => {
                const nilai = row.getValue('nilai_pengawas') as number;
                const total = row.original.total_evaluasi?.pengawas || 0;

                return (
                    <div className="flex flex-col">
                        <div className="font-medium">{formatNilai(nilai)}</div>
                        <div className="text-muted-foreground text-xs">{total} evaluasi</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'nilai_akhir',
            header: 'Nilai Akhir',
            cell: ({ row }) => {
                const nilai = row.getValue('nilai_akhir') as number;
                const category = getNilaiCategory(nilai);

                return (
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${category.color.replace('bg-', 'bg-opacity-20 text-')} border-none px-2 py-1`}>
                                <Star className="mr-1 h-3 w-3 fill-current" /> {formatNilai(nilai)}
                            </Badge>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div className={`h-1.5 rounded-full ${category.color}`} style={{ width: `${nilai}%` }}></div>
                        </div>
                        <div className="text-xs font-medium">{category.label}</div>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const hasil = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel className="flex items-center gap-2">
                                <MoreHorizontal className="h-4 w-4" />
                                Tindakan
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetail(hasil)} className="flex cursor-pointer items-center gap-2">
                                <EyeIcon className="h-4 w-4 text-blue-600" />
                                Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleCalculateResults(hasil.periode_evaluasi_id, hasil.guru_id)}
                                className="flex cursor-pointer items-center gap-2"
                                disabled={isCalculating}
                            >
                                <BarChart3 className="h-4 w-4 text-purple-600" />
                                Hitung Ulang
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportDirect(hasil.id)} className="flex cursor-pointer items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                Export Excel
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // Konfigurasi tabel dengan tanstack/react-table
    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    // Breadcrumbs untuk navigasi
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Hasil Evaluasi',
            href: route('hasil-evaluasi.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hasil Evaluasi" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-indigo-800">Hasil Evaluasi Guru</h1>
                        <p className="mt-2 text-indigo-600">Analisis dan pantau hasil evaluasi kinerja guru dari berbagai sumber</p>
                    </div>
                </div>

                {/* Tambahkan StatsCards */}
                {stats && (
                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <Card className="bg-indigo-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-indigo-600">Total Hasil</p>
                                        <h3 className="text-2xl font-bold text-indigo-800">{stats.totalHasil}</h3>
                                    </div>
                                    <div className="rounded-full bg-indigo-100 p-3">
                                        <LineChart className="h-5 w-5 text-indigo-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Guru Terevaluasi</p>
                                        <h3 className="text-2xl font-bold text-green-800">{stats.totalGuru}</h3>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3">
                                        <GraduationCap className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Periode Aktif</p>
                                        <h3 className="text-2xl font-bold text-blue-800">{stats.periodeAktif}</h3>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-amber-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-600">Nilai Rata-rata</p>
                                        <h3 className="text-2xl font-bold text-amber-800">
                                            {stats && typeof stats.nilaiRataRata !== 'undefined' ? Number(stats.nilaiRataRata).toFixed(2) : '0.00'}
                                        </h3>
                                    </div>
                                    <div className="rounded-full bg-amber-100 p-3">
                                        <Award className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="table" className="mb-4">
                    {/* <TabsList className="mb-2">
                        <TabsTrigger value="table">Tabel</TabsTrigger>
                        <TabsTrigger value="charts">Grafik</TabsTrigger>
                    </TabsList> */}
                    <TabsContent value="table">
                        <Card className="shadow-md">
                            <CardHeader className="">
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <LineChart className="h-5 w-5 text-indigo-600" />
                                            Daftar Hasil Evaluasi
                                        </CardTitle>
                                        <CardDescription>Lihat dan analisis hasil evaluasi guru</CardDescription>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Select value={selectedPeriodeId ? String(selectedPeriodeId) : 'all'} onValueChange={handlePeriodeChange}>
                                            <SelectTrigger className="w-[240px]">
                                                <SelectValue placeholder="Filter periode evaluasi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Periode</SelectItem>
                                                {periodeData.map((periode) => (
                                                    <SelectItem key={periode.id} value={String(periode.id)}>
                                                        {periode.judul}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <Button
                                                onClick={() => setIsDialogOpen(true)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                                disabled={isCalculating}
                                            >
                                                {isCalculating ? (
                                                    <>
                                                        <div className="border-opacity-20 mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-white" />
                                                        Menghitung...
                                                    </>
                                                ) : (
                                                    <>
                                                        <BarChart3 className="mr-2 h-4 w-4" /> Hitung Hasil
                                                    </>
                                                )}
                                            </Button>

                                            <Button onClick={handleExportAllDirect} className="bg-green-600 hover:bg-green-700">
                                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Semua
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="mb-4 flex items-center gap-4">
                                    <Input
                                        placeholder="Cari berdasarkan nama, nip, atau periode..."
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        className="max-w-sm"
                                    />
                                    {searchQuery && searchQuery !== debouncedSearchQuery && <span className="text-sm text-gray-500">Mencari...</span>}
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead key={header.id}>
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                                        Tidak ada data hasil evaluasi.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <div className="text-muted-foreground flex-1 text-sm">
                                        {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris
                                        dipilih.
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            Sebelumnya
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                            Berikutnya
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="charts">
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                    Visualisasi Hasil Evaluasi
                                </CardTitle>
                                <CardDescription>Grafik dan visualisasi perbandingan hasil evaluasi guru</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex h-[400px] items-center justify-center text-gray-500">
                                    <p>Grafik visualisasi akan ditampilkan di sini.</p>
                                    {/* Implementasi chart libraries seperti recharts, nivo, atau visx bisa ditambahkan di sini */}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialog untuk detail Hasil Evaluasi */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Detail Hasil Evaluasi</DialogTitle>
                        <DialogDescription>Hasil lengkap evaluasi kinerja guru berdasarkan berbagai sumber penilaian.</DialogDescription>
                    </DialogHeader>

                    {activeHasilEvaluasi && (
                        <HasilEvaluasiDetail
                            hasilId={activeHasilEvaluasi.id}
                            guruId={activeHasilEvaluasi.guru_id}
                            periodeId={activeHasilEvaluasi.periode_evaluasi_id}
                        />
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Konfirmasi Perhitungan */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                // Pastikan dialog memenuhi standar aksesibilitas
                aria-describedby="dialog-description"
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Hitung Hasil Evaluasi</DialogTitle>
                        <DialogDescription id="dialog-description">
                            Pilih opsi perhitungan hasil evaluasi. Data yang sudah ada akan diperbarui.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <h3 className="font-medium">Periode</h3>
                            <select
                                className="h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={selectedPeriodeId ? String(selectedPeriodeId) : ''}
                                onChange={(e) => setSelectedPeriodeId(parseInt(e.target.value))}
                            >
                                <option value="" disabled>
                                    Pilih periode
                                </option>
                                {periodeData
                                    .filter((p) => p.status === 'selesai')
                                    .map((periode) => (
                                        <option key={periode.id} value={String(periode.id)}>
                                            {periode.judul}
                                        </option>
                                    ))}
                            </select>
                            <p className="text-muted-foreground text-sm">Hanya periode yang sudah selesai dapat dihitung hasilnya.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            onClick={() => selectedPeriodeId && handleCalculateResults(selectedPeriodeId)}
                            disabled={!selectedPeriodeId || isCalculating}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isCalculating ? (
                                <>
                                    <div className="border-opacity-20 mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-white" />
                                    Menghitung...
                                </>
                            ) : (
                                <>
                                    <BarChart3 className="mr-2 h-4 w-4" /> Hitung Semua Guru
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
