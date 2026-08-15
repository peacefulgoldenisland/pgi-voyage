'use client';

import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BRAND_NAME, CONTACT } from "@/lib/constants";
import { ArrowRight, Compass, ShieldCheck, Ship, Users, Star, Quote, Anchor, HeartHandshake, MapPin, CheckCircle2, Loader2, MessageSquare, ChevronLeft, X } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";

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

const offerings = [
  {
    category: "Sailing Experiences",
    items: [
      "Exclusive Shared Expeditions",
      "Private Luxury Yacht Charters",
      "Standard to Premium Packages",
      "Bespoke Liveaboard Journeys",
      "Whale Shark Encounters",
      "Guided Marine Safaris"
    ]
  },
  {
    category: "Top Destinations",
    items: [
      "Padar Island Panorama",
      "Komodo Dragon Habitat",
      "The Majestic Pink Beach",
      "Manta Point Encounters",
      "Taka Makassar Sandbar",
      "Kelor & Kanawa Islands"
    ]
  }
];

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    title: "Trusted Expertise",
    desc: "Partnering strictly with verified, experienced maritime crews and meticulously maintained vessels for absolute safety."
  },
  {
    icon: <Ship className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    title: "Curated Fleet",
    desc: "From comfortable standard boats to opulent luxury liveaboards, we match your unique travel style and budget."
  },
  {
    icon: <Compass className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    title: "Transparent Journeys",
    desc: "Clear itineraries, honest pricing, and accurate facility details. We guarantee an experience without hidden surprises."
  },
  {
    icon: <HeartHandshake className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    title: "Exceptional Hospitality",
    desc: "Our dedicated team ensures a seamless, warm, and highly personalized experience from your first inquiry to disembarkation."
  }
];

