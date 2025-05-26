import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';

interface Guru {
    id: number;
    user: {
        id: number;
        name: string;
    };
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
}

interface Rekomendasi {
    id: number;
    guru_id: number;
    periode_evaluasi_id: number;
    konten: string;
    status: 'draft' | 'published';
}

interface RekomendasiFormProps {
    rekomendasi: Rekomendasi | null;
    mode: 'create' | 'edit';
    guru: Guru[];
    periodeEvaluasi: PeriodeEvaluasi[];
    selectedGuruId?: number | string | null;
    selectedPeriodeId?: number | string | null;
    onSuccess?: () => void;
}

// Schema validasi dengan Zod untuk form rekomendasi
const createRekomendasiSchema = z.object({
    guru_id: z.string().min(1, { message: 'Guru wajib dipilih' }),
    periode_evaluasi_id: z.string().min(1, { message: 'Periode evaluasi wajib dipilih' }),
    konten: z.string().min(10, { message: 'Konten rekomendasi minimal 10 karakter' }),
});

// Schema untuk edit (hanya konten yang bisa diedit)
const editRekomendasiSchema = z.object({
    konten: z.string().min(10, { message: 'Konten rekomendasi minimal 10 karakter' }),
});

export default function RekomendasiForm({ 
    rekomendasi, 
    mode, 
    guru, 
    periodeEvaluasi, 
    selectedGuruId, 
    selectedPeriodeId,
    onSuccess 
}: RekomendasiFormProps) {
    // Setup schema berdasarkan mode
    const schema = mode === 'create' ? createRekomendasiSchema : editRekomendasiSchema;
    
    // Setup react-hook-form dengan zod resolver
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: mode === 'create' 
            ? {
                guru_id: selectedGuruId ? String(selectedGuruId) : '',
                periode_evaluasi_id: selectedPeriodeId ? String(selectedPeriodeId) : '',
                konten: '',
              }
            : {
                konten: rekomendasi?.konten || '',
              },
    });
    
    // Update form values ketika rekomendasi berubah (untuk edit mode)
    useEffect(() => {
        if (mode === 'edit' && rekomendasi) {
            form.reset({
                konten: rekomendasi.konten,
            });
        }
    }, [rekomendasi, mode]);

    // Status loading untuk button submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handler untuk form submission
    const onSubmit = (data: z.infer<typeof schema>) => {
        setIsSubmitting(true);
        
        if (mode === 'create') {
            router.post(route('rekomendasi.store'), data, {
                onSuccess: () => {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.visit(route('rekomendasi.index'));
                    }
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as any, { type: 'manual', message: value as string });
                    });
                    setIsSubmitting(false);
                }
            });
        } else if (mode === 'edit' && rekomendasi) {
            router.put(route('rekomendasi.update', rekomendasi.id), data, {
                onSuccess: () => {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.visit(route('rekomendasi.index'));
                    }
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as any, { type: 'manual', message: value as string });
                    });
                    setIsSubmitting(false);
                }
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-2 space-y-6">
                {mode === 'create' && (
                    <>
                        <FormField
                            control={form.control}
                            name="guru_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Guru</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih guru" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {guru.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Pilih guru yang akan diberi rekomendasi
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="periode_evaluasi_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Periode Evaluasi</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih periode evaluasi" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {periodeEvaluasi.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.judul}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Pilih periode evaluasi terkait rekomendasi
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
                
                <FormField
                    control={form.control}
                    name="konten"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Isi Rekomendasi</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Masukkan isi rekomendasi pengembangan untuk guru..." 
                                    {...field} 
                                    rows={10}
                                    className="resize-y"
                                />
                            </FormControl>
                            <FormDescription>
                                Berikan rekomendasi yang spesifik dan konstruktif berdasarkan hasil evaluasi
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {/* Buttons row */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                router.visit(route('rekomendasi.index'));
                            }
                        }}
                    >
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? 'Memproses...' : mode === 'create' ? 'Simpan Rekomendasi' : 'Perbarui Rekomendasi'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}