'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <-- Solusi Portal
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BRAND_NAME, CONTACT } from '@/lib/constants';
import { motion, Variants, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Camera, 
  Play, 
  X, 
  MapPin, 
  Compass, 
  Ship,
  Waves,
  Mountain,
  Calendar,
  Loader2,
  Images
} from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

// --- DEFAULT FALLBACK MEDIA & ASSETS ---
const imgPadar = "https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=1973&auto=format&fit=crop";
const imgWhaleShark = "https://images.unsplash.com/photo-1580580297368-c782fb65d271?q=80&w=1974&auto=format&fit=crop";
const imgPinkBeach = "https://images.unsplash.com/photo-1724127722795-96efb9caffbc?q=80&w=1929&auto=format&fit=crop";

// --- CATEGORY DATA (Editorial View) ---
const categories = [
  { id: 'all', label: 'All Destinations', icon: Compass, subtitle: '', desc: '' },
  { id: 'vessel', label: 'Flagship Vessel', icon: Ship, subtitle: 'The Floating Sanctuary', desc: 'Engineered for adventure, designed for comfort. Explore the elegant exterior and luxurious interior of our trusted sailing companion.' },
  { id: 'kenawa', label: 'Kenawa Island', icon: Mountain, subtitle: 'The Hidden Savannah', desc: 'A breathtaking hike leading to a panoramic view of golden grasslands and a tropical sunset.' },
  { id: 'whaleshark', label: 'Whale Sharks', icon: Waves, subtitle: 'Gentle Giants', desc: 'An unforgettable underwater experience swimming alongside the majestic and peaceful whale sharks in Saleh Bay.' },
  { id: 'komodo', label: 'Komodo Island', icon: MapPin, subtitle: 'The Jurassic Realm', desc: 'Step into the wild and encounter the legendary Komodo dragons in their natural, protected habitat.' },
  { id: 'pinkbeach', label: 'Pink Beach', icon: MapPin, subtitle: 'Pristine Shores', desc: 'Relax on striking pink sands and snorkel in the crystal-clear turquoise waters teeming with marine life.' },
  { id: 'padar', label: 'Padar Island', icon: Mountain, subtitle: 'The Iconic Viewpoint', desc: 'A breathtaking hike leading to a panoramic view of three uniquely colored bays. The crown jewel of the archipelago.' },
  { id: 'majarite', label: 'Majarite & Kelor', icon: Waves, subtitle: 'Snorkeling Paradise', desc: 'Explore colorful coral reefs, vibrant marine life, and relax on untouched white sandy beaches.' },
];

type MediaType = 'image' | 'reel';

interface MediaItem {
  id: string;
  categoryId: string;
  tripId?: string;
  tripName?: string;
  type: MediaType;
  src: string;
  title: string;
  location: string;
  createdAt?: any;
}

