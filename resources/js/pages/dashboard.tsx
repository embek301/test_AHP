import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
    Activity,
    ArrowUpRight,
    Award,
    BarChart4,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Clock,
    GraduationCap,
    Lightbulb,
    NotebookPen,
    School,
    Star,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';

// Interface untuk props dari dashboard
interface DashboardProps extends PageProps {
    dashboardData?: {
        // Admin data
        totalUsers?: number;
        totalGuru?: number;
        evaluasiAktif?: number;
        evaluasiSelesai?: number;
        recentActivities?: Array<{
            type: string;
            message: string;
            time: string;
            icon: string;
        }>;
        
        // Guru data
        hasilEvaluasi?: number;
        rataRataNilai?: number;
        areaImprovement?: Array<{
            name: string;
            percentage: number;
            suggestion: string;
        }>;
        
        // Siswa data
        kelasSaya?: Array<{
            id: number;
            kelas: {
                id: number;
                nama: string;
                tahun_akademik: string;
            };
        }>;
        guruUntukEvaluasi?: Array<{
            id: number;
            nama_guru: string;
            mata_pelajaran: string;
            status_evaluasi: string;
        }>;
        
        // Kepala Sekolah data
        rekomendasi?: number;
        guruPerhatian?: Array<{
            name: string;
            mata_pelajaran: string;
            nilai: number;
        }>;
        
        // Chart data
        chartData?: {
            perbandinganGuru?: Array<{ name: string; nilai: number }>;
            trendEvaluasi?: Array<{ bulan: string; nilai: number }>;
            trendNilai?: Array<{ bulan: string; nilai: number }>;
            kriteriaEvaluasi?: Array<{ name: string; nilai: number }>;
            evaluasiDistribution?: Array<{ name: string; value: number }>;
        };
    };
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            roles: { name: string }[];
        };
    };
}

// Modern color palette
const COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    emerald: '#059669',
    orange: '#f97316',
    red: '#ef4444',
    slate: '#64748b'
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.purple, COLORS.pink];

