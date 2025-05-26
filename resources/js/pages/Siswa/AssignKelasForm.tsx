import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Tipe untuk Kelas
interface Kelas {
    id: number;
    nama: string;
    tahun_akademik: string;
}

// Tipe untuk User/Siswa
interface Siswa {
    id: number;
    name: string;
    email: string;
}

interface AssignKelasFormProps {
    siswa: Siswa | null;
    kelas: Kelas[];
    onSuccess: () => void;
}

// Schema validasi dengan Zod
const assignKelasSchema = z.object({
    kelas_id: z.string().min(1, { message: 'Kelas wajib dipilih' }),
});

export default function AssignKelasForm({ siswa, kelas, onSuccess }: AssignKelasFormProps) {
    // Setup react-hook-form dengan zod resolver
    const form = useForm<z.infer<typeof assignKelasSchema>>({
        resolver: zodResolver(assignKelasSchema),
        defaultValues: {
            kelas_id: '',
        },
    });

    // Status loading untuk button submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handler untuk form submission
    const onSubmit = (data: z.infer<typeof assignKelasSchema>) => {
        setIsSubmitting(true);
        
        if (siswa) {
            router.post(route('siswa.assignKelas', siswa.id), data, {
                onSuccess: () => {
                    toast.success('Siswa berhasil ditambahkan ke kelas');
                    onSuccess();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as any, { type: 'manual', message: value as string });
                    });
                    toast.error(errors.error || 'Gagal menambahkan siswa ke kelas');
                    setIsSubmitting(false);
                }
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-2">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="kelas_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kelas</FormLabel>
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
                                    Pilih kelas yang akan ditambahkan untuk siswa ini
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                        {isSubmitting ? 'Memproses...' : 'Tambahkan ke Kelas'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}