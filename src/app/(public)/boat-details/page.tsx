'use client';

import { ArrowRight, FileText, Award, Ship, Flag, Users, Scale, Ruler, LifeBuoy, Flame, ShieldCheck, CheckCircle2, MapPin, BedDouble, Droplets, Wifi, Compass, Waves, PenTool, LayoutTemplate, Info, Map as MapIcon } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { BRAND_NAME, CONTACT } from "@/lib/constants";

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

// URL Aset 
const imgPadar = "https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=773&auto=format&fit=crop";
const imgWhaleShark = "https://images.unsplash.com/photo-1580580297368-c782fb65d271?q=80&w=774&auto=format&fit=crop";
const imgKomodo = "https://images.unsplash.com/photo-1717238977683-5f06a9e60694?q=80&w=870&auto=format&fit=crop";
const imgPinkBeach = "https://images.unsplash.com/photo-1724127722795-96efb9caffbc?q=80&w=929&auto=format&fit=crop";
const imgVessel = "https://res.cloudinary.com/danyx7uny/image/upload/v1781582217/obuwude82h22wr1wvscz.png";

// --- DATA: LEGAL DOCUMENTS ---
const safetyDocuments = [
  {
    title: "Business Identification Number",
    desc: "An official tourism business license registered through Indonesia’s OSS system, allowing us to operate legally in the maritime tourism industry.",
    icon: <FileText className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1RkJcmdVgNFVH-0dthOwD5Xaah19SXmUD/view"
  },
  {
    title: "Legal Company Certification",
    desc: "An official certification from the Indonesian Ministry confirming that our company is legally registered and recognized.",
    icon: <Award className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1IgbQsB5Vpu1gXpFxyL4j_YQIgnUSsFs7/view"
  },
  {
    title: "Approved Operational Plan",
    desc: "Our vessels operate under officially approved plans (RPK), ensuring every exclusive route complies with maritime safety regulations.",
    icon: <Ship className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1auSwFOF_I5e0hMLMHi3_K9Oij3wYCOBI/view?usp=sharing"
  },
  {
    title: "Certificate of Nationality",
    desc: "Officially registered under the Indonesian flag holding a valid Pas Besar, confirming its legal national status.",
    icon: <Flag className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1J22XEt4JlIrjt7FCteDVcc2Gs1aZQxZh/view"
  },
  {
    title: "Minimum Safe Manning",
    desc: "Confirms that our vessel operates with the minimum required number of highly qualified crew members for safe operations.",
    icon: <Users className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1_M2Aww95R78OlIoGUsfiTSPALtbYKuBz/view"
  },
  {
    title: "International Tonnage",
    desc: "Holds a valid certificate confirming its registered gross and net tonnage in accordance with strict international standards.",
    icon: <Scale className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1XIQo8EumXkT2s1f7CDiwwJBBQmqwwE7y/view"
  },
  {
    title: "Provisional Load Line",
    desc: "Confirms the approved safe loading limits and compliance with maritime safety regulations for secure vessel operations.",
    icon: <Ruler className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1pYUnezjP8slJYeBlLfPqYOtIutxBF6AW/view"
  },
  {
    title: "Inflatable Life Rafts",
    desc: "Equipped with inflatable life rafts that comply with international maritime safety standards to ensure passenger safety.",
    icon: <LifeBuoy className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1CJ5X187Qkf5zEGHq87K1tH1X6InUgyNh/view"
  },
  {
    title: "Passenger Boat Safety",
    desc: "Holds official Safety Certificates issued by Indonesia’s Harbor Master (KSOP) confirming uncompromising seaworthiness.",
    icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    link: "https://drive.google.com/file/d/1Jy2ySWd9RixzFC9YBYFJ1jxd0p5gSZ2e/view"
  }
];

