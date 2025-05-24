import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { AlertCircle, AtSign, UserCheck } from 'lucide-react';

export default function InactiveAccount() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Head title="Akun Tidak Aktif" />
      
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 rounded-full bg-orange-100 p-3 w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Akun Tidak Aktif</CardTitle>
          <CardDescription className="text-gray-700 mt-2">
            Maaf, akun Anda saat ini tidak aktif.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800">
              Akun Anda telah dinonaktifkan oleh administrator sistem. 
              Silakan hubungi administrator untuk mengaktifkan kembali akun Anda.
            </p>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Hubungi Administrator</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Silakan hubungi administrator sistem untuk mendapatkan informasi lebih lanjut atau mengajukan aktivasi akun.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <AtSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email Dukungan</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <a href="mailto:admin@sekolah.ac.id" className="text-blue-600 hover:underline">
                    admin@sekolah.ac.id
                  </a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button 
            variant="default"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = '/login'}
          >
            Kembali ke Halaman Login
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Sistem Evaluasi Guru &copy; 2025
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}