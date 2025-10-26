import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

interface SubKriteria {
    id: number;
    kriteria_id: number;
    nama: string;
    deskripsi: string;
    bobot: number;
    urutan: number;
    aktif: boolean;
}

interface Kriteria {
    id: number;
    nama: string;
    deskripsi: string;
    kategori: string;
    bobot: number;
    sub_kriteria?: SubKriteria[];
}

interface PeriodeEvaluasi {
    id: number;
    judul: string;
}

interface DetailEvaluasi {
    kriteria_id: number;
    sub_kriteria_id?: number | null;
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
interface KepsekEvaluasiFormProps {
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
    sub_kriteria_id: z.number().nullable().optional(),
    nilai: z.number().min(1, 'Nilai harus diisi').max(5, 'Nilai maksimal adalah 5'),
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

export default function KepsekEvaluasiForm({ guru, kriteriaList, periodeAktif, evaluasi, mode, onClose }: KepsekEvaluasiFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSection, setCurrentSection] = useState(0);
    const [maxCompletedSection, setMaxCompletedSection] = useState(0);

    // Debug: Log data yang masuk
    useEffect(() => {
        console.log('Mode:', mode);
        console.log('Evaluasi data:', evaluasi);
        console.log('Kriteria list:', kriteriaList);
    }, [mode, evaluasi, kriteriaList]);

    // Flatten kriteria dan sub kriteria untuk penilaian
    const flattenedItems: Array<{
        type: 'kriteria' | 'sub_kriteria';
        kriteria: Kriteria;
        subKriteria?: SubKriteria;
        index: number;
    }> = [];

    kriteriaList.forEach((kriteria) => {
        if (kriteria.sub_kriteria && kriteria.sub_kriteria.length > 0) {
            kriteria.sub_kriteria
                .filter((sub) => sub.aktif)
                .sort((a, b) => a.urutan - b.urutan)
                .forEach((subKriteria) => {
                    flattenedItems.push({
                        type: 'sub_kriteria',
                        kriteria,
                        subKriteria,
                        index: flattenedItems.length,
                    });
                });
        } else {
            flattenedItems.push({
                type: 'kriteria',
                kriteria,
                index: flattenedItems.length,
            });
        }
    });

    // Group items into sections of 5
    const sectionedItems = chunkArray(flattenedItems, 5);

    // Initialize default values
    const getDefaultValues = (): EvaluasiFormValues => {
        if (evaluasi && evaluasi.detail_evaluasi) {
            const detailMap: Record<string, DetailEvaluasi> = {};
            
            // Build map dari detail evaluasi yang ada
            evaluasi.detail_evaluasi.forEach((detail) => {
                if (detail.kriteria_id) {
                    const key = detail.sub_kriteria_id 
                        ? `${detail.kriteria_id}-${detail.sub_kriteria_id}` 
                        : `${detail.kriteria_id}`;
                    detailMap[key] = detail;
                }
            });

            // Cari komentar umum (detail dengan kriteria_id null)
            const komentarUmum = evaluasi.detail_evaluasi.find(
                (detail) => !detail.kriteria_id
            )?.komentar || '';

            console.log('Detail map:', detailMap);
            console.log('Komentar umum:', komentarUmum);

            return {
                guru_id: evaluasi.guru_id,
                periode_evaluasi_id: evaluasi.periode_evaluasi_id,
                status: evaluasi.status,
                komentar_umum: komentarUmum,
                detail_evaluasi: flattenedItems.map((item) => {
                    const key = item.subKriteria 
                        ? `${item.kriteria.id}-${item.subKriteria.id}` 
                        : `${item.kriteria.id}`;
                    const existingDetail = detailMap[key];

                    const result = {
                        kriteria_id: item.kriteria.id,
                        sub_kriteria_id: item.subKriteria?.id ?? null,
                        nilai: existingDetail?.nilai || 0,
                        komentar: existingDetail?.komentar || '',
                    };

                    console.log(`Mapping ${key}:`, result);
                    return result;
                }),
            };
        } else {
            return {
                guru_id: guru.id,
                periode_evaluasi_id: periodeAktif.id,
                status: 'draft',
                komentar_umum: '',
                detail_evaluasi: flattenedItems.map((item) => ({
                    kriteria_id: item.kriteria.id,
                    sub_kriteria_id: item.subKriteria?.id ?? null,
                    nilai: 0,
                    komentar: '',
                })),
            };
        }
    };

