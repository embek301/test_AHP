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

interface SubKriteriaFormProps {
    subKriteria: SubKriteria | null;
    kriteriaId: number;
    mode: 'create' | 'edit';
    onSuccess?: () => void;
    totalBobotAktif: number;
}

// Schema validasi dengan Zod
// Di bagian schema, pastikan:
const subKriteriaSchema = z.object({
    nama: z.string().min(3, { message: 'Nama sub kriteria minimal 3 karakter' }).max(100, { message: 'Nama sub kriteria maksimal 100 karakter' }),
    deskripsi: z.string().optional(),
    bobot: z.coerce.number().min(0.01, { message: 'Bobot harus lebih dari 0' }).max(100, { message: 'Bobot maksimal 100' }),
    urutan: z.coerce.number().optional(),
    aktif: z.boolean(), // HAPUS .default(true) dari sini
});

export default function SubKriteriaForm({ subKriteria, kriteriaId, mode, onSuccess, totalBobotAktif }: SubKriteriaFormProps) {
    // Default values untuk form
    const defaultValues = {
    nama: subKriteria?.nama || '',
    deskripsi: subKriteria?.deskripsi || '',
    bobot: subKriteria?.bobot || 0,
    urutan: subKriteria?.urutan || 0,
    aktif: subKriteria?.aktif !== undefined ? subKriteria.aktif : true, // Pastikan selalu boolean
};

    // Inisialisasi form dengan React Hook Form + Zod
    const form = useForm<z.infer<typeof subKriteriaSchema>>({
        resolver: zodResolver(subKriteriaSchema),
        defaultValues,
    });

    // Update form ketika sub kriteria berubah
    useEffect(() => {
        if (subKriteria) {
            form.reset({
                nama: subKriteria.nama,
                deskripsi: subKriteria.deskripsi,
                bobot: subKriteria.bobot,
                urutan: subKriteria.urutan,
                aktif: subKriteria.aktif,
            });
        } else {
            form.reset(defaultValues);
        }
    }, [subKriteria, form]);

    // Handler untuk submit form
    const onSubmit = (data: z.infer<typeof subKriteriaSchema>) => {
        // Hitung total bobot jika sub kriteria baru menjadi aktif
        let newTotalBobot = totalBobotAktif;
        
        if (mode === 'create' && data.aktif) {
            newTotalBobot += data.bobot;
        } else if (mode === 'edit' && subKriteria) {
            if (data.aktif && !subKriteria.aktif) {
                // Sub kriteria diaktifkan
                newTotalBobot += data.bobot;
            } else if (!data.aktif && subKriteria.aktif) {
                // Sub kriteria dinonaktifkan
                newTotalBobot -= subKriteria.bobot;
            } else if (data.aktif && subKriteria.aktif) {
                // Sub kriteria tetap aktif tapi bobotnya berubah
                newTotalBobot = totalBobotAktif - subKriteria.bobot + data.bobot;
            }
        }

        // Validasi total bobot
        if (newTotalBobot > 100) {
            toast.error(`Total bobot sub kriteria aktif tidak boleh melebihi 100. Total bobot saat ini: ${newTotalBobot.toFixed(2)}`);
            return;
        }

        if (mode === 'create') {
            router.post(
                route('sub-kriteria.store', kriteriaId),
                data,
                {
                    onSuccess: () => {
                        toast.success('Sub kriteria berhasil ditambahkan');
                        onSuccess && onSuccess();
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Terjadi kesalahan saat menambahkan sub kriteria');
                    },
                },
            );
        } else if (mode === 'edit' && subKriteria) {
            router.put(
                route('sub-kriteria.update', [kriteriaId, subKriteria.id]),
                data,
                {
                    onSuccess: () => {
                        toast.success('Sub kriteria berhasil diperbarui');
                        onSuccess && onSuccess();
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Terjadi kesalahan saat memperbarui sub kriteria');
                    },
                },
            );
        }
    };

    // Total bobot yang tersedia dari 100
    const remainingBobot = mode === 'edit' && subKriteria?.aktif 
        ? 100 - totalBobotAktif + subKriteria.bobot 
        : 100 - totalBobotAktif;
    
    // Apakah sub kriteria digunakan dalam evaluasi
    const isUsed = subKriteria?.detail_evaluasi_count && subKriteria.detail_evaluasi_count > 0;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-2">
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <FormField
                        control={form.control}
                        name="nama"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Sub Kriteria</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: Ketepatan waktu masuk kelas" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Nama sub kriteria yang digunakan dalam evaluasi
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
                                        placeholder="Deskripsi tentang sub kriteria ini..." 
                                        className="min-h-[80px]"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Penjelasan tentang sub kriteria evaluasi (opsional)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
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
                                        Bobot sub kriteria (0.01-100). Sisa: {Number(remainingBobot).toFixed(2)}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="urutan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Urutan</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            placeholder="0"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Urutan tampilan (opsional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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
                                        Aktifkan Sub Kriteria
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                        Sub kriteria yang aktif akan digunakan dalam evaluasi.
                                        {isUsed && field.value && (
                                            <span className="block mt-1 text-amber-600">
                                                Sub kriteria ini sedang digunakan dalam evaluasi dan tidak dapat dinonaktifkan.
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
                        {mode === 'create' ? 'Tambah Sub Kriteria' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}