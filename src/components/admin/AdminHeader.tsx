'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Menu, Search, Bell } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

interface AdminHeaderProps {
  setIsMobileOpen: (isOpen: boolean) => void;
}

export default function AdminHeader({ setIsMobileOpen }: AdminHeaderProps) {
  const pathname = usePathname();
  
  // State User
  const [adminEmail, setAdminEmail] = useState('Administrator');
  const [adminInitial, setAdminInitial] = useState('A');
  
  // State untuk visibilitas Header via Scroll
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();

  // 1. CEK HALAMAN SAAT INI
  const isEditorPage = 
    pathname.includes('/admin/blog/create') || 
    pathname.includes('/admin/blog/edit/') ||
    pathname.includes('/admin/gallery/create') ||
    pathname.includes('/admin/gallery/edit/');

  // Logika Smart Scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isEditorPage) return;
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest > previous && latest > 100) {
      setIsHidden(true);
    } else if (latest < previous) {
      setIsHidden(false);
    }
  });

  // Fetch Data User dari Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const namePart = user.email.split('@')[0];
        setAdminEmail(namePart);
        setAdminInitial(namePart.charAt(0).toUpperCase());
      }
    });
    return () => unsubscribe();
  }, []);

  if (isEditorPage) {
    return null;
  }

  return (
    <motion.header 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: '-100%', opacity: 0 }
      }}
      animate={isHidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-20 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative group">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-[#B88E52] transition-colors" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#B88E52]/10 focus:border-[#B88E52] focus:bg-white w-64 md:w-80 transition-all text-[#11223a] placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="p-2.5 text-gray-400 hover:text-[#11223a] hover:bg-gray-50 rounded-full transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="w-px h-8 bg-gray-200"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-[#11223a] leading-none mb-1 capitalize group-hover:text-[#B88E52] transition-colors">{adminEmail}</p>
            <p className="text-[10px] text-[#B88E52] uppercase tracking-wider font-extrabold">Super Access</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#11223a] text-white flex items-center justify-center font-bold border-2 border-white shadow-md group-hover:scale-105 transition-transform">
            {adminInitial}
          </div>
        </div>
      </div>
    </motion.header>
  );
} 