// Helper untuk menghasilkan pola grid yang dinamis (Bento Grid Style)
const getGridSpanClass = (index: number) => {
  const patternIndex = index % 7;
  switch (patternIndex) {
    case 0: return "col-span-2 row-span-2"; // Item besar
    case 3: return "col-span-1 md:col-span-2 row-span-1"; // Item melebar
    case 6: return "col-span-1 row-span-2"; // Item meninggi
    default: return "col-span-1 row-span-1";              // Item standar
  }
};

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [isMounted, setIsMounted] = useState(false); // State untuk React Portal
  
  // States for fetching data from Firestore
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk 3 gambar hero dinamis (diisi fallback default dulu)
  const [heroImages, setHeroImages] = useState<string[]>([imgWhaleShark, imgPadar, imgPinkBeach]);

  // WA Formatting
  const waNumber = CONTACT.PHONE_1.replace(/\D/g, '');
  const encodedBrand = encodeURIComponent(BRAND_NAME);
  const b2cWaLink = `https://wa.me/${waNumber}?text=Hi%20${encodedBrand},%20I%20saw%20your%20stunning%20gallery%20and%20wish%20to%20reserve%20an%20exclusive%20voyage!`;

  // Mencegah background scroll saat modal terbuka & set Mounted untuk Portal
  useEffect(() => {
    setIsMounted(true);
    if (lightboxItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxItem]);

  // Ambil data galeri dari Firestore "galleries"
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, 'galleries'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const data: MediaItem[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as MediaItem);
        });
        
        setMediaList(data);

        // Ambil 3 gambar random khusus untuk Hero Section
        const imagesOnly = data.filter(m => m.type === 'image' && m.src);
        if (imagesOnly.length >= 3) {
          const shuffled = [...imagesOnly].sort(() => 0.5 - Math.random());
          setHeroImages([shuffled[0].src, shuffled[1].src, shuffled[2].src]);
        }

      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Filter media based on active tab
  const filteredMedia = activeTab === 'all' 
    ? mediaList 
    : mediaList.filter(m => m.categoryId === activeTab);

  const reels = filteredMedia.filter(m => m.type === 'reel');
  const editorialCategories = categories.filter(c => c.id !== 'all');

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] min-h-screen overflow-x-hidden select-none font-body">
      
      {/* 1. HERO SECTION (EXHIBITION STYLE) */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-32 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex items-center min-h-[70vh] lg:min-h-[85vh]">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#B88E52]/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-8">
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-1/2 text-center lg:text-left pt-6 lg:pt-0"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#B88E52] text-[10px] md:text-xs font-bold mb-4 md:mb-6 backdrop-blur-md uppercase tracking-widest shadow-sm">
              <Images className="h-3.5 w-3.5" />
              Visual Exhibition
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.15]">
              Moments Captured, <br className="hidden sm:block" />
              <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#B88E52] to-[#eaddbd]">
                Timeless Memories
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light mb-8 md:mb-10 px-4 lg:px-0">
              A curated visual journey through the untamed beauty of the Indonesian archipelago. Explore the pristine waters, majestic wildlife, and unforgettable luxury voyages.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex lg:hidden justify-center gap-3 mb-8 w-full max-w-md mx-auto px-4">
               <div className="w-1/3 aspect-[3/4] rounded-2xl overflow-hidden mt-4 shadow-lg border border-white/10">
                 <img src={heroImages[0]} className="w-full h-full object-cover" alt="Gallery preview 1" />
               </div>
               <div className="w-1/3 aspect-[3/4] rounded-2xl overflow-hidden -mt-4 shadow-xl border border-white/10 relative z-10">
                 <img src={heroImages[1]} className="w-full h-full object-cover" alt="Gallery preview 2" />
               </div>
               <div className="w-1/3 aspect-[3/4] rounded-2xl overflow-hidden mt-8 shadow-lg border border-white/10">
                 <img src={heroImages[2]} className="w-full h-full object-cover" alt="Gallery preview 3" />
               </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 px-5 lg:px-0 w-full">
               <button 
                  onClick={() => window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
                  className="px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-[#B88E52] to-[#a37c46] hover:from-[#a37c46] hover:to-[#8c693b] text-white font-bold text-sm md:text-base uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(184,142,82,0.3)] hover:-translate-y-1 w-full sm:w-auto"
               >
                 Explore Collection
               </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full lg:w-1/2 relative h-[600px] hidden lg:block pointer-events-none"
          >
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [-6, -6, -6] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-[10%] right-[20%] w-72 lg:w-80 h-96 bg-white/5 border border-white/10 p-2 pb-10 rounded-2xl shadow-2xl z-10 backdrop-blur-sm"
            >
              <img src={heroImages[1]} className="w-full h-full object-cover rounded-xl" alt="Gallery preview desktop 1" draggable={false} />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0], rotate: [8, 8, 8] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-[20%] left-[10%] w-64 lg:w-72 h-80 bg-white/5 border border-white/10 p-2 pb-10 rounded-2xl shadow-2xl z-20 backdrop-blur-sm"
            >
              <img src={heroImages[0]} className="w-full h-full object-cover rounded-xl" alt="Gallery preview desktop 2" draggable={false} />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [-2, -2, -2] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[5%] lg:right-[30%] w-80 lg:w-96 h-80 bg-white/5 border border-white/10 p-2 pb-10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-30 backdrop-blur-sm"
            >
              <img src={heroImages[2]} className="w-full h-full object-cover rounded-xl" alt="Gallery preview desktop 3" draggable={false} />
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 2. CATEGORY TABS (FILTER) */}
      <section className="sticky top-[72px] md:top-[88px] z-40 bg-[#f8f9fa]/90 backdrop-blur-md border-b border-gray-200 py-3 md:py-4 px-0 sm:px-6 lg:px-12 shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-2 md:gap-3 pb-2 pt-1 snap-x px-5 sm:px-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id);
                  window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 md:gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full whitespace-nowrap transition-all duration-300 snap-center font-medium uppercase tracking-widest text-[10px] md:text-xs shadow-sm ${
                  isActive 
                    ? 'bg-[#0f172a] text-white transform md:scale-105' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B88E52] hover:text-[#B88E52]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isActive ? 'text-[#B88E52]' : ''}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="w-full flex flex-col min-h-[50vh]">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32">
             <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#B88E52] animate-spin mb-4" />
             <p className="text-gray-500 font-medium text-sm md:text-base">Curating Visual Masterpieces...</p>
          </div>
        ) : (
          <>
            {/* 3. REELS / STORY HIGHLIGHTS */}
            {reels.length > 0 && (
              <section className="max-w-7xl mx-auto w-full px-0 sm:px-6 lg:px-12 pt-12 md:pt-16 pb-6 md:pb-8 relative">
                <div className="px-5 sm:px-0 mb-6 md:mb-8">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] flex items-center gap-2 md:gap-3">
                    Cinematic Stories
                    <span className="bg-[#B88E52] text-white text-[9px] md:text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse shadow-md">Hot</span>
                  </h2>
                  <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">Immersive vertical moments from our recent voyages.</p>
                </div>
                
                <div className="relative">
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10 sm:hidden pointer-events-none"></div>
                  
                  <div className="flex overflow-x-auto no-scrollbar gap-4 md:gap-6 pb-6 snap-x scroll-smooth px-5 sm:px-0">
                    <AnimatePresence>
                      {reels.map((reel) => (
                        <motion.div
                          key={reel.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4 }}
                          onClick={() => setLightboxItem(reel)}
                          className="relative shrink-0 w-52 sm:w-60 md:w-64 h-[340px] sm:h-[400px] md:h-[420px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer group snap-center shadow-lg bg-gray-200"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <video 
                            src={reel.src} 
                            className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105 pointer-events-none" 
                            muted 
                            loop 
                            playsInline 
                            autoPlay 
                            onContextMenu={(e) => e.preventDefault()}
                            controlsList="nodownload"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/10 to-transparent opacity-80 md:group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                          
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white md:transform md:group-hover:scale-110 transition-transform shadow-xl">
                              <Play className="w-5 h-5 md:w-6 md:h-6 ml-1 fill-white" />
                            </div>
                          </div>
                          
                          <div className="absolute bottom-5 left-5 right-5 md:bottom-6 md:left-6 md:right-6 pointer-events-none">
                            <h3 className="font-heading text-white font-bold text-base md:text-lg leading-tight mb-1.5 line-clamp-2">{reel.title}</h3>
                            <p className="text-[#B88E52] text-[10px] md:text-xs font-semibold flex items-center gap-1 uppercase tracking-widest">
                              <MapPin className="w-3 h-3" /> {reel.location}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </section>
            )}

            {/* 4. MAIN CONTENT AREA */}
            
            {/* SCENARIO A: 'ALL' TAB */}
            {activeTab === 'all' && (
              <div className="w-full flex flex-col">
                {editorialCategories
                  .filter((cat) => mediaList.some((m) => m.categoryId === cat.id))
                  .map((cat, index) => {
                    const catMedia = mediaList.filter(m => m.categoryId === cat.id).slice(0, 4); 
                    const isEven = index % 2 === 0;
                    const sectionBg = isEven ? 'bg-white' : 'bg-[#f8f9fa] border-y border-gray-100';

                    return (
                      <motion.section 
                        key={cat.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className={`w-full py-16 md:py-24 px-5 md:px-6 lg:px-12 transition-colors duration-500 ${sectionBg}`}
                      >
                        <div className={`max-w-7xl mx-auto flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-12 lg:gap-16`}>
                          
                          <div className="w-full lg:w-1/3">
                            <motion.div variants={fadeInUp} className="lg:sticky lg:top-40">
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#fdfaf5] border border-[#B88E52]/20 flex items-center justify-center mb-4 md:mb-6 shadow-sm">
                                <cat.icon className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />
                              </div>
                              <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-1.5 md:mb-2 block">
                                {cat.subtitle}
                              </span>
                              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f172a] mb-3 md:mb-5">
                                {cat.label}
                              </h2>
                              <p className="text-gray-600 text-sm md:text-base lg:text-lg leading-relaxed mb-4 md:mb-8 pr-4 md:pr-0 font-light">
                                {cat.desc}
                              </p>
                              
                              <button 
                                onClick={() => {
                                  setActiveTab(cat.id);
                                  window.scrollTo({ top: window.innerHeight * 0.5, behavior: 'smooth' });
                                }}
                                className="hidden lg:inline-flex group items-center gap-2 text-[#0f172a] font-bold border-b-2 border-[#0f172a] pb-1 hover:text-[#B88E52] hover:border-[#B88E52] transition-colors text-sm md:text-xs uppercase tracking-widest"
                              >
                                View Collection <ArrowRight className="w-4 h-4 transform md:group-hover:translate-x-1 transition-transform" />
                              </button>
                            </motion.div>
                          </div>

                          <div className="w-full lg:w-2/3 flex flex-col">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 auto-rows-[120px] sm:auto-rows-[160px] md:auto-rows-[200px] grid-flow-dense">
                              {catMedia.map((mediaItem, imgIdx) => {
                                const spanClass = getGridSpanClass(imgIdx);

                                return (
                                  <motion.div
                                    key={mediaItem.id}
                                    variants={fadeInUp}
                                    onClick={() => setLightboxItem(mediaItem)}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={`relative overflow-hidden rounded-[1rem] md:rounded-[1.5rem] lg:rounded-3xl group cursor-pointer bg-gray-200 shadow-md hover:shadow-xl transition-all ${spanClass}`}
                                  >
                                    {mediaItem.type === 'reel' ? (
                                      <video
                                        src={mediaItem.src}
                                        className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105 pointer-events-none"
                                        muted
                                        autoPlay
                                        loop
                                        playsInline
                                        onContextMenu={(e) => e.preventDefault()}
                                      />
                                    ) : (
                                      <img
                                        src={mediaItem.src}
                                        alt={mediaItem.title}
                                        draggable={false}
                                        onContextMenu={(e) => e.preventDefault()}
                                        className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105 pointer-events-none"
                                        loading="lazy"
                                      />
                                    )}
                                    
                                    <div className="absolute inset-0 bg-[#0f172a]/20 md:bg-[#0f172a]/40 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                    
                                    {mediaItem.type === 'reel' ? (
                                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md p-1.5 rounded-full shadow-sm pointer-events-none">
                                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                                      </div>
                                    ) : (
                                      <div className="md:hidden absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm pointer-events-none">
                                        <Images className="w-3.5 h-3.5 text-[#0f172a]" />
                                      </div>
                                    )}

                                    <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-4 text-center pointer-events-none">
                                      <span className="bg-white/95 backdrop-blur-sm text-[#0f172a] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2">
                                        {mediaItem.type === 'reel' ? 'Play Video' : 'Expand Image'}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                            
                            <motion.div variants={fadeInUp} className="lg:hidden w-full flex justify-start mt-6">
                              <button 
                                onClick={() => {
                                  setActiveTab(cat.id);
                                  window.scrollTo({ top: window.innerHeight * 0.5, behavior: 'smooth' });
                                }}
                                className="group inline-flex items-center gap-2 text-[#0f172a] font-bold border-b-2 border-[#0f172a] pb-1 hover:text-[#B88E52] hover:border-[#B88E52] transition-colors text-xs uppercase tracking-widest"
                              >
                                View Collection <ArrowRight className="w-4 h-4 transform transition-transform" />
                              </button>
                            </motion.div>

                          </div>

                        </div>
                      </motion.section>
                    );
                })}
              </div>
            )}

            {/* SCENARIO B: SPECIFIC CATEGORY TAB */}
            {activeTab !== 'all' && filteredMedia.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto w-full px-5 md:px-6 lg:px-12 py-10 md:py-16 space-y-8 md:space-y-12"
              >
                <div className="mb-6 md:mb-8 border-b border-gray-200 pb-6 md:pb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a]">
                    {categories.find(c => c.id === activeTab)?.label} Gallery
                  </h2>
                  <p className="text-gray-500 mt-2 text-sm md:text-lg font-light">Browse all captured moments for this destination.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 auto-rows-[140px] sm:auto-rows-[180px] md:auto-rows-[250px] grid-flow-dense">
                  {filteredMedia.map((mediaItem, index) => {
                    const spanClass = getGridSpanClass(index);

                    return (
                      <motion.div
                        key={mediaItem.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setLightboxItem(mediaItem)}
                        onContextMenu={(e) => e.preventDefault()}
                        className={`break-inside-avoid relative rounded-[1rem] md:rounded-[1.5rem] overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all bg-gray-200 ${spanClass}`}
                      >
                        {mediaItem.type === 'reel' ? (
                          <video
                            src={mediaItem.src}
                            className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105 pointer-events-none"
                            muted
                            autoPlay
                            loop
                            playsInline
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        ) : (
                          <img 
                            src={mediaItem.src} 
                            alt={mediaItem.title} 
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                            className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105 pointer-events-none"
                            loading="lazy"
                          />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/20 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 md:p-5 lg:p-6 pointer-events-none">
                          <div className="transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="font-heading text-white font-bold text-sm md:text-base lg:text-lg mb-1 line-clamp-1 flex items-center gap-2">
                              {mediaItem.type === 'reel' && <Play className="w-4 h-4 shrink-0 fill-white" />}
                              {mediaItem.title}
                            </h3>
                            <div className="flex flex-col gap-1">
                              <p className="text-[#B88E52] text-[10px] md:text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> {mediaItem.location}
                              </p>
                              {mediaItem.tripName && (
                                <p className="text-gray-300 text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 line-clamp-1 mt-1">
                                  <Calendar className="w-3 h-3 shrink-0" /> {mediaItem.tripName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {filteredMedia.length === 0 && (
              <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-24 md:py-32 text-center">
                <Camera className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-heading text-xl md:text-2xl font-bold text-[#0f172a]">Moments are being prepared...</h3>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Our crew is currently capturing amazing moments for this destination.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* INSTAGRAM / CINEMATIC CTA */}
      <section className="relative py-24 md:py-32 px-5 md:px-6 flex flex-col items-center justify-center overflow-hidden pointer-events-none border-t border-gray-100">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-105" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?q=80&w=1920&auto=format&fit=crop')` }}
        ></div>
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"></div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-10 max-w-4xl mx-auto text-center bg-white/5 backdrop-blur-md border border-white/20 p-8 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[3rem] shadow-2xl pointer-events-auto"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-[#B88E52] to-[#a37c46] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg">
            <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">Be Part of the Story</h2>
          <p className="text-white/80 mb-8 md:mb-10 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed font-light px-2 md:px-0">
            These pictures could be you. Join our next departure and experience the authentic luxury of Komodo. Your masterpiece awaits.
          </p>
          <a 
            id="btn-wa-booking"
            href={b2cWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 md:gap-3 px-8 py-4 rounded-full bg-white hover:bg-gray-100 text-[#0f172a] font-bold text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl md:hover:-translate-y-1 w-full sm:w-auto"
          >
            Reserve Your Voyage <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        </motion.div>
      </section>

      {/* 5. FULLSCREEN LIGHTBOX MODAL - DIPINDAHKAN KE PORTAL */}
      {isMounted && createPortal(
        <AnimatePresence>
          {lightboxItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-[#0f172a]/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 md:p-8"
              onClick={() => setLightboxItem(null)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <button 
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
                onClick={() => setLightboxItem(null)}
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`relative w-full h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] flex flex-col items-center justify-center ${lightboxItem.type === 'reel' ? 'max-w-md' : 'max-w-5xl'}`}
                onClick={(e) => e.stopPropagation()} 
              >
                {lightboxItem.type === 'reel' ? (
                   <div className="relative w-full sm:w-[90%] md:w-full h-full sm:h-auto aspect-[9/16] bg-black sm:rounded-[2rem] overflow-hidden shadow-2xl sm:ring-1 sm:ring-white/20">
                     <video 
                       src={lightboxItem.src} 
                       className="w-full h-full object-cover" 
                       controls 
                       autoPlay 
                       playsInline 
                       controlsList="nodownload"
                       onContextMenu={(e) => e.preventDefault()}
                     />
                     <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0f172a]/80 to-transparent pointer-events-none"></div>
                   </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                    <img 
                      src={lightboxItem.src} 
                      alt={lightboxItem.title} 
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                    />
                    <div className="mt-4 md:mt-6 text-center bg-[#0f172a]/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-4 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto absolute bottom-4 sm:relative">
                      <h3 className="font-heading text-white text-lg md:text-2xl font-bold leading-tight">{lightboxItem.title}</h3>
                      <p className="text-[#B88E52] mt-1 md:mt-2 flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-xs font-semibold uppercase tracking-widest">
                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4"/> {lightboxItem.location}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body // <-- Inject Langsung ke body HTML (Portal)
      )}

    </main>
  );  
}