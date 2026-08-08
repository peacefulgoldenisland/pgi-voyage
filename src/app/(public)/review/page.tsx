'use client';

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BRAND_NAME } from "@/lib/constants";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Star, Loader2, CheckCircle2, MessageSquareQuote, ArrowRight, Ship, ChevronDown, ChevronUp, Filter, MessageSquare, ExternalLink, X, MapPin } from "lucide-react";
import WriteReviewForm from "@/components/public/WriteReviewForm";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const TripAdvisorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.957 9.878A12.022 12.022 0 0012 0 12.022 12.022 0 00.043 9.878a11.967 11.967 0 002.392 7.747 11.986 11.986 0 006.592 4.095V24h5.946v-2.28a11.986 11.986 0 006.592-4.095 11.967 11.967 0 002.392-7.747zM6.924 16.51A4.587 4.587 0 1111.511 11.92 4.587 4.587 0 016.924 16.51zm10.152 0a4.587 4.587 0 114.587-4.587 4.587 4.587 0 01-4.587 4.587zM6.924 9.174a2.752 2.752 0 102.752 2.752 2.752 2.752 0 00-2.752-2.752zm10.152 0a2.752 2.752 0 102.752 2.752 2.752 2.752 0 00-2.752-2.752z"/>
  </svg>
);

