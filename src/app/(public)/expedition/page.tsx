'use client';

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BRAND_NAME, CONTACT } from "@/lib/constants";
import { 
  ArrowRight, 
  Sun, 
  Anchor, 
  MapPin, 
  Sunrise, 
  Sunset, 
  Moon, 
  CheckCircle2, 
  Coffee, 
  Compass, 
  XCircle, 
  ChevronDown, 
  FileText, 
  Navigation, 
  Map,
  Loader2,
  CalendarDays
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

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
const imgPadar = "https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=1973&auto=format&fit=crop";
const imgWhaleShark = "https://images.unsplash.com/photo-1580580297368-c782fb65d271?q=80&w=1974&auto=format&fit=crop";
const imgKomodo = "https://images.unsplash.com/photo-1717238977683-5f06a9e60694?q=80&w=1970&auto=format&fit=crop";
const imgPinkBeach = "https://images.unsplash.com/photo-1724127722795-96efb9caffbc?q=80&w=1929&auto=format&fit=crop";
const imgVessel = "https://res.cloudinary.com/danyx7uny/image/upload/v1781582217/obuwude82h22wr1wvscz.png";

// --- ORIGINAL PREMIUM FALLBACK DATA (UPDATED TO SATURDAY DEPARTURE) ---
const defaultExpeditionData = {
  highlights: [
    { title: "Saleh Bay – Whale Sharks", desc: "Swim alongside majestic whale sharks in the calm waters of Sumbawa.", image: imgWhaleShark, span: "md:col-span-2 row-span-1" },
    { title: "Komodo Park", desc: "Explore the natural habitat of the legendary Komodo dragons.", image: imgKomodo, span: "md:col-span-1 row-span-2" },
    { title: "Padar Viewpoint", desc: "Hike to the famous panoramic viewpoint overlooking three spectacular bays.", image: imgPadar, span: "md:col-span-1 row-span-1" },
    { title: "Pink Beach", desc: "Relax on rare pink sands and snorkel in crystal-clear waters.", image: imgPinkBeach, span: "md:col-span-1 row-span-1" }
  ],
  itinerary: [
    {
      day: "DAY 1 • SATURDAY", title: "Departure & Secret Islands", image: imgVessel,
      activities: [
        { time: "Morning Pick-Up", text: "Lombok Hotel Pick-Up (08:00 - 10:00 AM) via premium transport to our departure lounge.", iconName: "sunrise" },
        { time: "03:30 PM", text: `Board the ${BRAND_NAME} flagship vessel and set sail towards Komodo National Park.`, iconName: "anchor" },
        { time: "Late Afternoon", text: "Arrive at Kenawa Island for a short hill trek, panoramic views, and a tropical sunset.", iconName: "sunset" }
      ],
      meals: "Dinner Included", overnight: "Overnight onboard while sailing under the stars."
    },
    {
      day: "DAY 2 • SUNDAY", title: "Whale Sharks & Tambora", image: imgWhaleShark,
      activities: [
        { time: "Morning", text: "Swim alongside majestic whale sharks in the serene waters of Saleh Bay.", iconName: "sunrise" },
        { time: "Midday", text: "Sail across Tambora waters. Keep an eye out for playful dolphins.", iconName: "sun" },
        { time: "Afternoon", text: "Relax on the sun deck and enjoy exquisite ocean views and afternoon tea.", iconName: "sunset" }
      ],
      meals: "Breakfast, Lunch & Dinner", overnight: "Overnight onboard."
    },
    {
      day: "DAY 3 • MONDAY", title: "Komodo & Padar Excursion", image: imgKomodo,
      activities: [
        { time: "Morning", text: "Guided trekking at Loh Liang Village. Encounter the legendary Komodo dragons.", iconName: "sunrise" },
        { time: "Midday", text: "Swim, snorkel, and relax on the rare pink sands of Pink Beach.", iconName: "sun" },
        { time: "Afternoon & Evening", text: "Hike Padar Island for a breathtaking sunset over three-colored bays.", iconName: "moon" }
      ],
      meals: "Breakfast, Lunch & Dinner", overnight: "Overnight onboard near Padar."
    },
    {
      day: "DAY 4 • TUESDAY", title: "Majarite, Kelor & Return", image: imgPinkBeach,
      activities: [
        { time: "Morning", text: "Snorkeling session at Majarite Island. Explore vibrant coral reefs.", iconName: "sunrise" },
        { time: "Midday", text: "Explore Kelor Island. Relax on white sandy beaches or hike to the hilltop.", iconName: "sun" },
        { time: "Afternoon", text: "Sail back to Labuan Bajo. Disembark and say farewell to the crew.", iconName: "sunset" }
      ],
      meals: "Breakfast & Lunch", overnight: "Trip concludes in Labuan Bajo."
    }
  ],
  cabinPackages: [
    { name: "Private Cabin Sea View", desc: "A premium cabin option with expansive ocean views.", price: "4,600K", features: ["Sea view window", "Spacious comfort", "Air-conditioned"], image: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2069&auto=format&fit=crop", popular: true },
    { name: "Private Cabin Standard", desc: "Comfortable private room for exclusive privacy.", price: "4,200K", features: ["Ultimate privacy", "Premium bedding", "Air-conditioned"], image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop", popular: false },
    { name: "Down Deck Cabin", desc: "Cozy lower-deck cabin providing a serene sleeping area.", price: "3,800K", features: ["Cozy and quiet", "Comfortable space", "AC Central"], image: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop", popular: false },
    { name: "Sharing Deck Upstair", desc: "Spacious shared sleeping area on the upper deck.", price: "3,600K", features: ["Budget-friendly", "Clean mattress & blanket"], image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=2073&auto=format&fit=crop", popular: false }
  ],
  inclusions: ["Premium pick-up service", "Chef-prepared meals onboard", "Snacks & refreshments", "Snorkeling equipment", "Safety equipment", "Government tax", "English-speaking guide"],
  exclusions: ["Flight tickets", "Snorkeling suit & Fins", "Personal Towel", "Personal Expenses"],
  paymentMethods: [
    { name: "Visa", logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" },
    { name: "Mastercard", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" },
    { name: "Bank Transfer", logo: "https://placehold.co/200x80/f8f9fa/11223a?text=Bank+Transfer&font=Montserrat" },
    { name: "E-Wallet", logo: "https://placehold.co/200x80/f8f9fa/11223a?text=E-Wallets&font=Montserrat" }
  ],
  faqs: [
    { q: "What should I bring for my Komodo trip?", a: "Bring Valid ID/Passport, comfortable clothes, sun protection, personal medication, and a camera." },
    { q: "When should I book?", a: "We highly recommend booking at least one to two weeks before departure to secure your exclusive spot." },
    { q: "Is the trip safe?", a: "Absolutely. We prioritize your safety with rigorous boat inspections and highly experienced maritime crews." }
  ]
};

// --- ICON RESOLVER HELPERS ---
const getIcon = (name: string, className: string) => {
  switch (name) {
    case 'sunrise': return <Sunrise className={className} />;
    case 'sun': return <Sun className={className} />;
    case 'sunset': return <Sunset className={className} />;
    case 'moon': return <Moon className={className} />;
    case 'anchor': return <Anchor className={className} />;
    default: return <Sun className={className} />;
  }
};

function FaqAccordion({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-[#B88E52]/50 transition-colors">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left px-5 md:px-6 py-4 md:py-5 flex items-center justify-between focus:outline-none">
        <span className="font-bold text-[#0f172a] pr-4 text-sm md:text-base">{question}</span>
        <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-[#B88E52] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
            <div className="px-5 md:px-6 pb-4 md:pb-5 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-50 pt-3 md:pt-4 whitespace-pre-line">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExpeditionPage() {
  const waNumber = CONTACT.PHONE_1.replace(/\D/g, '');
  const encodedBrand = encodeURIComponent(BRAND_NAME);
  const b2cWaLink = `https://wa.me/${waNumber}?text=Hi%20${encodedBrand},%20I%20want%20to%20reserve%20the%20exclusive%204D3N%20Expedition!`;
  
  const [expData, setExpData] = useState(defaultExpeditionData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpeditionData = async () => {
      try {
        const docRef = doc(db, 'settings', 'expedition');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mergedHighlights = data.highlights && Array.isArray(data.highlights) && data.highlights.length > 0 ? data.highlights.map((h: any, i: number) => ({...defaultExpeditionData.highlights[i % defaultExpeditionData.highlights.length], ...h, image: h.image || defaultExpeditionData.highlights[i % defaultExpeditionData.highlights.length].image})) : defaultExpeditionData.highlights;
          
          // Fallback to defaultExpeditionData if the DB format is basic
          const mergedItinerary = data.itinerary && Array.isArray(data.itinerary) && data.itinerary.length > 0 ? data.itinerary.map((it: any, i: number) => ({...defaultExpeditionData.itinerary[i % defaultExpeditionData.itinerary.length], ...it, day: defaultExpeditionData.itinerary[i % defaultExpeditionData.itinerary.length].day, image: it.image || defaultExpeditionData.itinerary[i % defaultExpeditionData.itinerary.length].image, activities: Array.isArray(it.activities) ? it.activities.map((act: any) => ({time: act.time || "00:00", text: act.text || "", iconName: act.iconName || "sun"})) : []})) : defaultExpeditionData.itinerary;
          
          const mergedCabinPackages = data.cabinPackages && Array.isArray(data.cabinPackages) && data.cabinPackages.length > 0 ? data.cabinPackages.map((c: any, i: number) => ({...defaultExpeditionData.cabinPackages[i % defaultExpeditionData.cabinPackages.length], ...c, image: c.image || defaultExpeditionData.cabinPackages[i % defaultExpeditionData.cabinPackages.length].image, features: Array.isArray(c.features) ? c.features.filter(Boolean) : []})) : defaultExpeditionData.cabinPackages;
          const mergedInclusions = data.inclusions && Array.isArray(data.inclusions) && data.inclusions.length > 0 ? data.inclusions.filter(Boolean) : defaultExpeditionData.inclusions;
          const mergedExclusions = data.exclusions && Array.isArray(data.exclusions) && data.exclusions.length > 0 ? data.exclusions.filter(Boolean) : defaultExpeditionData.exclusions;
          const mergedPaymentMethods = data.paymentMethods && Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0 ? data.paymentMethods : defaultExpeditionData.paymentMethods;
          const mergedFaqs = data.faqs && Array.isArray(data.faqs) && data.faqs.length > 0 ? data.faqs : defaultExpeditionData.faqs;
          
          setExpData({ highlights: mergedHighlights, itinerary: mergedItinerary, cabinPackages: mergedCabinPackages, inclusions: mergedInclusions, exclusions: mergedExclusions, paymentMethods: mergedPaymentMethods, faqs: mergedFaqs });
        } else {
          setExpData(defaultExpeditionData);
        }
      } catch (error) {
        console.error("Error fetching expedition settings:", error);
        setExpData(defaultExpeditionData); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpeditionData();
  }, []);

  const getWaLink = (cabinName: string) => `https://wa.me/${waNumber}?text=Hi%20${encodedBrand},%20I%20am%20interested%20in%20reserving%20the%20*${encodeURIComponent(cabinName || "Cabin")}*%20for%20the%204D3N%20Expedition.`;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa]">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#B88E52] animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm md:text-base">Preparing your ultimate voyage...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] overflow-x-hidden font-body">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex items-center min-h-[70vh] lg:min-h-[85vh]">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-[#B88E52]/10 rounded-full blur-[100px] lg:blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-blue-500/10 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8">
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-1/2 text-center lg:text-left pt-6 lg:pt-0"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center justify-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full bg-white/5 border border-white/10 text-[#eaddbd] text-[10px] md:text-xs font-bold mb-6 backdrop-blur-md shadow-sm uppercase tracking-widest mx-auto lg:mx-0">
              <CalendarDays className="h-3.5 w-3.5 text-[#B88E52]" /> Departing Every Saturday
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.15]">
              4D3N Exclusive <br className="hidden sm:block" /> 
              <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#B88E52] via-[#eaddbd] to-[#B88E52]">Sea Expedition</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light mb-8 px-4 lg:px-0">
              Experience an unforgettable sailing journey from Lombok to Labuan Bajo. Encounter whale sharks, trek with dragons, and discover breathtaking island panoramas.
            </motion.p>

            {/* Mobile Hero Visual (Hidden on Desktop, Shows only on Mobile) */}
            <motion.div 
              variants={fadeInUp} 
              className="block lg:hidden w-full mb-8 md:mb-10 relative h-[280px] sm:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
            >
              <img src={imgPadar} className="w-full h-full object-cover" alt="Padar Island" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent opacity-90"></div>
              
              {/* Floating Badge Mobile */}
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 px-3 py-1.5 flex items-center gap-1.5 text-white shadow-xl">
                <Map className="w-3.5 h-3.5 text-[#B88E52]" />
                <span className="text-[10px] font-bold tracking-widest uppercase">4 Days</span>
              </div>

              <div className="absolute bottom-5 left-5 text-left">
                <span className="text-[#B88E52] text-[10px] font-bold uppercase tracking-widest mb-1 block">Iconic Destination</span>
                <span className="font-heading text-white font-bold text-xl tracking-wider">Padar Island</span>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4 w-full px-5 lg:px-0">
              <a 
                href={b2cWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-[#B88E52] to-[#a37c46] hover:from-[#a37c46] hover:to-[#8c693b] text-white font-bold text-sm md:text-base uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(184,142,82,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Reserve Your Cabin <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <button 
                onClick={() => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-4 md:px-8 md:py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold text-sm md:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                View Itinerary
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side: Pill Image Collage (Hidden on Mobile, block on Desktop) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:flex w-1/2 relative h-[500px] lg:h-[600px] justify-end items-center gap-6 pointer-events-none"
          >
            <motion.div animate={{ y: [20, 0, 20] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="w-56 h-[70%] rounded-full overflow-hidden shadow-2xl relative border-4 border-[#0f172a] z-20 mt-20">
              <img src={imgWhaleShark} className="w-full h-full object-cover" alt="Whale Shark" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent"></div>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="font-heading text-white font-bold text-lg tracking-wider">Saleh Bay</span>
              </div>
            </motion.div>
            <motion.div animate={{ y: [-20, 0, -20] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }} className="w-64 h-[90%] rounded-full overflow-hidden shadow-2xl relative border-4 border-[#0f172a] z-10 mb-20">
              <img src={imgPadar} className="w-full h-full object-cover" alt="Padar Island" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent"></div>
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <span className="text-[#B88E52] text-[10px] font-bold uppercase tracking-widest mb-1 block">Iconic</span>
                <span className="font-heading text-white font-bold text-xl tracking-wider">Padar Island</span>
              </div>
            </motion.div>
            <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-[15%] right-[40%] w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex flex-col items-center justify-center text-white shadow-xl z-30">
              <Map className="w-6 h-6 text-[#B88E52] mb-1" />
              <span className="text-[10px] font-bold tracking-widest uppercase">4 Days</span>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 2. TRIP HIGHLIGHTS */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-10 md:mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6">Expedition Highlights</motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Witness the wonders of the Indonesian archipelago. A carefully curated journey combining wildlife, nature, and relaxation.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 md:gap-6 pb-6 md:pb-0 snap-x no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:h-[600px]"
          >
            {expData.highlights.map((item, index) => {
              const gridSpan = item.span || (index === 0 ? "md:col-span-2 row-span-1" : index === 1 ? "md:col-span-1 row-span-2" : "md:col-span-1 row-span-1");
              return (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className={`relative rounded-[1.5rem] md:rounded-3xl overflow-hidden shadow-xl group cursor-pointer min-w-[280px] w-[85vw] md:w-auto h-[350px] md:h-auto snap-center shrink-0 ${gridSpan}`}
                >
                  <img src={item.image || "/images/Kapal_Pulau_Mas_88.png"} alt={item.title || "Highlight"} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 text-white">
                    <h3 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">{item.title}</h3>
                    <p className="text-white/80 text-xs md:text-sm lg:text-base leading-relaxed line-clamp-2 md:line-clamp-3">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 3. ITINERARY TIMELINE SECTION */}
      <section id="itinerary" className="py-16 md:py-24 px-5 md:px-12 bg-[#f8f9fa] border-y border-gray-100 relative">
        <div className="text-center mb-12 md:mb-20 relative z-10">
          <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 md:mb-3 block flex items-center justify-center gap-2">
            <CalendarDays className="w-4 h-4" /> Fixed Weekly Departures
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6">The Grand Itinerary</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Our trips are safe, meticulously organized, and perfectly paced. Follow the timeline of your upcoming adventure, setting sail every Saturday.
          </p>
        </div>

        <div className="space-y-16 md:space-y-24 max-w-6xl mx-auto relative z-10">
          {expData.itinerary.map((item, index) => (
            <motion.div 
              key={item.day || index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              // Stack image and text on mobile, side-by-side on desktop
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-start`}
            >
              {/* Image Container */}
              <motion.div variants={fadeInUp} className="w-full md:w-1/2">
                <div className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3] group md:sticky md:top-32 border border-gray-200">
                  <img src={item.image || "/images/Kapal_Pulau_Mas_88.png"} alt={item.title || "Day Image"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent opacity-90"></div>
                  <div className="absolute bottom-5 left-5 right-5 md:bottom-8 md:left-8 md:right-8 text-white">
                    <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4 shadow-md">
                      {item.day}
                    </span>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight">{item.title}</h3>
                  </div>
                </div>
              </motion.div>

              {/* Timeline Content */}
              <motion.div variants={fadeInUp} className="w-full md:w-1/2 flex flex-col justify-center pt-2 pb-6 md:pb-10">
                <div className="space-y-8 md:space-y-10 relative before:absolute before:inset-0 before:ml-[11px] md:before:ml-2.5 before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#B88E52] before:via-gray-300 before:to-transparent">
                  {item.activities && item.activities.map((act: any, i: number) => (
                    <div key={i} className="relative flex items-start gap-4 md:gap-6 group">
                      <div className="absolute left-0 w-6 h-6 md:w-5 md:h-5 rounded-full border-[4px] border-white bg-[#B88E52] shadow-sm z-10 mt-1"></div>
                      <div className="pl-10 md:pl-10 w-full">
                        <div className="flex items-center gap-3 mb-2 md:mb-3">
                          <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm border border-gray-100 shrink-0">
                             {getIcon(act.iconName || "sun", "w-4 h-4 md:w-5 md:h-5 text-[#B88E52]")}
                          </div>
                          <h4 className="text-base md:text-lg font-bold text-[#0f172a]">{act.time}</h4>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base pr-2">
                          {act.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day Summary Box */}
                <div className="mt-10 md:mt-12 bg-white border border-[#B88E52]/20 shadow-lg shadow-[#B88E52]/5 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 md:w-32 md:h-32 bg-[#B88E52]/5 rounded-bl-full pointer-events-none"></div>
                  <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
                    <div className="p-2 md:p-2.5 bg-[#fdfaf5] rounded-xl text-[#B88E52] shrink-0">
                       <Coffee className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#0f172a] text-sm md:text-base mb-0.5 md:mb-1">Included Meals</span>
                      <span className="text-gray-600 text-xs md:text-sm">{item.meals}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2 md:p-2.5 bg-[#fdfaf5] rounded-xl text-[#B88E52] shrink-0">
                       <Moon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#0f172a] text-sm md:text-base mb-0.5 md:mb-1">Accommodation</span>
                      <span className="text-gray-600 text-xs md:text-sm">{item.overnight}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. INCLUSIONS & EXCLUSIONS */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12"
          >
            {/* Inclusions */}
            <motion.div variants={fadeInUp} className="bg-[#fdfaf5] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 lg:p-12 border border-[#B88E52]/20 shadow-xl shadow-[#B88E52]/5 relative overflow-hidden">
              <Compass className="absolute -bottom-8 -right-8 w-32 h-32 md:w-48 md:h-48 text-[#B88E52]/5 pointer-events-none" />
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" /> What's Included?
              </h3>
              <ul className="space-y-3 md:space-y-5">
                {expData.inclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 md:gap-4 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52] shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Exclusions */}
            <motion.div variants={fadeInUp} className="bg-gray-50 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 lg:p-12 border border-gray-200 relative overflow-hidden mt-2 md:mt-0">
              <XCircle className="absolute -top-8 -right-8 w-32 h-32 md:w-48 md:h-48 text-gray-200/50 pointer-events-none" />
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                <XCircle className="w-6 h-6 md:w-8 md:h-8 text-gray-400" /> Not Included
              </h3>
              <ul className="space-y-3 md:space-y-5">
                {expData.exclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 md:gap-4 text-gray-600">
                    <XCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. CHOOSE CABIN SECTION */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-10 md:mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 block">Accommodation</motion.span>
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Select Your Suite</motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Select the perfect cabin for your journey. All sleeping areas are arranged to maximize space efficiency and premium comfort.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            // Horizontal scroll for Cabins on Mobile
            className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-6 sm:pb-0 snap-x no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0"
          >
            {expData.cabinPackages.map((cabin, index) => {
              const safeCabinName = cabin.name || `Cabin-${index + 1}`;
              const cabinWaId = `btn-wa-booking-cabin-${safeCabinName.replace(/\s+/g, '-').toLowerCase()}`;
              
              return (
                <motion.div 
                  key={index}
                  variants={fadeInUp} 
                  className="bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col group hover:bg-white/10 transition-colors duration-300 shadow-xl min-w-[280px] w-[85vw] sm:w-auto snap-center shrink-0"
                >
                  <div className="h-48 md:h-56 overflow-hidden relative">
                    <img src={cabin.image || "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=600"} alt={safeCabinName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                    {cabin.popular && (
                      <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-gradient-to-r from-[#B88E52] to-[#a37c46] text-white text-[10px] font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-full uppercase tracking-widest shadow-lg">Popular Choice</div>
                    )}
                    <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-white pr-4">
                       <h3 className="font-heading text-lg md:text-xl font-bold leading-tight">{safeCabinName}</h3>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col flex-grow">
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-3">{cabin.desc || ""}</p>
                    
                    <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-grow">
                      {cabin.features && cabin.features.map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#B88E52] shrink-0 mt-0.5" /> 
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-5 md:pt-6 border-t border-white/10">
                      <div className="flex items-baseline gap-1 mb-4 md:mb-6">
                        <span className="text-xs md:text-sm font-semibold text-[#B88E52]">IDR</span>
                        <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{cabin.price || "0K"}</span>
                        <span className="text-gray-400 text-xs md:text-sm">/pax</span>
                      </div>
                      
                      <a 
                        id={cabinWaId}
                        href={getWaLink(safeCabinName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-white text-[#0f172a] font-bold text-sm md:text-base hover:bg-[#B88E52] hover:text-white transition-colors shadow-lg hover:-translate-y-1 uppercase tracking-widest"
                      >
                        Select Suite
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 6. PAYMENT METHODS SECTION */}
      {expData.paymentMethods && expData.paymentMethods.length > 0 && (
        <section className="py-16 md:py-24 px-5 md:px-12 bg-[#f8f9fa] border-b border-gray-100">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 block">
                Secure Transactions
              </motion.span>
              <motion.h2 variants={fadeInUp} className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-8 md:mb-12">
                Trusted Global Partners
              </motion.h2>
              
              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center items-center gap-4 md:gap-10">
                {expData.paymentMethods.map((method: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center group cursor-pointer w-28 md:w-auto">
                    <div className="h-12 w-28 md:h-20 md:w-44 px-3 py-2 bg-white border border-gray-200 shadow-sm rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-500 hover:shadow-md hover:border-[#B88E52]/40 hover:-translate-y-1">
                      <img 
                        src={method.logo || "https://placehold.co/200x80/f8f9fa/11223a?text=Bank&font=Montserrat"} 
                        alt={method.name} 
                        className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-500 mt-2 md:mt-4 font-semibold opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 tracking-widest uppercase text-center">
                      {method.name}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 7. HELPFUL GUIDES & FAQS SECTION */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 md:gap-16">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="w-full lg:w-1/3 order-2 lg:order-1"
          >
            <div className="bg-[#fdfaf5] p-6 md:p-8 lg:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-[#B88E52]/20 lg:sticky lg:top-32 shadow-lg shadow-[#B88E52]/5">
              <h3 className="font-heading text-xl md:text-2xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                <FileText className="w-6 h-6 md:w-7 md:h-7 text-[#B88E52]" /> Helpful Guides
              </h3>
              <ul className="space-y-3 md:space-y-4">
                <li>
                  <a href="/terms-and-conditions" className="group flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-[#B88E52]/20">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#B88E52] transition-colors"><span className="text-[10px] md:text-xs font-bold text-gray-500 group-hover:text-[#B88E52]">1</span></div>
                    <span className="font-semibold text-gray-700 group-hover:text-[#B88E52] transition-colors text-sm md:text-lg">Terms & Conditions</span>
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="group flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-[#B88E52]/20">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#B88E52] transition-colors"><span className="text-[10px] md:text-xs font-bold text-gray-500 group-hover:text-[#B88E52]">2</span></div>
                    <span className="font-semibold text-gray-700 group-hover:text-[#B88E52] transition-colors text-sm md:text-lg">Privacy Policy</span>
                  </a>
                </li>
                <li>
                  <a href="/faq" className="group flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-[#B88E52]/20">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#B88E52] transition-colors"><span className="text-[10px] md:text-xs font-bold text-gray-500 group-hover:text-[#B88E52]">3</span></div>
                    <span className="font-semibold text-gray-700 group-hover:text-[#B88E52] transition-colors text-sm md:text-lg leading-snug">View Full FAQ Center</span>
                  </a>
                </li>
              </ul>
              
              <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-[#B88E52]/20 text-center">
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Require personal assistance?</p>
                <a 
                  id="btn-wa-support"
                  href={b2cWaLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 md:py-4 rounded-xl bg-[#0f172a] text-white font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-[#1e293b] transition-colors shadow-md hover:-translate-y-1"
                >
                   Contact Concierge
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="w-full lg:w-2/3 order-1 lg:order-2"
          >
            <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-6 md:mb-10">Trip FAQs</h2>
            <div className="space-y-3 md:space-y-4">
              {expData.faqs.map((faq, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <FaqAccordion question={faq.q || "FAQ?"} answer={faq.a || ""} />
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

    </main>
  );
} 