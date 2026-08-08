'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Database,
  ArrowRight,
  MapPin,
  Star
} from 'lucide-react';

// Icon TripAdvisor
const TripAdvisorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.957 9.878A12.022 12.022 0 0012 0 12.022 12.022 0 00.043 9.878a11.967 11.967 0 002.392 7.747 11.986 11.986 0 006.592 4.095V24h5.946v-2.28a11.986 11.986 0 006.592-4.095 11.967 11.967 0 002.392-7.747zM6.924 16.51A4.587 4.587 0 1111.511 11.92 4.587 4.587 0 016.924 16.51zm10.152 0a4.587 4.587 0 114.587-4.587 4.587 4.587 0 01-4.587 4.587zM6.924 9.174a2.752 2.752 0 102.752 2.752 2.752 2.752 0 00-2.752-2.752zm10.152 0a2.752 2.752 0 102.752 2.752 2.752 2.752 0 00-2.752-2.752z"/>
  </svg>
);

// DATA DUMMY: Simulasi response dari API TripAdvisor
const DUMMY_TRIPADVISOR_REVIEWS = [
  {
    name: "Sarah Jenkins",
    origin: "Sydney, Australia",
    rating: 5,
    text: "PMM Voyage exceeded all my expectations! The Komodo trip was flawlessly executed. The crew was incredibly attentive, the food was 5-star quality, and the dive guides knew exactly where to find the mantas. A trip of a lifetime!",
    url: "https://www.tripadvisor.com"
  },
  {
    name: "Michael R.",
    origin: "Berlin, Germany",
    rating: 5,
    text: "Das beste Liveaboard-Erlebnis! The boat is beautiful and very well maintained. My cabin was comfortable with great AC. The sunset view from the upper deck while sipping cocktails is something I will never forget. Highly recommended.",
    url: "https://www.tripadvisor.com"
  },
  {
    name: "Lisa Wong",
    origin: "Singapore",
    rating: 4,
    text: "Very solid experience overall. The itinerary was packed with amazing spots. Snorkeling at Pink Beach was a highlight. Taking off one star only because the wifi was a bit spotty, but then again, it's nice to disconnect!",
    url: "https://www.tripadvisor.com"
  }
];

export default function TripAdvisorSyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncedCount, setSyncedCount] = useState(0);
  const [syncedData, setSyncedData] = useState<any[]>([]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncedData([]);
    
    try {
      // 1. SIMULASI DELAY NETWORK (Seolah-olah sedang fetching API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. PROSES MEMASUKKAN DATA KE FIRESTORE
      const newReviews = [];
      for (const review of DUMMY_TRIPADVISOR_REVIEWS) {
        const payload = {
          ...review,
          source: 'tripadvisor', // Flag khusus
          status: 'pending',     // Wajib pending agar dimoderasi dulu
          createdAt: serverTimestamp(),
        };
        
        await addDoc(collection(db, 'reviews'), payload);
        newReviews.push(payload);
      }

      // 3. UPDATE STATE UI
      setSyncedCount(newReviews.length);
      setSyncedData(newReviews);
      setSyncStatus('success');

    } catch (error) {
      console.error("Error syncing with TripAdvisor:", error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-[#00a680]/10 to-transparent p-8 rounded-[2.5rem] border border-[#00a680]/20 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-[#00a680]/5 rotate-12 pointer-events-none">
           <TripAdvisorIcon className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#34e0a1]/20 text-[#00a680] rounded-lg text-xs font-bold uppercase tracking-widest mb-3 border border-[#34e0a1]/30">
            <Database className="w-3.5 h-3.5" /> Integration Hub
          </div>
          <h1 className="text-3xl font-bold text-[#11223a] flex items-center gap-3">
            TripAdvisor Sync
          </h1>
          <p className="text-gray-500 mt-2 font-medium max-w-xl">
            Tarik ulasan terbaru secara otomatis dari halaman TripAdvisor PMM Voyage ke dalam database lokal Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ACTION PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
              <TripAdvisorIcon className="w-10 h-10 text-[#00a680]" />
            </div>
            <h3 className="font-bold text-[#11223a] text-lg mb-2">Tarik Ulasan</h3>
            <p className="text-gray-500 text-sm mb-6">
              Sistem akan mencari ulasan terbaru yang belum ada di database, lalu menyimpannya dengan status <span className="font-bold text-amber-600">Pending</span>.
            </p>
            
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#00a680] hover:bg-[#008060] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-[#00a680]/30 hover:-translate-y-0.5"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sedang Menarik Data...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" /> Sinkronisasi Sekarang
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Info Sistem
            </h4>
            <p className="text-blue-600 text-xs leading-relaxed">
              Saat ini sistem menggunakan <strong>Data Dummy</strong> (simulasi) karena API Key pihak ketiga belum dikonfigurasi. Setiap klik akan memasukkan 3 ulasan simulasi ke dalam sistem.
            </p>
          </div>
        </div>

        {/* RESULT / LOG PANEL */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-[#11223a] text-lg">Log Sinkronisasi</h3>
              {syncStatus === 'success' && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {syncedCount} Data Ditarik
                </span>
              )}
            </div>

            <div className="h-full">
              {syncStatus === 'idle' && !isSyncing && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Database className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Klik tombol sinkronisasi untuk memulai</p>
                </div>
              )}

              {isSyncing && (
                <div className="flex flex-col items-center justify-center h-64 text-[#00a680]">
                  <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                  <p className="text-sm font-bold animate-pulse">Menghubungkan ke server TripAdvisor...</p>
                </div>
              )}

              {syncStatus === 'error' && (
                <div className="flex flex-col items-center justify-center h-64 text-red-500">
                  <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-bold">Gagal menarik data. Silakan coba lagi.</p>
                </div>
              )}

              <AnimatePresence>
                {syncStatus === 'success' && !isSyncing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-start gap-3 border border-emerald-100 mb-6">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-700">Sinkronisasi Berhasil!</p>
                        <p className="text-emerald-600/80 mt-1">Ulasan telah masuk ke antrean dengan status "Pending". Silakan cek halaman <a href="/admin/reviews" className="underline font-bold hover:text-emerald-800">Guest Reviews</a> untuk melakukan moderasi (Approve/Reject).</p>
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-3">Preview Data Terkini:</h4>
                    
                    <div className="grid gap-3">
                      {syncedData.map((data, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex gap-4"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-full bg-[#00a680]/10 flex items-center justify-center">
                            <TripAdvisorIcon className="w-5 h-5 text-[#00a680]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-bold text-[#11223a] text-sm truncate">{data.name}</h5>
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md flex items-center gap-1"><MapPin className="w-3 h-3"/> {data.origin}</span>
                            </div>
                            <div className="flex gap-0.5 mb-2">
                              {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < data.rating ? 'fill-[#B88E52] text-[#B88E52]' : 'fill-transparent text-gray-300'}`} />)}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 italic">"{data.text}"</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                       <a href="/admin/reviews" className="inline-flex items-center gap-2 text-sm font-bold text-[#B88E52] hover:text-[#8c693b] transition-colors">
                         Pergi ke Halaman Moderasi <ArrowRight className="w-4 h-4" />
                       </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}