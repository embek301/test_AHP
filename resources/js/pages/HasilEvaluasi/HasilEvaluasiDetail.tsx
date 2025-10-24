import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, FileSpreadsheet, GraduationCap, Users } from 'lucide-react';

interface SubKriteriaDetail {
    id?: number;
    sub_kriteria_id: number;
    sub_kriteria_nama: string;
    sub_kriteria_bobot: number;
    nilai_rata_siswa: number;
    nilai_rata_rekan: number;
    nilai_pengawas: number;
    nilai_rata_akhir: number;
}

interface DetailKriteria {
    id?: number;
    kriteria_id: number;
    kriteria_nama: string;
    kriteria_bobot: number;
    nilai_rata_siswa: number;
    nilai_rata_rekan: number;
    nilai_pengawas: number;
    nilai_rata_akhir: number;
    sub_kriteria?: SubKriteriaDetail[];
}

interface DetailHasilEvaluasi {
    guru: {
        id: number;
        nip: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    periode: {
        id: number;
        judul: string;
        tanggal_mulai: string;
        tanggal_selesai: string;
    };
    hasil: {
        id: number;
        nilai_siswa: number;
        nilai_rekan: number;
        nilai_pengawas: number;
        nilai_akhir: number;
        created_at: string;
    };
    detail_kriteria: DetailKriteria[];
    evaluator_counts: {
        siswa: number;
        rekan: number;
        pengawas: number;
    };
    komentar: {
        siswa: string[];
        rekan: string[];
        pengawas: string[];
    };
}

interface HasilEvaluasiDetailProps {
    hasilId: number;
    guruId: number;
    periodeId: number;
}

export default function HasilEvaluasiDetail({ hasilId, guruId, periodeId }: HasilEvaluasiDetailProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [detailData, setDetailData] = useState<DetailHasilEvaluasi | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetch(route('hasil-evaluasi.detail', hasilId));
                if (!response.ok) {
                    throw new Error('Failed to fetch detail data');
                }
                const data = await response.json();
                console.log('Fetched data:', data); // Debug log
                setDetailData(data);
            } catch (error) {
                console.error('Error fetching detail:', error);
                toast.error('Gagal memuat detail hasil evaluasi');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [hasilId]);

    const handleExportDirect = (hasilId: number) => {
        try {
            window.location.href = route('hasil-evaluasi.export', hasilId);
            toast.info('Memulai download...');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal mengunduh file');
        }
    };

    const getNilaiCategory = (
        nilai: number,
    ): {
        category: string;
        label: string;
        color: string;
        textColor: string;
        bgColor: string;
    } => {
        if (nilai >= 90) {
            return {
                category: 'sangat-baik',
                label: 'Sangat Baik',
                color: 'bg-green-500',
                textColor: 'text-green-700',
                bgColor: 'bg-green-100',
            };
        } else if (nilai >= 80) {
            return {
                category: 'baik',
                label: 'Baik',
                color: 'bg-blue-500',
                textColor: 'text-blue-700',
                bgColor: 'bg-blue-100',
            };
        } else if (nilai >= 70) {
            return {
                category: 'cukup',
                label: 'Cukup',
                color: 'bg-yellow-500',
                textColor: 'text-yellow-700',
                bgColor: 'bg-yellow-100',
            };
        } else if (nilai >= 60) {
            return {
                category: 'kurang',
                label: 'Kurang',
                color: 'bg-orange-500',
                textColor: 'text-orange-700',
                bgColor: 'bg-orange-100',
            };
        } else {
            return {
                category: 'sangat-kurang',
                label: 'Sangat Kurang',
                color: 'bg-red-500',
                textColor: 'text-red-700',
                bgColor: 'bg-red-100',
            };
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-12 w-[250px]" />
                    <Skeleton className="h-10 w-[120px]" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <Skeleton className="h-[400px]" />
            </div>
        );
    }

    if (!detailData) {
        return (
            <div className="p-4 text-center">
                <p className="mb-4 text-red-500">Gagal memuat data hasil evaluasi.</p>
            </div>
        );
    }

    const nilaiAkhirCategory = getNilaiCategory(detailData.hasil.nilai_akhir);

