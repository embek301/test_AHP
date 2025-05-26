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
import { format, isFuture, isPast, isToday } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import {
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    ClipboardList,
    FileClock,
    MoreHorizontal,
    PenLine,
    PlayCircle,
    PlusCircle,
    StopCircle,
    Trash2
} from 'lucide-react';

import PeriodeEvaluasiForm from './PeriodeEvaluasiForm';

// Tipe untuk PeriodeEvaluasi
interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: 'draft' | 'aktif' | 'selesai';
    evaluasi_count?: number;
    hasil_evaluasi_count?: number;
    created_at?: string;
    updated_at?: string;
}

// Props untuk komponen PeriodeEvaluasi
interface PeriodeEvaluasiIndexProps extends PageProps {
    periodeEvaluasi: PeriodeEvaluasi[];
    stats: {
        active: number;
        completed: number;
        draft: number;
        total: number;
    };
    message?: string;
    error?: string;
}

export default function PeriodeEvaluasiIndex({ periodeEvaluasi = [], stats, message, error }: PeriodeEvaluasiIndexProps) {
    // Initialize with empty array as fallback to prevent undefined errors
    const periodeEvaluasiData = Array.isArray(periodeEvaluasi) ? periodeEvaluasi : [];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [activePeriodeEvaluasi, setActivePeriodeEvaluasi] = useState<PeriodeEvaluasi | null>(null);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    
    // Tambahkan state search global
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Implementasi debounce tanpa lodash
    useEffect(() => {
        // Set timer untuk update debouncedSearchQuery setelah 300ms
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        
        // Cleanup: batalkan timer jika searchQuery berubah sebelum 300ms
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

    // Fungsi untuk membuka dialog tambah periode evaluasi
    const handleAddPeriodeEvaluasi = () => {
        setActivePeriodeEvaluasi(null);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog edit periode evaluasi
    const handleEditPeriodeEvaluasi = (periode: PeriodeEvaluasi) => {
        setActivePeriodeEvaluasi(periode);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog konfirmasi hapus
    const handleDeleteConfirm = (periode: PeriodeEvaluasi) => {
        setActivePeriodeEvaluasi(periode);
        setIsAlertDialogOpen(true);
    };

    // Fungsi untuk mengubah status periode evaluasi
    const handleChangeStatus = (periode: PeriodeEvaluasi, newStatus: 'draft' | 'aktif' | 'selesai') => {
        router.put(
            route('periode-evaluasi.change-status', periode.id),
            {
                status: newStatus,
            },
            {
                onSuccess: () => {
                    let statusText = 'diubah';
                    if (newStatus === 'aktif') statusText = 'diaktifkan';
                    else if (newStatus === 'draft') statusText = 'dijadikan draft';
                    else if (newStatus === 'selesai') statusText = 'diselesaikan';
                    
                    toast.success(`Status periode evaluasi ${periode.judul} berhasil ${statusText}`);
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Terjadi kesalahan saat mengubah status periode evaluasi');
                },
            },
        );
    };

    // Fungsi untuk melakukan hapus periode evaluasi
    const handleDelete = () => {
        if (activePeriodeEvaluasi) {
            router.delete(
                route('periode-evaluasi.destroy', activePeriodeEvaluasi.id),
                {
                    onSuccess: () => {
                        toast.success(`Periode evaluasi ${activePeriodeEvaluasi.judul} berhasil dihapus`);
                        setIsAlertDialogOpen(false);
                    },
                    onError: (errors) => {
                        toast.error(errors.error || 'Terjadi kesalahan saat menghapus periode evaluasi');
                        setIsAlertDialogOpen(false);
                    },
                },
            );
        }
    };

    // Helper function untuk mendapatkan status periode berdasarkan tanggal
    const getStatusFromDate = (startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'expired' => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if ((isPast(start) && isFuture(end)) || isToday(start) || isToday(end)) {
            return 'ongoing';
        } else if (isFuture(start)) {
            return 'upcoming';
        } else {
            return 'expired';
        }
    };

    // Gunakan useMemo untuk memfilter data hanya ketika perlu
    const filteredData = useMemo(() => {
        if (!debouncedSearchQuery) return periodeEvaluasiData;
        
        const query = debouncedSearchQuery.toLowerCase().trim();
        
        return periodeEvaluasiData.filter(periode => {
            // Cari di judul
            if (periode.judul?.toLowerCase().includes(query)) {
                return true;
            }
            
            // Cari di status
            if (periode.status?.toLowerCase().includes(query)) {
                return true;
            }
            
            // Cari di tanggal (format: dd MMM yyyy)
            const tanggalMulai = format(new Date(periode.tanggal_mulai), 'dd MMM yyyy').toLowerCase();
            const tanggalSelesai = format(new Date(periode.tanggal_selesai), 'dd MMM yyyy').toLowerCase();
            
            if (tanggalMulai.includes(query) || tanggalSelesai.includes(query)) {
                return true;
            }
            
            return false;
        });
    }, [periodeEvaluasiData, debouncedSearchQuery]);

    // Definisi kolom untuk tabel
    const columns: ColumnDef<PeriodeEvaluasi>[] = [
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
            accessorKey: 'judul',
            header: 'Judul',
            cell: ({ row }) => <div className="font-medium">{row.getValue('judul')}</div>,
        },
        {
            accessorKey: 'tanggal_mulai',
            header: 'Tanggal Mulai',
            cell: ({ row }) => {
                const date = row.getValue('tanggal_mulai') as string;
                return (
                    <div className="flex items-center">
                        <CalendarCheck className="mr-1 h-4 w-4 text-gray-500" />
                        {format(new Date(date), 'dd MMM yyyy')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'tanggal_selesai',
            header: 'Tanggal Selesai',
            cell: ({ row }) => {
                const date = row.getValue('tanggal_selesai') as string;
                return (
                    <div className="flex items-center">
                        <CalendarClock className="mr-1 h-4 w-4 text-gray-500" />
                        {format(new Date(date), 'dd MMM yyyy')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const dateStatus = getStatusFromDate(
                    row.getValue('tanggal_mulai') as string,
                    row.getValue('tanggal_selesai') as string
                );
                
                // Badge untuk status yang diset secara manual
                const statusBadge = () => {
                    switch (status) {
                        case 'draft':
                            return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
                        case 'aktif':
                            return <Badge variant="outline" className="bg-green-100 text-green-800">Aktif</Badge>;
                        case 'selesai':
                            return <Badge variant="outline" className="bg-blue-100 text-blue-800">Selesai</Badge>;
                        default:
                            return <Badge variant="outline">Unknown</Badge>;
                    }
                };
                
                // Badge untuk status berdasarkan tanggal
                const dateStatusBadge = () => {
                    switch (dateStatus) {
                        case 'upcoming':
                            return (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 ml-2">
                                    <FileClock className="mr-1 h-3 w-3" />
                                    Akan Datang
                                </Badge>
                            );
                        case 'ongoing':
                            return (
                                <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">
                                    <PlayCircle className="mr-1 h-3 w-3" />
                                    Sedang Berlangsung
                                </Badge>
                            );
                        case 'expired':
                            return (
                                <Badge variant="outline" className="bg-red-100 text-red-800 ml-2">
                                    <StopCircle className="mr-1 h-3 w-3" />
                                    Berakhir
                                </Badge>
                            );
                        default:
                            return null;
                    }
                };
                
                return (
                    <div className="flex items-center">
                        {statusBadge()}
                        {dateStatusBadge()}
                    </div>
                );
            },
        },
        {
            accessorKey: 'evaluasi_count',
            header: 'Data Evaluasi',
            cell: ({ row }) => {
                const evaluasiCount = row.original.evaluasi_count || 0;
                const hasilCount = row.original.hasil_evaluasi_count || 0;
                
                return (
                    <div className="space-y-1">
                        <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                            <ClipboardList className="mr-1 h-3 w-3" />
                            {evaluasiCount} Evaluasi
                        </Badge>
                        <br />
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                            <PenLine className="mr-1 h-3 w-3" />
                            {hasilCount} Hasil
                        </Badge>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const periode = row.original;
                const isActive = periode.status === 'aktif';
                const isDraft = periode.status === 'draft';
                const isCompleted = periode.status === 'selesai';
                const hasEvaluasi = (periode.evaluasi_count || 0) > 0;
                const hasHasil = (periode.hasil_evaluasi_count || 0) > 0;

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
                            <DropdownMenuItem 
                                onClick={() => handleEditPeriodeEvaluasi(periode)}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Edit
                            </DropdownMenuItem>
                            
                            {isDraft && (
                                <DropdownMenuItem 
                                    onClick={() => handleChangeStatus(periode, 'aktif')}
                                    className="flex cursor-pointer items-center gap-2"
                                >
                                    <PlayCircle className="h-4 w-4 text-green-600" />
                                    Aktifkan
                                </DropdownMenuItem>
                            )}
                            
                            {isActive && (
                                <>
                                    <DropdownMenuItem 
                                        onClick={() => handleChangeStatus(periode, 'draft')}
                                        className="flex cursor-pointer items-center gap-2"
                                        disabled={hasEvaluasi}
                                    >
                                        <FileClock className="h-4 w-4 text-amber-600" />
                                        Jadikan Draft
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={() => handleChangeStatus(periode, 'selesai')}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <StopCircle className="h-4 w-4 text-blue-600" />
                                        Selesaikan
                                    </DropdownMenuItem>
                                </>
                            )}
                            
                            <DropdownMenuItem 
                                onClick={() => handleDeleteConfirm(periode)}
                                className="flex cursor-pointer items-center gap-2"
                                disabled={hasEvaluasi || hasHasil}
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                                Hapus
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
            title: 'Periode Evaluasi',
            href: route('periode-evaluasi.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Periode Evaluasi" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-purple-800">Periode Evaluasi</h1>
                        <p className="mt-2 text-purple-600">Kelola jadwal dan periode evaluasi guru dalam sistem</p>
                    </div>
                </div>

                {/* Tambahkan StatsCards di sini */}
                <div className="grid gap-4 mb-6 md:grid-cols-4">
                    <Card className="bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total</p>
                                    <h3 className="text-2xl font-bold text-blue-800">{stats.total}</h3>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <CalendarDays className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Aktif</p>
                                    <h3 className="text-2xl font-bold text-green-800">{stats.active}</h3>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <PlayCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-amber-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-amber-600">Draft</p>
                                    <h3 className="text-2xl font-bold text-amber-800">{stats.draft}</h3>
                                </div>
                                <div className="rounded-full bg-amber-100 p-3">
                                    <FileClock className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Selesai</p>
                                    <h3 className="text-2xl font-bold text-purple-800">{stats.completed}</h3>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <StopCircle className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="">
                    <Card className="shadow-md">
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className=''>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <CalendarDays className="h-5 w-5 text-purple-600" />
                                        Daftar Periode Evaluasi
                                    </CardTitle>
                                    <CardDescription>Kelola jadwal dan periode evaluasi guru</CardDescription>
                                </div>
                                <Button onClick={handleAddPeriodeEvaluasi} className="bg-purple-600 hover:bg-purple-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Periode
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center gap-4">
                                <Input
                                    placeholder="Cari berdasarkan judul, status, atau tanggal..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="max-w-sm"
                                />
                                {searchQuery && searchQuery !== debouncedSearchQuery && (
                                    <span className="text-sm text-gray-500">Mencari...</span>
                                )}
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
                                                    Tidak ada data periode evaluasi.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <div className="text-muted-foreground flex-1 text-sm">
                                    {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
                                </div>
                                <div className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                        Sebelumnya
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                        Berikutnya
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialog untuk form Add/Edit Periode Evaluasi */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'create' ? 'Tambah Periode Evaluasi Baru' : 'Edit Periode Evaluasi'}</DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create'
                                ? 'Isi informasi periode evaluasi baru yang akan ditambahkan ke sistem.'
                                : 'Perbarui informasi periode evaluasi yang ada dalam sistem.'}
                        </DialogDescription>
                    </DialogHeader>

                    <PeriodeEvaluasiForm
                        periodeEvaluasi={activePeriodeEvaluasi}
                        mode={dialogMode}
                        onSuccess={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Alert Dialog untuk konfirmasi hapus */}
            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Periode Evaluasi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus periode evaluasi "{activePeriodeEvaluasi?.judul}"?
                            
                            {activePeriodeEvaluasi && 
                                ((activePeriodeEvaluasi.evaluasi_count && activePeriodeEvaluasi.evaluasi_count > 0) || 
                                (activePeriodeEvaluasi.hasil_evaluasi_count && activePeriodeEvaluasi.hasil_evaluasi_count > 0)) && (
                                <p className="mt-2 text-red-600">
                                    PERHATIAN: Periode evaluasi ini memiliki data evaluasi terkait. 
                                    Menghapus periode ini akan mempengaruhi data evaluasi tersebut.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}