    // Initialize form
    const form = useForm<EvaluasiFormValues>({
        resolver: zodResolver(evaluasiSchema),
        defaultValues: getDefaultValues(),
    });

    // Watch all form values to calculate progress
    const formValues = form.watch();

    // Calculate completion percentage
    const calculateCompletion = () => {
        let filled = 0;
        const total = flattenedItems.length;

        formValues.detail_evaluasi.forEach((detail) => {
            if (detail.nilai > 0) filled++;
        });

        return Math.round((filled / total) * 100);
    };

    const completionPercentage = calculateCompletion();

    // Navigate to next section if current section is complete
    useEffect(() => {
        const currentSectionItems = sectionedItems[currentSection] || [];
        const isCurrentSectionComplete = currentSectionItems.every((item) => {
            const detail = formValues.detail_evaluasi[item.index];
            return detail && detail.nilai > 0;
        });

        if (isCurrentSectionComplete && currentSection > maxCompletedSection) {
            setMaxCompletedSection(currentSection);
        }
    }, [formValues.detail_evaluasi, currentSection]);

    // Handle section navigation
    const goToSection = (index: number) => {
        setCurrentSection(index);
    };

    const goToNextSection = () => {
        if (currentSection < sectionedItems.length) {
            setCurrentSection(currentSection + 1);
        }
    };

