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
import { GraduationCap, KeyRound, MoreHorizontal, School, ToggleLeft, TrashIcon, UserPlus } from 'lucide-react';
import AssignKelasForm from './AssignKelasForm';
import SiswaForm from './SiswaForm';

// Tipe untuk Kelas
interface Kelas {
    id: number;
    nama: string;
    tahun_akademik: string;
}

// Tipe untuk SiswaKelas
interface SiswaKelas {
    id: number;
    user_id: number;
    kelas_id: number;
    kelas: Kelas;
}

// Tipe untuk data Siswa
interface Siswa {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    siswaKelas: SiswaKelas[]; // Pastikan ini bukan opsional (?)
    created_at?: string;
    updated_at?: string;
}

// Props untuk komponen Siswa
interface SiswaIndexProps extends PageProps {
    siswa: Siswa[];
    kelas: Kelas[];
    message?: string;
    error?: string;
}

export default function SiswaIndex({ siswa = [], kelas = [], message, error }: SiswaIndexProps) {
    // Initialize with empty array as fallback to prevent undefined errors
    const siswaData = Array.isArray(siswa) ? siswa : [];
    const kelasData = Array.isArray(kelas) ? kelas : [];
    
    // Debug semua data siswa saat komponen di-render
    useEffect(() => {
        console.log('Siswa data from server:', siswaData);
        // Check if siswaKelas exists and is populated
        siswaData.forEach((siswa, index) => {
            console.log(`Siswa ${index} - ${siswa.name}:`, {
                hasSiswaKelasProperty: siswa.hasOwnProperty('siswaKelas'),
                siswaKelasValue: siswa.siswaKelas,
                siswaKelasType: typeof siswa.siswaKelas,
                isArray: Array.isArray(siswa.siswaKelas),
                length: siswa.siswaKelas ? siswa.siswaKelas.length : 'N/A'
            });
        });
    }, [siswaData]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAssignKelasDialogOpen, setIsAssignKelasDialogOpen] = useState(false);
    const [isRemoveKelasDialogOpen, setIsRemoveKelasDialogOpen] = useState(false);
    const [isToggleActiveDialogOpen, setIsToggleActiveDialogOpen] = useState(false);
    const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);

    const [activeSiswa, setActiveSiswa] = useState<Siswa | null>(null);
    const [activeKelas, setActiveKelas] = useState<SiswaKelas | null>(null);
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

    // Fungsi untuk membuka dialog tambah siswa
    const handleAddSiswa = () => {
        setActiveSiswa(null);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog edit siswa
    const handleEditSiswa = (siswa: Siswa) => {
        setActiveSiswa(siswa);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog tambahkan siswa ke kelas
    const handleAssignKelasDialog = (siswa: Siswa) => {
        setActiveSiswa(siswa);
        setIsAssignKelasDialogOpen(true);
    };

    // Fungsi untuk membuka dialog konfirmasi hapus siswa dari kelas
    const handleRemoveKelasConfirm = (siswa: Siswa, kelasItem: SiswaKelas) => {
        setActiveSiswa(siswa);
        setActiveKelas(kelasItem);
        setIsRemoveKelasDialogOpen(true);
    };

    // Fungsi untuk menghapus siswa dari kelas
    const handleRemoveKelas = () => {
        if (activeSiswa && activeKelas) {
            router.post(
                route('siswa.removeFromKelas', activeSiswa.id),
                {
                    siswa_kelas_id: activeKelas.id,
                    _method: 'DELETE',
                },
                {
                    onSuccess: () => {
                        toast.success(`Siswa berhasil dihapus dari kelas ${activeKelas.kelas.nama}`);
                        setIsRemoveKelasDialogOpen(false);
                    },
                    onError: (errors) => {
                        toast.error(errors.error || 'Terjadi kesalahan saat menghapus siswa dari kelas');
                        setIsRemoveKelasDialogOpen(false);
                    },
                },
            );
        }
    };

    // Fungsi untuk membuka dialog konfirmasi toggle active status
    const handleToggleActiveConfirm = (siswa: Siswa) => {
        setActiveSiswa(siswa);
        setIsToggleActiveDialogOpen(true);
    };

    // Fungsi untuk melakukan toggle status aktif
    const handleToggleActive = () => {
        if (activeSiswa) {
            router.post(
                route('siswa.toggleActive', activeSiswa.id),
                {
                    _method: 'PATCH',
                },
                {
                    onSuccess: () => {
                        const newStatus = !activeSiswa.is_active ? 'diaktifkan' : 'dinonaktifkan';
                        toast.success(`Akun siswa berhasil ${newStatus}`);
                        setIsToggleActiveDialogOpen(false);
                    },
                    onError: () => {
                        toast.error('Terjadi kesalahan saat mengubah status akun');
                        setIsToggleActiveDialogOpen(false);
                    },
                },
            );
        }
    };

    // Fungsi untuk membuka dialog konfirmasi reset password
    const handleResetPasswordConfirm = (siswa: Siswa) => {
        setActiveSiswa(siswa);
        setIsResetPasswordDialogOpen(true);
    };

    // Fungsi untuk melakukan reset password
    const handleResetPassword = () => {
        if (activeSiswa) {
            router.post(
                route('siswa.resetPassword', activeSiswa.id),
                {
                    _method: 'PATCH',
                },
                {
                    onSuccess: () => {
                        toast.success('Password siswa berhasil direset ke default');
                        setIsResetPasswordDialogOpen(false);
                    },
                    onError: () => {
                        toast.error('Terjadi kesalahan saat mereset password');
                        setIsResetPasswordDialogOpen(false);
                    },
                },
            );
        }
    };

    // Definisi kolom untuk tabel
    const columns: ColumnDef<Siswa>[] = [
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
            accessorKey: 'name',
            header: 'Nama Siswa',
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'siswaKelas',
            header: 'Kelas',
            cell: ({ row }) => {
                const siswa = row.original;
                
                // Ensure siswaKelas is treated as an array, handle all edge cases
                let siswaKelas: SiswaKelas[] = [];
                
                // First check if property exists
                if (siswa.hasOwnProperty('siswaKelas')) {
                    // Then handle different formats it might be in
                    if (Array.isArray(siswa.siswaKelas)) {
                        siswaKelas = siswa.siswaKelas;
                    } else if (siswa.siswaKelas && typeof siswa.siswaKelas === 'object') {
                        // Convert object to array if needed
                        siswaKelas = Object.values(siswa.siswaKelas);
                    }
                }
                
                return (
                    <div className="flex flex-wrap gap-2">
                        {siswaKelas && siswaKelas.length > 0 ? (
                            siswaKelas.map((item) => (
                                item && item.kelas ? (
                                    <Badge key={item.id} variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
                                        <School className="h-3 w-3" />
                                        {item.kelas.nama}
                                        <button
                                            className="ml-1 rounded-full bg-blue-200 p-0.5 hover:bg-blue-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveKelasConfirm(siswa, item);
                                            }}
                                        >
                                            <TrashIcon className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                ) : (
                                    <Badge key={item.id} variant="outline" className="bg-yellow-100 text-yellow-800">
                                        Kelas #{item.kelas_id}
                                    </Badge>
                                )
                            ))
                        ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                Belum Ada Kelas
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.original.is_active;
                return (
                    <Badge
                        variant="outline"
                        className={isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}
                    >
                        {isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const siswa = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Tindakan
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditSiswa(siswa)} className="flex cursor-pointer items-center gap-2">
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
                                Edit Siswa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignKelasDialog(siswa)} className="flex cursor-pointer items-center gap-2">
                                <School className="h-4 w-4 text-teal-600" />
                                Tambahkan ke Kelas
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActiveConfirm(siswa)} className="flex cursor-pointer items-center gap-2">
                                <ToggleLeft className="h-4 w-4 text-amber-600" />
                                {siswa.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPasswordConfirm(siswa)} className="flex cursor-pointer items-center gap-2">
                                <KeyRound className="h-4 w-4 text-violet-600" />
                                Reset Password
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // Konfigurasi tabel dengan tanstack/react-table
    const table = useReactTable({
        data: siswaData,
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
            title: 'Manajemen Siswa',
            href: route('siswa.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Siswa" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="dark mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-blue-800">Manajemen Siswa</h1>
                        <p className="mt-2 text-blue-600">Kelola data siswa dan kelas yang diikuti dalam sistem evaluasi guru</p>
                    </div>
                </div>

                <div className="">
                    <Card className="shadow-md">
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className="">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                        Daftar Siswa
                                    </CardTitle>
                                    <CardDescription>Kelola data siswa dan kelas yang diikuti</CardDescription>
                                </div>
                                <Button onClick={handleAddSiswa} className="bg-blue-600 hover:bg-blue-700">
                                    <UserPlus className="mr-2 h-4 w-4" /> Tambah Siswa
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center gap-4">
                                <Input
                                    placeholder="Cari berdasarkan nama siswa..."
                                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                                    className="max-w-sm"
                                />
                                <Input
                                    placeholder="Cari berdasarkan email..."
                                    value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
                                    onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
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
                                                    Tidak ada data siswa.
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

            {/* Dialog untuk form Add/Edit Siswa */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'create' ? 'Tambah Siswa Baru' : 'Edit Siswa'}</DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create'
                                ? 'Isi informasi siswa baru yang akan ditambahkan ke sistem.'
                                : 'Perbarui informasi siswa yang ada dalam sistem.'}
                        </DialogDescription>
                    </DialogHeader>

                    <SiswaForm siswa={activeSiswa} mode={dialogMode} kelas={kelasData} onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Dialog untuk form Assign Kelas */}
            <Dialog open={isAssignKelasDialogOpen} onOpenChange={setIsAssignKelasDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Tambahkan ke Kelas</DialogTitle>
                        <DialogDescription>Tambahkan siswa {activeSiswa?.name || ''} ke dalam kelas yang tersedia.</DialogDescription>
                    </DialogHeader>

                    <AssignKelasForm siswa={activeSiswa} kelas={kelasData} onSuccess={() => setIsAssignKelasDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Alert Dialog untuk konfirmasi hapus dari kelas */}
            <AlertDialog open={isRemoveKelasDialogOpen} onOpenChange={setIsRemoveKelasDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus dari Kelas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus siswa <span className="font-medium">{activeSiswa?.name}</span> dari kelas{' '}
                            <span className="font-medium">{activeKelas?.kelas?.nama}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveKelas} className="bg-red-600 hover:bg-red-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Alert Dialog untuk konfirmasi toggle active */}
            <AlertDialog open={isToggleActiveDialogOpen} onOpenChange={setIsToggleActiveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{activeSiswa?.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {activeSiswa?.is_active
                                ? `Apakah Anda yakin ingin menonaktifkan akun untuk siswa ${activeSiswa?.name}? Siswa tidak akan dapat login ke sistem.`
                                : `Apakah Anda yakin ingin mengaktifkan akun untuk siswa ${activeSiswa?.name}?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleToggleActive}
                            className={activeSiswa?.is_active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}
                        >
                            {activeSiswa?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Alert Dialog untuk konfirmasi reset password */}
            <AlertDialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Password</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin mereset password untuk siswa <span className="font-medium">{activeSiswa?.name}</span>? Password
                            akan direset ke default.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetPassword} className="bg-violet-600 hover:bg-violet-700">
                            Reset Password
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