    return (
        <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                    <h3 className="text-lg font-bold">{detailData.guru.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{detailData.guru.nip}</p>
                    <p className="text-xs">Periode: {detailData.periode.judul}</p>
                </div>
                <Button
                    onClick={() => handleExportDirect(detailData.hasil.id)}
                    className="self-start bg-green-600 hover:bg-green-700"
                    size="sm"
                >
                    <FileSpreadsheet className="mr-2 h-3 w-3" /> Export
                </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
                <Card className={`${nilaiAkhirCategory.bgColor} p-3`}>
                    <div className="flex flex-col items-center justify-center">
                        <p className="mb-1 text-xs font-medium">Nilai Akhir</p>
                        <h3 className={`text-xl font-bold ${nilaiAkhirCategory.textColor}`}>{Number(detailData.hasil.nilai_akhir).toFixed(2)}</h3>
                        <p className={`text-xs font-medium ${nilaiAkhirCategory.textColor}`}>{nilaiAkhirCategory.label}</p>
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex flex-col items-center justify-center">
                        <p className="mb-1 flex items-center text-xs font-medium text-indigo-600">
                            <Users className="mr-1 h-3 w-3" /> Siswa
                        </p>
                        <h3 className="text-xl font-bold text-indigo-700">{Number(detailData.hasil.nilai_siswa).toFixed(2)}</h3>
                        <p className="text-xs font-medium text-muted-foreground">{detailData.evaluator_counts.siswa} evaluator</p>
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex flex-col items-center justify-center">
                        <p className="mb-1 flex items-center text-xs font-medium text-blue-600">
                            <GraduationCap className="mr-1 h-3 w-3" /> Rekan Guru
                        </p>
                        <h3 className="text-xl font-bold text-blue-700">{Number(detailData.hasil.nilai_rekan).toFixed(2)}</h3>
                        <p className="text-xs font-medium text-muted-foreground">{detailData.evaluator_counts.rekan} evaluator</p>
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex flex-col items-center justify-center">
                        <p className="mb-1 flex items-center text-xs font-medium text-amber-600">
                            <Award className="mr-1 h-3 w-3" /> Pengawas
                        </p>
                        <h3 className="text-xl font-bold text-amber-700">{Number(detailData.hasil.nilai_pengawas).toFixed(2)}</h3>
                        <p className="text-xs font-medium text-muted-foreground">{detailData.evaluator_counts.pengawas} evaluator</p>
                    </div>
                </Card>
            </div>

            <Tabs defaultValue="kriteria" className="mt-4">
                <TabsList className="mb-3 grid grid-cols-2">
                    <TabsTrigger value="kriteria" className="text-xs">Detail Kriteria</TabsTrigger>
                    <TabsTrigger value="komentar" className="text-xs">Komentar</TabsTrigger>
                </TabsList>

                <TabsContent value="kriteria" className="p-0">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Detail Penilaian Per Kriteria</CardTitle>
                            <CardDescription className="text-xs">Rincian nilai berdasarkan masing-masing kriteria evaluasi</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {detailData.detail_kriteria && detailData.detail_kriteria.length > 0 ? (
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                            <tr className="border-b-2">
                                                <th className="py-2 px-2 text-left font-medium bg-white">Kriteria</th>
                                                <th className="py-2 px-2 text-center font-medium bg-white">Bobot</th>
                                                <th className="py-2 px-2 text-center font-medium bg-white">Siswa</th>
                                                <th className="py-2 px-2 text-center font-medium bg-white">Rekan</th>
                                                <th className="py-2 px-2 text-center font-medium bg-white">Pengawas</th>
                                                <th className="py-2 px-2 text-right font-medium bg-white">Nilai Akhir</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailData.detail_kriteria.map((kriteria, index) => {
                                                const kategoriNilai = getNilaiCategory(kriteria.nilai_rata_akhir || 0);
                                                const hasSubKriteria = kriteria.sub_kriteria && kriteria.sub_kriteria.length > 0;

                                                return (
                                                    <React.Fragment key={`kriteria-${kriteria.kriteria_id}-${index}`}>
                                                        <tr className={`border-b hover:bg-gray-50 ${hasSubKriteria ? 'bg-blue-50/30' : ''}`}>
                                                            <td className="py-2 px-2">
                                                                <div className="font-semibold text-gray-900">{kriteria.kriteria_nama}</div>
                                                            </td>
                                                            <td className="py-2 px-2 text-center font-semibold">{Number(kriteria.kriteria_bobot).toFixed(1)}%</td>
                                                            <td className="py-2 px-2 text-center font-semibold">{Number(kriteria.nilai_rata_siswa || 0).toFixed(1)}</td>
                                                            <td className="py-2 px-2 text-center font-semibold">{Number(kriteria.nilai_rata_rekan || 0).toFixed(1)}</td>
                                                            <td className="py-2 px-2 text-center font-semibold">{Number(kriteria.nilai_pengawas || 0).toFixed(1)}</td>
                                                            <td className="py-2 px-2 text-right">
                                                                <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${kategoriNilai.bgColor} ${kategoriNilai.textColor}`}>
                                                                    {Number(kriteria.nilai_rata_akhir || 0).toFixed(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        
                                                        {hasSubKriteria && kriteria.sub_kriteria!.map((subKriteria, subIndex) => {
                                                            const subKategoriNilai = getNilaiCategory(subKriteria.nilai_rata_akhir || 0);
                                                            
                                                            return (
                                                                <tr key={`sub-${subKriteria.sub_kriteria_id}-${subIndex}`} className="border-b hover:bg-gray-50 bg-gray-50/50">
                                                                    <td className="py-2 px-2 pl-8">
                                                                        <div className="flex items-start">
                                                                            <span className="mr-2 text-gray-400">└─</span>
                                                                            <span className="text-gray-700">{subKriteria.sub_kriteria_nama}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-2 px-2 text-center text-gray-600">{Number(subKriteria.sub_kriteria_bobot).toFixed(1)}%</td>
                                                                    <td className="py-2 px-2 text-center text-gray-700">{Number(subKriteria.nilai_rata_siswa || 0).toFixed(1)}</td>
                                                                    <td className="py-2 px-2 text-center text-gray-700">{Number(subKriteria.nilai_rata_rekan || 0).toFixed(1)}</td>
                                                                    <td className="py-2 px-2 text-center text-gray-700">{Number(subKriteria.nilai_pengawas || 0).toFixed(1)}</td>
                                                                    <td className="py-2 px-2 text-right">
                                                                        <span className={`rounded px-1.5 py-0.5 text-xs ${subKategoriNilai.bgColor} ${subKategoriNilai.textColor}`}>
                                                                            {Number(subKriteria.nilai_rata_akhir || 0).toFixed(1)}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-sm text-gray-500">
                                    Tidak ada data kriteria tersedia
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="komentar" className="p-0">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Komentar Evaluasi</CardTitle>
                            <CardDescription className="text-xs">Komentar dan masukan dari evaluator</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="max-h-60 space-y-3 overflow-y-auto">
                                <div>
                                    <h4 className="mb-2 flex items-center text-sm font-medium">
                                        <Users className="mr-1 h-3 w-3 text-indigo-600" />
                                        Komentar Siswa
                                    </h4>
                                    {detailData.komentar.siswa.length > 0 ? (
                                        <div className="space-y-1">
                                            {detailData.komentar.siswa.slice(0, 3).map((komentar, i) => (
                                                <div key={i} className="rounded-md bg-indigo-50 p-2 text-xs">
                                                    "{komentar}"
                                                </div>
                                            ))}
                                            {detailData.komentar.siswa.length > 3 && (
                                                <p className="text-xs text-muted-foreground">+{detailData.komentar.siswa.length - 3} komentar lainnya</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Tidak ada komentar dari siswa.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="mb-2 flex items-center text-sm font-medium">
                                        <GraduationCap className="mr-1 h-3 w-3 text-blue-600" />
                                        Komentar Rekan Guru
                                    </h4>
                                    {detailData.komentar.rekan.length > 0 ? (
                                        <div className="space-y-1">
                                            {detailData.komentar.rekan.slice(0, 3).map((komentar, i) => (
                                                <div key={i} className="rounded-md bg-blue-50 p-2 text-xs">
                                                    "{komentar}"
                                                </div>
                                            ))}
                                            {detailData.komentar.rekan.length > 3 && (
                                                <p className="text-xs text-muted-foreground">+{detailData.komentar.rekan.length - 3} komentar lainnya</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Tidak ada komentar dari rekan guru.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="mb-2 flex items-center text-sm font-medium">
                                        <Award className="mr-1 h-3 w-3 text-amber-600" />
                                        Komentar Pengawas
                                    </h4>
                                    {detailData.komentar.pengawas.length > 0 ? (
                                        <div className="space-y-1">
                                            {detailData.komentar.pengawas.slice(0, 3).map((komentar, i) => (
                                                <div key={i} className="rounded-md bg-amber-50 p-2 text-xs">
                                                    "{komentar}"
                                                </div>
                                            ))}
                                            {detailData.komentar.pengawas.length > 3 && (
                                                <p className="text-xs text-muted-foreground">+{detailData.komentar.pengawas.length - 3} komentar lainnya</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Tidak ada komentar dari pengawas.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}