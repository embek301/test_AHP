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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Tipe untuk User dan Role
interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: { id: number; name: string }[];
}

interface Role {
  id: number;
  name: string;
}

interface UserFormProps {
  user: User | null;
  roles: Role[];
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

// Schema validasi dengan Zod
const createUserSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal 3 karakter' }),
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
  password_confirmation: z.string(),
  role: z.string().min(1, { message: 'Pilih peran pengguna' }),
  is_active: z.boolean().default(true),
}).refine(data => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok",
  path: ["password_confirmation"],
});

// Schema untuk edit (password opsional)
const editUserSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal 3 karakter' }),
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(8, { message: 'Password minimal 8 karakter' }).optional().or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
  role: z.string().min(1, { message: 'Pilih peran pengguna' }),
  is_active: z.boolean(),
}).refine(data => !data.password || data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok",
  path: ["password_confirmation"],
});

export default function UserForm({ user, roles, mode, onSuccess }: UserFormProps) {
  // Gunakan schema yang sesuai berdasarkan mode
  const schema = mode === 'create' ? createUserSchema : editUserSchema;
  
  // Setup react-hook-form dengan zod resolver
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      password_confirmation: '',
      role: user?.roles?.[0]?.name || '',
      is_active: user?.is_active ?? true,
    },
  });
  
  // Update form values ketika user berubah (untuk edit mode)
  useEffect(() => {
    if (user && mode === 'edit') {
      form.reset({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.roles?.[0]?.name || '',
        is_active: user.is_active,
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        is_active: true,
      });
    }
  }, [user, mode]);

  // Status loading untuk button submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler untuk form submission
  const onSubmit = (data: z.infer<typeof schema>) => {
    setIsSubmitting(true);
    
    if (mode === 'create') {
      router.post(route('users.store'), data, {
        onSuccess: () => {
          toast.success('Pengguna berhasil ditambahkan');
          onSuccess();
          setIsSubmitting(false);
        },
        onError: (errors) => {
          Object.entries(errors).forEach(([key, value]) => {
            form.setError(key as any, { type: 'manual', message: value as string });
          });
          toast.error('Gagal menambahkan pengguna');
          setIsSubmitting(false);
        }
      });
    } else if (mode === 'edit' && user) {
      router.post(route('users.update', user.id), {
        ...data,
        _method: 'POST',
      }, {
        onSuccess: () => {
          toast.success('Informasi pengguna berhasil diperbarui');
          onSuccess();
          setIsSubmitting(false);
        },
        onError: (errors) => {
          Object.entries(errors).forEach(([key, value]) => {
            form.setError(key as any, { type: 'manual', message: value as string });
          });
          toast.error('Gagal memperbarui informasi pengguna');
          setIsSubmitting(false);
        }
      });
    }
  };
  
  // Map untuk menampilkan label dari role name
  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    kepala_sekolah: 'Kepala Sekolah',
    guru: 'Guru',
    siswa: 'Siswa'
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-2">
        {/* Row 1: Nama dan Email - 2 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama lengkap" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Nama lengkap yang akan ditampilkan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="contoh@sekolah.ac.id" type="email" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Email untuk login ke sistem
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Row 2: Password dan Konfirmasi Password - 2 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{mode === 'create' ? 'Password' : 'Password Baru (Opsional)'}</FormLabel>
                <FormControl>
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  {mode === 'create' 
                    ? 'Password minimal 8 karakter' 
                    : 'Kosongkan jika tidak diubah'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Password</FormLabel>
                <FormControl>
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Masukkan password yang sama
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Row 3: Role dan Status - 2 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peran Pengguna</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih peran pengguna" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.name}>
                        {roleLabels[role.name] || role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Menentukan hak akses dalam sistem
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
                <FormItem className="flex flex-col justify-between">
                  <FormLabel>Status Pengguna</FormLabel>
                  <div className="pt-2">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        defaultValue={field.value ? 'true' : 'false'}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Aktif
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Tidak Aktif
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <FormDescription className="text-xs mt-1">
                    Nonaktif tidak dapat login
                  </FormDescription>
                  <FormMessage />
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
            {isSubmitting ? 'Memproses...' : mode === 'create' ? 'Tambah Pengguna' : 'Perbarui Pengguna'}
          </Button>
        </div>
      </form>
    </Form>
  );
}