import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import {
    Award,
    BadgeCheck,
    BarChart4,
    BookOpen,
    BookOpenCheck,
    CalendarDays,
    CheckCircle2,
    GraduationCap,
    Lightbulb,
    NotebookPen,
    School,
    TrendingUp,
    Users
} from 'lucide-react';

// Tambahkan interface untuk data chart
interface EvaluasiDataItem {
  name: string;
  nilai: number;
}

interface EvaluasiTrendDataItem {
  bulan: string;
  nilai: number;
}

interface PerbandinganGuruDataItem {
  name: string;
  nilai: number;
}

interface PieDataItem {
  name: string;
  value: number;
}

// Interface untuk props dari dashboard
interface DashboardProps extends PageProps {
  dashboardData?: {
    totalUsers?: number;
    totalGuru?: number;
    evaluasiAktif?: number;
    evaluasiSelesai?: number;
    hasilEvaluasi?: number;
    rataRataNilai?: number;
    rekomendasi?: number;
    kelasSaya?: Array<{
      id: number;
      kelas: {
        id: number;
        nama: string;
        tahun_akademik: string;
      }
    }>;
  };
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      roles: { name: string }[];
    }
  }
}

// Data dummy untuk grafik dengan tipe eksplisit
const evaluasiData: EvaluasiDataItem[] = [
  { name: 'Kemampuan Mengajar', nilai: 4.2 },
  { name: 'Penguasaan Materi', nilai: 4.5 },
  { name: 'Kedisiplinan', nilai: 3.8 },
  { name: 'Interaksi dengan Siswa', nilai: 4.1 },
  { name: 'Pengembangan Diri', nilai: 3.9 },
];

const evaluasiTrendData: EvaluasiTrendDataItem[] = [
  { bulan: 'Jan', nilai: 3.8 },
  { bulan: 'Feb', nilai: 3.9 },
  { bulan: 'Mar', nilai: 4.0 },
  { bulan: 'Apr', nilai: 4.1 },
  { bulan: 'May', nilai: 4.2 },
  { bulan: 'Jun', nilai: 4.3 },
];

const perbandinganGuruData: PerbandinganGuruDataItem[] = [
  { name: 'Budi Santoso', nilai: 4.5 },
  { name: 'Siti Aminah', nilai: 4.2 },
  { name: 'Agus Prasetyo', nilai: 4.0 },
  { name: 'Diana Putri', nilai: 4.3 },
  { name: 'Rudi Hartono', nilai: 3.9 },
];

const pieData: PieDataItem[] = [
  { name: 'Siswa', value: 65 },
  { name: 'Rekan Guru', value: 20 },
  { name: 'Kepala Sekolah', value: 15 },
];

const COLORS: string[] = ['#0088FE', '#00C49F', '#FFBB28'];

// Pallete warna pendidikan yang lebih modern
const EDUCATION_COLORS = ['#4B77BE', '#1ABC9C', '#F1C40F', '#9B59B6', '#3498DB'];
const PRIMARY_COLOR = '#4B77BE';
const SECONDARY_COLOR = '#1ABC9C';
const ACCENT_COLOR = '#F1C40F';