// --- DATA: TECHNICAL DRAWINGS ---
const technicalDocuments = [
  {
    title: "General Arrangement (GA)",
    desc: "A technical drawing showing the main layout of the vessel, including deck areas, cabins, engine room, access routes, and safety equipment locations.",
    icon: <LayoutTemplate className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />,
    link: "https://drive.google.com/file/d/1-gIFxdAmo-2OoFXbHy6XVJZqIXH2U0pe/view"
  },
  {
    title: "Lines Plan",
    desc: "Shows the shape of the vessel’s hull, especially below the waterline. It helps determine the hull form, stability, water flow, and overall sailing efficiency.",
    icon: <PenTool className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />,
    link: "https://drive.google.com/file/d/1ds-JESETJ5z507f60RCUZ0fRfzootjHT/view"
  },
  {
    title: "Fire Safety Plan",
    desc: "Shows the vessel’s fire prevention, detection, and emergency response arrangements including extinguishers, alarms, hoses, and emergency exits.",
    icon: <Flame className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />,
    link: "https://drive.google.com/file/d/1xjdskzMfvuWT1mf4n9jDcn-J4h7NVUlE/view"
  },
  {
    title: "Midship Section",
    desc: "Refers to the central section of the vessel. It is an important reference point for checking balance, stability, load distribution, and structural strength.",
    icon: <Scale className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />,
    link: "https://drive.google.com/file/d/1FzxeBd-XoULY4-FX6w--aWw6oxFGbTWj/view"
  },
  {
    title: "Stability Calculation",
    desc: "A technical assessment used to evaluate the vessel’s initial stability in the water, estimating its ability to stay balanced and handle load distribution.",
    icon: <Ship className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />,
    link: "https://drive.google.com/file/d/1hfkScwC2u8mKVFc3O9k8XaxvqLdi13Zl/view"
  }
];

// --- DATA: SPECIFICATIONS (UPDATED TO SATURDAY DEPARTURE) ---
const specifications = [
  {
    title: "Route & Schedule",
    icon: <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />,
    items: ["Lombok (Kayangan) ➔ Labuan Bajo", "Fixed Departures: Every Saturday", "Adjustable to weather conditions"]
  },
  {
    title: "Capacity & Crew",
    icon: <Users className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />,
    items: ["Max 46 Privileged Guests", "8 Professional Crew Members", "Highly trained in emergency handling"]
  },
  {
    title: "Cabins",
    icon: <BedDouble className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />,
    items: ["Premium Private Suites", "Comfortable Shared Cabins", "Space-efficient elegant arrangement"]
  },
  {
    title: "Bathroom Facilities",
    icon: <Droplets className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />,
    items: ["Shared toilet & shower facilities", "Immaculate regular staff cleaning", "Efficient freshwater management"]
  },
  {
    title: "Onboard Amenities",
    icon: <Wifi className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />,
    items: ["Open deck lounge & Dining area", "Mobile charging stations", "WiFi (Subject to signal coverage)"]
  },
  {
    title: "Safety Gear",
    icon: <LifeBuoy className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />,
    items: ["Inflatable Life rafts & Jackets", "Rescue boat (Sekoci)", "Flares & Fire extinguishers"]
  },
  {
    title: "Navigation",
    icon: <Compass className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />,
    items: ["Marine Radar", "GPS Navigation", "AIS / Marine Radio"]
  },
  {
    title: "Medical & Activities",
    icon: <Waves className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />,
    items: ["First aid kit (P3K) & Basics", "Motion sickness support", "Premium snorkeling masks included"]
  }
];

