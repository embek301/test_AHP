import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { format, isFuture, isPast, isToday } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { cn } from '@/lib/utils';

// Tipe untuk PeriodeEvaluasi
interface PeriodeEvaluasi {
    id: number;
    judul: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: 'draft' | 'aktif' | 'selesai';
    evaluasi_count?: number;
    hasil_evaluasi_count?: number;
}

interface PeriodeEvaluasiFormProps {
    periodeEvaluasi: PeriodeEvaluasi | null;
    mode: 'create' | 'edit';
    onSuccess: () => void;
}

// Schema validasi dengan Zod
const periodeEvaluasiSchema = z.object({
    judul: z.string().min(1, { message: 'Judul periode evaluasi wajib diisi' }),
    tanggal_mulai: z.date({ required_error: 'Tanggal mulai wajib diisi' }),
    tanggal_selesai: z.date({ required_error: 'Tanggal selesai wajib diisi' }),
    status: z.enum(['draft', 'aktif', 'selesai'], {
        required_error: 'Status periode evaluasi wajib dipilih',
    }),
});

export default function PeriodeEvaluasiForm({ periodeEvaluasi, mode, onSuccess }: PeriodeEvaluasiFormProps) {
    // Parse tanggal
    const tanggalMulai = periodeEvaluasi?.tanggal_mulai ? new Date(periodeEvaluasi.tanggal_mulai) : undefined;
    const tanggalSelesai = periodeEvaluasi?.tanggal_selesai ? new Date(periodeEvaluasi.tanggal_selesai) : undefined;

    // Setup react-hook-form dengan zod resolver
    const form = useForm<z.infer<typeof periodeEvaluasiSchema>>({
        resolver: zodResolver(periodeEvaluasiSchema),
        defaultValues: mode === 'create'
            ? {
                judul: '',
                tanggal_mulai: undefined,
                tanggal_selesai: undefined,
                status: 'draft',
            }
            : {
                judul: periodeEvaluasi?.judul || '',
                tanggal_mulai: tanggalMulai,
                tanggal_selesai: tanggalSelesai,
                status: periodeEvaluasi?.status || 'draft',
            },
    });

    // Update form values ketika periodeEvaluasi berubah (untuk edit mode)
    useEffect(() => {
        if (periodeEvaluasi && mode === 'edit') {
            form.reset({
                judul: periodeEvaluasi.judul || '',
                tanggal_mulai: tanggalMulai,
                tanggal_selesai: tanggalSelesai,
                status: periodeEvaluasi.status || 'draft',
            });
        } else if (mode === 'create') {
            form.reset({
                judul: '',
                tanggal_mulai: undefined,
                tanggal_selesai: undefined,
                status: 'draft',
            });
        }
    }, [periodeEvaluasi, mode]);

    // Status loading untuk button submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dapatkan status periode berdasarkan tanggal
    const getStatusFromDate = (startDate?: Date, endDate?: Date): 'upcoming' | 'ongoing' | 'expired' | 'unknown' => {
        if (!startDate || !endDate) return 'unknown';
        
        if (isPast(startDate) && isFuture(endDate) || isToday(startDate) || isToday(endDate)) {
            return 'ongoing';
        } else if (isFuture(startDate)) {
            return 'upcoming';
        } else if (isPast(endDate)) {
            return 'expired';
        }
        
        return 'unknown';
    };

    // Handler untuk form submission
    const onSubmit = (data: z.infer<typeof periodeEvaluasiSchema>) => {
        setIsSubmitting(true);

        if (mode === 'create') {
            router.post(route('periode-evaluasi.store'), {
                judul: data.judul,
                tanggal_mulai: format(data.tanggal_mulai, 'yyyy-MM-dd'),
                tanggal_selesai: format(data.tanggal_selesai, 'yyyy-MM-dd'),
                status: data.status,
            }, {
                onSuccess: () => {
                    toast.success('Periode evaluasi berhasil ditambahkan');
                    onSuccess();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as any, { type: 'manual', message: value as string });
                    });
                    toast.error('Gagal menambahkan periode evaluasi');
                    setIsSubmitting(false);
                }
            });
        } else if (mode === 'edit' && periodeEvaluasi) {
            router.put(route('periode-evaluasi.update', periodeEvaluasi.id), {
                judul: data.judul,
                tanggal_mulai: format(data.tanggal_mulai, 'yyyy-MM-dd'),
                tanggal_selesai: format(data.tanggal_selesai, 'yyyy-MM-dd'),
                status: data.status,
            }, {
                onSuccess: () => {
                    toast.success('Periode evaluasi berhasil diperbarui');
                    onSuccess();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as any, { type: 'manual', message: value as string });
                    });
                    toast.error('Gagal memperbarui periode evaluasi');
                    setIsSubmitting(false);
                }
            });
        }
    };

    // State untuk dialog kalender
    const [isStartDateOpen, setIsStartDateOpen] = useState(false);
    const [isEndDateOpen, setIsEndDateOpen] = useState(false);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-2">
                {/* Grid layout dengan 1 kolom responsif */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <FormField
                        control={form.control}
                        name="judul"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Judul Periode Evaluasi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: Evaluasi Semester Ganjil 2025" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Judul untuk mengidentifikasi periode evaluasi
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="tanggal_mulai"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal Mulai</FormLabel>
                                    <FormControl>
                                        <div className="flex">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                onClick={() => setIsStartDateOpen(true)}
                                            >
                                                {field.value ? format(field.value, "dd MMMM yyyy") : "Pilih tanggal"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Tanggal dimulainya periode evaluasi
                                    </FormDescription>
                                    <FormMessage />

                                    {isStartDateOpen && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        field.onChange(date);
                                                        setIsStartDateOpen(false);
                                                    }}
                                                    disabled={(date) => date < new Date("2020-01-01")}
                                                    initialFocus
                                                />
                                                <div className="mt-2 flex justify-end">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setIsStartDateOpen(false)}
                                                    >
                                                        Tutup
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tanggal_selesai"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal Selesai</FormLabel>
                                    <FormControl>
                                        <div className="flex">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                onClick={() => setIsEndDateOpen(true)}
                                            >
                                                {field.value ? format(field.value, "dd MMMM yyyy") : "Pilih tanggal"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Tanggal berakhirnya periode evaluasi
                                    </FormDescription>
                                    <FormMessage />

                                    {isEndDateOpen && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        field.onChange(date);
                                                        setIsEndDateOpen(false);
                                                    }}
                                                    disabled={(date) => {
                                                        const startDate = form.getValues("tanggal_mulai");
                                                        return date < new Date("2020-01-01") || (startDate && date < startDate);
                                                    }}
                                                    initialFocus
                                                />
                                                <div className="mt-2 flex justify-end">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setIsEndDateOpen(false)}
                                                    >
                                                        Tutup
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => {
                            // Get temporal status berdasarkan tanggal
                            const temporalStatus = getStatusFromDate(
                                form.getValues("tanggal_mulai"),
                                form.getValues("tanggal_selesai")
                            );
                            
                            return (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status periode evaluasi" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="aktif">Aktif</SelectItem>
                                            <SelectItem value="selesai">Selesai</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="text-xs">
                                        Status periode evaluasi
                                        {temporalStatus !== 'unknown' && (
                                            <span className="ml-2">
                                                (Berdasarkan tanggal: 
                                                <span className={cn(
                                                    "ml-1 font-medium",
                                                    temporalStatus === 'ongoing' && "text-green-600",
                                                    temporalStatus === 'upcoming' && "text-blue-600", 
                                                    temporalStatus === 'expired' && "text-red-600"
                                                )}>
                                                    {temporalStatus === 'ongoing' && "Sedang Berlangsung"}
                                                    {temporalStatus === 'upcoming' && "Akan Datang"}
                                                    {temporalStatus === 'expired' && "Telah Berakhir"}
                                                </span>)
                                            </span>
                                        )}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />

                    {mode === 'edit' && periodeEvaluasi && (periodeEvaluasi.evaluasi_count || 0) > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-2">
                            <p className="text-amber-700 text-sm">
                                <strong>Perhatian:</strong> Periode evaluasi ini memiliki {periodeEvaluasi.evaluasi_count} evaluasi terkait.
                                Mengubah periode dapat mempengaruhi data evaluasi yang sedang berlangsung.
                            </p>
                        </div>
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
                        {isSubmitting ? 'Memproses...' : mode === 'create' ? 'Tambah Periode Evaluasi' : 'Perbarui Periode Evaluasi'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}