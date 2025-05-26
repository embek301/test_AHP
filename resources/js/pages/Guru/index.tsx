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
import { format } from 'date-fns';
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
import { CalendarCheck, ClipboardList, GraduationCap, MoreHorizontal, PenSquare, PlusCircle, Power, Trash2 } from 'lucide-react';

import GuruForm from './GuruForm';

// Tipe untuk MataPelajaran
interface MataPelajaran {
    id: number;
    nama: string;
    kode: string;
    deskripsi?: string;
    is_active: boolean;
}

// Tipe untuk User
interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
}

// Tipe untuk Evaluasi
interface Evaluasi {
    id: number;
    guru_id: number;
    periode: string;
}

// Tipe untuk HasilEvaluasi
interface HasilEvaluasi {
    id: number;
    guru_id: number;
    periode_id: number;
}

// Definisikan tipe untuk data Guru
interface Guru {
    id: number;
    user_id: number;
    nip: string;
    mata_pelajaran_id: number;
    tanggal_bergabung: string;
    user: User;
    mata_pelajaran: MataPelajaran;
    evaluasi: Evaluasi[];
    hasil_evaluasi: HasilEvaluasi[];
    created_at?: string;
    updated_at?: string;
}

// Props untuk komponen Guru
interface GuruIndexProps extends PageProps {
    guru: Guru[];
    mataPelajaran: MataPelajaran[];
    message?: string;
    error?: string;
}