export default function AboutUsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  const reviewSliderRef = useRef<HTMLDivElement>(null);

  // Format WA link menggunakan data dari constants
  const waNumber = CONTACT.PHONE_1.replace(/\D/g, '');
  const encodedBrand = encodeURIComponent(BRAND_NAME);
  const b2cWaLink = `https://wa.me/${waNumber}?text=Hi%20${encodedBrand},%20I%20am%20interested%20in%20booking%20an%20unforgettable%20luxury%20sailing%20adventure!`;

  // Fetch data dari Firestore untuk Testimonial (Review)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const querySnapshot = await getDocs(q);
        const reviewData: any[] = [];
        querySnapshot.forEach((doc) => {
          reviewData.push({ id: doc.id, ...doc.data() });
        });
        
        setReviews(reviewData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  // Fungsi geser slider review untuk tombol panah desktop
  const slideReviews = (direction: 'left' | 'right') => {
    if (reviewSliderRef.current) {
      const { scrollLeft, clientWidth } = reviewSliderRef.current;
      const offset = direction === 'left' ? -(clientWidth * 0.8) : (clientWidth * 0.8);
      reviewSliderRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] overflow-x-hidden font-body">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-32 md:pt-40 md:pb-48 lg:pt-48 lg:pb-56 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-[#0f172a]/60 to-transparent"></div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto text-center mt-6 md:mt-12"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white/10 border border-[#B88E52]/60 text-[#B88E52] text-[10px] md:text-xs font-bold mb-4 md:mb-6 backdrop-blur-md shadow-lg uppercase tracking-widest">
            <Anchor className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Our Story
          </motion.div>
          <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-md leading-[1.15] tracking-tight px-2">
            Redefining <br className="hidden sm:block" /> <span className="italic font-serif text-[#B88E52]">Ocean Adventures</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed px-4 md:px-0 font-light">
            Welcome to {BRAND_NAME}, a trusted maritime platform dedicated to orchestrating unforgettable luxury liveaboard experiences across the majestic Indonesian archipelago.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. WHO WE ARE SECTION (OVERLAP) */}
      <section className="px-5 md:px-6 lg:px-12 mt-[-60px] md:mt-[-100px] relative z-20 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 lg:p-16 shadow-2xl shadow-[#0f172a]/5 border border-gray-100 flex flex-col lg:flex-row gap-8 lg:gap-16 items-start lg:items-center"
          >
            {/* KIRI: Judul, Paragraf, dan Gambar Mobile */}
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2 flex flex-col">
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6 leading-tight">Our Mission & <br className="hidden lg:block"/> Identity</h2>
              <div className="w-16 md:w-20 h-1 md:h-1.5 bg-gradient-to-r from-[#B88E52] to-[#a37c46] mb-6 md:mb-8 rounded-full"></div>
              
              {/* GAMBAR KAPAL KHUSUS MOBILE (Muncul setelah Judul) */}
              <div className="w-full relative mb-8 lg:hidden">
                <div className="aspect-[4/5] sm:aspect-square rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-inner bg-gray-100">
                  <img 
                    src="https://res.cloudinary.com/danyx7uny/image/upload/v1781582217/obuwude82h22wr1wvscz.png" 
                    alt={`KM Pulau Mas 88 - ${BRAND_NAME} Flagship Vessel`} 
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                  />
                </div>
                {/* Decorative Element Mobile/Tablet */}
                <div className="absolute -bottom-5 -left-5 bg-[#0f172a] text-white p-5 rounded-[1.5rem] shadow-xl hidden sm:block border border-[#1e293b]">
                  <Compass className="w-8 h-8 text-[#B88E52] mb-2" />
                  <p className="font-heading font-bold text-base leading-tight">Explore with<br/>Elegance</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                We are driven by a profound passion for the sea, tropical islands, and the art of crafting meaningful travel narratives. Our singular mission is to help global explorers discover the raw, untamed beauty of Indonesia's iconic islands through exclusive sailing journeys that prioritize ultimate safety, personalized service, and profound joy.
              </p>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                Whether you are embarking on a solo quest, celebrating with a partner, or creating memories with family and friends, we curate the perfect equilibrium of adrenaline-fueled adventure and serene comfort, tailored specifically for you.
              </p>
            </motion.div>
            
            {/* KANAN: Gambar Kapal Khusus Desktop */}
            <motion.div variants={fadeInUp} className="hidden lg:block w-full lg:w-1/2 relative mt-6 lg:mt-0">
              <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-inner bg-gray-100">
                <img 
                  src="https://res.cloudinary.com/danyx7uny/image/upload/v1781582217/obuwude82h22wr1wvscz.png" 
                  alt={`KM Pulau Mas 88 - ${BRAND_NAME} Flagship Vessel`} 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
              </div>
              {/* Decorative Element Desktop */}
              <div className="absolute -bottom-8 -left-8 bg-[#0f172a] text-white p-8 rounded-[2rem] shadow-xl border border-[#1e293b]">
                <Compass className="w-12 h-12 text-[#B88E52] mb-3" />
                <p className="font-heading font-bold text-xl leading-tight">Explore with<br/>Elegance</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. WHY TRAVEL WITH US SECTION (HORIZONTAL SCROLL ON MOBILE) */}
      <section className="py-16 md:py-24 px-5 md:px-6 lg:px-12 bg-white border-t border-gray-100 relative overflow-hidden">
        {/* Background Blur */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#B88E52]/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 block">Why Choose Us</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6">The {BRAND_NAME} Standard</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-lg leading-relaxed px-4 md:px-0">We elevate industry standards by merging meticulous planning with a deep respect for maritime safety.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 md:gap-8 pb-6 lg:pb-0 snap-x no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0"
          >
            {features.map((feat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-[#fdfaf5] border border-[#B88E52]/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300 shadow-sm min-w-[280px] w-[85vw] lg:w-auto snap-center shrink-0"
              >
                <div className="h-12 w-12 md:h-16 md:w-16 bg-white rounded-xl md:rounded-2xl shadow-sm border border-[#B88E52]/10 flex items-center justify-center mb-5 md:mb-6 shrink-0">
                  {feat.icon}
                </div>
                <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mb-3 md:mb-4 leading-snug">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs md:text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. WHAT WE OFFER (INCLUSIONS/CATEGORIES) */}
      <section className="py-16 md:py-24 px-5 md:px-6 lg:px-12 bg-[#0f172a] text-white border-y border-white/5 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24"
          >
            {offerings.map((offer, index) => (
              <motion.div key={index} variants={fadeInUp} className="space-y-6 md:space-y-8 bg-white/5 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white flex items-center gap-3 md:gap-4">
                  {index === 0 ? <Ship className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" /> : <MapPin className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />}
                  {offer.category}
                </h2>
                <ul className="space-y-3 md:space-y-4">
                  {offer.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 md:gap-4 text-gray-300 text-sm md:text-lg">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#B88E52]/20 border border-[#B88E52]/50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#B88E52]" />
                      </div>
                      <span className="font-medium tracking-wide">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-[#f8f9fa] border-b border-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
            <div>
              <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 block">Social Proof</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6">Voices of Our Explorers</h2>
              <p className="text-gray-600 max-w-2xl text-base md:text-lg">Read authentic experiences from travelers who joined our Komodo sailing trips and explored unforgettable liveaboard adventures.</p>
            </div>
            
            {/* Tombol Panah (Hanya untuk Desktop) */}
            <div className="hidden md:flex gap-4 shrink-0">
              <button 
                onClick={() => slideReviews('left')}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#B88E52]/30 flex items-center justify-center text-[#B88E52] hover:bg-[#B88E52] hover:text-white transition-all focus:outline-none shadow-sm"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={() => slideReviews('right')}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#B88E52]/30 flex items-center justify-center text-[#B88E52] hover:bg-[#B88E52] hover:text-white transition-all focus:outline-none shadow-sm"
                aria-label="Next testimonials"
              >
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {isLoadingReviews ? (
            <div className="flex flex-col items-center justify-center h-[350px] bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
              <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-sm md:text-base">Loading Traveler Stories...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 text-sm">Be the first to share your sailing experience with us.</p>
            </div>
          ) : (
            <div className="relative -mx-5 px-5 sm:mx-0 sm:px-0">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f8f9fa] to-transparent z-10 md:hidden pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10 md:hidden pointer-events-none"></div>
              
              <div 
                ref={reviewSliderRef}
                className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-8 pt-4"
              >
                {reviews.map((testi, idx) => (
                  <div 
                    key={testi.id || idx} 
                    onClick={() => setSelectedReview(testi)}
                    className="min-w-[280px] w-[85vw] sm:min-w-[340px] md:min-w-[400px] max-w-[420px] h-[480px] md:h-[520px] bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 relative overflow-hidden flex flex-col snap-center shrink-0 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group"
                  >
                    <Quote className="absolute top-6 right-6 md:top-8 md:right-8 w-16 h-16 md:w-20 md:h-20 text-[#B88E52]/10 rotate-180 pointer-events-none" />
                    
                    <div className="flex gap-1 text-[#B88E52] mb-4 md:mb-6 relative z-10">
                      {[...Array(testi.rating || 5)].map((_, i) => <Star key={i} className={`w-4 h-4 md:w-5 md:h-5 ${i < (testi.rating || 5) ? 'fill-[#B88E52] text-[#B88E52]' : 'fill-transparent text-gray-300'}`} />)}
                    </div>
                    
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed relative z-10 italic font-light line-clamp-4">
                      "{testi.review || testi.text}"
                    </p>
                    <span className="text-[#B88E52] text-xs md:text-sm font-bold mt-2 mb-4 block group-hover:underline uppercase tracking-widest">Read full story...</span>

                    <div className="mt-auto flex flex-col gap-3 md:gap-4 relative z-10">
                      {testi.image && (
                        <div className="w-full h-24 md:h-32 rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
                          <img src={testi.image} alt="Guest Moment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 md:gap-4 pt-3 md:pt-4 border-t border-gray-50">
                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-[#fdfaf5] border border-[#B88E52]/20 shadow-sm flex items-center justify-center text-lg md:text-xl font-bold text-[#B88E52]">
                          {testi.name?.charAt(0).toUpperCase() || "G"}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#0f172a] text-sm md:text-base leading-tight">{testi.name || 'Guest'}</h4>
                          <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold">{testi.origin || testi.country || 'Global Traveler'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FULLSCREEN REVIEW MODAL */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[1.5rem] md:rounded-[2rem] w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedReview(null)} 
                className="absolute top-3 right-3 md:top-4 md:right-4 z-30 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-gray-100 text-[#0f172a] transition-colors shadow-sm border border-gray-200"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Kiri: Foto Momen */}
              {selectedReview.image && (
                <div className="w-full h-64 sm:h-72 md:h-auto md:w-2/5 shrink-0 bg-[#f8f9fa] relative flex items-center justify-center overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 scale-110" 
                    style={{ backgroundImage: `url(${selectedReview.image})` }}
                  ></div>
                  <img 
                    src={selectedReview.image} 
                    alt="Guest Moment" 
                    className="w-full h-full object-contain relative z-10 p-4 drop-shadow-xl pointer-events-none" 
                  />
                </div>
              )}

              {/* Kanan: Teks Ulasan & Balasan Admin */}
              <div className={`p-5 sm:p-6 md:p-10 flex flex-col overflow-y-auto no-scrollbar ${selectedReview.image ? 'md:w-3/5' : 'w-full'}`}>
                
                <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6 mt-2 md:mt-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#fdfaf5] border border-[#B88E52]/30 shadow-sm flex items-center justify-center text-xl md:text-2xl font-bold text-[#B88E52]">
                    {selectedReview.name?.charAt(0).toUpperCase() || "G"}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0f172a] text-base md:text-lg leading-tight">{selectedReview.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5 md:mt-1">
                      <span>{selectedReview.origin || selectedReview.country}</span>
                    </div>
                    <div className="flex gap-1 mt-1 md:mt-1.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 md:w-4 md:h-4 ${i < (selectedReview.rating || 5) ? 'fill-[#B88E52] text-[#B88E52]' : 'fill-transparent text-gray-300'}`} />)}
                    </div>
                  </div>
                </div>
                
                <div className="relative mb-6 md:mb-8">
                  <Quote className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-8 h-8 md:w-10 md:h-10 text-[#B88E52]/10 rotate-180 pointer-events-none" />
                  <p className="text-[#0f172a] opacity-80 text-sm sm:text-base md:text-lg leading-relaxed italic font-light relative z-10 whitespace-pre-wrap">
                    "{selectedReview.review || selectedReview.text}"
                  </p>
                </div>

                {selectedReview.reply && (
                  <div className="mt-auto bg-[#f8f9fa] border border-gray-200 p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl relative shadow-inner">
                    <div className="absolute -left-px top-4 md:top-6 bottom-4 md:bottom-6 w-1 bg-[#B88E52] rounded-r-full"></div>
                    <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-3">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#0f172a] flex items-center justify-center shadow-sm shrink-0">
                         <Ship className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#B88E52]" />
                      </div>
                      <div>
                         <span className="block font-bold text-[#0f172a] text-xs md:text-sm tracking-wide">{BRAND_NAME} Team</span>
                         <span className="block text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest">Official Reply</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap pl-9 md:pl-11">
                      {selectedReview.reply}
                    </p>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
} 