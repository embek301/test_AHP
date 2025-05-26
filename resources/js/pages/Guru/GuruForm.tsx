import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Tipe untuk MataPelajaran
interface MataPelajaran {
    id: number;
    nama: string;
    kode: string;
}

// Tipe untuk User
interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
}

// Tipe untuk Guru
interface Guru {
    id: number;
    user_id: number;
    nip: string;
    mata_pelajaran_id: number;
    tanggal_bergabung: string;
    user: User;
    mata_pelajaran: MataPelajaran;
}

interface GuruFormProps {
    guru: Guru | null;
    mataPelajaran: MataPelajaran[];
    mode: 'create' | 'edit';
    onSuccess: () => void;
}

// Schema validasi dengan Zod
const createGuruSchema = z.object({
    name: z.string().min(1, { message: 'Nama guru wajib diisi' }),
    email: z.string().email({ message: 'Format email tidak valid' }),
    nip: z.string().min(1, { message: 'NIP wajib diisi' }),
    mata_pelajaran_id: z.string().min(1, { message: 'Mata pelajaran wajib dipilih' }),
    tanggal_bergabung: z.date({ required_error: 'Tanggal bergabung wajib diisi' }),
    password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
});

const editGuruSchema = z.object({
    name: z.string().min(1, { message: 'Nama guru wajib diisi' }),
    email: z.string().email({ message: 'Format email tidak valid' }),
    nip: z.string().min(1, { message: 'NIP wajib diisi' }),
    mata_pelajaran_id: z.string().min(1, { message: 'Mata pelajaran wajib dipilih' }),
    tanggal_bergabung: z.date({ required_error: 'Tanggal bergabung wajib diisi' }),
    password: z.string().min(8, { message: 'Password minimal 8 karakter' }).optional().or(z.literal('')),
});

export default function GuruForm({ guru, mataPelajaran, mode, onSuccess }: GuruFormProps) {
    // Setup schema berdasarkan mode
    const schema = mode === 'create' ? createGuruSchema : editGuruSchema;

    // Parse tanggal bergabung
    const tanggalBergabung = guru?.tanggal_bergabung ? new Date(guru.tanggal_bergabung) : undefined;

    // Setup react-hook-form dengan zod resolver
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues:
            mode === 'create'
                ? {
                      name: '',
                      email: '',
                      nip: '',
                      mata_pelajaran_id: '',
                      tanggal_bergabung: undefined,
                      password: '',
                  }
                : {
                      name: guru?.user?.name || '',
                      email: guru?.user?.email || '',
                      nip: guru?.nip || '',
                      mata_pelajaran_id: guru?.mata_pelajaran_id?.toString() || '',
                      tanggal_bergabung: tanggalBergabung,
                      password: '',
                  },
    });

    // Update form values ketika guru berubah (untuk edit mode)
    useEffect(() => {
        if (guru && mode === 'edit') {
            form.reset({
                name: guru.user?.name || '',
                email: guru.user?.email || '',
                nip: guru.nip || '',
                mata_pelajaran_id: guru.mata_pelajaran_id?.toString() || '',
                tanggal_bergabung: tanggalBergabung,
                password: '',
            });
        } else if (mode === 'create') {
            form.reset({
                name: '',
                email: '',
                nip: '',
                mata_pelajaran_id: '',
                tanggal_bergabung: undefined,
                password: '',
            });
        }
    }, [guru, mode]);

    // Status loading untuk button submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handler untuk form submission
    const onSubmit = (data: z.infer<typeof schema>) => {
        setIsSubmitting(true);

        if (mode === 'create') {
            router.post(
                route('guru.store'),
                {
                    ...data,
                    mata_pelajaran_id: parseInt(data.mata_pelajaran_id),
                    tanggal_bergabung: format(data.tanggal_bergabung, 'yyyy-MM-dd'),
                },
                {
                    onSuccess: () => {
                        toast.success('Data guru berhasil ditambahkan');
                        onSuccess();
                        setIsSubmitting(false);
                    },
                    onError: (errors) => {
                        Object.entries(errors).forEach(([key, value]) => {
                            form.setError(key as any, { type: 'manual', message: value as string });
                        });
                        toast.error('Gagal menambahkan data guru');
                        setIsSubmitting(false);
                    },
                },
            );
        } else if (mode === 'edit' && guru) {
            router.post(
                route('guru.update', guru.id),
                {
                    ...data,
                    mata_pelajaran_id: parseInt(data.mata_pelajaran_id),
                    tanggal_bergabung: format(data.tanggal_bergabung, 'yyyy-MM-dd'),
                    _method: 'POST',
                },
                {
                    onSuccess: () => {
                        toast.success('Data guru berhasil diperbarui');
                        onSuccess();
                        setIsSubmitting(false);
                    },
                    onError: (errors) => {
                        Object.entries(errors).forEach(([key, value]) => {
                            form.setError(key as any, { type: 'manual', message: value as string });
                        });
                        toast.error('Gagal memperbarui data guru');
                        setIsSubmitting(false);
                    },
                },
            );
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-2">
                {/* Grid layout dengan 2 kolom responsif */}
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Lengkap</FormLabel>
                                <FormControl>
                                    <Input placeholder="Masukkan nama lengkap guru" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">Nama lengkap guru tanpa gelar</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="guru@sekolah.com" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">Email untuk login ke sistem</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="nip"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NIP</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nomor Induk Pegawai" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">Nomor Induk Pegawai atau identifikasi guru</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mata_pelajaran_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mata Pelajaran</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih mata pelajaran" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {mataPelajaran.map((mp) => (
                                            <SelectItem key={mp.id} value={mp.id.toString()}>
                                                {mp.nama} ({mp.kode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">Mata pelajaran yang diampu oleh guru</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tanggal_bergabung"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal Bergabung</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => {
                                            const dateValue = e.target.value;
                                            if (dateValue) {
                                                field.onChange(new Date(dateValue));
                                            } else {
                                                field.onChange(undefined);
                                            }
                                        }}
                                        max={format(new Date(), 'yyyy-MM-dd')}
                                        min="1900-01-01"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">Tanggal guru mulai mengajar</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{mode === 'create' ? 'Password' : 'Password (Opsional)'}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder={mode === 'create' ? 'Minimal 8 karakter' : 'Biarkan kosong jika tidak ingin mengubah'}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    {mode === 'create' ? 'Password untuk login ke sistem' : 'Isi hanya jika ingin mengubah password'}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Buttons row */}
                <div className="mt-4 flex justify-end gap-3 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => onSuccess()}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? 'Memproses...' : mode === 'create' ? 'Tambah Guru' : 'Perbarui Data Guru'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
