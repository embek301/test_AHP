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
import { BookOpen, MoreHorizontal, PlusCircle, School, User2, UserCog, Users2 } from 'lucide-react';
import UserForm from './UserForm';

// Definisikan tipe untuk data User
interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: { id: number; name: string }[];
    created_at?: string;
    updated_at?: string;
}

// Definisikan tipe untuk data Role
interface Role {
    id: number;
    name: string;
}

// Props untuk komponen Users
interface UsersProps extends PageProps {
    users: User[];
    roles: Role[];
    message?: string;
    error?: string;
}

export default function Users({ users = [], roles = [], message, error }: UsersProps) {
    console.log('Rendering Users component', users, roles, message, error);

    // Initialize with empty array as fallback to prevent undefined errors
    const usersData = Array.isArray(users) ? users : [];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [activeUser, setActiveUser] = useState<User | null>(null);
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

    // Fungsi untuk membuka dialog tambah user
    const handleAddUser = () => {
        setActiveUser(null);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog edit user
    const handleEditUser = (user: User) => {
        setActiveUser(user);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    // Fungsi untuk membuka dialog konfirmasi toggle active
    const handleToggleActiveConfirm = (user: User) => {
        setActiveUser(user);
        setIsAlertDialogOpen(true);
    };

    // Fungsi untuk melakukan toggle active status user
    const handleToggleActive = () => {
        if (activeUser) {
            router.post(
                route('users.toggle-active', activeUser.id),
                {},
                {
                    onSuccess: () => {
                        toast.success(`Status pengguna ${activeUser.name} berhasil diperbarui`);
                        setIsAlertDialogOpen(false);
                    },
                    onError: () => {
                        toast.error('Terjadi kesalahan saat memperbarui status pengguna');
                    },
                },
            );
        }
    };

    // Definisi kolom untuk tabel
    const columns: ColumnDef<User>[] = [
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
            header: 'Nama',
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'roles',
            header: 'Peran',
            cell: ({ row }) => {
                const roles = row.original.roles;
                if (!roles || roles.length === 0) return '-';

                // Map role name ke ikon yang sesuai dan warna badge
                const roleConfig: Record<string, { icon: JSX.Element; color: string }> = {
                    admin: {
                        icon: <UserCog className="mr-1 h-3 w-3" />,
                        color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
                    },
                    kepala_sekolah: {
                        icon: <School className="mr-1 h-3 w-3" />,
                        color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
                    },
                    guru: {
                        icon: <BookOpen className="mr-1 h-3 w-3" />,
                        color: 'bg-green-100 text-green-800 hover:bg-green-200',
                    },
                    siswa: {
                        icon: <Users2 className="mr-1 h-3 w-3" />,
                        color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
                    },
                };

                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.map((role) => {
                            const config = roleConfig[role.name] || {
                                icon: null,
                                color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
                            };

                            return (
                                <Badge key={role.id} className={`${config.color} flex items-center`} variant="outline">
                                    {config.icon}
                                    {role.name === 'admin' && 'Administrator'}
                                    {role.name === 'kepala_sekolah' && 'Kepala Sekolah'}
                                    {role.name === 'guru' && 'Guru'}
                                    {role.name === 'siswa' && 'Siswa'}
                                    {!['admin', 'kepala_sekolah', 'guru', 'siswa'].includes(role.name) && role.name}
                                </Badge>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                return row.getValue('is_active') ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200" variant="outline">
                        Aktif
                    </Badge>
                ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200" variant="outline">
                        Tidak Aktif
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;

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
                                onClick={() => handleEditUser(user)}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Edit Pengguna
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleToggleActiveConfirm(user)}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                {user.is_active ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                                        Nonaktifkan Pengguna
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                                        Aktifkan Pengguna
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // Konfigurasi tabel dengan tanstack/react-table
    const table = useReactTable({
        data: usersData,
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
            title: 'Manajemen Pengguna',
            href: route('users.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />

            <Toaster position="top-right" richColors />

            <div className="p-4">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-blue-800">Manajemen Pengguna</h1>
                        <p className="mt-2 text-blue-600">Kelola semua pengguna dalam sistem evaluasi guru</p>
                    </div>
                </div>

                <div className="">
                    <Card className="shadow-md">
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className=''>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <User2 className="h-5 w-5 text-blue-600" />
                                        Daftar Pengguna
                                    </CardTitle>
                                    <CardDescription>Kelola semua pengguna dalam sistem</CardDescription>
                                </div>
                                <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center gap-4">
                                <Input
                                    placeholder="Cari berdasarkan nama..."
                                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
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
                                                    Tidak ada data pengguna.
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

             {/* Dialog untuk form Add/Edit User */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>{dialogMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}</DialogTitle>
                            <DialogDescription>
                                {dialogMode === 'create'
                                    ? 'Isi informasi pengguna baru yang akan ditambahkan ke sistem.'
                                    : 'Perbarui informasi pengguna yang ada dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>

                        <UserForm roles={roles} user={activeUser} mode={dialogMode} onSuccess={() => setIsDialogOpen(false)} />
                    </DialogContent>
                </Dialog>

                {/* Alert Dialog untuk konfirmasi Toggle Active */}
                <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{activeUser?.is_active ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {activeUser?.is_active
                                    ? `Apakah Anda yakin ingin menonaktifkan pengguna "${activeUser?.name}"? Pengguna tidak akan dapat masuk ke sistem.`
                                    : `Apakah Anda yakin ingin mengaktifkan kembali pengguna "${activeUser?.name}"? Pengguna akan dapat masuk kembali ke sistem.`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleToggleActive}
                                className={activeUser?.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                            >
                                {activeUser?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
        </AppLayout>
    );
}
