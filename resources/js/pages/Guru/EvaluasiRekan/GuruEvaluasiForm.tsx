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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

// Interfaces
interface Guru {
    id: number;
    nip: string;
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Kriteria {
    id: number;
    nama: string;
    deskripsi: string;
    bobot: number;
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
}

interface DetailEvaluasi {
    kriteria_id: number;
    nilai: number;
    komentar?: string;
}

interface Evaluasi {
    id?: number;
    guru_id: number;
    periode_evaluasi_id: number;
    evaluator_id?: number;
    status: 'draft' | 'selesai';
    detail_evaluasi: DetailEvaluasi[];
}

// Form props
interface GuruEvaluasiFormProps {
    guru: Guru;
    kriteriaList: Kriteria[];
    periodeAktif: PeriodeEvaluasi;
    evaluasi?: Evaluasi;
    mode: 'create' | 'edit' | 'view';
    onClose?: () => void;
}

// Zod schema for form validation
const detailEvaluasiSchema = z.object({
    kriteria_id: z.number(),
    nilai: z.number().min(1, "Nilai harus diisi").max(5, "Nilai maksimal adalah 5"),
    komentar: z.string().optional(),
});

const evaluasiSchema = z.object({
    guru_id: z.number(),
    periode_evaluasi_id: z.number(),
    status: z.enum(['draft', 'selesai']),
    komentar_umum: z.string().optional(),
    detail_evaluasi: z.array(detailEvaluasiSchema),
});

type EvaluasiFormValues = z.infer<typeof evaluasiSchema>;

export default function GuruEvaluasiForm({
    guru,
    kriteriaList,
    periodeAktif,
    evaluasi,
    mode,
    onClose,
}: GuruEvaluasiFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSection, setCurrentSection] = useState(0);
    const [maxCompletedSection, setMaxCompletedSection] = useState(0);
    
    // Kelompokkan kriteria menjadi beberapa bagian dengan 5 kriteria per bagian
    const sectionedKriteria = chunkArray(kriteriaList, 5);
    
    // Inisialisasi nilai default
    const getDefaultValues = (): EvaluasiFormValues => {
        if (evaluasi) {
            // Untuk mode edit/view, gunakan data evaluasi yang sudah ada
            const detailMap: Record<number, DetailEvaluasi> = {};
            evaluasi.detail_evaluasi.forEach(detail => {
                detailMap[detail.kriteria_id] = detail;
            });
            
            // Cari komentar_umum dari detail_evaluasi dengan kriteria_id = 0 or null
            const komentarUmum = evaluasi.detail_evaluasi.find(
                detail => !detail.kriteria_id
            )?.komentar || '';
            
            return {
                guru_id: evaluasi.guru_id,
                periode_evaluasi_id: evaluasi.periode_evaluasi_id,
                status: evaluasi.status,
                komentar_umum: komentarUmum,
                detail_evaluasi: kriteriaList.map(kriteria => ({
                    kriteria_id: kriteria.id,
                    nilai: detailMap[kriteria.id]?.nilai || 0,
                    komentar: detailMap[kriteria.id]?.komentar || '',
                })),
            };
        } else {
            // Untuk mode create, inisialisasi form kosong
            return {
                guru_id: guru.id,
                periode_evaluasi_id: periodeAktif.id,
                status: 'draft',
                komentar_umum: '',
                detail_evaluasi: kriteriaList.map(kriteria => ({
                    kriteria_id: kriteria.id,
                    nilai: 0,
                    komentar: '',
                })),
            };
        }
    };

    // Inisialisasi form
    const form = useForm<EvaluasiFormValues>({
        resolver: zodResolver(evaluasiSchema),
        defaultValues: getDefaultValues(),
    });
    
    // Pantau semua nilai form untuk menghitung progress
    const formValues = form.watch();
    
    // Hitung persentase penyelesaian
    const calculateCompletion = () => {
        let filled = 0;
        const total = kriteriaList.length;
        
        formValues.detail_evaluasi.forEach(detail => {
            if (detail.nilai > 0) filled++;
        });
        
        return Math.round((filled / total) * 100);
    };
    
    const completionPercentage = calculateCompletion();
    
