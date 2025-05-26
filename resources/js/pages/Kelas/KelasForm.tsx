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

// Tipe untuk Kelas
interface Kelas {
  id: number;
  nama: string;
  tahun_akademik: string;
}

interface KelasFormProps {
  kelas: Kelas | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

// Schema validasi dengan Zod
const kelasSchema = z.object({
  nama: z.string().min(1, { message: 'Nama kelas wajib diisi' }),
  tahun_akademik: z.string().min(1, { message: 'Tahun akademik wajib diisi' }),
});

export default function KelasForm({ kelas, mode, onSuccess }: KelasFormProps) {
  // Setup react-hook-form dengan zod resolver
  const form = useForm<z.infer<typeof kelasSchema>>({
    resolver: zodResolver(kelasSchema),
    defaultValues: {
      nama: kelas?.nama || '',
      tahun_akademik: kelas?.tahun_akademik || '',
    },
  });
  
  // Update form values ketika kelas berubah (untuk edit mode)
  useEffect(() => {
    if (kelas && mode === 'edit') {
      form.reset({
        nama: kelas.nama,
        tahun_akademik: kelas.tahun_akademik,
      });
    } else if (mode === 'create') {
      form.reset({
        nama: '',
        tahun_akademik: '',
      });
    }
  }, [kelas, mode]);

  // Status loading untuk button submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler untuk form submission
  const onSubmit = (data: z.infer<typeof kelasSchema>) => {
    setIsSubmitting(true);
    
    if (mode === 'create') {
      router.post(route('kelas.store'), data, {
        onSuccess: () => {
          toast.success('Kelas berhasil ditambahkan');
          onSuccess();
          setIsSubmitting(false);
        },
        onError: (errors) => {
          Object.entries(errors).forEach(([key, value]) => {
            form.setError(key as any, { type: 'manual', message: value as string });
          });
          toast.error('Gagal menambahkan kelas');
          setIsSubmitting(false);
        }
      });
    } else if (mode === 'edit' && kelas) {
      router.post(route('kelas.update', kelas.id), {
        ...data,
        _method: 'POST',
      }, {
        onSuccess: () => {
          toast.success('Informasi kelas berhasil diperbarui');
          onSuccess();
          setIsSubmitting(false);
        },
        onError: (errors) => {
          Object.entries(errors).forEach(([key, value]) => {
            form.setError(key as any, { type: 'manual', message: value as string });
          });
          toast.error('Gagal memperbarui informasi kelas');
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
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kelas</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 10A, 11B, 12C" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Nama atau identifikasi untuk kelas ini
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tahun_akademik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun Akademik</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 2024/2025" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Periode tahun ajaran untuk kelas ini
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
            {isSubmitting ? 'Memproses...' : mode === 'create' ? 'Tambah Kelas' : 'Perbarui Kelas'}
          </Button>
        </div>
      </form>
    </Form>
  );
}