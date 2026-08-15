'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  FileText, 
  Image as ImageIcon, 
  ArrowRight, 
  Activity, 
  PlusCircle,
  Ship,
  Clock,
  ShieldCheck,
  TrendingUp,
  Globe,
  Loader2,
  MessageSquareQuote,
  Star,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import Link from 'next/link';

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 } 
  }
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    blogs: 0,
    gallery: 0,
    reviewsTotal: 0,
    reviewsPending: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Live Clock effect
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data Stats (Parallel Query for Performance)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchDashboardStats = async () => {
          setIsLoading(true);
          try {
            const [blogSnap, gallerySnap, reviewSnap, pendingReviewSnap] = await Promise.all([
              getCountFromServer(collection(db, 'blogs')),
              getCountFromServer(collection(db, 'galleries')),
              getCountFromServer(collection(db, 'reviews')),
              getCountFromServer(query(collection(db, 'reviews'), where('status', '==', 'pending')))
            ]);

            setStats({
              blogs: blogSnap.data().count,
              gallery: gallerySnap.data().count,
              reviewsTotal: reviewSnap.data().count,
              reviewsPending: pendingReviewSnap.data().count
            });
          } catch (error) {
            console.error("Error fetching stats:", error);
          } finally {
            setIsLoading(false);
          }
        };

        fetchDashboardStats();
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8 max-w-[1400px] mx-auto pb-20"
    >
      {/* 1. Header Section */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/50 p-6 rounded-[2rem] backdrop-blur-xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-[#11223a] tracking-tight">Command Center</h1>
            <span className="bg-[#B88E52]/10 text-[#B88E52] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-[#B88E52]/20">
              Admin
            </span>
          </div>
          <p className="text-gray-500 font-medium text-lg">Manage your digital presence and incoming voyages.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {currentTime && (
            <div className="text-sm font-bold text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
          <div className="flex items-center gap-3 text-sm font-bold text-[#11223a] bg-white px-5 py-2.5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            System Online & Secure
          </div>
        </div>
      </motion.div>

      {/* 2. Key Metrics (Bento Stats) */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Metric 1: Reviews (Priority) */}
        <Link href="/admin/reviews" className="block">
          <motion.div variants={fadeInUp} className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer relative overflow-hidden group h-full flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-50 group-hover:bg-amber-100 transition-colors duration-500 pointer-events-none"></div>
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                <MessageSquareQuote className="w-7 h-7 text-white" />
              </div>
              {stats.reviewsPending > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {stats.reviewsPending} Pending
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Moderated
                </div> 
              )}
            </div>
            
            <div className="relative z-10">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Guest Reviews</p>
              <div className="flex items-end gap-4 justify-between">
                <h3 className="text-5xl font-black text-[#11223a] leading-none">
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-[#B88E52]" /> : stats.reviewsTotal}
                </h3>
                <span className="text-gray-400 font-medium pb-1 flex items-center gap-1 group-hover:text-[#B88E52] transition-colors duration-300">
                  Moderate <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Metric 2: Blog */}
        <Link href="/admin/blog" className="block">
          <motion.div variants={fadeInUp} className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer relative overflow-hidden group h-full flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-500 pointer-events-none"></div>
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <TrendingUp className="w-3.5 h-3.5" />
                Active SEO
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Published Articles</p>
              <div className="flex items-end gap-4 justify-between">
                <h3 className="text-5xl font-black text-[#11223a] leading-none">
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-[#B88E52]" /> : stats.blogs}
                </h3>
                <span className="text-gray-400 font-medium pb-1 flex items-center gap-1 group-hover:text-[#B88E52] transition-colors duration-300">
                  Manage <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Metric 3: Gallery */}
        <Link href="/admin/gallery" className="block">
          <motion.div variants={fadeInUp} className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer relative overflow-hidden group h-full flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:bg-emerald-100 transition-colors duration-500 pointer-events-none"></div>
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                <ImageIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <TrendingUp className="w-3.5 h-3.5" />
                Growing
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Gallery Assets</p>
              <div className="flex items-end gap-4 justify-between">
                <h3 className="text-5xl font-black text-[#11223a] leading-none">
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-[#B88E52]" /> : stats.gallery}
                </h3>
                <span className="text-gray-400 font-medium pb-1 flex items-center gap-1 group-hover:text-[#B88E52] transition-colors duration-300">
                  Manage <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </motion.div>
        </Link>

      </motion.div>

      {/* 3. Main Dashboard Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KIRI: Banner & Quick Actions */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-8">
          
          {/* Live Web Manager Banner (PREMIUM CARD) */}
          <div className="relative bg-gradient-to-br from-[#0c1828] to-[#11223a] p-10 rounded-[2.5rem] border border-[#1a3356] shadow-2xl text-white overflow-hidden group">
            {/* Glowing Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#B88E52] rounded-full mix-blend-screen filter blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>
            
            <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform duration-1000">
              <Ship className="w-64 h-64 text-[#B88E52]" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-inner">
                <Globe className="w-4 h-4 text-[#B88E52]" /> B2C Portal Active
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight">PMM Voyage Live Manager</h2>
              <p className="text-gray-300 text-base mb-8 max-w-lg leading-relaxed font-medium">
                Sistem terpusat untuk mengelola konten <span className="text-[#B88E52] font-bold">pulaumasmulia.com</span>. Pastikan Anda selalu mengecek ulasan terbaru untuk membangun kredibilitas perusahaan.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="/" target="_blank" className="bg-[#B88E52] hover:bg-[#a07b46] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-[#B88E52]/20 flex items-center gap-2 hover:-translate-y-0.5">
                  <Globe className="w-5 h-5" /> Kunjungi Website
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold text-[#11223a] mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#B88E52]" /> Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link href="/admin/reviews" className="group flex items-start gap-5 p-5 rounded-3xl border border-gray-100 hover:border-[#B88E52]/30 hover:bg-gradient-to-br from-white to-[#fdfaf5] transition-all duration-300 hover:shadow-md cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-amber-50/80 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-[#B88E52] group-hover:text-white transition-colors duration-300 shadow-sm relative">
                  <Star className="w-6 h-6" />
                  {stats.reviewsPending > 0 && (
                     <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#11223a] text-lg group-hover:text-[#B88E52] transition-colors">Moderasi Review</h4>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed font-medium">Setujui ulasan masuk dan berikan balasan resmi.</p>
                </div>
              </Link>

              <Link href="/admin/blog/create" className="group flex items-start gap-5 p-5 rounded-3xl border border-gray-100 hover:border-[#B88E52]/30 hover:bg-gradient-to-br from-white to-[#fdfaf5] transition-all duration-300 hover:shadow-md cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-[#B88E52] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#11223a] text-lg group-hover:text-[#B88E52] transition-colors">Tulis Artikel Baru</h4>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed font-medium">Publikasikan jurnal perjalanan untuk optimasi SEO.</p>
                </div>
              </Link>
              
              <Link href="/admin/gallery/create" className="group flex items-start gap-5 p-5 rounded-3xl border border-gray-100 hover:border-[#B88E52]/30 hover:bg-gradient-to-br from-white to-[#fdfaf5] transition-all duration-300 hover:shadow-md cursor-pointer sm:col-span-2 md:col-span-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-[#B88E52] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#11223a] text-lg group-hover:text-[#B88E52] transition-colors">Upload Galeri</h4>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed font-medium">Tambahkan foto/reel ekspedisi ke portofolio utama.</p>
                </div>
              </Link>
            </div>
          </div>

        </motion.div>

        {/* KANAN: System Logs & Status */}
        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#11223a] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> System Logs
            </h2>
          </div>
          
          <div className="space-y-6 flex-grow">
            {/* Log Item 1 */}
            <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <p className="text-sm font-bold text-[#11223a]">Admin Authenticated</p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Just now
              </p>
            </div>

            {/* Log Item 2 */}
            <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-sm font-bold text-[#11223a]">Database Connected</p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Secure connection to Firestore
              </p>
            </div>
            
            {/* Log Item 3 */}
            <div className="relative pl-6 border-l-2 border-transparent pb-2">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              </div>
              <p className="text-sm font-bold text-[#11223a]">Cloudinary Ready</p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Media server is on standby
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Architecture</p>
              <p className="text-sm font-bold text-[#11223a]">Decoupled B2C Engine (Phase 1)</p>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}