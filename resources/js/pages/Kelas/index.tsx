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
import { MoreHorizontal, PlusCircle, School, Trash2, Users } from 'lucide-react';
import KelasForm from './KelasForm';

// Definisikan tipe untuk data Kelas
interface Kelas {
    id: number;
    nama: string;
    tahun_akademik: string;
    siswa_kelas: Array<{
        id: number;
        kelas_id: number;
        user_id: number;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    created_at?: string;
    updated_at?: string;
}

// Props untuk komponen Kelas
interface KelasIndexProps extends PageProps {
    kelas: Kelas[];
    message?: string;
    error?: string;
}

export default function KelasIndex({ kelas = [], message, error }: KelasIndexProps) {
    // Initialize with empty array as fallback to prevent undefined errors
    const kelasData = Array.isArray(kelas) ? kelas : [];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [activeKelas, setActiveKelas] = useState<Kelas | null>(null);
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

    // Fungsi untuk membuka dialog tambah kelas
    const handleAddKelas = () => {
        setActiveKelas(null);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog edit kelas
    const handleEditKelas = (kelas: Kelas) => {
        setActiveKelas(kelas);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog konfirmasi hapus
    const handleDeleteConfirm = (kelas: Kelas) => {
        setActiveKelas(kelas);
        setIsAlertDialogOpen(true);
    };

    // Fungsi untuk melakukan hapus kelas
    const handleDelete = () => {
        if (activeKelas) {
            router.delete(
                route('kelas.destroy', activeKelas.id),
                {
                    onSuccess: () => {
                        toast.success(`Kelas ${activeKelas.nama} berhasil dihapus`);
                        setIsAlertDialogOpen(false);
                    },
                    onError: (errors) => {
                        toast.error(errors.error || 'Terjadi kesalahan saat menghapus kelas');
                        setIsAlertDialogOpen(false);
                    },
                },
            );
        }
    };

    // Definisi kolom untuk tabel
    const columns: ColumnDef<Kelas>[] = [
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
            accessorKey: 'nama',
            header: 'Nama Kelas',
            cell: ({ row }) => <div className="font-medium">{row.getValue('nama')}</div>,
        },
        {
            accessorKey: 'tahun_akademik',
            header: 'Tahun Akademik',
            cell: ({ row }) => <div>{row.getValue('tahun_akademik')}</div>,
        },
        {
            accessorKey: 'siswa_kelas',
            header: 'Jumlah Siswa',
            cell: ({ row }) => {
                // Ensure siswaKelas exists and is an array before accessing length
                const siswaKelas = row.original.siswa_kelas || [];
                const siswaCount = Array.isArray(siswaKelas) ? siswaKelas.length : 0;

                console.log('Jumlah siswa:', siswaCount);
                
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <Users className="mr-1 h-3 w-3" />
                        {siswaCount} Siswa
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const kelas = row.original;

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
                                onClick={() => handleEditKelas(kelas)}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Edit Kelas
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleDeleteConfirm(kelas)}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                                Hapus Kelas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // Konfigurasi tabel dengan tanstack/react-table
    const table = useReactTable({
        data: kelasData,
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
            title: 'Manajemen Kelas',
            href: route('kelas.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Kelas" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-blue-800">Manajemen Kelas</h1>
                        <p className="mt-2 text-blue-600">Kelola data kelas dan siswa dalam sistem evaluasi guru</p>
                    </div>
                </div>

                <div className="">
                    <Card className="shadow-md">
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className=''>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <School className="h-5 w-5 text-blue-600" />
                                        Daftar Kelas
                                    </CardTitle>
                                    <CardDescription>Kelola data kelas dalam sistem</CardDescription>
                                </div>
                                <Button onClick={handleAddKelas} className="bg-blue-600 hover:bg-blue-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kelas
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center gap-4">
                                <Input
                                    placeholder="Cari berdasarkan nama kelas..."
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
                                                    Tidak ada data kelas.
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

            {/* Dialog untuk form Add/Edit Kelas */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'create' ? 'Tambah Kelas Baru' : 'Edit Kelas'}</DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create'
                                ? 'Isi informasi kelas baru yang akan ditambahkan ke sistem.'
                                : 'Perbarui informasi kelas yang ada dalam sistem.'}
                        </DialogDescription>
                    </DialogHeader>

                    <KelasForm kelas={activeKelas} mode={dialogMode} onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Alert Dialog untuk konfirmasi hapus */}
            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kelas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kelas "{activeKelas?.nama}"?
                            {activeKelas && activeKelas.siswa_kelas && activeKelas.siswa_kelas.length > 0 && (
                                <p className="mt-2 text-red-600">
                                    PERHATIAN: Kelas ini memiliki {activeKelas.siswa_kelas.length} siswa terdaftar. 
                                    Menghapus kelas ini akan menghapus seluruh data terkait.
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