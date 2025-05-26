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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// Tipe untuk MataPelajaran
interface MataPelajaran {
  id: number;
  nama: string;
  kode: string;
  deskripsi?: string;
  is_active: boolean;
}

interface MataPelajaranFormProps {
  mataPelajaran: MataPelajaran | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

// Schema validasi dengan Zod
const createMataPelajaranSchema = z.object({
  nama: z.string().min(1, { message: 'Nama mata pelajaran wajib diisi' }),
  kode: z.string().min(1, { message: 'Kode mata pelajaran wajib diisi' }),
  deskripsi: z.string().optional(),
});

const editMataPelajaranSchema = z.object({
  nama: z.string().min(1, { message: 'Nama mata pelajaran wajib diisi' }),
  kode: z.string().min(1, { message: 'Kode mata pelajaran wajib diisi' }),
  deskripsi: z.string().optional(),
  is_active: z.boolean(),
});

export default function MataPelajaranForm({ mataPelajaran, mode, onSuccess }: MataPelajaranFormProps) {
  // Setup schema berdasarkan mode
  const schema = mode === 'create' ? createMataPelajaranSchema : editMataPelajaranSchema;
  
  // Setup react-hook-form dengan zod resolver
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'create' 
        ? {
            nama: '',
            kode: '',
            deskripsi: '',
          }
        : {
            nama: mataPelajaran?.nama || '',
            kode: mataPelajaran?.kode || '',
            deskripsi: mataPelajaran?.deskripsi || '',
            is_active: mataPelajaran?.is_active || false,
          },
  });
  
  // Update form values ketika mataPelajaran berubah (untuk edit mode)
  useEffect(() => {
    if (mataPelajaran && mode === 'edit') {
      form.reset({
        nama: mataPelajaran.nama,
        kode: mataPelajaran.kode,
        deskripsi: mataPelajaran.deskripsi || '',
        is_active: mataPelajaran.is_active,
      });
    } else if (mode === 'create') {
      form.reset({
        nama: '',
        kode: '',
        deskripsi: '',
      });
    }
  }, [mataPelajaran, mode]);

  // Status loading untuk button submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler untuk form submission
  const onSubmit = (data: z.infer<typeof schema>) => {
    setIsSubmitting(true);
    
    if (mode === 'create') {
      router.post(route('mata-pelajaran.store'), data, {
        onSuccess: () => {
          toast.success('Mata pelajaran berhasil ditambahkan');
          onSuccess();
          setIsSubmitting(false);
        },
        onError: (errors) => {
          Object.entries(errors).forEach(([key, value]) => {
            form.setError(key as any, { type: 'manual', message: value as string });
          });
          toast.error('Gagal menambahkan mata pelajaran');
          setIsSubmitting(false);
        }
      });
    } else if (mode === 'edit' && mataPelajaran) {
      router.post(route('mata-pelajaran.update', mataPelajaran.id), {
        ...data,
        _method: 'POST',
      }, {
        onSuccess: () => {
          toast.success('Informasi mata pelajaran berhasil diperbarui');
          onSuccess();
          setIsSubmitting(false);
        },
        onError: (errors) => {
          Object.entries(errors).forEach(([key, value]) => {
            form.setError(key as any, { type: 'manual', message: value as string });
          });
          toast.error('Gagal memperbarui informasi mata pelajaran');
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
                <FormLabel>Nama Mata Pelajaran</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Matematika, Fisika, Bahasa Indonesia" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Nama lengkap mata pelajaran
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="kode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Mata Pelajaran</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: MTK, FIS, BIN" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Kode singkatan mata pelajaran (unik)
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
                    placeholder="Deskripsi singkat tentang mata pelajaran"
                    className="resize-none" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Deskripsi singkat tentang mata pelajaran (opsional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {mode === 'edit' && (
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Status Aktif</FormLabel>
                    <FormDescription>
                      Mata pelajaran akan tersedia untuk dipilih jika aktif
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
            {isSubmitting ? 'Memproses...' : mode === 'create' ? 'Tambah Mata Pelajaran' : 'Perbarui Mata Pelajaran'}
          </Button>
        </div>
      </form>
    </Form>
  );
}