    // Pindah ke bagian berikutnya jika bagian saat ini sudah selesai
    useEffect(() => {
        const currentSectionKriteria = sectionedKriteria[currentSection] || [];
        const isCurrentSectionComplete = currentSectionKriteria.every(kriteria => {
            const detail = formValues.detail_evaluasi.find(d => d.kriteria_id === kriteria.id);
            return detail && detail.nilai > 0;
        });
        
        if (isCurrentSectionComplete && currentSection > maxCompletedSection) {
            setMaxCompletedSection(currentSection);
        }
    }, [formValues.detail_evaluasi, currentSection]);

    // Fungsi navigasi antar bagian
    const goToSection = (index: number) => {
        if (index <= maxCompletedSection + 1) {
            setCurrentSection(index);
        }
    };

    const goToNextSection = () => {
        if (currentSection < sectionedKriteria.length) {
            setCurrentSection(currentSection + 1);
        }
    };

    const goToPrevSection = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    // Handler submit form
    const onSubmit = (data: EvaluasiFormValues, status: 'draft' | 'selesai' = 'draft') => {
        data.status = status;
        
        setIsSubmitting(true);
        
        // Siapkan payload
        const payload = {
            ...data,
            komentar_umum: data.komentar_umum,
        };
        
        if (mode === 'edit' && evaluasi?.id) {
            router.put(
                route('evaluasi-rekan.update', evaluasi.id),
                payload,
                {
                    onSuccess: () => {
                        toast.success(status === 'selesai' 
                            ? 'Evaluasi berhasil diselesaikan dan disimpan' 
                            : 'Perubahan evaluasi berhasil disimpan sebagai draft');
                        onClose && onClose();
                    },
                    onError: (errors) => {
                        console.error(errors);
                        toast.error('Terjadi kesalahan saat menyimpan evaluasi');
                        setIsSubmitting(false);
                    },
                }
            );
        } else {
            router.post(
                route('evaluasi-rekan.store'),
                payload,
                {
                    onSuccess: () => {
                        toast.success(status === 'selesai' 
                            ? 'Evaluasi berhasil diselesaikan dan disimpan' 
                            : 'Evaluasi berhasil disimpan sebagai draft');
                        onClose && onClose();
                    },
                    onError: (errors) => {
                        console.error(errors);
                        toast.error('Terjadi kesalahan saat menyimpan evaluasi');
                        setIsSubmitting(false);
                    },
                }
            );
        }
    };

