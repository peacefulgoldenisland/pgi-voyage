'use client';

import { MapPin, Compass, Mail } from "lucide-react";
import { BRAND_NAME, CONTACT, SOCIAL_MEDIA } from "@/lib/constants";

export default function PublicFooter() {
  // Format nomor WA otomatis (menghilangkan spasi dan karakter khusus)
  const waNumber1 = CONTACT.PHONE_1.replace(/\D/g, '');
  const waNumber2 = CONTACT.PHONE_2.replace(/\D/g, '');

  return (
    <footer className="bg-[#0f172a] pt-20 pb-10 border-t border-white/5 mt-auto relative overflow-hidden font-body">
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
        <Compass className="w-96 h-96 text-[#B88E52]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand Profile */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-6">
               <div className="bg-white/95 p-1 rounded-full shadow-[0_0_15px_rgba(184,142,82,0.15)] flex items-center justify-center overflow-hidden w-12 h-12 border border-white/20">
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
                <span className="text-white font-heading font-semibold text-lg tracking-widest uppercase">
                  {BRAND_NAME}
                </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Redefining premium liveaboard experiences across the Indonesian archipelago. Explore Komodo in unrivaled elegance and supreme safety.
            </p>
            
            <h4 className="text-white font-bold mb-4 tracking-widest uppercase text-xs">Follow Us</h4>
            <div className="flex gap-4">
              <a href={SOCIAL_MEDIA.INSTAGRAM} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#B88E52] hover:border-[#B88E52] hover:bg-[#B88E52]/10 transition-all">
                {/* Instagram SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href={SOCIAL_MEDIA.FACEBOOK} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#B88E52] hover:border-[#B88E52] hover:bg-[#B88E52]/10 transition-all">
                {/* Facebook SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links (Cleaned Up) */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Explore</h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-400 hover:text-[#B88E52] transition-colors text-sm">Home</a></li>
              <li><a href="/about-us" className="text-gray-400 hover:text-[#B88E52] transition-colors text-sm">Our Story</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-[#B88E52] transition-colors text-sm">Journal & News</a></li>
              <li><a href="/faq" className="text-gray-400 hover:text-[#B88E52] transition-colors text-sm">FAQ & Help</a></li>
            </ul>
          </div>

          {/* Column 3: Digital Portal */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Ecosystem</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#B88E52] transition-colors text-sm flex items-center gap-2">Member Login (B2C)</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#B88E52] transition-colors text-sm flex items-center gap-2">Agent Portal (B2B)</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#B88E52] transition-colors text-sm flex items-center gap-2">Claim Welcome Voucher</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Contact Us</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-5 h-5 text-[#B88E52] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{CONTACT.ADDRESS}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-5 h-5 text-[#B88E52] shrink-0" />
                <a href={`mailto:${CONTACT.EMAIL}`} className="hover:text-[#B88E52] transition-colors">{CONTACT.EMAIL}</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                {/* WhatsApp Custom SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#B88E52] shrink-0 mt-0.5">
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                </svg>
                <div className="flex flex-col gap-2">
                  <a href={`https://wa.me/${waNumber1}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#B88E52] transition-colors">{CONTACT.PHONE_1}</a>
                  <a href={`https://wa.me/${waNumber2}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#B88E52] transition-colors">{CONTACT.PHONE_2}</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 tracking-wide">
            © {new Date().getFullYear()} {BRAND_NAME}. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500 tracking-wide">
            <a href="/privacy-policy" className="hover:text-[#B88E52] transition-colors">Privacy Policy</a>
            <a href="/terms-and-conditions" className="hover:text-[#B88E52] transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 