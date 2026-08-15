'use client';

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BRAND_NAME, CONTACT } from "@/lib/constants";
import {
  ArrowRight,
  Compass,
  Gift,
  Handshake,
  Ship,
  Star,
  Anchor,
  Users,
  CheckCircle2,
  ImageIcon,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  Quote,
  ChevronLeft,
  X
} from "lucide-react";
import { motion, Variants, AnimatePresence, useScroll, useTransform } from "framer-motion";

// --- ANIMATION CONFIGURATIONS ---
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
const defaultGallery = [
  { id: 'f-g1', src: "https://images.unsplash.com/photo-1717238977683-5f06a9e60694?q=80&w=870&auto=format&fit=crop", title: "Komodo Archipelago" },
  { id: 'f-g2', src: "https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=1973&auto=format&fit=crop", title: "Padar Lookout" },
  { id: 'f-g3', src: "https://images.unsplash.com/photo-1724127722795-96efb9caffbc?q=80&w=929&auto=format&fit=crop", title: "Pink Beach" },
];

const defaultBlogs = [
  {
    id: "f-b1",
    slug: "guide-exploring-komodo",
    category: "Travel Guide",
    coverImage: "https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=1973&auto=format&fit=crop",
    title: "The Ultimate Guide to Exploring Komodo in 2026",
    excerpt: "Everything you need to know before setting sail. From encountering prehistoric dragons to hiking Padar Island.",
    formattedDate: "June 10, 2026",
    readTime: "5 min read"
  },
  {
    id: "f-b2",
    slug: "close-encounter-komodo-dragons",
    category: "Wildlife",
    coverImage: "https://images.unsplash.com/photo-1717238977683-5f06a9e60694?q=80&w=870&auto=format&fit=crop",
    title: "A Close Encounter with the Komodo Dragons",
    excerpt: "Discover the thrill of walking among the world's largest living lizards in their natural, protected habitat.",
    formattedDate: "May 28, 2026",
    readTime: "4 min read"
  },
  {
    id: "f-b3",
    slug: "why-liveaboard-is-best-way",
    category: "Lifestyle",
    coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
    title: "Why Liveaboard is the Best Way to Travel",
    excerpt: "Forget traditional hotels. Waking up to a new island sunrise every day from your private cabin window is an unmatched luxury.",
    formattedDate: "April 15, 2026",
    readTime: "5 min read"
  }
];

