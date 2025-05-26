import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            <div className="relative w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <Link href={route('home')} className="inline-block">
                        <div className="mx-auto mb-4 relative">
                            <div className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100">
                                <img 
                                    src="https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-destra.png" 
                                    alt="Destra Logo" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-gray-900">SMK IGASAR PINDAD</h1>
                            <p className="text-sm text-gray-600">Sistem Evaluasi Guru</p>
                        </div>
                    </Link>
                </div>

                {/* Main Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-2 text-center bg-gradient-to-r  text-gray-800">
                        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                        <CardDescription className="text-gray-800 text-sm">{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 py-8">
                        {children}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        © 2025 SMK IGASAR PINDAD. Semua hak dilindungi undang-undang.
                    </p>
                </div>
            </div>
        </div>
    );
}
