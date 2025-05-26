import { Head, router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Award, Eye, MoreHorizontal, PenLine, PlusCircle, Trash2 } from 'lucide-react';

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
    status: string;
}

interface Rekomendasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    konten: string;
    dibuat_oleh: number;
    status: 'draft' | 'disetujui' | 'ditolak' | 'implementasi';
    created_at: string;
    updated_at: string;
    guru: Guru;
    periode_evaluasi: PeriodeEvaluasi;
    pembuat: User;
}

interface RekomendasiIndexProps extends PageProps {
    rekomendasi: Rekomendasi[];
    guru: Guru[];
    periodeEvaluasi: PeriodeEvaluasi[];
    filters: {
        periode_id: number | null;
        guru_id: number | null;
    };
    message?: string;
    error?: string;
}

export default function RekomendasiIndex({ rekomendasi = [], guru = [], periodeEvaluasi = [], filters, message, error }: RekomendasiIndexProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [activeRekomendasi, setActiveRekomendasi] = useState<Rekomendasi | null>(null);
    const [selectedPeriode, setSelectedPeriode] = useState<string>(filters.periode_id ? String(filters.periode_id) : '');
    const [selectedGuru, setSelectedGuru] = useState<string>(filters.guru_id ? String(filters.guru_id) : '');

    // Tampilkan notifikasi jika ada message atau error dari server
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
        if (error) {
            toast.error(error);
        }
    }, [message, error]);

    // Fungsi untuk navigasi ke halaman tambah rekomendasi
    const handleAddRekomendasi = () => {
        const queryParams = new URLSearchParams();

        if (selectedPeriode) {
            queryParams.append('periode_id', selectedPeriode);
        }

        if (selectedGuru) {
            queryParams.append('guru_id', selectedGuru);
        }

        const queryString = queryParams.toString();
        const url = route('rekomendasi.create') + (queryString ? `?${queryString}` : '');

        router.visit(url);
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'disetujui':
                return 'success';
            case 'ditolak':
                return 'destructive';
            case 'implementasi':
                return 'default';
            default:
                return 'secondary';
        }
    };

    // Fungsi untuk mendapatkan label status (tambahkan ini)
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft':
                return 'Draft';
            case 'disetujui':
                return 'Disetujui';
            case 'ditolak':
                return 'Ditolak';
            case 'implementasi':
                return 'Implementasi';
            default:
                return status;
        }
    };

    // Fungsi untuk filter berdasarkan periode dan guru
    const handleFilter = () => {
        const queryParams = new URLSearchParams();

        if (selectedPeriode && selectedPeriode !== '_all') {
            // Tambahkan pengecekan untuk "_all"
            queryParams.append('periode_id', selectedPeriode);
        }

        if (selectedGuru && selectedGuru !== '_all') {
            // Tambahkan pengecekan untuk "_all"
            queryParams.append('guru_id', selectedGuru);
        }

        const queryString = queryParams.toString();
        router.get(route('rekomendasi.index') + (queryString ? `?${queryString}` : ''));
    };

    // Fungsi untuk reset filter
    const handleResetFilter = () => {
        setSelectedPeriode('_all'); // Ubah dari "" menjadi "_all"
        setSelectedGuru('_all'); // Ubah dari "" menjadi "_all"
        router.get(route('rekomendasi.index'));
    };

    // Fungsi untuk membuka dialog konfirmasi hapus
    const handleDeleteConfirm = (rekomendasi: Rekomendasi) => {
        setActiveRekomendasi(rekomendasi);
        setIsAlertDialogOpen(true);
    };

    // Fungsi untuk melakukan hapus rekomendasi
    const handleDelete = () => {
        if (activeRekomendasi) {
            router.delete(route('rekomendasi.destroy', activeRekomendasi.id), {
                onSuccess: () => {
                    toast.success('Rekomendasi berhasil dihapus');
                    setIsAlertDialogOpen(false);
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Terjadi kesalahan saat menghapus rekomendasi');
                    setIsAlertDialogOpen(false);
                },
            });
        }
    };

    // Fungsi untuk mengubah status rekomendasi
    const handleChangeStatus = (rekomendasi: Rekomendasi, newStatus: 'draft' | 'disetujui' | 'ditolak' | 'implementasi') => {
        router.put(
            route('rekomendasi.change-status', rekomendasi.id),
            { status: newStatus },
            {
                onSuccess: () => {
                    const statusMessages = {
                        draft: 'disimpan sebagai draft',
                        disetujui: 'disetujui',
                        ditolak: 'ditolak',
                        implementasi: 'diubah ke status implementasi',
                    };
                    toast.success(`Rekomendasi berhasil ${statusMessages[newStatus]}`);
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Terjadi kesalahan saat mengubah status rekomendasi');
                },
            },
        );
    };

    const getPeriodeJudul = (rekomendasi: any): string => {
        // Coba berbagai cara untuk mendapatkan judul
        if (rekomendasi?.periode_evaluasi?.judul) {
            return rekomendasi.periode_evaluasi.judul;
        }
        if (typeof rekomendasi?.periodeEvaluasi === 'object' && rekomendasi.periodeEvaluasi !== null) {
            return JSON.stringify(rekomendasi.periodeEvaluasi);
        }
        if (rekomendasi?.periode_judul) {
            return rekomendasi.periode_judul;
        }
        return 'Periode tidak tersedia';
    };

    // Definisi kolom untuk tabel
    const columns: ColumnDef<Rekomendasi>[] = [
        {
            accessorKey: 'guru',
            header: 'Guru',
            cell: ({ row }) => {
                const guru = row.original.guru;
                return <div className="font-medium">{guru && guru.user ? guru.user.name : 'Data tidak tersedia'}</div>;
            },
        },
        {
            accessorKey: 'periodeEvaluasi',
            header: 'Periode',
            cell: ({ row }) => {
                return <div>{getPeriodeJudul(row.original)}</div>;
            },
        },
        {
            accessorKey: 'konten',
            header: 'Isi Rekomendasi',
            cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.konten}</div>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                return <Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status)}</Badge>;
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return <div>{date.toLocaleDateString('id-ID')}</div>;
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const rekomendasi = row.original;

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
                                onClick={() => router.visit(route('rekomendasi.show', rekomendasi.id))}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <Eye className="h-4 w-4 text-blue-600" />
                                Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.visit(route('rekomendasi.edit', rekomendasi.id))}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <PenLine className="h-4 w-4 text-amber-600" />
                                Edit
                            </DropdownMenuItem>

                            {/* Menu untuk mengubah status */}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-gray-500">Ubah Status</DropdownMenuLabel>

                            {/* Hanya tampilkan opsi status yang tidak aktif saat ini */}
                            {rekomendasi.status !== 'draft' && (
                                <DropdownMenuItem
                                    onClick={() => handleChangeStatus(rekomendasi, 'draft')}
                                    className="flex cursor-pointer items-center gap-2"
                                >
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
                                        className="text-gray-600"
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                    Set ke Draft
                                </DropdownMenuItem>
                            )}

                            {rekomendasi.status !== 'disetujui' && (
                                <DropdownMenuItem
                                    onClick={() => handleChangeStatus(rekomendasi, 'disetujui')}
                                    className="flex cursor-pointer items-center gap-2"
                                >
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
                                        className="text-green-600"
                                    >
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    Setujui
                                </DropdownMenuItem>
                            )}

                            {rekomendasi.status !== 'ditolak' && (
                                <DropdownMenuItem
                                    onClick={() => handleChangeStatus(rekomendasi, 'ditolak')}
                                    className="flex cursor-pointer items-center gap-2"
                                >
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
                                        className="text-red-600"
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                    Tolak
                                </DropdownMenuItem>
                            )}

                            {rekomendasi.status !== 'implementasi' && (
                                <DropdownMenuItem
                                    onClick={() => handleChangeStatus(rekomendasi, 'implementasi')}
                                    className="flex cursor-pointer items-center gap-2"
                                >
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
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    Implementasi
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeleteConfirm(rekomendasi)} className="flex cursor-pointer items-center gap-2">
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
        data: rekomendasi,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

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
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Rekomendasi" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="dark mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-blue-800">Manajemen Rekomendasi</h1>
                        <p className="mt-2 text-blue-600">Kelola rekomendasi pengembangan untuk guru berdasarkan hasil evaluasi</p>
                    </div>
                </div>

                <div className="">
                    <Card className="shadow-md">
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className="">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Award className="h-5 w-5 text-blue-600" />
                                        Daftar Rekomendasi
                                    </CardTitle>
                                    <CardDescription>Kelola rekomendasi pengembangan untuk guru</CardDescription>
                                </div>
                                <Button onClick={handleAddRekomendasi} className="bg-blue-600 hover:bg-blue-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Rekomendasi
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Periode</label>
                                    <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih periode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="_all">Semua Periode</SelectItem> {/* Ubah dari "" menjadi "_all" */}
                                                {periodeEvaluasi.map((periode) => (
                                                    <SelectItem key={periode.id} value={periode.id.toString()}>
                                                        {periode.judul}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Guru</label>
                                    <Select value={selectedGuru} onValueChange={setSelectedGuru}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih guru" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="_all">Semua Guru</SelectItem> {/* Ubah dari "" menjadi "_all" */}
                                                {guru.map((g) => (
                                                    <SelectItem key={g.id} value={g.id.toString()}>
                                                        {g.user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button onClick={handleFilter} className="flex-1">
                                        Filter
                                    </Button>
                                    <Button onClick={handleResetFilter} variant="outline" className="flex-1">
                                        Reset
                                    </Button>
                                </div>
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
                                                <TableRow key={row.id}>
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
                                                    Tidak ada data rekomendasi.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-end space-x-2 py-4">
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

            {/* Alert Dialog untuk konfirmasi hapus */}
            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Rekomendasi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus rekomendasi ini?
                            <p className="mt-2">Tindakan ini tidak dapat dibatalkan.</p>
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
