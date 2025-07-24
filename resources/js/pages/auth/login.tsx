import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout 
            title="Selamat Datang Kembali" 
            description="Masuk ke sistem evaluasi guru untuk melanjutkan aktivitas Anda"
        >
            <Head title="Masuk" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                    <p className="text-sm font-medium text-green-800">{status}</p>
                </div>
            )}

            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-5">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Alamat Email
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@sekolah.com"
                                className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Kata Sandi
                            </Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                    tabIndex={5}
                                >
                                    Lupa kata sandi?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan kata sandi"
                                className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            tabIndex={3}
                            className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                            Ingat saya
                        </Label>
                    </div>
                </div>

                {/* Submit Button */}
                <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                    tabIndex={4} 
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                            Sedang masuk...
                        </>
                    ) : (
                        <>
                            Masuk ke Sistem
                        </>
                    )}
                </Button>

                {/* Footer Info */}
                <div className="text-center pt-4">
                    <p className="text-sm text-gray-500">
                        Sistem Evaluasi Guru - SMP PENIDA KATAPANG
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Hubungi administrator jika mengalami kesulitan login
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