export default function GuruIndex({ guru = [], mataPelajaran = [], message, error }: GuruIndexProps) {
    // Initialize with empty array as fallback to prevent undefined errors
    const guruData = Array.isArray(guru) ? guru : [];
    const mataPelajaranData = Array.isArray(mataPelajaran) ? mataPelajaran : [];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [activeGuru, setActiveGuru] = useState<Guru | null>(null);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

    // Tambahkan state search global
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Tampilkan notifikasi jika ada message atau error dari server
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    // Fungsi untuk membuka dialog tambah guru
    const handleAddGuru = () => {
        setActiveGuru(null);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog edit guru
    const handleEditGuru = (guru: Guru) => {
        setActiveGuru(guru);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog konfirmasi hapus
    const handleDeleteConfirm = (guru: Guru) => {
        setActiveGuru(guru);
        setIsAlertDialogOpen(true);
    };

    // Fungsi untuk melakukan toggle status aktif
    const handleToggleActive = (guru: Guru) => {
        router.put(
            route('guru.toggle-active', guru.id),
            {},
            {
                onSuccess: () => {
                    const status = !guru.user.is_active ? 'diaktifkan' : 'dinonaktifkan';
                    toast.success(`Akun guru ${guru.user.name} berhasil ${status}`);
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Terjadi kesalahan saat mengubah status');
                },
            },
        );
    };

    // Fungsi untuk melakukan hapus guru
    const handleDelete = () => {
        if (activeGuru) {
            router.delete(route('guru.destroy', activeGuru.id), {
                onSuccess: () => {
                    toast.success(`Data guru ${activeGuru.user.name} berhasil dihapus`);
                    setIsAlertDialogOpen(false);
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Terjadi kesalahan saat menghapus data guru');
                    setIsAlertDialogOpen(false);
                },
            });
        }
    };

    // Perbaikan definisi kolom untuk tabel
    const columns: ColumnDef<Guru>[] = [
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
            accessorKey: 'nip',
            header: 'NIP',
            cell: ({ row }) => (
                <Badge variant="outline" className="font-medium">
                    {row.getValue('nip')}
                </Badge>
            ),
        },
        {
            accessorKey: 'user',
            header: 'Nama Guru',
            cell: ({ row }) => {
                const user = row.original.user;
                return <div className="font-medium">{user?.name || 'N/A'}</div>;
            },
        },
        {
            accessorKey: 'user',
            id: 'email',
            header: 'Email',
            cell: ({ row }) => {
                const user = row.original.user;
                return <div>{user?.email || 'N/A'}</div>;
            },
        },
        {
            accessorKey: 'mata_pelajaran.nama',
            header: 'Mata Pelajaran',
            cell: ({ row }) => {
                const mataPelajaran = row.original.mata_pelajaran;
                return (
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                        <PenSquare className="mr-1 h-3 w-3" />
                        {mataPelajaran?.nama || 'Tidak ada'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'tanggal_bergabung',
            header: 'Tanggal Bergabung',
            cell: ({ row }) => {
                const date = row.getValue('tanggal_bergabung') as string;
                return (
                    <div className="flex items-center">
                        <CalendarCheck className="mr-1 h-4 w-4 text-gray-500" />
                        {format(new Date(date), 'dd MMM yyyy')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'user.is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.original.user.is_active;
                return <Badge variant={isActive ? 'success' : 'destructive'}>{isActive ? 'Aktif' : 'Nonaktif'}</Badge>;
            },
        },
        {
            accessorKey: 'evaluasi',
            header: 'Evaluasi',
            cell: ({ row }) => {
                const evaluasi = row.original.evaluasi || [];
                const evaluasiCount = Array.isArray(evaluasi) ? evaluasi.length : 0;

                const hasilEvaluasi = row.original.hasil_evaluasi || [];
                const hasilCount = Array.isArray(hasilEvaluasi) ? hasilEvaluasi.length : 0;

                return (
                    <div className="space-y-1">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            <ClipboardList className="mr-1 h-3 w-3" />
                            {evaluasiCount} Evaluasi
                        </Badge>
                        <br />
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                            <ClipboardList className="mr-1 h-3 w-3" />
                            {hasilCount} Hasil
                        </Badge>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const guru = row.original;

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
                            <DropdownMenuItem onClick={() => handleEditGuru(guru)} className="flex cursor-pointer items-center gap-2">
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
                                Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(guru)} className="flex cursor-pointer items-center gap-2">
                                <Power className={`h-4 w-4 ${guru.user.is_active ? 'text-orange-600' : 'text-green-600'}`} />
                                {guru.user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteConfirm(guru)} className="flex cursor-pointer items-center gap-2">
                                <Trash2 className="h-4 w-4 text-red-600" />
                                Hapus Data
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

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

    // Gunakan useMemo untuk memfilter data hanya ketika perlu
    const filteredData = useMemo(() => {
        if (!debouncedSearchQuery) return guruData;

        const query = debouncedSearchQuery.toLowerCase().trim();

        // Filter hanya dijalankan ketika debouncedSearchQuery berubah
        return guruData.filter((guru) => {
            // Cari di NIP
            if (guru.nip?.toLowerCase().includes(query)) {
                return true;
            }

            // Cari di nama guru
            if (guru.user?.name?.toLowerCase().includes(query)) {
                return true;
            }

            // Cari di email
            if (guru.user?.email?.toLowerCase().includes(query)) {
                return true;
            }

            return false;
        });
    }, [guruData, debouncedSearchQuery]);

    // Update table config untuk menggunakan filteredData
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
            title: 'Manajemen Guru',
            href: route('guru.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Guru" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="dark mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 p-6">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-green-800">Manajemen Guru</h1>
                        <p className="mt-2 text-green-600">Kelola data guru dan tenaga pengajar dalam sistem evaluasi</p>
                    </div>
                </div>

                <div className="">
                    <Card className="shadow-md">
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className="">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <GraduationCap className="h-5 w-5 text-green-600" />
                                        Daftar Guru
                                    </CardTitle>
                                    <CardDescription>Kelola data guru dan tenaga pengajar dalam sistem</CardDescription>
                                </div>
                                <Button onClick={handleAddGuru} className="bg-green-600 hover:bg-green-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Guru Baru
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center gap-4">
                                <Input
                                    placeholder="Cari berdasarkan nama, NIP, atau email..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="max-w-sm"
                                />
                                {/* Indikator pencarian (opsional) */}
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
                                                    Tidak ada data guru.
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

            {/* Dialog untuk form Add/Edit Guru */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'create' ? 'Tambah Guru Baru' : 'Edit Data Guru'}</DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create'
                                ? 'Isi informasi guru baru yang akan ditambahkan ke sistem.'
                                : 'Perbarui informasi guru yang ada dalam sistem.'}
                        </DialogDescription>
                    </DialogHeader>

                    <GuruForm guru={activeGuru} mataPelajaran={mataPelajaranData} mode={dialogMode} onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Alert Dialog untuk konfirmasi hapus */}
            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Guru</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data guru "{activeGuru?.user.name}"?
                            {activeGuru &&
                                ((activeGuru.evaluasi && activeGuru.evaluasi.length > 0) ||
                                    (activeGuru.hasil_evaluasi && activeGuru.hasil_evaluasi.length > 0)) && (
                                    <p className="mt-2 text-red-600">
                                        PERHATIAN: Guru ini memiliki data evaluasi terkait. Menghapus data guru ini akan mempengaruhi semua data
                                        evaluasi tersebut.
                                    </p>
                                )}
                            <p className="mt-2">Tindakan ini akan menghapus data guru dan akun pengguna terkait secara permanen.</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
