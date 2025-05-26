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
interface SiswaEvaluasiFormProps {
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

export default function SiswaEvaluasiForm({
    guru,
    kriteriaList,
    periodeAktif,
    evaluasi,
    mode,
    onClose,
}: SiswaEvaluasiFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSection, setCurrentSection] = useState(0);
    
    //Bagi kriteria menjadi beberapa section berdasarkan kategori
    const sections: Record<string, Kriteria[]> = { 
    'Semua Kriteria': kriteriaList 
};
    
    const sectionNames = Object.keys(sections);
    
    // Setup form dengan default values
    const form = useForm<EvaluasiFormValues>({
        resolver: zodResolver(evaluasiSchema),
        defaultValues: evaluasi ? {
            guru_id: evaluasi.guru_id,
            periode_evaluasi_id: evaluasi.periode_evaluasi_id,
            status: evaluasi.status,
            detail_evaluasi: evaluasi.detail_evaluasi,
            
        } : {
            guru_id: guru.id,
            periode_evaluasi_id: periodeAktif.id,
            status: 'draft',
            komentar_umum: '',
            detail_evaluasi: kriteriaList.map(k => ({
                kriteria_id: k.id,
                nilai: 0,
                komentar: '',
            })),
        }
    });
    
    // Navigasi antar section
    const goToNextSection = () => {
        if (currentSection < sectionNames.length - 1) {
            setCurrentSection(prev => prev + 1);
        }
    };
    
    const goToPrevSection = () => {
        if (currentSection > 0) {
            setCurrentSection(prev => prev - 1);
        }
    };
    
    // Validasi section saat ini
    const validateCurrentSection = () => {
        const currentKriteria = sections[sectionNames[currentSection]].map(k => k.id);
        
        // Cek setiap detail evaluasi untuk kriteria di section ini
        const values = form.getValues();
        
        let isValid = true;
        
        currentKriteria.forEach(kriteriaId => {
            const detailEval = values.detail_evaluasi.find(de => de.kriteria_id === kriteriaId);
            
            if (!detailEval || detailEval.nilai < 1) {
                isValid = false;
            }
        });
        
        return isValid;
    };
    
    // Handle next button with validation
    const handleNextSection = () => {
        if (validateCurrentSection()) {
            goToNextSection();
        } else {
            toast.error("Harap nilai semua kriteria pada bagian ini sebelum melanjutkan");
        }
    };
    
    // Submit handler
    const onSubmit = (values: EvaluasiFormValues) => {
        if (mode === 'view') return;
        
        setIsSubmitting(true);
        
        // Kirim ke endpoint sesuai mode (create atau edit)
        const endpoint = mode === 'create' 
            ? route('evaluasi-guru.store')
            : route('evaluasi-guru.update', evaluasi?.id);
            
        const method = mode === 'create' ? 'post' : 'put';
        
        router[method](endpoint, values, {
            onSuccess: () => {
                toast.success(
                    values.status === 'selesai'
                        ? 'Evaluasi berhasil disimpan dan diselesaikan'
                        : 'Evaluasi berhasil disimpan sebagai draft'
                );
                if (onClose) onClose();
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Terjadi kesalahan saat menyimpan evaluasi');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };
    
    // Rating component
    const RatingInput = ({ 
        value, 
        onChange, 
        disabled = false 
    }: { 
        value: number; 
        onChange: (value: number) => void; 
        disabled?: boolean;
    }) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                    <label 
                        key={rating}
                        className={`
                            flex h-10 w-10 cursor-pointer items-center justify-center rounded-full
                            ${value === rating 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted hover:bg-muted/80'}
                            ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        <input
                            type="radio"
                            value={rating}
                            checked={value === rating}
                            onChange={() => onChange(rating)}
                            className="sr-only"
                            disabled={disabled}
                        />
                        {rating}
                    </label>
                ))}
            </div>
        );
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Progress indicator */}
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        Bagian {currentSection + 1} dari {sectionNames.length}: {sectionNames[currentSection]}
                    </div>
                    <div className="flex items-center gap-2">
                        {sectionNames.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-8 rounded-full ${
                                    currentSection === index 
                                        ? 'bg-primary' 
                                        : currentSection > index 
                                        ? 'bg-primary/30' 
                                        : 'bg-muted'
                                }`}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Kriteria di section saat ini */}
                <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                    <div className="space-y-8">
                        {sections[sectionNames[currentSection]].map((kriteria) => (
                            <FormField
                                key={kriteria.id}
                                control={form.control}
                                name={`detail_evaluasi.${form.getValues().detail_evaluasi.findIndex(
                                    de => de.kriteria_id === kriteria.id
                                )}.nilai`}
                                render={({ field }) => (
                                    <FormItem className="border rounded-lg p-4">
                                        <FormLabel className="text-base font-semibold">{kriteria.nama}</FormLabel>
                                        <FormDescription className="text-sm text-gray-600">
                                            {kriteria.deskripsi}
                                        </FormDescription>
                                        <FormControl>
                                            <div className="mt-3">
                                                <RatingInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    disabled={mode === 'view'}
                                                />
                                                <div className="mt-2 flex justify-between text-xs text-gray-500">
                                                    <span>Sangat Kurang</span>
                                                    <span>Sangat Baik</span>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        
                                        <div className="mt-4">
                                            <FormField
                                                control={form.control}
                                                name={`detail_evaluasi.${form.getValues().detail_evaluasi.findIndex(
                                                    de => de.kriteria_id === kriteria.id
                                                )}.komentar`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Komentar (opsional)</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Tambahkan komentar atau saran..."
                                                                className="resize-none"
                                                                {...field}
                                                                disabled={mode === 'view'}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        ))}
                        
                        {/* Komentar umum pada section terakhir */}
                        {currentSection === sectionNames.length - 1 && (
                            <FormField
                                control={form.control}
                                name="komentar_umum"
                                render={({ field }) => (
                                    <FormItem className="border rounded-lg p-4">
                                        <FormLabel>Komentar Umum (opsional)</FormLabel>
                                        <FormDescription>
                                            Berikan komentar umum mengenai guru ini.
                                        </FormDescription>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Tambahkan komentar umum..." 
                                                className="resize-none" 
                                                rows={4}
                                                {...field}
                                                disabled={mode === 'view'}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </ScrollArea>
                
                {/* Navigation and Submit buttons */}
                <div className="flex justify-between pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={currentSection === 0 ? onClose : goToPrevSection}
                    >
                        {currentSection === 0 ? "Kembali" : "Sebelumnya"}
                    </Button>
                    
                    <div className="flex gap-2">
                        {currentSection < sectionNames.length - 1 ? (
                            <Button type="button" onClick={handleNextSection}>
                                Selanjutnya
                            </Button>
                        ) : mode !== 'view' ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.handleSubmit((data) => onSubmit({...data, status: 'draft'}))()}
                                    disabled={isSubmitting}
                                >
                                    Simpan Draft
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => form.handleSubmit((data) => onSubmit({...data, status: 'selesai'}))()}
                                    disabled={isSubmitting}
                                >
                                    Selesai & Kirim
                                </Button>
                            </>
                        ) : (
                            <Button type="button" onClick={onClose}>
                                Tutup
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    );
}