    const goToPrevSection = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    // Submit handler
    const onSubmit = (data: EvaluasiFormValues, status: 'draft' | 'selesai' = 'draft') => {
        const filteredDetailEvaluasi = status === 'selesai' 
            ? data.detail_evaluasi 
            : data.detail_evaluasi.filter((detail) => detail.nilai > 0);

        if (status === 'selesai') {
            const hasEmptyValue = data.detail_evaluasi.some((detail) => detail.nilai === 0);
            if (hasEmptyValue) {
                toast.error('Mohon isi semua nilai sebelum menyelesaikan evaluasi');
                return;
            }
        }

        data.status = status;
        setIsSubmitting(true);

        const payload = {
            guru_id: data.guru_id,
            periode_evaluasi_id: data.periode_evaluasi_id,
            status: status,
            komentar_umum: data.komentar_umum || '',
            detail_evaluasi: filteredDetailEvaluasi,
        };

        if (mode === 'edit' && evaluasi?.id) {
            router.put(route('kepsek.evaluasi-form.update', evaluasi.id), payload, {
                onSuccess: () => {
                    toast.success(
                        status === 'selesai' 
                            ? 'Evaluasi berhasil diselesaikan dan disimpan' 
                            : 'Perubahan evaluasi berhasil disimpan sebagai draft',
                    );
                    setIsSubmitting(false);
                    onClose && onClose();
                },
                onError: (errors) => {
                    console.error('Error dari server:', errors);
                    const errorMessages = Object.values(errors).flat();
                    errorMessages.forEach((msg: any) => {
                        toast.error(typeof msg === 'string' ? msg : 'Terjadi kesalahan saat menyimpan evaluasi');
                    });
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post(route('kepsek.evaluasi-form.store'), payload, {
                onSuccess: () => {
                    toast.success(
                        status === 'selesai' 
                            ? 'Evaluasi berhasil diselesaikan dan disimpan' 
                            : 'Evaluasi berhasil disimpan sebagai draft'
                    );
                    setIsSubmitting(false);
                    onClose && onClose();
                },
                onError: (errors) => {
                    console.error('Error dari server:', errors);
                    const errorMessages = Object.values(errors).flat();
                    errorMessages.forEach((msg: any) => {
                        toast.error(typeof msg === 'string' ? msg : 'Terjadi kesalahan saat menyimpan evaluasi');
                    });
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        }
    };

    // Helper function to chunk array into groups
    function chunkArray<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    // Render read-only version for view mode
    if (mode === 'view') {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Detail Evaluasi</h2>
                    <p className="text-gray-500">
                        Evaluasi terhadap {guru.user.name} pada periode {periodeAktif.judul}
                    </p>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="font-medium">Komentar Umum</h3>
                    <p className="rounded bg-gray-50 p-3">{formValues.komentar_umum || '-'}</p>
                </div>

                <div className="space-y-6">
                    {flattenedItems.map((item, index) => {
                        const detail = formValues.detail_evaluasi[index];
                        
                        // Debug log untuk setiap item
                        console.log(`Item ${index}:`, {
                            kriteria: item.kriteria.nama,
                            subKriteria: item.subKriteria?.nama,
                            nilai: detail?.nilai
                        });

                        return (
                            <div key={`${item.kriteria.id}-${item.subKriteria?.id || 'main'}`} className="space-y-3 rounded-md border p-4">
                                <div>
                                    {item.type === 'sub_kriteria' && item.subKriteria ? (
                                        <>
                                            <Badge variant="outline" className="mb-2 bg-purple-50 text-purple-700">
                                                {item.kriteria.nama}
                                            </Badge>
                                            <h3 className="font-medium">
                                                {index + 1}. {item.subKriteria.nama}
                                            </h3>
                                            {item.subKriteria.deskripsi && (
                                                <p className="mt-1 text-sm text-gray-500">{item.subKriteria.deskripsi}</p>
                                            )}
                                            <Badge variant="secondary" className="mt-2">
                                                Bobot: {item.subKriteria.bobot}%
                                            </Badge>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="font-medium">
                                                {index + 1}. {item.kriteria.nama}
                                            </h3>
                                            {item.kriteria.deskripsi && (
                                                <p className="mt-1 text-sm text-gray-500">{item.kriteria.deskripsi}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">Nilai: {detail?.nilai || 'Tidak ada nilai'}</h4>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4, 5].map((value) => {
                                            // Konversi nilai ke integer untuk perbandingan
                                            const nilaiInt = detail ? Math.round(Number(detail.nilai)) : 0;
                                            const isSelected = nilaiInt === value;
                                            return (
                                                <div
                                                    key={value}
                                                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-semibold ${
                                                        isSelected
                                                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                                                            : 'border-gray-200 bg-gray-50 text-gray-400'
                                                    }`}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {Math.round(Number(detail?.nilai)) === 1 && 'Sangat Kurang'}
                                        {Math.round(Number(detail?.nilai)) === 2 && 'Kurang'}
                                        {Math.round(Number(detail?.nilai)) === 3 && 'Cukup'}
                                        {Math.round(Number(detail?.nilai)) === 4 && 'Baik'}
                                        {Math.round(Number(detail?.nilai)) === 5 && 'Sangat Baik'}
                                    </p>
                                </div>

                                {detail?.komentar && (
                                    <div>
                                        <h4 className="text-sm font-medium">Komentar:</h4>
                                        <p className="mt-1 rounded bg-gray-50 p-3">{detail.komentar}</p>
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

    // Main form for create/edit modes
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
                        <div className="h-2.5 w-full rounded-full bg-gray-200">
                            <div className="h-2.5 rounded-full bg-indigo-600" style={{ width: `${completionPercentage}%` }}></div>
                        </div>
                    </div>

                    {/* Section navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {sectionedItems.map((section, index) => {
                            const isSectionComplete = section.every((item) => {
                                const detail = formValues.detail_evaluasi[item.index];
                                return detail && detail.nilai > 0;
                            });

                            return (
                                <Button
                                    key={index}
                                    type="button"
                                    variant={currentSection === index ? 'default' : 'outline'}
                                    className={`min-w-[40px] px-3 ${
                                        isSectionComplete ? 'border-indigo-300 bg-indigo-100 text-indigo-800' : ''
                                    }`}
                                    onClick={() => goToSection(index)}
                                >
                                    {index + 1}
                                </Button>
                            );
                        })}
                        <Button
                            type="button"
                            variant={currentSection === sectionedItems.length ? 'default' : 'outline'}
                            className="px-3"
                            onClick={() => goToSection(sectionedItems.length)}
                            disabled={sectionedItems.length > maxCompletedSection + 1}
                        >
                            Komentar
                        </Button>
                    </div>

                    {/* Current section content */}
                    <ScrollArea className="h-[460px] rounded-md border p-4">
                        {currentSection === sectionedItems.length ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-medium">Komentar Umum</h2>
                                <p className="text-sm text-gray-500">
                                    Berikan komentar umum terkait kinerja guru yang dievaluasi.
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
                                                Komentar ini akan membantu guru untuk memahami keseluruhan evaluasi yang diberikan.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {sectionedItems[currentSection]?.map((item) => {
                                    const detailIndex = item.index;

                                    return (
                                        <div key={`${item.kriteria.id}-${item.subKriteria?.id || 'main'}`} className="space-y-4">
                                            <div>
                                                {item.type === 'sub_kriteria' && item.subKriteria ? (
                                                    <>
                                                        <Badge variant="outline" className="mb-2 bg-purple-50 text-purple-700">
                                                            {item.kriteria.nama}
                                                        </Badge>
                                                        <h2 className="text-lg font-medium">
                                                            {detailIndex + 1}. {item.subKriteria.nama}
                                                        </h2>
                                                        {item.subKriteria.deskripsi && (
                                                            <p className="mt-1 text-sm text-gray-500">{item.subKriteria.deskripsi}</p>
                                                        )}
                                                        <Badge variant="secondary" className="mt-2">
                                                            Bobot: {item.subKriteria.bobot}%
                                                        </Badge>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h2 className="text-lg font-medium">
                                                            {detailIndex + 1}. {item.kriteria.nama}
                                                        </h2>
                                                        {item.kriteria.deskripsi && (
                                                            <p className="mt-1 text-sm text-gray-500">{item.kriteria.deskripsi}</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name={`detail_evaluasi.${detailIndex}.nilai`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel>Nilai</FormLabel>
                                                        <FormControl>
                                                            <div className="flex space-x-2">
                                                                {[1, 2, 3, 4, 5].map((value) => (
                                                                    <button
                                                                        key={value}
                                                                        type="button"
                                                                        onClick={() => field.onChange(value)}
                                                                        className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 transition-colors ${
                                                                            field.value === value
                                                                                ? 'border-indigo-600 bg-indigo-100 font-semibold text-indigo-800'
                                                                                : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
                                                                        }`}
                                                                    >
                                                                        {value}
                                                                    </button>
                                                                ))}
                                                            </div>
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
                            <Button type="button" variant="outline" onClick={goToPrevSection} disabled={currentSection === 0}>
                                Sebelumnya
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onSubmit(form.getValues(), 'draft')} disabled={isSubmitting}>
                                Simpan Draft
                            </Button>
                            {currentSection < sectionedItems.length ? (
                                <Button
                                    type="button"
                                    onClick={goToNextSection}
                                    disabled={
                                        currentSection >= sectionedItems.length ||
                                        (currentSection < sectionedItems.length &&
                                            !sectionedItems[currentSection]?.every((item) => {
                                                const detail = form.getValues().detail_evaluasi[item.index];
                                                return detail && detail.nilai > 0;
                                            }))
                                    }
                                >
                                    Selanjutnya
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting || completionPercentage < 100}>
                                    {isSubmitting ? 'Menyimpan...' : 'Selesai & Simpan'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}