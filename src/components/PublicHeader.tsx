'use client';

import { useState } from "react";
import { usePathname } from "next/navigation"; // 🔥 Tambahan untuk deteksi Tab Aktif
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react"; // 🔥 Tambahan ChevronDown
import { BRAND_NAME, CONTACT } from "@/lib/constants";

// STRUKTUR NAVIGASI
const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'Our Expedition', href: '/expedition' },
  { 
    name: 'DISCOVER', 
    dropdown: [ 
      { name: 'About Us', href: '/about-us' },
      { name: 'The Vessel & Safety', href: '/boat-details' },
      { name: 'Guest Reviews', href: '/review' },
      { name: 'FAQ', href: '/faq' },
    ]
  },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Blog', href: '/blog' }
];

export default function PublicHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false); // State khusus Dropdown Mobile

  // Format nomor WA otomatis dari constants
  const waNumber = CONTACT.PHONE_1.replace(/\D/g, '');
  const b2cWaLink = `https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(BRAND_NAME)},%20I%20want%20to%20sign%20up%20and%20claim%20my%20exclusive%20Welcome%20Voucher!`;

  // Logika Smart Header
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }

    if (latest > 150 && latest > previous) {
      setHidden(true);
      setMobileMenuOpen(false); 
      setMobileAboutOpen(false); // Reset accordion mobile saat scroll
    } else {
      setHidden(false);
    }
  });

  // Fungsi deteksi menu aktif
  const isActive = (item: any) => {
    if (item.href) {
      // Logic khusus Home agar tidak aktif di semua sub-path
      if (item.href === '/') return pathname === '/';
      return pathname.startsWith(item.href);
    }
    if (item.dropdown) {
      return item.dropdown.some((sub: any) => pathname.startsWith(sub.href));
    }
    return false;
  };

  return (
    <>
      <motion.header 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
          isScrolled 
            ? "bg-[#0f172a]/90 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-[#0f172a]/20 py-3" 
            : "bg-transparent py-5 lg:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* LOGO & BRANDING */}
          <div className="flex items-center gap-3">
            <a href="/" className="group flex items-center gap-4">
              <div className="bg-white/95 p-1 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(184,142,82,0.3)] flex items-center justify-center overflow-hidden w-11 h-11 lg:w-12 lg:h-12 border border-white/20">
                <img 
                  src="/LOGO-KOMODO-GILI.png" 
                  alt={`${BRAND_NAME} Logo`} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-[#0f172a] font-bold text-xs">GIV</span>';
                  }}
                />
              </div>
              <span className="text-white font-heading font-semibold text-lg lg:text-xl tracking-wide group-hover:text-[#B88E52] transition-colors duration-300">
                {BRAND_NAME}
              </span>
            </a>
          </div>
          
          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-10">
            <nav className="flex items-center gap-8 text-xs font-body font-medium uppercase tracking-widest text-white/90">
              {NAV_ITEMS.map((item) => (
                item.dropdown ? (
                  /* DESKTOP DROPDOWN (ABOUT) */
                  <div key={item.name} className="relative group py-2">
                    <button className={`flex items-center gap-1.5 transition-colors duration-300 ${isActive(item) ? 'text-[#B88E52]' : 'hover:text-[#B88E52]'}`}>
                      {item.name} 
                      <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                    {/* Garis Bawah Aktif (Parent) */}
                    <span className={`absolute bottom-0 left-0 h-[2px] bg-[#B88E52] rounded-full transition-all duration-300 ${isActive(item) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>

                    {/* Dropdown Box */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex flex-col py-2 z-50">
                      {item.dropdown.map(subItem => (
                        <a 
                          key={subItem.name} 
                          href={subItem.href} 
                          className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center gap-2 ${
                            pathname === subItem.href ? 'text-[#B88E52] bg-white/5' : 'text-white/80 hover:text-[#B88E52]'
                          }`}
                        >
                          {/* Garis aktif vertikal di dalam dropdown */}
                          <span className={`w-1 h-1 rounded-full transition-colors ${pathname === subItem.href ? 'bg-[#B88E52]' : 'bg-transparent'}`}></span>
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* DESKTOP NORMAL LINK */
                  <a key={item.name} href={item.href} className={`relative py-2 group transition-colors duration-300 ${isActive(item) ? 'text-[#B88E52]' : 'hover:text-[#B88E52]'}`}>
                    <span>{item.name}</span>
                    {/* Garis Bawah Aktif */}
                    <span className={`absolute bottom-0 left-0 h-[2px] bg-[#B88E52] rounded-full transition-all duration-300 ${isActive(item) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </a>
                )
              ))}
            </nav>
            
            <div className="w-px h-6 bg-white/20"></div>

            <a 
              href={b2cWaLink}
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center gap-2 bg-gradient-to-r from-[#B88E52] to-[#a37c46] hover:from-[#a37c46] hover:to-[#8c693b] text-white px-7 py-3 rounded-full font-body font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(184,142,82,0.4)] hover:shadow-[0_6px_25px_rgba(184,142,82,0.6)] transform hover:-translate-y-0.5"
            >
              Reserve Now
            </a>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button 
            className="lg:hidden text-white p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* MOBILE DROPDOWN MENU */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="fixed top-[70px] left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 z-40 overflow-hidden lg:hidden"
      >
        <div className="px-6 py-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            item.dropdown ? (
              /* MOBILE ACCORDION (ABOUT) */
              <div key={item.name} className="flex flex-col border-b border-white/10 pb-4">
                <button
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  className={`flex items-center justify-between font-body font-bold uppercase tracking-widest text-xs transition-colors ${isActive(item) ? 'text-[#B88E52]' : 'text-white/90'}`}
                >
                  {item.name}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileAboutOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-col gap-4 overflow-hidden"
                    >
                      <div className="pt-4 pl-4 flex flex-col gap-4 border-l-2 border-white/5 ml-2 mt-2">
                        {item.dropdown.map(subItem => (
                          <a 
                            key={subItem.name} 
                            href={subItem.href} 
                            className={`font-body font-medium uppercase tracking-widest text-[10px] transition-colors ${pathname === subItem.href ? 'text-[#B88E52]' : 'text-white/70 hover:text-[#B88E52]'}`}
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* MOBILE NORMAL LINK */
              <a 
                key={item.name} 
                href={item.href} 
                className={`font-body font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-4 transition-colors ${
                  isActive(item) ? 'text-[#B88E52] border-[#B88E52]/30' : 'text-white/90'
                }`}
              >
                {item.name}
              </a>
            )
          ))}
          
          <a 
            href={b2cWaLink} 
            className="mt-2 bg-gradient-to-r from-[#B88E52] to-[#a37c46] text-center text-white py-4 rounded-xl font-body font-bold uppercase tracking-widest text-xs shadow-lg"
          >
            Reserve Now
          </a>
        </div>
      </motion.div>
    </>
  );
}