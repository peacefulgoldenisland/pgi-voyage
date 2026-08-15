'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
// Import Provider dan Guard yang baru dibuat
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/admin/AuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // State navigasi & layout sidebar
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // PENTING: Set default ke TRUE (Sidebar ciut) agar tidak lompat saat pertama load
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); 

  // JIKA BERADA DI HALAMAN LOGIN, JANGAN TAMPILKAN LAYOUT DAN JANGAN DI-GUARD
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      {/* Bungkus seluruh struktur admin dengan AuthGuard.
        Di sini kita set bahwa HANYA 'superadmin' dan 'admin' yang boleh masuk
        ke kerangka dasar Admin Dashboard ini.
      */}
      <AuthGuard allowedRoles={['superadmin', 'admin']}>
        <div className="min-h-screen bg-[#f8f9fa] flex">
          
          {/* SIDEBAR COMPONENT */}
          <AdminSidebar 
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />

          {/* MAIN CONTENT AREA */}
          <div 
            className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
            }`}
          >
            {/* SMART HEADER COMPONENT */}
            <AdminHeader setIsMobileOpen={setIsMobileOpen} />

            {/* PAGE CONTENT */}
            <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full mx-auto overflow-x-hidden relative">
              {children}
            </main>
          </div>
          
        </div>
      </AuthGuard>
    </AuthProvider>
  );
} 