    // Fungsi bantuan untuk memecah array menjadi kelompok
    function chunkArray<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    // Render tampilan khusus untuk mode view
    if (mode === 'view') {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Detail Evaluasi</h2>
                    <p className="text-gray-500">
                        Evaluasi terhadap {guru.user.name} pada periode {periodeAktif.judul}
                    </p>
                </div>

                <div className="rounded-md border p-4 space-y-4">
                    <h3 className="font-medium">Komentar Umum</h3>
                    <p className="p-3 bg-gray-50 rounded">
                        {formValues.komentar_umum || "-"}
                    </p>
                </div>

                <div className="space-y-6">
                    {kriteriaList.map((kriteria, index) => {
                        const detail = formValues.detail_evaluasi.find(d => d.kriteria_id === kriteria.id);
                        return (
                            <div key={kriteria.id} className="rounded-md border p-4 space-y-3">
                                <div>
                                    <h3 className="font-medium">
                                        {index + 1}. {kriteria.nama}
                                    </h3>
                                    {kriteria.deskripsi && (
                                        <p className="text-sm text-gray-500 mt-1">{kriteria.deskripsi}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium">Nilai:</h4>
                                    <div className="flex space-x-2 mt-1">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <div
                                                key={value}
                                                className={`h-10 w-10 flex items-center justify-center rounded-full border-2 ${
                                                    detail?.nilai === value
                                                        ? 'border-indigo-600 bg-indigo-100 text-indigo-800'
                                                        : 'border-gray-300 bg-gray-50 text-gray-400'
                                                }`}
                                            >
                                                {value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {detail?.komentar && (
                                    <div>
                                        <h4 className="text-sm font-medium">Komentar:</h4>
                                        <p className="p-3 bg-gray-50 rounded mt-1">{detail.komentar}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end">
                    <Button type="button" onClick={onClose}>
                        Kembali
                    </Button>
                </div>
            </div>
        );
    }

    // Form utama untuk mode create/edit
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(() => onSubmit(form.getValues(), 'selesai'))}>
                <div className="space-y-6">
                    {/* Progress bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{completionPercentage}% Selesai</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Section navigation */}
                    <div className="flex overflow-x-auto pb-2 gap-2">
                        {sectionedKriteria.map((section, index) => {
                            // Cek apakah bagian sudah selesai
                            const isSectionComplete = section.every(kriteria => {
                                const detail = formValues.detail_evaluasi.find(d => d.kriteria_id === kriteria.id);
                                return detail && detail.nilai > 0;
                            });
                            
                            return (
                                <Button
                                    key={index}
                                    type="button"
                                    variant={currentSection === index ? "default" : "outline"}
                                    className={`px-3 min-w-[40px] ${isSectionComplete ? "bg-indigo-100 border-indigo-300 text-indigo-800" : ""}`}
                                    onClick={() => goToSection(index)}
                                    disabled={index > maxCompletedSection + 1}
                                >
                                    {index + 1}
                                </Button>
                            );
                        })}
                        <Button
                            type="button"
                            variant={currentSection === sectionedKriteria.length ? "default" : "outline"}
                            className="px-3"
                            onClick={() => goToSection(sectionedKriteria.length)}
                            disabled={sectionedKriteria.length > maxCompletedSection + 1}
                        >
                            Komentar
                        </Button>
                    </div>

                    {/* Current section content */}
                    <ScrollArea className="h-[460px] rounded-md border p-4">
                        {currentSection === sectionedKriteria.length ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-medium">Komentar Umum</h2>
                                <p className="text-gray-500 text-sm">
                                    Berikan komentar umum terkait kinerja rekan guru yang Anda evaluasi.
                                </p>

                                <FormField
                                    control={form.control}
                                    name="komentar_umum"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Komentar</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tuliskan komentar umum di sini..."
                                                    className="min-h-[200px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Komentar ini akan membantu rekan guru untuk memahami keseluruhan evaluasi yang diberikan.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {sectionedKriteria[currentSection]?.map((kriteria, kritIndex) => {
                                    const detailIndex = kriteriaList.findIndex(k => k.id === kriteria.id);
                                    if (detailIndex === -1) return null;
                                    
                                    return (
                                        <div key={kriteria.id} className="space-y-4">
                                            <div>
                                                <h2 className="text-lg font-medium">
                                                    {currentSection * 5 + kritIndex + 1}. {kriteria.nama}
                                                </h2>
                                                {kriteria.deskripsi && (
                                                    <p className="mt-1 text-sm text-gray-500">{kriteria.deskripsi}</p>
                                                )}
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name={`detail_evaluasi.${detailIndex}.nilai`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel>Nilai</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                                value={field.value ? field.value.toString() : undefined}
                                                                className="flex space-x-2"
                                                            >
                                                                {[1, 2, 3, 4, 5].map((value) => (
                                                                    <div key={value} className="flex items-center space-x-1">
                                                                        <RadioGroupItem value={value.toString()} id={`nilai-${kriteria.id}-${value}`} className="sr-only" />
                                                                        <label
                                                                            htmlFor={`nilai-${kriteria.id}-${value}`}
                                                                            className={`h-12 w-12 flex items-center justify-center rounded-full border-2 cursor-pointer transition-colors ${
                                                                                field.value === value
                                                                                    ? 'border-indigo-600 bg-indigo-100 text-indigo-800'
                                                                                    : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
                                                                            }`}
                                                                        >
                                                                            {value}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormDescription>
                                                            1 = Sangat Kurang, 2 = Kurang, 3 = Cukup, 4 = Baik, 5 = Sangat Baik
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`detail_evaluasi.${detailIndex}.komentar`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Komentar (Opsional)</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Tulis komentar tentang kriteria ini..."
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Navigation buttons */}
                    <div className="flex justify-between pt-2">
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={goToPrevSection}
                                disabled={currentSection === 0}
                            >
                                Sebelumnya
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onSubmit(form.getValues(), 'draft')}
                                disabled={isSubmitting}
                            >
                                Simpan Draft
                            </Button>
                            {currentSection < sectionedKriteria.length ? (
                                <Button
                                    type="button"
                                    onClick={goToNextSection}
                                    disabled={
                                        currentSection >= sectionedKriteria.length || 
                                        (currentSection < sectionedKriteria.length && !sectionedKriteria[currentSection]?.every(kriteria => {
                                            const detail = form.getValues().detail_evaluasi.find(d => d.kriteria_id === kriteria.id);
                                            return detail && detail.nilai > 0;
                                        }))
                                    }
                                >
                                    Selanjutnya
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || completionPercentage < 100}
                                >
                                    {isSubmitting ? (
                                        <>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Selesai & Simpan'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}