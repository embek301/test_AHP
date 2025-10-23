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
import { ArrowLeft, ClipboardCheck, ClipboardList, GripVertical, MoreHorizontal, PlusCircle, PowerOff, Trash2 } from 'lucide-react';

import SubKriteriaForm from './SubKriteriaForm';

// Tipe untuk Kriteria
interface Kriteria {
    id: number;
    nama: string;
    deskripsi: string;
    bobot: number;
    aktif: boolean;
}

// Tipe untuk Sub Kriteria
interface SubKriteria {
    id: number;
    kriteria_id: number;
    nama: string;
    deskripsi: string;
    bobot: number;
    urutan: number;
    aktif: boolean;
    detail_evaluasi_count?: number;
}

// Props untuk komponen SubKriteria
interface SubKriteriaIndexProps extends PageProps {
    kriteria: Kriteria;
    subKriteria: SubKriteria[];
    stats?: {
        total: number;
        active: number;
        inactive: number;
        totalBobotAktif: number;
    };
    message?: string;
    error?: string;
}

export default function SubKriteriaIndex({ kriteria, subKriteria = [], stats, message, error }: SubKriteriaIndexProps) {
    // Initialize with empty array as fallback to prevent undefined errors
    const subKriteriaData = Array.isArray(subKriteria) ? subKriteria : [];

    const [sorting, setSorting] = useState<SortingState>([{ id: 'urutan', desc: false }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [activeSubKriteria, setActiveSubKriteria] = useState<SubKriteria | null>(null);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

    // State untuk search
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Implementasi debounce
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

    // Fungsi untuk membuka dialog tambah sub kriteria
    const handleAddSubKriteria = () => {
        setActiveSubKriteria(null);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog edit sub kriteria
    const handleEditSubKriteria = (subKriteria: SubKriteria) => {
        setActiveSubKriteria(subKriteria);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog konfirmasi hapus
    const handleDeleteConfirm = (subKriteria: SubKriteria) => {
        setActiveSubKriteria(subKriteria);
        setIsAlertDialogOpen(true);
    };

    // Fungsi untuk melakukan toggle status aktif
    const handleToggleActive = (subKriteria: SubKriteria) => {
    const newStatus = !subKriteria.aktif;
    const statusText = newStatus ? 'diaktifkan' : 'dinonaktifkan';

    router.put(
        route('kriteria.sub-kriteria.toggle-active', [kriteria.id, subKriteria.id]), // ← PERBAIKI INI
        {
            aktif: newStatus,
        },
        {
            onSuccess: () => {
                toast.success(`Sub kriteria ${subKriteria.nama} berhasil ${statusText}`);
            },
            onError: (errors) => {
                toast.error(errors.error || `Terjadi kesalahan saat ${statusText} sub kriteria`);
            },
        },
    );
};

    // Fungsi untuk melakukan hapus sub kriteria
    const handleDelete = () => {
    if (activeSubKriteria) {
        router.delete(route('kriteria.sub-kriteria.destroy', [kriteria.id, activeSubKriteria.id]), { // ← PERBAIKI INI
            onSuccess: () => {
                toast.success(`Sub kriteria ${activeSubKriteria.nama} berhasil dihapus`);
                setIsAlertDialogOpen(false);
            },
            onError: (errors) => {
                toast.error(errors.error || 'Terjadi kesalahan saat menghapus sub kriteria');
                setIsAlertDialogOpen(false);
            },
        });
    }
};
    // Filter data berdasarkan pencarian
    const filteredData = useMemo(() => {
        if (!debouncedSearchQuery) return subKriteriaData;

        const query = debouncedSearchQuery.toLowerCase().trim();

        return subKriteriaData.filter((subKriteria) => {
            if (subKriteria.nama?.toLowerCase().includes(query)) {
                return true;
            }
            if (subKriteria.deskripsi?.toLowerCase().includes(query)) {
                return true;
            }
            if (subKriteria.bobot?.toString().includes(query)) {
                return true;
            }
            return false;
        });
    }, [subKriteriaData, debouncedSearchQuery]);

    // Definisi kolom untuk tabel
    const columns: ColumnDef<SubKriteria>[] = [
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
            accessorKey: 'urutan',
            header: 'Urutan',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{row.getValue('urutan')}</span>
                </div>
            ),
        },
        {
            accessorKey: 'nama',
            header: 'Nama Sub Kriteria',
            cell: ({ row }) => <div className="font-medium">{row.getValue('nama')}</div>,
        },
        {
            accessorKey: 'deskripsi',
            header: 'Deskripsi',
            cell: ({ row }) => <div className="max-w-md">{row.getValue('deskripsi') || '-'}</div>,
        },
        {
            accessorKey: 'bobot',
            header: 'Bobot',
            cell: ({ row }) => {
                const bobot = row.getValue('bobot');
                const numericBobot = typeof bobot === 'string' ? parseFloat(bobot) : Number(bobot);

                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {!isNaN(numericBobot) ? numericBobot.toFixed(2) : '0.00'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'aktif',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('aktif') as boolean;
                return (
                    <Badge
                        variant={isActive ? 'success' : 'secondary'}
                        className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                        {isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'detail_evaluasi_count',
            header: 'Digunakan',
            cell: ({ row }) => {
                const count = row.original.detail_evaluasi_count || 0;
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        <ClipboardCheck className="mr-1 h-3 w-3" />
                        {count} Evaluasi
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const subKriteria = row.original;
                const isActive = subKriteria.aktif;
                const hasEvaluasi = (subKriteria.detail_evaluasi_count || 0) > 0;

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
                            <DropdownMenuItem onClick={() => handleEditSubKriteria(subKriteria)} className="flex cursor-pointer items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-blue-600"
                                >
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                                Edit Sub Kriteria
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleToggleActive(subKriteria)}
                                className="flex cursor-pointer items-center gap-2"
                                disabled={hasEvaluasi && isActive}
                            >
                                <PowerOff className={`h-4 w-4 ${isActive ? 'text-orange-600' : 'text-green-600'}`} />
                                {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDeleteConfirm(subKriteria)}
                                className="flex cursor-pointer items-center gap-2"
                                disabled={hasEvaluasi}
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

    // Konfigurasi tabel
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
        title: 'Kriteria Evaluasi',
        href: route('kriteria.index'),
    },
    {
        title: kriteria.nama,
        href: route('kriteria.sub-kriteria.index', kriteria.id), // ← PERBAIKI INI
    },
];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Sub Kriteria - ${kriteria.nama}`} />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
                    <div className="mx-auto max-w-5xl">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit(route('kriteria.index'))}
                            className="mb-4 hover:bg-purple-100"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Kriteria
                        </Button>
                        <h1 className="text-2xl font-bold text-indigo-800">Sub Kriteria: {kriteria.nama}</h1>
                        <p className="mt-2 text-indigo-600">Kelola sub kriteria untuk kriteria evaluasi "{kriteria.nama}"</p>
                        {kriteria.deskripsi && (
                            <p className="mt-1 text-sm text-indigo-500">{kriteria.deskripsi}</p>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <Card className="bg-purple-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600">Total Sub Kriteria</p>
                                        <h3 className="text-2xl font-bold text-purple-800">{stats.total}</h3>
                                    </div>
                                    <div className="rounded-full bg-purple-100 p-3">
                                        <ClipboardList className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Sub Kriteria Aktif</p>
                                        <h3 className="text-2xl font-bold text-green-800">{stats.active}</h3>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3">
                                        <ClipboardCheck className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Sub Kriteria Nonaktif</p>
                                        <h3 className="text-2xl font-bold text-gray-800">{stats.inactive}</h3>
                                    </div>
                                    <div className="rounded-full bg-gray-100 p-3">
                                        <PowerOff className="h-5 w-5 text-gray-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-indigo-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-indigo-600">Total Bobot Aktif</p>
                                        <h3 className="text-2xl font-bold text-indigo-800">{stats.totalBobotAktif.toFixed(2)}</h3>
                                    </div>
                                    <div className="rounded-full bg-indigo-100 p-3">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-indigo-600"
                                        >
                                            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                                            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                                            <path d="M7 21h10"></path>
                                            <path d="M12 3v18"></path>
                                            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="">
                    <Card className="shadow-md">
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className="">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <ClipboardList className="h-5 w-5 text-purple-600" />
                                        Daftar Sub Kriteria
                                    </CardTitle>
                                    <CardDescription>Kelola sub kriteria untuk "{kriteria.nama}"</CardDescription>
                                </div>
                                <Button onClick={handleAddSubKriteria} className="bg-purple-600 hover:bg-purple-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Sub Kriteria
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center gap-4">
                                <Input
                                    placeholder="Cari berdasarkan nama, deskripsi, atau bobot..."
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
                                                    Tidak ada data sub kriteria.
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

            {/* Dialog untuk form Add/Edit Sub Kriteria */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'create' ? 'Tambah Sub Kriteria Baru' : 'Edit Sub Kriteria'}</DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create'
                                ? `Isi informasi sub kriteria baru untuk "${kriteria.nama}".`
                                : `Perbarui informasi sub kriteria untuk "${kriteria.nama}".`}
                        </DialogDescription>
                    </DialogHeader>

                    <SubKriteriaForm
                        subKriteria={activeSubKriteria}
                        kriteriaId={kriteria.id}
                        mode={dialogMode}
                        onSuccess={() => setIsDialogOpen(false)}
                        totalBobotAktif={stats?.totalBobotAktif || 0}
                    />
                </DialogContent>
            </Dialog>

            {/* Alert Dialog untuk konfirmasi hapus */}
            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Sub Kriteria</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus sub kriteria "{activeSubKriteria?.nama}"?
                            {activeSubKriteria && activeSubKriteria.detail_evaluasi_count && activeSubKriteria.detail_evaluasi_count > 0 && (
                                <p className="mt-2 text-red-600">
                                    PERHATIAN: Sub kriteria ini telah digunakan dalam {activeSubKriteria.detail_evaluasi_count} evaluasi. Menghapus
                                    sub kriteria ini tidak diperbolehkan.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={activeSubKriteria?.detail_evaluasi_count && activeSubKriteria.detail_evaluasi_count > 0}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}