export default function BoatDetailsPage() {
  const waNumber = CONTACT.PHONE_1.replace(/\D/g, '');
  const encodedBrand = encodeURIComponent(BRAND_NAME);
  const generalWaLink = `https://wa.me/${waNumber}?text=Hi%20${encodedBrand},%20I%20want%20to%20know%20more%20about%20the%20KM%20Pulau%20Mas%2088%20vessel%20specifications.`;

  // Komponen Reusable untuk Bento Grid Gambar Destinasi
  const DestinationsGallery = ({ className = "" }) => (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={`grid grid-cols-2 grid-rows-2 gap-3 md:gap-6 ${className}`}
    >
      {/* Top Left - Komodo */}
      <div className="col-span-1 row-span-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl group relative h-full">
        <img src={imgKomodo} alt="Komodo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent opacity-70 md:opacity-80"></div>
        <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-white font-heading font-bold tracking-wide text-sm md:text-lg lg:text-xl">Komodo Park</div>
      </div>

      {/* Top Right - Pink Beach */}
      <div className="col-span-1 row-span-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl group relative h-full">
        <img src={imgPinkBeach} alt="Pink Beach" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent opacity-70 md:opacity-80"></div>
        <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-white font-heading font-bold tracking-wide text-sm md:text-lg lg:text-xl">Pink Beach</div>
      </div>

      {/* Bottom Full Width - Padar Island */}
      <div className="col-span-2 row-span-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl group relative h-full">
        <img src={imgPadar} alt="Padar Island" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/20 to-transparent opacity-80 md:opacity-90"></div>
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white font-heading font-bold tracking-wide text-lg md:text-2xl lg:text-3xl">Padar Island</div>
      </div>
    </motion.div>
  );

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] overflow-x-hidden font-body">
      
      {/* 1. HERO SECTION (EDITORIAL & MODERN SHOWCASE) */}
      <section className="relative pt-28 pb-40 md:pt-40 md:pb-56 lg:pt-48 lg:pb-64 bg-[#0f172a] overflow-hidden flex flex-col items-center text-center px-5 border-b border-white/10">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#B88E52]/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-900/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto mt-6 md:mt-0"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 border border-white/10 text-[#B88E52] text-[10px] md:text-xs font-bold mb-6 md:mb-8 backdrop-blur-md uppercase tracking-widest shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Exclusive Fleet
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.15] drop-shadow-xl px-2">
            KM Pulau Mas 88
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed font-light px-4 md:px-0">
            Built for true adventure. Engineered for uncompromising safety. Discover the flagship vessel of {BRAND_NAME}'s expeditions.
          </motion.p>
        </motion.div>
      </section>

      {/* CONTAINER FOR OVERLAPPING ELEMENT & NEXT SECTION */}
      <div className="bg-[#f8f9fa] w-full relative">
        
        {/* 2. OVERLAPPING VESSEL SHOWCASE */}
        <section className="relative z-20 -mt-24 sm:-mt-32 md:-mt-40 lg:-mt-48 px-5 md:px-6 lg:px-12 max-w-7xl mx-auto w-full">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="relative rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-[#0f172a]/30 border-4 md:border-[8px] border-white aspect-[4/5] sm:aspect-square md:aspect-video bg-gray-100 group"
          >
            <img 
              src={imgVessel} 
              alt={`KM Pulau Mas 88 - ${BRAND_NAME}`} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            {/* Soft dark gradient at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent pointer-events-none opacity-80 md:opacity-100"></div>
            
            {/* Floating Stats Bar */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-[2rem] p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-y-4 md:gap-0 text-white shadow-2xl">
              <div className="text-center md:border-r border-white/10">
                 <span className="block text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 md:mb-1">Capacity</span>
                 <span className="font-heading text-xl sm:text-2xl md:text-4xl font-bold tracking-tight">46 Pax</span>
              </div>
              <div className="text-center md:border-r border-white/10">
                 <span className="block text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 md:mb-1">Crew</span>
                 <span className="font-heading text-xl sm:text-2xl md:text-4xl font-bold tracking-tight">8 Pro</span>
              </div>
              <div className="text-center md:border-r border-white/10">
                 <span className="block text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 md:mb-1">Vessel Type</span>
                 <span className="font-heading text-xl sm:text-2xl md:text-4xl font-bold tracking-tight">Phinisi</span>
              </div>
              <div className="text-center">
                 <span className="block text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 md:mb-1">Navigation</span>
                 <span className="font-heading text-xl sm:text-2xl md:text-4xl font-bold tracking-tight">GPS/Radar</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3. OVERVIEW & DESTINATIONS GALLERY */}
        <section className="py-16 md:py-24 lg:py-32 px-5 md:px-6 lg:px-12 relative z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88E52]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 items-start relative z-10">
            
            {/* LEFT SIDE: Text and Mobile Gallery Content */}
            <div className="w-full lg:w-1/2 flex flex-col">
              
              {/* Title Part */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="order-1 mb-6 md:mb-8"
              >
                <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 md:mb-3 block">The Experience</span>
                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#0f172a] leading-tight">
                  Designed for the <br className="hidden sm:block" /> Ultimate Voyage
                </h2>
              </motion.div>

              {/* MOBILE GALLERY (Muncul di bawah Title khusus di layar HP/Tablet kecil) */}
              <div className="lg:hidden order-2 mb-8 w-full">
                 <DestinationsGallery className="h-[350px] sm:h-[450px]" />
              </div>
              
              {/* Paragraphs */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="order-3 space-y-4 md:space-y-6"
              >
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Experience the untamed beauty of Komodo National Park with a premium sailing trip aboard our flagship vessel, <strong className="font-heading font-bold text-[#0f172a] tracking-wide">KM Pulau Mas 88</strong>. We bridge the gap between back-to-nature adventure and uncompromising comfort.
                </p>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Sail through stunning archipelagos, swim alongside majestic whale sharks, encounter legendary prehistoric dragons, and relax on pristine pink sands. Our vessel is your elegant floating sanctuary throughout this unforgettable 4D3N journey.
                </p>
              </motion.div>
              
              {/* Small Icons Section */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="order-4 pt-6 md:pt-8 mt-6 md:mt-8 border-t border-gray-200 flex items-center gap-4 md:gap-6"
              >
                 <div className="flex -space-x-3 md:-space-x-4">
                   <img src={imgWhaleShark} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="Wildlife" />
                   <img src={imgPadar} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="Landscapes" />
                   <img src={imgPinkBeach} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="Beaches" />
                 </div>
                 <p className="text-xs md:text-sm font-bold text-[#0f172a]">Unlocking 10+ <br/><span className="text-gray-500 font-normal">Breathtaking Destinations</span></p>
              </motion.div>

            </div>

            {/* RIGHT SIDE: Desktop Gallery (Disembunyikan di layar HP) */}
            <div className="hidden lg:block w-full lg:w-1/2 h-full">
              <DestinationsGallery className="h-[600px]" />
            </div>

          </div>
        </section>
      </div>

      {/* 4. BOAT SPECIFICATIONS - TECHNICAL SHEET STYLE */}
      <section className="py-16 md:py-24 px-5 md:px-6 lg:px-12 bg-white border-y border-gray-100 relative">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#B88E52]/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 md:gap-16 relative z-10">
          
          {/* Left Side: Sticky Title */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="w-full lg:w-1/3 lg:sticky lg:top-32 h-fit"
          >
            <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 md:mb-3 block flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Vessel Details
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6 leading-tight">Cruise <br className="hidden lg:block"/> Facilities</h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 md:mb-8 pr-4 md:pr-0">
              Engineered for comfort and safety. Explore the full technical capabilities and onboard amenities of our flagship vessel.
            </p>
            
            <div className="p-5 md:p-6 bg-[#f8f9fa] rounded-[1.5rem] md:rounded-2xl border border-gray-100 shadow-sm hidden lg:block">
              <Info className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52] mb-2 md:mb-3" />
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                <strong className="text-[#0f172a]">Important Note:</strong> WiFi availability depends on mobile signal coverage. Routes and activities may be adjusted to ensure passenger safety based on weather conditions.
              </p>
            </div>
          </motion.div>

          {/* Right Side: Specs List */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="w-full lg:w-2/3 flex overflow-x-auto md:grid md:grid-cols-2 gap-4 md:gap-x-12 md:gap-y-10 pb-8 md:pb-0 snap-x no-scrollbar -mx-5 px-5 md:mx-0 md:px-0"
          >
            {specifications.map((spec, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="bg-white md:bg-transparent border border-gray-100 md:border-none md:border-t md:border-gray-100 p-6 md:p-0 md:pt-6 rounded-[1.5rem] md:rounded-none min-w-[280px] w-[85vw] md:w-auto snap-center shrink-0 group flex flex-col shadow-sm md:shadow-none"
              >
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#f8f9fa] border border-[#B88E52]/20 flex items-center justify-center text-[#B88E52] shadow-sm group-hover:bg-[#B88E52] group-hover:text-white transition-colors duration-300 shrink-0">
                    {spec.icon}
                  </div>
                  <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a]">{spec.title}</h3>
                </div>
                <ul className="space-y-2 md:space-y-3 flex-grow">
                  {spec.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                      <span className="text-[#B88E52] mt-0.5 font-bold md:text-base text-sm">•</span>
                      <span className="leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Info Note untuk Mobile (Muncul di bawah Scroll List) */}
          <div className="p-5 bg-[#f8f9fa] rounded-[1.5rem] border border-gray-100 shadow-sm block lg:hidden mt-2">
             <Info className="w-5 h-5 text-[#B88E52] mb-2" />
             <p className="text-xs text-gray-600 leading-relaxed">
               <strong className="text-[#0f172a]">Important Note:</strong> WiFi availability depends on mobile signal coverage. Routes and activities may be adjusted to ensure passenger safety based on weather conditions.
             </p>
          </div>

        </div>
      </section>

      {/* 5. TECHNICAL DRAWINGS (DARK ARCHITECTURAL THEME) */}
      <section className="py-16 md:py-24 px-5 md:px-6 lg:px-12 bg-[#0b1728] text-white relative overflow-hidden">
        {/* Blueprint Grid Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-10 md:mb-16 lg:flex justify-between items-end gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <MapIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold text-xs md:text-sm uppercase tracking-widest">Architectural Blueprints</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">Technical Drawings & Plans</h2>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed font-light">
                Transparency is key to trust. Below are the structural arrangements, stability assessments, and emergency planning modules of our vessel, engineered for maximum operational safety.
              </p>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6 md:pb-0 snap-x no-scrollbar -mx-5 px-5 md:mx-0 md:px-0"
          >
            {technicalDocuments.map((doc, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-[#11223a]/50 backdrop-blur-md border border-blue-900/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] hover:bg-[#11223a] hover:border-blue-500/30 transition-all duration-300 group flex flex-col shadow-2xl min-w-[280px] w-[85vw] md:w-auto snap-center shrink-0"
              >
                <div className="mb-6 md:mb-8 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 origin-left">
                  {doc.icon}
                </div>
                <h3 className="font-heading text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-100 group-hover:text-blue-400 transition-colors leading-tight">{doc.title}</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 flex-grow font-light line-clamp-4">{doc.desc}</p>
                <a 
                  href={doc.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-500 group-hover:text-blue-400 transition-colors mt-auto uppercase tracking-widest"
                >
                  See Blueprint <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. GRID LEGAL DOCUMENTS SECTION */}
      <section className="py-16 md:py-24 px-5 md:px-6 lg:px-12 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-10 md:mb-16 max-w-3xl mx-auto">
            <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-2 md:mb-3 block">Compliance</span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#0f172a] mb-4 md:mb-6">Official Legality & Licensing</h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              As a proud entity of {BRAND_NAME}, we operate in strict compliance with Indonesian maritime tourism regulations. We are a direct operator, not a middleman. Explore our verified certificates below.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6 md:pb-0 snap-x no-scrollbar -mx-5 px-5 md:mx-0 md:px-0"
          >
            {safetyDocuments.map((doc, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-gray-100 hover:shadow-xl hover:border-[#B88E52]/20 hover:-translate-y-2 transition-all duration-300 group flex flex-col min-w-[280px] w-[85vw] md:w-auto snap-center shrink-0"
              >
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-[#fdfaf5] border border-[#B88E52]/20 flex items-center justify-center mb-5 md:mb-6 shadow-sm group-hover:bg-[#B88E52] group-hover:border-[#B88E52] transition-colors duration-300 shrink-0">
                   <div className="group-hover:text-white transition-colors duration-300">
                     {doc.icon}
                   </div>
                </div>
                
                <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mb-3 md:mb-4 group-hover:text-[#B88E52] transition-colors leading-tight">{doc.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 flex-grow line-clamp-4">
                  {doc.desc}
                </p>
                
                <div className="mt-auto pt-4 md:pt-6 border-t border-gray-100">
                  <a 
                    href={doc.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#0f172a] font-bold text-xs md:text-sm uppercase tracking-widest hover:text-[#B88E52] transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#B88E52]" /> View Certificate
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-16 md:py-24 px-5 text-center bg-white border-t border-gray-100">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto bg-[#0f172a] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#B88E52]/20 rounded-full blur-3xl pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-[#B88E52]/10 rounded-full blur-2xl pointer-events-none"></div>
           
           <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 relative z-10 leading-tight">Sail With Peace of Mind</h2>
           <p className="text-gray-300 mb-8 md:mb-10 text-sm md:text-lg lg:text-xl relative z-10 max-w-2xl mx-auto font-light leading-relaxed px-2 md:px-0">
             Our verified vessels and expert crew are ready to guide you safely through the breathtaking landscapes of Komodo National Park.
           </p>
           <a 
              href={generalWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 md:px-10 md:py-5 rounded-full bg-gradient-to-r from-[#B88E52] to-[#a37c46] hover:from-[#a37c46] hover:to-[#8c693b] text-white font-bold text-sm md:text-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(184,142,82,0.3)] md:shadow-[0_0_30px_rgba(184,142,82,0.4)] transform hover:scale-105 relative z-10 w-full sm:w-auto"
            >
              Consult With Our Team <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </a>
        </motion.div>
      </section>

    </main>
  );
}