function AdminReply({ replyText }: { replyText: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mt-4 bg-[#fdfaf5] border border-[#B88E52]/20 rounded-xl relative overflow-hidden transition-all duration-300 shadow-sm">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B88E52]"></div>
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between p-3 sm:p-4 focus:outline-none group">
        <div className="flex items-center gap-2 pl-2">
          <Ship className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#B88E52]" />
          <span className="font-bold text-[#0f172a] text-[10px] md:text-xs uppercase tracking-widest">{BRAND_NAME} Replied</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 group-hover:text-[#B88E52] transition-colors">
          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">{isExpanded ? 'Hide' : 'Read'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 pl-8 md:pl-10">
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium italic">"{replyText}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [selectedOrigin, setSelectedOrigin] = useState<string>("All");
  const [selectedSource, setSelectedSource] = useState<'all' | 'direct' | 'tripadvisor'>('all');
  
  // STATE UNTUK POP-UP MODAL & PORTAL MOUNTING
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const reviewData: any[] = [];
        querySnapshot.forEach((doc) => { reviewData.push({ id: doc.id, ...doc.data() }); });
        setReviews(reviewData);
      } catch (error) { 
        console.error("Error fetching reviews:", error); 
      } finally { 
        setIsLoadingReviews(false); 
      }
    };
    fetchReviews();
  }, []);

  const uniqueOrigins = useMemo(() => {
    const origins = reviews.map(r => r.origin?.trim() || "Unknown").filter(Boolean);
    return ["All", ...Array.from(new Set(origins)).sort()];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (selectedOrigin !== "All") result = result.filter(r => (r.origin?.trim() || "Unknown") === selectedOrigin);
    if (selectedSource !== "all") {
      // Pastikan property 'source' ada. Jika undefined, kita anggap 'direct'
      result = result.filter(r => (r.source || 'direct') === selectedSource);
    }
    return result;
  }, [reviews, selectedOrigin, selectedSource]);

  const handleOptimisticSubmit = (newReview: any) => {
    // Review baru masuk otomatis ke 'direct' dan 'pending', jadi tidak dirender ke public sampai di-approve admin.
    // Kode ini dipertahankan dari original jika kamu punya logic optimistik khusus.
    // Tapi secara realita, karena query `where('status', '==', 'approved')`, dia nggak akan nampil sebelum di-approve.
  };

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] min-h-screen relative overflow-x-hidden font-body">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-32 md:pt-40 md:pb-48 lg:pt-48 lg:pb-56 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-[#0f172a]/80 to-[#0f172a]/50"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#B88E52]/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative z-10 max-w-4xl mx-auto text-center mt-6 md:mt-0">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-1.5 md:gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 border border-white/10 text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 backdrop-blur-md shadow-sm">
            <MessageSquareQuote className="h-3.5 w-3.5 md:h-4 md:w-4" /> Guestbook
          </motion.div>
          <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.15] px-2 drop-shadow-sm">
            Voices of Our <br className="hidden sm:block" /><span className="italic font-serif text-[#B88E52]">Explorers</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light px-4 md:px-0 mb-8 md:mb-12">
            Read authentic experiences from travelers who joined {BRAND_NAME} and explored unforgettable liveaboard adventures.
          </motion.p>
          <motion.button 
            variants={fadeInUp} 
            onClick={() => setIsModalOpen(true)} 
            className="inline-flex items-center justify-center gap-2 md:gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#B88E52] to-[#a37c46] hover:from-[#a37c46] hover:to-[#8c693b] text-white font-bold uppercase tracking-widest text-xs md:text-sm transition-all shadow-[0_0_20px_rgba(184,142,82,0.3)] transform hover:-translate-y-1"
          >
            Share Your Experience <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* 2. REVIEWS WALL */}
      <section className="px-5 md:px-6 lg:px-12 mt-[-60px] md:mt-[-100px] relative z-20 pb-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR / FILTERS */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6 shrink-0">
            
            {/* Desktop Filters Wrapper */}
            <div className="hidden lg:flex flex-col gap-6 sticky top-32 z-10">
              
              {/* Source Filter (Desktop) */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-white">
                <h3 className="font-heading font-bold text-[#0f172a] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#B88E52] fill-[#B88E52]/20" /> Platform
                </h3>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSelectedSource('all')} className={`px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all text-left border ${selectedSource === 'all' ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}>All Reviews</button>
                  <button onClick={() => setSelectedSource('tripadvisor')} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${selectedSource === 'tripadvisor' ? 'bg-[#34e0a1]/10 text-[#00a680] border-[#34e0a1]/30' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}>
                      <TripAdvisorIcon className="w-4 h-4"/> TripAdvisor
                  </button>
                  <button onClick={() => setSelectedSource('direct')} className={`px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all text-left border ${selectedSource === 'direct' ? 'bg-[#fdfaf5] text-[#B88E52] border-[#B88E52]/20' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}>Direct Web</button>
                </div>
              </div>

              {/* Origin Filter (Desktop) */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-white">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                  <MapPin className="w-4 h-4 text-[#B88E52]" />
                  <h3 className="font-heading font-bold text-[#0f172a] text-xs uppercase tracking-widest">Traveler Origin</h3>
                </div>
                <div className="flex flex-col gap-1 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                  {uniqueOrigins.map((origin, idx) => (
                    <button key={idx} onClick={() => setSelectedOrigin(origin)} className={`text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-between border ${selectedOrigin === origin ? 'bg-[#fdfaf5] text-[#B88E52] border-[#B88E52]/20 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0f172a] border-transparent'}`}>
                      {origin} {selectedOrigin === origin && <CheckCircle2 className="w-4 h-4 text-[#B88E52]" />}
                    </button>
                  ))}
                </div>
              </div>
              
            </div>

            {/* Mobile Filters Horizontal Scroll */}
            <div className="lg:hidden sticky top-[72px] md:top-[88px] z-40 bg-[#f8f9fa]/95 backdrop-blur-md pt-3 pb-4 -mx-5 px-5 border-b border-gray-200/50 shadow-sm flex flex-col gap-3">
               
               {/* Mobile Source Filter */}
               <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x pb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0 ml-1 mr-1">Platform:</span>
                  <button onClick={() => setSelectedSource('all')} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap snap-center border transition-colors ${selectedSource === 'all' ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-gray-500 border-gray-200'}`}>All</button>
                  <button onClick={() => setSelectedSource('tripadvisor')} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap snap-center border transition-colors flex items-center gap-1.5 ${selectedSource === 'tripadvisor' ? 'bg-[#eafaf4] text-[#00a680] border-[#34e0a1]/50' : 'bg-white text-gray-500 border-gray-200'}`}><TripAdvisorIcon className="w-3 h-3"/> TripAdvisor</button>
                  <button onClick={() => setSelectedSource('direct')} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap snap-center border transition-colors ${selectedSource === 'direct' ? 'bg-[#fdfaf5] text-[#B88E52] border-[#B88E52]/50' : 'bg-white text-gray-500 border-gray-200'}`}>Direct Web</button>
               </div>
               
               {/* Mobile Origin Filter */}
               <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x pb-1">
                 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm shrink-0 ml-1"><MapPin className="w-3.5 h-3.5 text-[#B88E52]" /></div>
                 {uniqueOrigins.map((origin, idx) => (
                   <button key={idx} onClick={() => setSelectedOrigin(origin)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap snap-center transition-colors border shadow-sm ${selectedOrigin === origin ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-gray-500 border-gray-200 hover:text-[#B88E52]'}`}>{origin}</button>
                 ))}
               </div>

            </div>
          </div>

          {/* MAIN FEED */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6 md:gap-8">
            {isLoadingReviews ? (
              <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-white p-8">
                <Loader2 className="w-10 h-10 text-[#B88E52] animate-spin mb-4" />
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Memuat Cerita Tamu...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-white p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gray-200 mb-6" />
                <h2 className="font-heading text-2xl font-bold text-[#0f172a] mb-2">Belum ada ulasan</h2>
                <p className="text-gray-500 text-sm mb-8">Tidak ada ulasan yang sesuai dengan filter yang Anda pilih.</p>
                <button onClick={() => { setSelectedOrigin("All"); setSelectedSource("all"); }} className="px-8 py-3.5 rounded-full bg-gray-100 text-[#0f172a] font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">Reset Filter</button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredReviews.map((review, idx) => (
                  <motion.div key={review.id || idx} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} 
                    className="bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-white hover:border-[#B88E52]/20 transition-all duration-300 flex flex-col sm:flex-row gap-5 sm:gap-8 relative overflow-hidden group"
                  >
                    
                    {/* Bumper Atas Kanan untuk TripAdvisor */}
                    {review.source === 'tripadvisor' && (
                      <div className="absolute top-0 right-0 bg-[#34e0a1] text-[#000000] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-bl-2xl flex items-center gap-1.5 shadow-sm">
                        <TripAdvisorIcon className="w-4 h-4"/> TripAdvisor
                      </div>
                    )}

                    {/* Avatar Profil */}
                    <div className="shrink-0 pt-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#fdfaf5] to-white border border-[#B88E52]/20 text-[#B88E52] flex items-center justify-center font-heading font-bold text-2xl sm:text-3xl shadow-sm">
                        {review.name?.charAt(0).toUpperCase() || "G"}
                      </div>
                    </div>

                    {/* Konten Review */}
                    <div className="flex-1 min-w-0 pt-2 md:pt-1">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                        <div>
                          <h4 className="font-bold text-[#0f172a] text-lg md:text-xl leading-tight mb-1">{review.name}</h4>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[11px] text-gray-500 font-semibold">{review.origin}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-0.5 shrink-0 mt-2 sm:mt-0 bg-[#fdfaf5] px-3 py-1.5 rounded-full border border-[#B88E52]/10 w-fit">
                          {[...Array(review.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#B88E52] text-[#B88E52]" />)}
                        </div>
                      </div>

                      <p className="text-gray-700 text-base md:text-lg leading-relaxed font-light whitespace-pre-wrap mb-6">
                        "{review.review || review.text}"
                      </p>

                      {review.image && (
                        <div className="w-full rounded-[1.5rem] overflow-hidden mt-2 mb-6 shadow-md border border-gray-100 relative group-hover:shadow-lg transition-all duration-300">
                          <img src={review.image} alt="Guest Moment" className="w-full max-h-[400px] object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                      )}

                      {review.source === 'tripadvisor' && review.url && (
                        <a href={review.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-[#34e0a1]/10 text-[#00a680] text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#34e0a1]/20 transition-colors">
                          Lihat ulasan asli <ExternalLink className="w-3.5 h-3.5"/>
                        </a>
                      )}

                      {review.reply && <AdminReply replyText={review.reply} />}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* 3. DEDICATED WRITE REVIEW MODAL (POP UP) MENGGUNAKAN REACT PORTAL */}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[99999] bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                onClick={(e) => e.stopPropagation()} 
                className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 md:p-12 shadow-2xl relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20"
              >
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-5 right-5 md:top-8 md:right-8 p-2.5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-all z-20"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                
                <WriteReviewForm 
                  onSuccessSubmit={handleOptimisticSubmit} 
                  onClose={() => setIsModalOpen(false)} 
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </main>
  );
}