const defaultReviews = [
  { id: 'f-r1', name: 'Marco De Luca', origin: 'Italy', rating: 5, text: `Snorkeling in Komodo was amazing. The water was clear, the marine life was beautiful, and ${BRAND_NAME} made the experience easy and memorable.`, image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=800&auto=format&fit=crop' },
  { id: 'f-r2', name: 'Hannah Fischer', origin: 'Switzerland', rating: 5, text: 'Seeing the Komodo dragons in their natural habitat was incredible. The crew was helpful, the guide was informative, and the whole journey felt very well planned. I would absolutely recommend this to anyone visiting Indonesia.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop' },
  { id: 'f-r3', name: 'Lucas Bennett', origin: 'United Kingdom', rating: 5, text: 'The trip was perfectly organized and full of beautiful moments. From the boat to the island stops, everything felt smooth, safe, and truly unforgettable.', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop' }
];

const defaultItineraryFallback = [
  { day: "DAY 1 • SATURDAY", title: "Departure & Secret Islands", image: "https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=1973&auto=format&fit=crop" },
  { day: "DAY 2 • SUNDAY", title: "Whale Sharks & Tambora", image: "https://images.unsplash.com/photo-1580580297368-c782fb65d271?q=80&w=1974&auto=format&fit=crop" },
  { day: "DAY 3 • MONDAY", title: "Komodo & Padar Excursion", image: "https://images.unsplash.com/photo-1717238977683-5f06a9e60694?q=80&w=1970&auto=format&fit=crop" },
  { day: "DAY 4 • TUESDAY", title: "Majarite, Kelor & Return", image: "https://images.unsplash.com/photo-1724127722795-96efb9caffbc?q=80&w=1929&auto=format&fit=crop" }
];

const stripHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function PublicHomepage() {
  const waNumber = CONTACT.PHONE_1.replace(/\D/g, '');
  const encodedBrand = encodeURIComponent(BRAND_NAME);
  const b2cWaLink = `https://wa.me/${waNumber}?text=Hi%20${encodedBrand},%20I%20want%20to%20book%20the%20exclusive%204D3N%20Expedition!`;
  const b2bWaLink = `https://wa.me/${waNumber}?text=Hello%20${encodedBrand},%20I%20am%20a%20Travel%20Agent%20interested%20in%20joining%20the%20B2B%20Portal%20for%20the%20Allotment%20&%20Commission%20system.`;
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const reviewSliderRef = useRef<HTMLDivElement>(null);
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(true);

  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.2]);

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

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const docRef = doc(db, 'settings', 'expedition');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().itinerary && docSnap.data().itinerary.length > 0) {
          const mappedItinerary = docSnap.data().itinerary.map((it: any, index: number) => {
             const daysMap = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY"];
             return {
                ...it,
                day: it.day || `DAY ${index + 1} • ${daysMap[index % 4]}`
             };
          });
          setItinerary(mappedItinerary.slice(0, 4));
        } else {
          setItinerary(defaultItineraryFallback);
        }
      } catch (error) {
        console.error("Error fetching itinerary:", error);
        setItinerary(defaultItineraryFallback);
      } finally {
        setIsLoadingItinerary(false);
      }
    };
    fetchItinerary();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'), limit(6));
        const querySnapshot = await getDocs(q);
        const fetchedReviews: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReviews.push({ id: doc.id, ...doc.data() });
        });
        if (fetchedReviews.length > 0) {
          setReviews(fetchedReviews);
        } else {
          setReviews(defaultReviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews(defaultReviews);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsRef = collection(db, 'blogs');
        const q = query(blogsRef, where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const fetchedBlogs: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const dateObj = data.createdAt?.toDate();
          const formattedDate = dateObj ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateObj) : 'Recently';
          const plainText = stripHtml(data.content || "");
          const excerpt = plainText.length > 120 ? plainText.substring(0, 120) + "..." : plainText;
          fetchedBlogs.push({
            id: doc.id,
            ...data,
            formattedDate,
            excerpt,
            readTime: data.readTime || "5 min read"
          });
        });
        const mergedBlogs = [...defaultBlogs];
        fetchedBlogs.forEach((item, index) => {
          if (index < 3) mergedBlogs[index] = item;
        });
        setBlogs(mergedBlogs);
      } catch (err) {
        console.error("Error fetching homepage blogs:", err);
        setBlogs(defaultBlogs);
      } finally {
        setIsLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, 'galleries'), where('type', '==', 'image'), orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const fetchedGallery: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedGallery.push({ id: doc.id, src: data.src, title: data.title });
        });
        const mergedGallery = [...defaultGallery];
        fetchedGallery.forEach((item, index) => {
          if (index < 3) mergedGallery[index] = item;
        });
        setGallery(mergedGallery);
      } catch (err) {
        console.error("Error fetching homepage gallery:", err);
        setGallery(defaultGallery);
      } finally {
        setIsLoadingGallery(false);
      }
    };
    fetchGallery();
  }, []);

  const VesselImageCard = () => (
    <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100 group cursor-pointer aspect-square sm:aspect-[4/5] lg:aspect-[4/5] w-full">
      <img src="https://assets.peacefulgoldenisland.com/8b1a3d77-873b-4c28-baaa-52c4971e08e3-WhatsAppImage2026-06-16at10.18.39.jpeg" alt="Flagship Vessel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
      <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 text-white">
         <div className="inline-block bg-gradient-to-r from-[#B88E52] to-[#a37c46] text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow-lg uppercase tracking-wider mb-2 md:mb-3">
          Flagship Vessel
        </div>
        <h3 className="text-2xl md:text-3xl font-heading font-bold">KM Pulau Mas 88</h3>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white relative font-body">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center min-h-[90vh] md:min-h-screen">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=1973&auto=format&fit=crop')" }}
          ></div>
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/50 to-[#0f172a] z-0 pointer-events-none"></div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto text-center mt-8 md:mt-12"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-dark border border-[#B88E52]/40 text-[#eaddbd] text-xs md:text-sm font-semibold mb-6 md:mb-8 backdrop-blur-md uppercase tracking-widest shadow-lg">
            <Star className="h-3.5 w-3.5 fill-[#B88E52] text-[#B88E52]" />
            Exclusive 4D3N Liveaboard
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white tracking-tight mb-4 md:mb-6 leading-[1.15] drop-shadow-2xl px-2">
            Discover Komodo in <br className="hidden sm:block" />
            <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#B88E52] via-[#eaddbd] to-[#B88E52]">
              {' '}Unrivaled Elegance
            </span>
          </motion.h1>
          
          <motion.div variants={fadeInUp} className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-8 md:mb-12 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md px-4">
            <p>An intimate journey from Lombok to Flores.</p>
            <p className="mt-2 font-semibold text-[#eaddbd]">
               Fixed departures every <span className="underline decoration-[#B88E52] underline-offset-4">Saturday</span>.
            </p>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 w-full sm:w-auto">
            <a 
              href={b2cWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#B88E52] to-[#a37c46] hover:from-[#a37c46] hover:to-[#8c693b] text-white font-bold text-sm md:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(184,142,82,0.3)] hover:shadow-[0_0_40px_rgba(184,142,82,0.5)] transform hover:-translate-y-1"
            >
              Reserve Your Journey <ArrowRight className="h-5 w-5" />
            </a>
            <a 
              href="/expedition"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold text-sm md:text-base uppercase tracking-widest backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              Explore The Route
            </a>
          </motion.div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 8, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 flex flex-col items-center pointer-events-none"
        >
          <span className="text-[10px] md:text-xs uppercase tracking-widest mb-2 font-medium">Scroll to Explore</span>
          <div className="w-[1px] h-8 md:h-12 bg-gradient-to-b from-[#B88E52] to-transparent"></div>
        </motion.div>
      </section>

      {/* 2. WELCOME SECTION */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2">
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-5 md:mb-6 leading-tight">
                Embark on an Exclusive Voyage
              </h2>
              <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-[#B88E52] to-[#a37c46] mb-6 md:mb-8 rounded-full"></div>
              <div className="text-gray-600 text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                <p><strong className="text-[#0f172a]">{BRAND_NAME}</strong> is a premier maritime operator offering extraordinary sailing expeditions. We provide unforgettable sea adventures with meticulously curated routes to Komodo Island, Pink Beach, Padar Island, Manta Point, and other stunning destinations across the archipelago.</p>
              </div>
              <div className="text-gray-600 text-base md:text-lg leading-relaxed">
                <p>Enjoy a comfortable and secure journey aboard our flagship vessels, accompanied by breathtaking ocean views and professional hospitality for a truly memorable holiday experience.</p>
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} className="w-full lg:w-1/2 flex overflow-x-auto sm:grid sm:grid-cols-3 gap-4 sm:gap-6 pb-4 sm:pb-0 snap-x no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
              <motion.div variants={fadeInUp} className="min-w-[200px] sm:min-w-0 bg-[#fdfaf5] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-[#B88E52]/20 text-center shadow-lg shadow-[#B88E52]/5 snap-center shrink-0">
                <span className="block font-heading text-4xl md:text-5xl font-bold text-[#0f172a] mb-1 md:mb-2">5+</span>
                <span className="text-xs md:text-sm font-semibold text-[#B88E52] uppercase tracking-wider">Premium Vessels</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="min-w-[200px] sm:min-w-0 bg-[#fdfaf5] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-[#B88E52]/20 text-center shadow-lg shadow-[#B88E52]/5 snap-center shrink-0">
                <span className="block font-heading text-4xl md:text-5xl font-bold text-[#0f172a] mb-1 md:mb-2">98%</span>
                <span className="text-xs md:text-sm font-semibold text-[#B88E52] uppercase tracking-wider">Guest Satisfaction</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="min-w-[200px] sm:min-w-0 bg-[#fdfaf5] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-[#B88E52]/20 text-center shadow-lg shadow-[#B88E52]/5 snap-center shrink-0">
                <span className="block font-heading text-4xl md:text-5xl font-bold text-[#0f172a] mb-1 md:mb-2">15+</span>
                <span className="text-xs md:text-sm font-semibold text-[#B88E52] uppercase tracking-wider">Years Excellence</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. THE VESSEL TEASER */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-[#f8f9fa] relative border-y border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="hidden lg:block w-full lg:w-1/2 relative"
          >
            <VesselImageCard />
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="w-full lg:w-1/2 flex flex-col"
          >
            <motion.div variants={fadeInUp}>
              <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 md:mb-3 block">Trust & Comfort</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6 leading-tight">Engineered for <br className="hidden md:block"/> Supreme Comfort</h2>
              <div className="text-gray-600 text-base md:text-lg mb-8 md:mb-10 leading-relaxed font-light">
                <p>As a direct operator of {BRAND_NAME}, we guarantee the highest standards of safety and hospitality. Our vessel is meticulously designed to provide a spacious, luxurious retreat with strict compliance to national maritime regulations.</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="block lg:hidden w-full relative mb-10">
              <VesselImageCard />
            </motion.div>

            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              <div className="flex items-start gap-4">
                <div className="p-3 md:p-4 rounded-2xl bg-white border border-[#B88E52]/20 shadow-sm shrink-0">
                  <Users className="h-6 w-6 md:h-7 md:w-7 text-[#B88E52]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg md:text-xl text-[#0f172a] mb-1">Exclusive Capacity</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">Strictly capped to ensure intimate service and ample deck space.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 md:p-4 rounded-2xl bg-white border border-[#B88E52]/20 shadow-sm shrink-0">
                  <Anchor className="h-6 w-6 md:h-7 md:w-7 text-[#B88E52]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg md:text-xl text-[#0f172a] mb-1">Verified Safety</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">Equipped with official maritime certifications and modern nav systems.</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mt-auto">
              <a 
                href="/boat-details"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold uppercase tracking-widest text-xs md:text-sm transition-all shadow-lg hover:-translate-y-1 w-full sm:w-auto text-center"
              >
                View Vessel Specs <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. DESTINATIONS TEASER */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-10 md:mb-16 flex flex-col items-center"
          >
            <motion.span variants={fadeInUp} className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 block">The Route</motion.span>
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6">4 Days of Wonder</motion.h2>
            <motion.div variants={fadeInUp} className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
              <p>Embark on a carefully curated route traversing the pristine waters of the Indonesian archipelago. Witness prehistoric dragons, pink sands, and majestic mantas.</p>
            </motion.div>
          </motion.div>

          {isLoadingItinerary ? (
            <div className="flex flex-col items-center justify-center h-[250px] md:h-[300px]">
              <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-sm md:text-base">Loading The Route...</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-6 sm:pb-0 snap-x no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0"
            >
              {itinerary.map((day, idx) => (
                <motion.a 
                  key={idx} 
                  href="/expedition" 
                  variants={fadeInUp} 
                  className="group rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/60 border border-gray-100 block min-w-[260px] sm:min-w-0 snap-center shrink-0"
                >
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img src={day.image || defaultItineraryFallback[idx % 4].image} alt={day.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/20 to-transparent"></div>
                    <div className="absolute bottom-5 left-5 right-5 md:bottom-6 md:left-6 md:right-6">
                      <span className="text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 block">{day.day || `DAY ${idx + 1}`}</span>
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 leading-tight">{day.title}</h3>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-6 md:mt-10">
            <a 
              href="/expedition" 
              className="inline-flex items-center gap-2 text-[#0f172a] font-bold uppercase tracking-widest text-xs md:text-sm hover:text-[#B88E52] transition-colors border-b-2 border-transparent hover:border-[#B88E52] pb-1"
            >
              View Full Itinerary <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-10 md:mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 md:mb-3 block">
              The {BRAND_NAME} Difference
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Why Choose Us?</motion.h2>
            <motion.div variants={fadeInUp} className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              <p>Experience a safe, comfortable, and unforgettable journey under our exclusive fleet, manned by professional crews and designed for the most discerning travelers.</p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pb-8 sm:pb-0 snap-x no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0"
          >
            <motion.div variants={fadeInUp} className="glass-panel-dark p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl hover:bg-white/10 transition-colors min-w-[280px] w-[85vw] sm:w-auto snap-center shrink-0">
              <Ship className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] mb-4 md:mb-6" />
              <h3 className="font-heading text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Luxury Cruises</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">Well-maintained vessels built for comfort, featuring spacious lounges, private cabins, and an exceptionally smooth sailing experience.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="glass-panel-dark p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl hover:bg-white/10 transition-colors min-w-[280px] w-[85vw] sm:w-auto snap-center shrink-0">
              <MapPin className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] mb-4 md:mb-6" />
              <h3 className="font-heading text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Iconic Destinations</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">Discover the highlights of the National Park, from whale sharks and pink beaches to crystal-clear waters and breathtaking viewpoints.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="glass-panel-dark p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl hover:bg-white/10 transition-colors min-w-[280px] w-[85vw] sm:w-auto snap-center shrink-0">
              <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] mb-4 md:mb-6" />
              <h3 className="font-heading text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Transparent Excellence</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">We provide clear details on prices, itineraries, and facilities. No hidden charges, ensuring peace of mind from the beginning.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="glass-panel-dark p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl hover:bg-white/10 transition-colors min-w-[280px] w-[85vw] sm:w-auto snap-center shrink-0">
              <HeartHandshake className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] mb-4 md:mb-6" />
              <h3 className="font-heading text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Supreme Hospitality</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">Friendly crews, gourmet dining, and warm hospitality ensure every moment of your voyage is curated to perfection.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 6. GALLERY TEASER */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-[#f8f9fa] border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-6"
          >
            <div>
              <motion.span variants={fadeInUp} className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Visual Journey
              </motion.span>
              <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a]">A Glimpse of Paradise</motion.h2>
            </div>
            <motion.a 
              variants={fadeInUp}
              href="/gallery" 
              className="hidden md:inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-[#0f172a] font-bold uppercase tracking-widest hover:bg-[#0f172a] hover:text-white transition-all whitespace-nowrap bg-white text-xs w-full md:w-auto shadow-sm"
            >
              Explore Gallery <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>

          {isLoadingGallery ? (
            <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-sm md:text-base">Loading Visual Masterpieces...</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 h-[350px] md:h-[500px]"
            >
              {/* Gallery Items */}
              <a href="/gallery" className="col-span-2 row-span-1 md:row-span-2 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg group relative cursor-pointer block bg-gray-100">
                <img src={gallery[0]?.src || "https://images.unsplash.com/photo-1717238977683-5f06a9e60694?q=80&w=870"} alt={gallery[0]?.title || "Komodo"} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white font-bold text-base md:text-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">{gallery[0]?.title || "Explore"}</div>
              </a>
              <a href="/gallery" className="col-span-1 row-span-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg group relative cursor-pointer block bg-gray-100">
                <img src={gallery[1]?.src || "https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=600"} alt={gallery[1]?.title || "Padar"} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-white font-bold text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">{gallery[1]?.title || "Explore"}</div>
              </a>
              <a href="/gallery" className="col-span-1 row-span-1 md:row-span-2 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg group relative cursor-pointer block bg-gray-100">
                 <img src={gallery[2]?.src || "https://images.unsplash.com/photo-1724127722795-96efb9caffbc?q=80&w=600"} alt={gallery[2]?.title || "Pink Beach"} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                 <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-white font-bold text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">{gallery[2]?.title || "Explore"}</div>
              </a>
              <div className="col-span-2 md:col-span-1 row-span-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg group relative cursor-pointer bg-[#0f172a] flex flex-col items-center justify-center text-center p-4 md:p-6 border border-gray-100 transition-transform hover:-translate-y-1">
                 <a href="/gallery" className="text-white hover:text-[#B88E52] transition-colors w-full h-full flex flex-col items-center justify-center">
                    <span className="block font-heading text-3xl md:text-4xl font-bold mb-1 md:mb-2">50+</span>
                    <span className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">More Photos</span>
                 </a>
              </div>
            </motion.div>
          )}

          <div className="md:hidden mt-8">
            <a href="/gallery" className="flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-gray-300 text-[#0f172a] font-bold uppercase tracking-widest hover:bg-[#0f172a] hover:text-white transition-all w-full text-xs bg-white shadow-sm">
              Explore Gallery <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 7. REVIEWS SECTION */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-[#f8f9fa] border-b border-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
            <div>
              <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 block">Social Proof</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6">Stories from Our Guests</h2>
              <p className="text-gray-600 max-w-2xl text-base md:text-lg">Read authentic experiences from travelers who joined our Komodo sailing trips and explored unforgettable liveaboard adventures.</p>
            </div>
            
            <div className="hidden md:flex gap-4 shrink-0">
              <button onClick={() => slideReviews('left')} className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#B88E52]/30 flex items-center justify-center text-[#B88E52] hover:bg-[#B88E52] hover:text-white transition-all focus:outline-none shadow-sm"><ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /></button>
              <button onClick={() => slideReviews('right')} className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#B88E52]/30 flex items-center justify-center text-[#B88E52] hover:bg-[#B88E52] hover:text-white transition-all focus:outline-none shadow-sm"><ArrowRight className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>
          </div>

          {isLoadingReviews ? (
            <div className="flex flex-col items-center justify-center h-[350px] bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
              <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-sm md:text-base">Loading Guest Stories...</p>
            </div>
          ) : (
            <div className="relative -mx-5 px-5 sm:mx-0 sm:px-0">
              <div ref={reviewSliderRef} className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-8 pt-4">
                {reviews.map((testi, idx) => (
                  <div key={testi.id || idx} onClick={() => setSelectedReview(testi)} className="min-w-[280px] w-[85vw] sm:min-w-[340px] md:min-w-[400px] max-w-[420px] h-[480px] md:h-[520px] bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 relative overflow-hidden flex flex-col snap-center shrink-0 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                    <Quote className="absolute top-6 right-6 md:top-8 md:right-8 w-16 h-16 md:w-20 md:h-20 text-[#B88E52]/10 rotate-180 pointer-events-none" />
                    
                    <div className="flex gap-1 text-[#B88E52] mb-4 md:mb-6 relative z-10">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 md:w-5 md:h-5 ${i < (testi.rating || 5) ? 'fill-[#B88E52] text-[#B88E52]' : 'fill-transparent text-gray-300'}`} />)}
                    </div>
                    
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed relative z-10 italic font-light line-clamp-4">"{testi.text}"</p>
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
                          <h4 className="font-bold text-[#0f172a] text-sm md:text-base">{testi.name}</h4>
                          <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold">{testi.origin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
             <a href="/review" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white border border-[#B88E52]/40 text-[#0f172a] font-bold uppercase tracking-widest hover:bg-[#B88E52] hover:text-white transition-all shadow-sm hover:shadow-md w-full sm:w-auto text-xs md:text-sm">
                View All Reviews <ArrowRight className="w-4 h-4" />
             </a>
          </div>
        </div>
      </section>

      {/* 8. BLOG TEASER SECTION */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-10 md:mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" /> The Journal
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-8">Stories from the Sea</motion.h2>
          </motion.div>

          {isLoadingBlogs ? (
            <div className="flex flex-col items-center justify-center h-[250px] md:h-[300px] bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-inner">
              <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-[#B88E52] animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-sm md:text-base">Loading Editorial stories...</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex overflow-x-auto md:grid md:grid-cols-3 gap-5 md:gap-8 mb-8 md:mb-12 pb-6 md:pb-0 snap-x no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0"
            >
              {blogs.map((post) => (
                <motion.a 
                  href={`/blog/${post.slug}`} 
                  key={post.id}
                  variants={fadeInUp} 
                  className="group bg-[#f8f9fa] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col min-w-[280px] w-[85vw] md:w-auto snap-center shrink-0"
                >
                  <div className="h-48 md:h-60 overflow-hidden relative bg-gray-200">
                    <img src={post.coverImage || "https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=600"} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 backdrop-blur-sm text-[#0f172a] text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm">
                      {post.category || "Expedition"}
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex-grow flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 mb-2 md:mb-3 tracking-wider uppercase font-semibold">
                      <span className="flex items-center gap-1"><Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#B88E52]"/> {post.formattedDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#B88E52]"/> {post.readTime}</span>
                    </div>
                    <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mb-3 md:mb-4 group-hover:text-[#B88E52] transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <div className="text-gray-600 mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed flex-grow text-sm">
                      <p>{post.excerpt}</p>
                    </div>
                    <span className="text-[#B88E52] font-bold text-xs md:text-sm flex items-center gap-2 mt-auto uppercase tracking-widest">
                      Read Article <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}

          <div className="text-center">
             <a href="/blog" className="inline-flex items-center justify-center gap-2 text-[#0f172a] font-bold uppercase tracking-widest text-xs md:text-sm hover:text-[#B88E52] transition-colors border-b-2 border-transparent hover:border-[#B88E52] pb-1">
               View All Entries <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
             </a>
          </div>
        </div>
      </section>

      {/* 9. PORTAL / ECOSYSTEM SECTION */}
      <section id="ecosystem" className="py-16 md:py-24 px-5 md:px-12 bg-[#f8f9fa] max-w-7xl mx-auto w-full relative">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-10 md:mb-16"
        >
          <motion.span variants={fadeInUp} className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 block">Digital Ecosystem</motion.span>
          <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6">Unlock Your Privileges</motion.h2>
          <motion.div variants={fadeInUp} className="text-[#0f172a]/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            <p>We are building a world-class booking platform. Secure your early-bird benefits and tiers today by registering manually via our concierges.</p>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-12 relative z-10">
          {/* Card B2C - COMING SOON */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            className="group bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 lg:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col h-full relative overflow-hidden transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-bl from-gray-100 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1rem] md:rounded-[1.5rem] bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 md:mb-8 text-gray-400">
              <Gift className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f172a] opacity-40 mb-3 md:mb-4">For Explorers</h3>
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 flex-grow">
              <p className="text-gray-400 text-base md:text-lg">Join the <strong>Expedition Tiers</strong> program.</p>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-center gap-3 text-gray-400 font-medium text-sm md:text-base"><CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-gray-300 shrink-0" /> Earn points for every cabin</li>
                <li className="flex items-center gap-3 text-gray-400 font-medium text-sm md:text-base"><CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-gray-300 shrink-0" /> Unlock the VIP Rewards Store</li>
                <li className="flex items-center gap-3 text-gray-400 font-bold bg-gray-50 p-2.5 md:p-3 rounded-xl border border-gray-100 text-sm md:text-base"><CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-gray-300 shrink-0" /> Welcome Vouchers</li>
              </ul>
            </div>
            <div className="inline-flex items-center justify-center gap-2 w-full py-3.5 md:py-4 lg:py-5 rounded-xl md:rounded-2xl bg-gray-100 text-gray-400 font-bold text-sm md:text-base uppercase tracking-widest cursor-not-allowed">
              Coming Soon
            </div>
          </motion.div>

          {/* Card B2B */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            className="group bg-[#0f172a] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 lg:p-12 shadow-xl shadow-[#0f172a]/20 border border-[#1e293b] flex flex-col h-full relative overflow-hidden transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
              <Compass className="h-48 w-48 md:h-64 md:w-64 text-[#B88E52]" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1rem] md:rounded-[1.5rem] bg-[#1e293b] border border-[#B88E52]/40 flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-[#B88E52] group-hover:text-[#0f172a] transition-all duration-500 text-[#B88E52]">
                <Handshake className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">Travel Partners</h3>
              <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 flex-grow">
                <p className="text-gray-300 text-base md:text-lg">Experience the future of B2B booking.</p>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-center gap-3 text-gray-300 font-medium text-sm md:text-base"><CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-[#B88E52] shrink-0" /> Real-time Live Inventory sync</li>
                  <li className="flex items-center gap-3 text-gray-300 font-medium text-sm md:text-base"><CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-[#B88E52] shrink-0" /> Smart Allotment & Auto-Nett Pricing</li>
                  <li className="flex items-center gap-3 text-white font-bold bg-[#1e293b] p-2.5 md:p-3 rounded-xl border border-[#B88E52]/20 text-sm md:text-base"><CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-[#B88E52] shrink-0" /> Up to IDR 500k Commission/pax</li>
                </ul>
              </div>
              <a 
                id="btn-wa-b2b-register"
                href={b2bWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-4 lg:py-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-[#B88E52] to-[#a37c46] hover:from-[#a37c46] hover:to-[#8c693b] text-white font-bold uppercase tracking-widest text-sm md:text-base transition-colors shadow-[0_10px_20px_rgba(184,142,82,0.2)] hover:shadow-[0_15px_30px_rgba(184,142,82,0.3)]"
              >
                Register Agency
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FULLSCREEN REVIEW MODAL (Menampilkan detail Review jika ada gambar yang di-klik di Homepage) */}
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

              {selectedReview.image && (
                <div className="w-full h-64 sm:h-72 md:h-auto md:w-2/5 shrink-0 bg-[#f8f9fa] relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 scale-110" style={{ backgroundImage: `url(${selectedReview.image})` }}></div>
                  <img src={selectedReview.image} alt="Guest Moment" className="w-full h-full object-contain relative z-10 p-4 drop-shadow-xl" />
                </div>
              )}

              <div className={`p-5 sm:p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar ${selectedReview.image ? 'md:w-3/5' : 'w-full'}`}>
                <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6 mt-2 md:mt-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#fdfaf5] border border-[#B88E52]/30 shadow-sm flex items-center justify-center text-xl md:text-2xl font-bold text-[#B88E52]">
                    {selectedReview.name?.charAt(0).toUpperCase() || "G"}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0f172a] text-base md:text-lg leading-tight">{selectedReview.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5 md:mt-1">
                      <span>{selectedReview.origin}</span>
                    </div>
                    <div className="flex gap-1 mt-1 md:mt-1.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 md:w-4 md:h-4 ${i < (selectedReview.rating || 5) ? 'fill-[#B88E52] text-[#B88E52]' : 'fill-transparent text-gray-300'}`} />)}
                    </div>
                  </div>
                </div>
                
                <div className="relative mb-6 md:mb-8">
                  <Quote className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-8 h-8 md:w-10 md:h-10 text-[#B88E52]/10 rotate-180 pointer-events-none" />
                  <p className="text-[#0f172a] opacity-80 text-sm sm:text-base md:text-lg leading-relaxed italic font-light relative z-10 whitespace-pre-wrap">
                    "{selectedReview.text}"
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