export default function Dashboard() {
  const { dashboardData, auth } = usePage<DashboardProps>().props;
  const roles = auth?.user?.roles?.map((role: { name: string }) => role.name) || [];
  
  const isAdmin = roles.includes('admin');
  const isKepalaSekolah = roles.includes('kepala_sekolah');
  const isGuru = roles.includes('guru');
  const isSiswa = roles.includes('siswa');
  
  // Data dummy jika tidak ada data sebenarnya
  const adminData = {
    totalUsers: dashboardData?.totalUsers || 65,
    totalGuru: dashboardData?.totalGuru || 25,
    evaluasiAktif: dashboardData?.evaluasiAktif || 2,
    evaluasiSelesai: dashboardData?.evaluasiSelesai || 7,
  };
  
  const kepalaSekolahData = {
    totalGuru: dashboardData?.totalGuru || 25,
    evaluasiAktif: dashboardData?.evaluasiAktif || 2,
    evaluasiSelesai: dashboardData?.evaluasiSelesai || 7,
    rekomendasi: dashboardData?.rekomendasi || 42
  };
  
  const guruData = {
    evaluasiAktif: dashboardData?.evaluasiAktif || 2,
    hasilEvaluasi: dashboardData?.hasilEvaluasi || 5,
    rataRataNilai: dashboardData?.rataRataNilai || 4.2
  };
  
  const siswaData = {
    evaluasiAktif: dashboardData?.evaluasiAktif || 2,
    kelasSaya: dashboardData?.kelasSaya || [
      { id: 1, kelas: { id: 1, nama: 'Kelas 10A', tahun_akademik: '2025/2026' } },
      { id: 2, kelas: { id: 3, nama: 'Kelas 11A', tahun_akademik: '2025/2026' } }
    ]
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      
      {/* Header section dengan welcome message */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg mb-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-800">Selamat Datang di Sistem Evaluasi Guru</h1>
          <p className="text-blue-600 mt-2">
            {isAdmin && "Kelola dan pantau evaluasi guru dengan mudah"}
            {isKepalaSekolah && "Pantau perkembangan evaluasi dan berikan rekomendasi"}
            {isGuru && "Lihat hasil evaluasi dan tingkatkan pengembangan diri Anda"}
            {isSiswa && "Berkontribusi untuk peningkatan kualitas pengajaran"}
          </p>
        </div>
      </div>
      
      <div className="flex h-full flex-1 flex-col gap-6 p-4 max-w-7xl mx-auto">
        {/* Dashboard Admin */}
        {isAdmin && (
          <>
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminData.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Pengguna terdaftar dalam sistem
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-teal-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
                  <div className="rounded-full bg-teal-100 p-2 text-teal-600">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminData.totalGuru}</div>
                  <p className="text-xs text-muted-foreground">
                    Guru yang dikelola
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-yellow-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluasi Aktif</CardTitle>
                  <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminData.evaluasiAktif}</div>
                  <p className="text-xs text-muted-foreground">
                    Periode evaluasi yang sedang berlangsung
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluasi Selesai</CardTitle>
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminData.evaluasiSelesai}</div>
                  <p className="text-xs text-muted-foreground">
                    Periode evaluasi yang telah selesai
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5 text-blue-600" /> 
                    Perbandingan Nilai Guru
                  </CardTitle>
                  <CardDescription>
                    Rata-rata nilai evaluasi dari 5 guru teratas
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={perbandinganGuruData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[3, 5]} tickCount={5} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="nilai" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-600" /> 
                    Tren Evaluasi
                  </CardTitle>
                  <CardDescription>
                    Rata-rata nilai evaluasi 6 bulan terakhir
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evaluasiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="bulan" />
                      <YAxis domain={[3, 5]} tickCount={5} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="nilai" 
                        stroke={SECONDARY_COLOR} 
                        strokeWidth={3}
                        activeDot={{ r: 8, fill: SECONDARY_COLOR }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Latest Activity Section for Admin */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <NotebookPen className="h-5 w-5 text-purple-600" />
                  Aktivitas Terbaru
                </CardTitle>
                <CardDescription>
                  Update terbaru dalam sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="flex items-center gap-4 p-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Periode Evaluasi Semester Ganjil dibuka</p>
                      <p className="text-sm text-muted-foreground">2 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">5 siswa baru ditambahkan ke sistem</p>
                      <p className="text-sm text-muted-foreground">5 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <div className="rounded-full bg-yellow-100 p-2">
                      <BadgeCheck className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Kriteria evaluasi diperbarui</p>
                      <p className="text-sm text-muted-foreground">1 hari yang lalu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Dashboard Kepala Sekolah */}
        {isKepalaSekolah && (
          <>
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="border-t-4 border-t-teal-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
                  <div className="rounded-full bg-teal-100 p-2 text-teal-600">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kepalaSekolahData.totalGuru}</div>
                  <p className="text-xs text-muted-foreground">
                    Guru yang dikelola
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-yellow-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluasi Aktif</CardTitle>
                  <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kepalaSekolahData.evaluasiAktif}</div>
                  <p className="text-xs text-muted-foreground">
                    Periode evaluasi yang sedang berlangsung
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluasi Selesai</CardTitle>
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kepalaSekolahData.evaluasiSelesai}</div>
                  <p className="text-xs text-muted-foreground">
                    Periode evaluasi yang telah selesai
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-purple-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rekomendasi</CardTitle>
                  <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kepalaSekolahData.rekomendasi}</div>
                  <p className="text-xs text-muted-foreground">
                    Rekomendasi yang telah dibuat
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5 text-blue-600" />
                    Perbandingan Nilai Guru
                  </CardTitle>
                  <CardDescription>
                    Rata-rata nilai evaluasi dari 5 guru teratas
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={perbandinganGuruData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[3, 5]} tickCount={5} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="nilai" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpenCheck className="h-5 w-5 text-yellow-600" />
                    Hasil Evaluasi Guru
                  </CardTitle>
                  <CardDescription>
                    Persentase sumber evaluasi
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EDUCATION_COLORS[index % EDUCATION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Guru yang membutuhkan perhatian untuk Kepala Sekolah */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Guru yang Membutuhkan Perhatian
                </CardTitle>
                <CardDescription>
                  Berdasarkan hasil evaluasi terbaru
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-orange-100 p-2">
                        <GraduationCap className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Diana Putri</p>
                        <p className="text-sm text-muted-foreground">Guru Matematika</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-orange-600">
                      3.5 / 5.0
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-orange-100 p-2">
                        <GraduationCap className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Rudi Hartono</p>
                        <p className="text-sm text-muted-foreground">Guru Bahasa Inggris</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-orange-600">
                      3.7 / 5.0
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Dashboard Guru */}
        {isGuru && (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-t-4 border-t-yellow-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluasi Aktif</CardTitle>
                  <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guruData.evaluasiAktif}</div>
                  <p className="text-xs text-muted-foreground">
                    Periode evaluasi yang sedang berlangsung
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hasil Evaluasi</CardTitle>
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <BarChart4 className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guruData.hasilEvaluasi}</div>
                  <p className="text-xs text-muted-foreground">
                    Total evaluasi yang sudah diterima
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rata-Rata Nilai</CardTitle>
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <Award className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guruData.rataRataNilai}</div>
                  <p className="text-xs text-muted-foreground">
                    Nilai rata-rata dari semua evaluasi
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5 text-blue-600" />
                    Detail Evaluasi
                  </CardTitle>
                  <CardDescription>
                    Nilai per kriteria evaluasi
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={evaluasiData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[3, 5]} tickCount={5} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="nilai" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    Tren Evaluasi
                  </CardTitle>
                  <CardDescription>
                    Perkembangan nilai evaluasi 6 bulan terakhir
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evaluasiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="bulan" />
                      <YAxis domain={[3, 5]} tickCount={5} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="nilai" 
                        stroke={SECONDARY_COLOR}
                        strokeWidth={3}
                        activeDot={{ r: 8, fill: SECONDARY_COLOR }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Area untuk improvement suggestion */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Area Untuk Ditingkatkan
                </CardTitle>
                <CardDescription>
                  Berdasarkan evaluasi terbaru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-yellow-100 p-2">
                      <BadgeCheck className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Kedisiplinan</p>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-yellow-500" style={{ width: '38%' }}></div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tingkatkan kedisiplinan dalam kehadiran dan penyelesaian tugas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-yellow-100 p-2">
                      <BadgeCheck className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pengembangan Diri</p>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-yellow-500" style={{ width: '45%' }}></div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ikuti pelatihan dan kembangkan metode pengajaran baru
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Dashboard Siswa */}
        {isSiswa && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-t-4 border-t-yellow-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluasi Aktif</CardTitle>
                  <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{siswaData.evaluasiAktif}</div>
                  <p className="text-xs text-muted-foreground">
                    Periode evaluasi yang sedang berlangsung
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kelas</CardTitle>
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{siswaData.kelasSaya.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Kelas yang diikuti
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-blue-600" />
                  Kelas Saya
                </CardTitle>
                <CardDescription>
                  Daftar kelas yang sedang diikuti
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {siswaData.kelasSaya.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                      <div className="rounded-full bg-blue-100 p-2 h-10 w-10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.kelas.nama}</div>
                        <div className="text-sm text-muted-foreground">Tahun: {item.kelas.tahun_akademik}</div>
                      </div>
                      <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        Aktif
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Guru yang perlu dievaluasi */}
            <Card className="mt-4 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <NotebookPen className="h-5 w-5 text-purple-600" />
                  Guru yang Perlu Dievaluasi
                </CardTitle>
                <CardDescription>
                  Evaluasi guru Anda untuk periode saat ini
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-purple-100 p-2">
                        <GraduationCap className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Budi Santoso</p>
                        <p className="text-sm text-muted-foreground">Matematika</p>
                      </div>
                    </div>
                    <div className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                      Belum Dievaluasi
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-purple-100 p-2">
                        <GraduationCap className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Siti Aminah</p>
                        <p className="text-sm text-muted-foreground">Bahasa Indonesia</p>
                      </div>
                    </div>
                    <div className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      Sudah Dievaluasi
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}