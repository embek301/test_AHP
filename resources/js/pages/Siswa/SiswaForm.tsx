import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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

// Tipe untuk User/Siswa
interface Siswa {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    siswaKelas?: SiswaKelas[];
}

interface SiswaFormProps {
    siswa: Siswa | null;
    mode: 'create' | 'edit';
    kelas: Kelas[];
    onSuccess: () => void;
}

// Schema validasi dengan Zod untuk create siswa
const createSiswaSchema = z.object({
    name: z.string().min(1, { message: 'Nama siswa wajib diisi' }),
    email: z.string().email({ message: 'Format email tidak valid' }),
    kelas_id: z.string().optional(),
});

// Schema validasi dengan Zod untuk edit siswa
const editSiswaSchema = z.object({
    name: z.string().min(1, { message: 'Nama siswa wajib diisi' }),
    email: z.string().email({ message: 'Format email tidak valid' }),
    is_active: z.boolean(),
});

export default function SiswaForm({ siswa, mode, kelas, onSuccess }: SiswaFormProps) {
    // Setup schema berdasarkan mode
    const schema = mode === 'create' ? createSiswaSchema : editSiswaSchema;
    
    // Setup react-hook-form dengan zod resolver
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: mode === 'create' 
            ? {
                name: '',
                email: '',
                kelas_id: '',
              }
            : {
                name: siswa?.name || '',
                email: siswa?.email || '',
                is_active: siswa?.is_active || false,
              },
    });
    
    // Update form values ketika siswa berubah (untuk edit mode)
    useEffect(() => {
        if (siswa && mode === 'edit') {
            form.reset({
                name: siswa.name,
                email: siswa.email,
                is_active: siswa.is_active,
            });
        }
    }, [siswa, mode]);

    // Status loading untuk button submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handler untuk form submission
    const onSubmit = (data: z.infer<typeof schema>) => {
        setIsSubmitting(true);
        
        if (mode === 'create') {
            router.post(route('siswa.store'), data, {
                onSuccess: () => {
                    toast.success('Siswa berhasil ditambahkan');
                    onSuccess();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as any, { type: 'manual', message: value as string });
                    });
                    toast.error('Gagal menambahkan siswa');
                    setIsSubmitting(false);
                }
            });
        } else if (mode === 'edit' && siswa) {
            router.post(route('siswa.update', siswa.id), {
                ...data,
                _method: 'PATCH',
            }, {
                onSuccess: () => {
                    toast.success('Informasi siswa berhasil diperbarui');
                    onSuccess();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as any, { type: 'manual', message: value as string });
                    });
                    toast.error('Gagal memperbarui informasi siswa');
                    setIsSubmitting(false);
                }
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-2">
                {/* Grid layout dengan 1 kolom responsif */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Siswa</FormLabel>
                                <FormControl>
                                    <Input placeholder="Masukkan nama siswa" {...field} />
                                </FormControl>
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
                                    <Input type="email" placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Email digunakan untuk login dan notifikasi
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {mode === 'create' && (
                        <FormField
                            control={form.control}
                            name="kelas_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kelas (Opsional)</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kelas" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {kelas.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.nama} - {item.tahun_akademik}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="text-xs">
                                        Kelas dapat ditambahkan nanti
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    
                    {mode === 'edit' && (
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Status Aktif</FormLabel>
                                        <FormDescription className="text-xs">
                                            Siswa dengan status tidak aktif tidak dapat login
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                </div>
                
                {/* Buttons row */}
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSuccess()}
                    >
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? 'Memproses...' : mode === 'create' ? 'Tambah Siswa' : 'Perbarui Siswa'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}