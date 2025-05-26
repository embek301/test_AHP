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
import { useEffect, useState } from 'react';
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
import { Book, MoreHorizontal, PlusCircle, Power, Trash2, User } from 'lucide-react';
import MataPelajaranForm from './MataPelajaranForm';

// Tipe untuk Guru
interface Guru {
    id: number;
    user_id: number;
    mata_pelajaran_id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

// Definisikan tipe untuk data MataPelajaran
interface MataPelajaran {
    id: number;
    nama: string;
    kode: string;
    deskripsi?: string;
    is_active: boolean;
    guru: Guru[];
    created_at?: string;
    updated_at?: string;
}

// Props untuk komponen MataPelajaran
interface MataPelajaranIndexProps extends PageProps {
    mataPelajaran: MataPelajaran[];
    message?: string;
    error?: string;
}

export default function MataPelajaranIndex({ mataPelajaran = [], message, error }: MataPelajaranIndexProps) {
    // Initialize with empty array as fallback to prevent undefined errors
    const mataPelajaranData = Array.isArray(mataPelajaran) ? mataPelajaran : [];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [activeMataPelajaran, setActiveMataPelajaran] = useState<MataPelajaran | null>(null);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

    // Tampilkan notifikasi jika ada message atau error dari server
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    // Fungsi untuk membuka dialog tambah mata pelajaran
    const handleAddMataPelajaran = () => {
        setActiveMataPelajaran(null);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog edit mata pelajaran
    const handleEditMataPelajaran = (mataPelajaran: MataPelajaran) => {
        setActiveMataPelajaran(mataPelajaran);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog konfirmasi hapus
    const handleDeleteConfirm = (mataPelajaran: MataPelajaran) => {
        setActiveMataPelajaran(mataPelajaran);
        setIsAlertDialogOpen(true);
    };

    // Fungsi untuk melakukan toggle status aktif
    const handleToggleActive = (mataPelajaran: MataPelajaran) => {
        router.put(
            route('mata-pelajaran.toggle-active', mataPelajaran.id),
            {},
            {
                onSuccess: () => {
                    const status = !mataPelajaran.is_active ? 'diaktifkan' : 'dinonaktifkan';
                    toast.success(`Mata pelajaran ${mataPelajaran.nama} berhasil ${status}`);
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Terjadi kesalahan saat mengubah status');
                },
            },
        );
    };

    // Fungsi untuk melakukan hapus mata pelajaran
    const handleDelete = () => {
        if (activeMataPelajaran) {
            router.delete(
                route('mata-pelajaran.destroy', activeMataPelajaran.id),
                {
                    onSuccess: () => {
                        toast.success(`Mata pelajaran ${activeMataPelajaran.nama} berhasil dihapus`);
                        setIsAlertDialogOpen(false);
                    },
                    onError: (errors) => {
                        toast.error(errors.error || 'Terjadi kesalahan saat menghapus mata pelajaran');
                        setIsAlertDialogOpen(false);
                    },
                },
            );
        }
    };

    // Definisi kolom untuk tabel
    const columns: ColumnDef<MataPelajaran>[] = [
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
            accessorKey: 'kode',
            header: 'Kode',
            cell: ({ row }) => (
                <Badge variant="outline" className="font-medium">
                    {row.getValue('kode')}
                </Badge>
            ),
        },
        {
            accessorKey: 'nama',
            header: 'Nama Mata Pelajaran',
            cell: ({ row }) => <div className="font-medium">{row.getValue('nama')}</div>,
        },
        {
            accessorKey: 'deskripsi',
            header: 'Deskripsi',
            cell: ({ row }) => {
                const deskripsi = row.getValue('deskripsi') as string;
                return (
                    <div className="max-w-[500px] truncate">
                        {deskripsi || <span className="text-gray-400 italic">Tidak ada deskripsi</span>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_active') as boolean;
                return (
                    <Badge variant={isActive ? "success" : "destructive"}>
                        {isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'guru',
            header: 'Guru Pengajar',
            cell: ({ row }) => {
                const guru = row.original.guru || [];
                const guruCount = Array.isArray(guru) ? guru.length : 0;
                
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                        <User className="mr-1 h-3 w-3" />
                        {guruCount} Guru
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const mataPelajaran = row.original;

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
                                onClick={() => handleEditMataPelajaran(mataPelajaran)}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleToggleActive(mataPelajaran)}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <Power className={`h-4 w-4 ${mataPelajaran.is_active ? 'text-orange-600' : 'text-green-600'}`} />
                                {mataPelajaran.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleDeleteConfirm(mataPelajaran)}
                                className="flex cursor-pointer items-center gap-2"
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
        data: mataPelajaranData,
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
            title: 'Manajemen Mata Pelajaran',
            href: route('mata-pelajaran.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Mata Pelajaran" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-indigo-800">Manajemen Mata Pelajaran</h1>
                        <p className="mt-2 text-indigo-600">Kelola data mata pelajaran dalam sistem evaluasi guru</p>
                    </div>
                </div>

                <div className="">
                    <Card className="shadow-md">
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className=''>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Book className="h-5 w-5 text-indigo-600" />
                                        Daftar Mata Pelajaran
                                    </CardTitle>
                                    <CardDescription>Kelola data mata pelajaran dalam sistem</CardDescription>
                                </div>
                                <Button onClick={handleAddMataPelajaran} className="bg-indigo-600 hover:bg-indigo-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center gap-4">
                                <Input
                                    placeholder="Cari berdasarkan nama atau kode..."
                                    value={(table.getColumn('nama')?.getFilterValue() as string) ?? ''}
                                    onChange={(event) => table.getColumn('nama')?.setFilterValue(event.target.value)}
                                    className="max-w-sm"
                                />
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
                                                    Tidak ada data mata pelajaran.
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

            {/* Dialog untuk form Add/Edit Mata Pelajaran */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'create' ? 'Tambah Mata Pelajaran Baru' : 'Edit Mata Pelajaran'}</DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create'
                                ? 'Isi informasi mata pelajaran baru yang akan ditambahkan ke sistem.'
                                : 'Perbarui informasi mata pelajaran yang ada dalam sistem.'}
                        </DialogDescription>
                    </DialogHeader>

                    <MataPelajaranForm mataPelajaran={activeMataPelajaran} mode={dialogMode} onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Alert Dialog untuk konfirmasi hapus */}
            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Mata Pelajaran</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus mata pelajaran "{activeMataPelajaran?.nama}"?
                            {activeMataPelajaran && activeMataPelajaran.guru && activeMataPelajaran.guru.length > 0 && (
                                <p className="mt-2 text-red-600">
                                    PERHATIAN: Mata pelajaran ini memiliki {activeMataPelajaran.guru.length} guru yang mengajar. 
                                    Menghapus mata pelajaran ini akan mempengaruhi data guru tersebut.
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