export default function Dashboard() {
    const { dashboardData, auth } = usePage<DashboardProps>().props;
    const roles = auth?.user?.roles?.map((role: { name: string }) => role.name) || [];

    const isAdmin = roles.includes('admin');
    const isKepalaSekolah = roles.includes('kepala_sekolah');
    const isGuru = roles.includes('guru');
    const isSiswa = roles.includes('siswa');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Modern Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative px-6 py-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                                Selamat Datang, {auth.user.name}
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                                {isAdmin && 'Kelola dan pantau evaluasi guru dengan dashboard yang komprehensif dan real-time'}
                                {isKepalaSekolah && 'Pantau perkembangan evaluasi dan berikan rekomendasi untuk peningkatan kualitas'}
                                {isGuru && 'Lihat hasil evaluasi dan tingkatkan pengembangan diri dengan insight yang mendalam'}
                                {isSiswa && 'Berkontribusi untuk peningkatan kualitas pengajaran melalui evaluasi yang objektif'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Dashboard Admin */}
                {isAdmin && dashboardData && (
                    <>
                        {/* Stats Grid */}
                        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Total Pengguna</p>
                                            <p className="text-3xl font-bold">{dashboardData.totalUsers}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <Users className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs text-blue-100">
                                        <ArrowUpRight className="mr-1 h-3 w-3" />
                                        Pengguna aktif dalam sistem
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-100 text-sm font-medium">Total Guru</p>
                                            <p className="text-3xl font-bold">{dashboardData.totalGuru}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs text-emerald-100">
                                        <Target className="mr-1 h-3 w-3" />
                                        Guru yang dikelola
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-amber-100 text-sm font-medium">Evaluasi Aktif</p>
                                            <p className="text-3xl font-bold">{dashboardData.evaluasiAktif}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs text-amber-100">
                                        <Clock className="mr-1 h-3 w-3" />
                                        Periode berlangsung
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">Evaluasi Selesai</p>
                                            <p className="text-3xl font-bold">{dashboardData.evaluasiSelesai}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs text-purple-100">
                                        <Star className="mr-1 h-3 w-3" />
                                        Periode selesai
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Section */}
                        <div className="mb-8 grid gap-8 lg:grid-cols-2">
                            <Card className="border-0 shadow-xl">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="rounded-lg bg-blue-100 p-2">
                                            <School className="h-5 w-5 text-blue-600" />
                                        </div>
                                        Top 5 Guru Terbaik
                                    </CardTitle>
                                    <CardDescription>Berdasarkan rata-rata nilai evaluasi</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={dashboardData.chartData?.perbandinganGuru || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" fontSize={12} />
                                            <YAxis domain={[3, 5]} tickCount={5} fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                                }}
                                            />
                                            <Bar 
                                                dataKey="nilai" 
                                                fill="url(#colorGradient)" 
                                                radius={[6, 6, 0, 0]}
                                            />
                                            <defs>
                                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.9}/>
                                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.6}/>
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="rounded-lg bg-emerald-100 p-2">
                                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        Tren Evaluasi
                                    </CardTitle>
                                    <CardDescription>Perkembangan nilai 6 bulan terakhir</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={dashboardData.chartData?.trendEvaluasi || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="bulan" fontSize={12} />
                                            <YAxis domain={[3, 5]} tickCount={5} fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="nilai"
                                                stroke={COLORS.secondary}
                                                strokeWidth={3}
                                                dot={{ fill: COLORS.secondary, r: 6 }}
                                                activeDot={{ r: 8, fill: COLORS.secondary }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activities */}
                        <Card className="border-0 shadow-xl">
                            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="rounded-lg bg-purple-100 p-2">
                                        <NotebookPen className="h-5 w-5 text-purple-600" />
                                    </div>
                                    Aktivitas Terbaru
                                </CardTitle>
                                <CardDescription>Update terbaru dalam sistem</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {dashboardData.recentActivities?.map((activity, index) => (
                                        <div key={index} className="flex items-center gap-4 p-6 transition-colors hover:bg-gray-50">
                                            <div className="rounded-full bg-blue-100 p-3">
                                                <CalendarDays className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{activity.message}</p>
                                                <p className="text-sm text-gray-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Dashboard Kepala Sekolah */}
                {isKepalaSekolah && dashboardData && (
                    <>
                        {/* Stats Grid untuk Kepala Sekolah */}
                        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-100 text-sm font-medium">Total Guru</p>
                                            <p className="text-3xl font-bold">{dashboardData.totalGuru}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-amber-100 text-sm font-medium">Evaluasi Aktif</p>
                                            <p className="text-3xl font-bold">{dashboardData.evaluasiAktif}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">Evaluasi Selesai</p>
                                            <p className="text-3xl font-bold">{dashboardData.evaluasiSelesai}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-indigo-100 text-sm font-medium">Rekomendasi</p>
                                            <p className="text-3xl font-bold">{dashboardData.rekomendasi}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <Lightbulb className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts dan Guru Perhatian */}
                        <div className="mb-8 grid gap-8 lg:grid-cols-2">
                            <Card className="border-0 shadow-xl">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="rounded-lg bg-blue-100 p-2">
                                            <School className="h-5 w-5 text-blue-600" />
                                        </div>
                                        Perbandingan Nilai Guru
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={dashboardData.chartData?.perbandinganGuru || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" fontSize={12} />
                                            <YAxis domain={[3, 5]} tickCount={5} fontSize={12} />
                                            <Tooltip />
                                            <Bar dataKey="nilai" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="rounded-lg bg-orange-100 p-2">
                                            <Award className="h-5 w-5 text-orange-600" />
                                        </div>
                                        Guru Perlu Perhatian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        {dashboardData.guruPerhatian?.map((guru, index) => (
                                            <div key={index} className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full bg-orange-100 p-2">
                                                        <GraduationCap className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{guru.name}</p>
                                                        <p className="text-sm text-gray-500">{guru.mata_pelajaran}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                                    {guru.nilai.toFixed(1)}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* Dashboard Guru */}
                {isGuru && dashboardData && (
                    <>
                        {/* Stats Grid untuk Guru */}
                        <div className="mb-8 grid gap-6 sm:grid-cols-3">
                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-amber-100 text-sm font-medium">Evaluasi Aktif</p>
                                            <p className="text-3xl font-bold">{dashboardData.evaluasiAktif}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Hasil Evaluasi</p>
                                            <p className="text-3xl font-bold">{dashboardData.hasilEvaluasi}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <BarChart4 className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-100 text-sm font-medium">Rata-Rata Nilai</p>
                                            <p className="text-3xl font-bold">{dashboardData.rataRataNilai}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <Star className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts dan Area Improvement */}
                        <div className="mb-8 grid gap-8 lg:grid-cols-2">
                            <Card className="border-0 shadow-xl">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="rounded-lg bg-blue-100 p-2">
                                            <BarChart4 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        Detail Evaluasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={dashboardData.chartData?.kriteriaEvaluasi || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" fontSize={12} />
                                            <YAxis domain={[3, 5]} tickCount={5} fontSize={12} />
                                            <Tooltip />
                                            <Bar dataKey="nilai" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="rounded-lg bg-yellow-100 p-2">
                                            <Lightbulb className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        Area Pengembangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {dashboardData.areaImprovement?.map((area, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{area.name}</span>
                                                    <span className="text-sm text-gray-500">{area.percentage}%</span>
                                                </div>
                                                <Progress value={area.percentage} className="h-2" />
                                                <p className="text-sm text-gray-600">{area.suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* Dashboard Siswa */}
                {isSiswa && dashboardData && (
                    <>
                        {/* Stats Grid untuk Siswa */}
                        <div className="mb-8 grid gap-6 sm:grid-cols-2">
                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-amber-100 text-sm font-medium">Evaluasi Aktif</p>
                                            <p className="text-3xl font-bold">{dashboardData.evaluasiAktif}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Kelas Saya</p>
                                            <p className="text-3xl font-bold">{dashboardData.kelasSaya?.length || 0}</p>
                                        </div>
                                        <div className="rounded-full bg-white/20 p-3">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Kelas dan Guru untuk Evaluasi */}
                        <div className="grid gap-8 lg:grid-cols-2">
                            <Card className="border-0 shadow-xl">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="rounded-lg bg-blue-100 p-2">
                                            <School className="h-5 w-5 text-blue-600" />
                                        </div>
                                        Kelas Saya
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        {dashboardData.kelasSaya?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-4">
                                                <div className="rounded-full bg-blue-100 p-3">
                                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.kelas.nama}</p>
                                                    <p className="text-sm text-gray-500">Tahun: {item.kelas.tahun_akademik}</p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl">
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="rounded-lg bg-purple-100 p-2">
                                            <NotebookPen className="h-5 w-5 text-purple-600" />
                                        </div>
                                        Status Evaluasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        {dashboardData.guruUntukEvaluasi?.map((guru, index) => (
                                            <div key={index} className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full bg-purple-100 p-2">
                                                        <GraduationCap className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{guru.nama_guru}</p>
                                                        <p className="text-sm text-gray-500">{guru.mata_pelajaran}</p>
                                                    </div>
                                                </div>
                                                <Badge 
                                                    variant={guru.status_evaluasi === 'Sudah Dievaluasi' ? 'default' : 'secondary'}
                                                    className={guru.status_evaluasi === 'Sudah Dievaluasi' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }
                                                >
                                                    {guru.status_evaluasi}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}