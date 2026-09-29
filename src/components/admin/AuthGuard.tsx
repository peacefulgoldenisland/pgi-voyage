'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Contoh: ['superadmin', 'editor']
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Menghindari masalah hydration saat merender UI yang berbeda antara server dan client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Jalankan logika redirect HANYA JIKA:
    // 1. Pengecekan auth selesai (!loading)
    // 2. Kita berada di sisi client (isClient)
    if (!loading && isClient) {
      if (!user) {
        // Jika middleware kebobolan (cookie ada tapi auth null), hapus cookie agar tidak infinite loop
        console.log("AuthGuard: User tidak ada, hapus cookie & redirect ke login");
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push('/admin/login');
      } else if (!allowedRoles.includes(user.role)) {
        // Jika user login tapi rolenya tidak diizinkan
        console.log(`AuthGuard: Role ${user.role} tidak diizinkan untuk rute ini. Redirect ke dashboard.`);
        
        // Mencegah infinite loop jika dashboard sendiri diblokir
        if (pathname !== '/admin/dashboard') {
           router.push('/admin/dashboard'); 
        } else {
            // Kalau dia masuk ke dashboard tapi gak punya role juga? 
            // Kita redirect ke halaman depan atau login agar layar tidak blank/hitam.
            console.error("User masuk dashboard tapi tidak punya akses sama sekali.");
            router.push('/'); // redirect ke landing page atau /admin/login
        }
      }
    }
  }, [user, loading, allowedRoles, router, isClient, pathname]);

  // Saat masih loading (menunggu balasan dari Firebase), tampilkan spinner
  // Ini penting untuk mencegah 'kedip' (flicker) halaman admin sebelum di-redirect
  if (loading || !isClient) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Memeriksa Akses...</p>
        </div>
      </div>
    );
  }

  // Jika user belum login, jangan render apa-apa, biarkan useEffect yang redirect
  if (!user) return null;

  // Jika role tidak sesuai, jangan render apa-apa, biarkan useEffect yang redirect
  if (!allowedRoles.includes(user.role)) return null;

  // Jika semua pengecekan lulus, persilakan masuk!
  return <>{children}</>;
} 