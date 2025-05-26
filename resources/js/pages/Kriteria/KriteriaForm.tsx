import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';

// Tipe untuk Kriteria
interface Kriteria {
    id: number;
    nama: string;
    deskripsi: string;
    bobot: number;
    aktif: boolean;
    detail_evaluasi_count?: number;
}

interface KriteriaFormProps {
    kriteria: Kriteria | null;
    mode: 'create' | 'edit';
    onSuccess?: () => void;
    totalBobotAktif: number;
}

// Schema validasi dengan Zod
const kriteriaSchema = z.object({
    nama: z.string().min(3, { message: 'Nama kriteria minimal 3 karakter' }).max(100, { message: 'Nama kriteria maksimal 100 karakter' }),
    deskripsi: z.string().optional(),
    bobot: z.coerce.number().min(0.01, { message: 'Bobot harus lebih dari 0' }).max(100, { message: 'Bobot maksimal 100' }),
    aktif: z.boolean().default(true),
});

export default function KriteriaForm({ kriteria, mode, onSuccess, totalBobotAktif }: KriteriaFormProps) {
    // Default values untuk form
    const defaultValues = {
        nama: kriteria?.nama || '',
        deskripsi: kriteria?.deskripsi || '',
        bobot: kriteria?.bobot || 0,
        aktif: kriteria?.aktif ?? true,
    };

    // Inisialisasi form dengan React Hook Form + Zod
    const form = useForm<z.infer<typeof kriteriaSchema>>({
        resolver: zodResolver(kriteriaSchema),
        defaultValues,
    });

    // Update form ketika kriteria berubah
    useEffect(() => {
        if (kriteria) {
            form.reset({
                nama: kriteria.nama,
                deskripsi: kriteria.deskripsi,
                bobot: kriteria.bobot,
                aktif: kriteria.aktif,
            });
        } else {
            form.reset(defaultValues);
        }
    }, [kriteria, form]);

    // Handler untuk submit form
    const onSubmit = (data: z.infer<typeof kriteriaSchema>) => {
        // Hitung total bobot jika kriteria baru menjadi aktif
        let newTotalBobot = totalBobotAktif;
        
        if (mode === 'create' && data.aktif) {
            newTotalBobot += data.bobot;
        } else if (mode === 'edit' && kriteria) {
            if (data.aktif && !kriteria.aktif) {
                // Kriteria diaktifkan
                newTotalBobot += data.bobot;
            } else if (!data.aktif && kriteria.aktif) {
                // Kriteria dinonaktifkan
                newTotalBobot -= kriteria.bobot;
            } else if (data.aktif && kriteria.aktif) {
                // Kriteria tetap aktif tapi bobotnya berubah
                newTotalBobot = totalBobotAktif - kriteria.bobot + data.bobot;
            }
        }

        // Validasi total bobot
        if (newTotalBobot > 100) {
            toast.error(`Total bobot kriteria aktif tidak boleh melebihi 100. Total bobot saat ini: ${newTotalBobot.toFixed(2)}`);
            return;
        }

        if (mode === 'create') {
            router.post(
                route('kriteria.store'),
                data,
                {
                    onSuccess: () => {
                        toast.success('Kriteria evaluasi berhasil ditambahkan');
                        onSuccess && onSuccess();
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Terjadi kesalahan saat menambahkan kriteria');
                    },
                },
            );
        } else if (mode === 'edit' && kriteria) {
            router.put(
                route('kriteria.update', kriteria.id),
                data,
                {
                    onSuccess: () => {
                        toast.success('Kriteria evaluasi berhasil diperbarui');
                        onSuccess && onSuccess();
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Terjadi kesalahan saat memperbarui kriteria');
                    },
                },
            );
        }
    };

    // Total bobot yang tersedia dari 100
    const remainingBobot = mode === 'edit' && kriteria?.aktif 
        ? 100 - totalBobotAktif + kriteria.bobot 
        : 100 - totalBobotAktif;
    
    // Apakah kriteria digunakan dalam evaluasi
    const isUsed = kriteria?.detail_evaluasi_count && kriteria.detail_evaluasi_count > 0;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-2">
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <FormField
                        control={form.control}
                        name="nama"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Kriteria</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: Penguasaan Materi" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Nama kriteria yang digunakan dalam evaluasi
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="deskripsi"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deskripsi</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Deskripsi tentang kriteria ini..." 
                                        className="min-h-[80px]"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Penjelasan tentang kriteria evaluasi (opsional)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bobot"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bobot</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        min="0.01"
                                        max="100"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Bobot kriteria dalam penilaian (nilai 0.01-100). Sisa bobot yang tersedia: {Number(remainingBobot).toFixed(2)}.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="aktif"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isUsed && field.value}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Aktifkan Kriteria
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                        Kriteria yang aktif akan digunakan dalam evaluasi.
                                        {isUsed && field.value && (
                                            <span className="block mt-1 text-amber-600">
                                                Kriteria ini sedang digunakan dalam evaluasi dan tidak dapat dinonaktifkan.
                                            </span>
                                        )}
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSuccess && onSuccess()}
                    >
                        Batal
                    </Button>
                    <Button type="submit">
                        {mode === 'create' ? 'Tambah Kriteria' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}