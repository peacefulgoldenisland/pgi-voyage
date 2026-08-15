'use client';

import { ShieldCheck, FileText, AlertTriangle, Scale, BookOpen, ChevronRight } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { BRAND_NAME } from "@/lib/constants";

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

export default function TermsAndConditionsPage() {
  const lastUpdated = "June 20, 2026";
  const [activeSection, setActiveSection] = useState("section-intro");

  // Intersection Observer untuk mendeteksi bagian mana yang sedang dibaca
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["section-intro", "section-1", "section-2", "section-3", "section-4", "section-5"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Ruang bernafas di atas saat di scroll
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  const navItems = [
    { id: "section-intro", label: "Introduction" },
    { id: "section-1", label: "1. Booking and Payment" },
    { id: "section-2", label: "2. Cancellation & Amendment" },
    { id: "section-3", label: "3. Travel & Participation" },
    { id: "section-4", label: "4. Accommodation & Risks" },
    { id: "section-5", label: "5. General Provisions" },
  ];

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] min-h-screen overflow-x-hidden font-body">
      
      {/* HERO SECTION */}
      <section className="relative pt-28 pb-32 md:pt-40 md:pb-48 lg:pt-48 lg:pb-56 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1920&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-[#0f172a]/80 to-[#0f172a]/50"></div>
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#B88E52]/10 rounded-full blur-[80px] md:blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-3xl mx-auto text-center mt-6 md:mt-0"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-1.5 md:gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 border border-white/10 text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 backdrop-blur-md shadow-sm">
            <Scale className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Legal Agreement
          </motion.div>
          <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.15] px-2 drop-shadow-sm">
            Terms & <br className="hidden sm:block" />
            <span className="italic font-serif text-[#B88E52]">Conditions</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light px-4 md:px-0">
            Please read these terms carefully before booking your sailing adventure with {BRAND_NAME}.
          </motion.p>
        </motion.div>
      </section>

      {/* CONTENT SECTION WITH SIDEBAR */}
      <section className="px-5 md:px-6 lg:px-12 mt-[-60px] md:mt-[-100px] relative z-20 pb-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* SIDEBAR NAVIGATION (Hanya Desktop) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block w-1/4 sticky top-32 shrink-0 bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-6">
              <BookOpen className="w-6 h-6 text-[#B88E52]" />
              <h3 className="font-heading font-bold text-[#0f172a] text-lg">Table of Contents</h3>
            </div>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${
                      activeSection === item.id 
                        ? 'bg-[#fdfaf5] text-[#B88E52] border border-[#B88E52]/20 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#0f172a] border border-transparent'
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && <ChevronRight className="w-4 h-4 text-[#B88E52]" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* MAIN DOCUMENT AREA */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="w-full lg:w-3/4 bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 lg:p-16 shadow-2xl shadow-[#0f172a]/5 border border-gray-100"
          >
            <div className="mb-10 md:mb-16 pb-6 md:pb-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Last Updated: <span className="text-[#0f172a] font-bold">{lastUpdated}</span></p>
              <div className="inline-flex items-center gap-2 text-xs md:text-sm text-[#B88E52] font-semibold bg-[#fdfaf5] px-4 py-2 rounded-lg border border-[#B88E52]/20 w-max">
                <AlertTriangle className="w-4 h-4" /> Binding Contract
              </div>
            </div>

            <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none text-gray-600">
              
              <div id="section-intro" className="scroll-mt-32">
                <p className="text-lg md:text-xl text-[#0f172a] mb-10 leading-relaxed font-medium">
                  Welcome to <strong className="text-[#B88E52]">{BRAND_NAME}</strong>. We are excited to have you join us for an unforgettable luxury sailing adventure to Komodo National Park. By booking and participating in our tour, you confirm that you have read, understood, and agreed to the following Terms & Conditions.
                </p>
              </div>

              <div className="space-y-12 md:space-y-16">
                
                {/* Section 1 */}
                <div id="section-1" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="text-[#B88E52]">1.</span> Booking and Payment
                  </h2>
                  
                  <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mt-6 mb-3">Booking Process</h3>
                  <p className="mb-5 leading-relaxed">
                    Bookings can be made through our official website, direct communication with our team, or through our authorized partners. We encourage guests to book directly with {BRAND_NAME} so our concierge team can personally assist with booking details, trip information, special requests, and any questions before departure. A booking confirmation will be sent after your reservation and payment have been successfully received.
                  </p>

                  <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mt-8 mb-3">Payment Terms</h3>
                  <ul className="list-disc list-outside ml-6 space-y-3 mb-5 marker:text-[#B88E52]">
                    <li className="pl-2">To secure a booking, a deposit of <strong>50% of the total trip price</strong> is required.</li>
                    <li className="pl-2">The remaining balance must be paid at least <strong>7 days before the departure date</strong>.</li>
                    <li className="pl-2">We accept payment through bank transfer and other available payment methods confirmed by our team.</li>
                  </ul>

                  <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mt-8 mb-3">Pricing</h3>
                  <p className="mb-4 leading-relaxed">The tour price includes accommodation as described, meals onboard, selected activities, and facilities mentioned in the trip package.</p>
                  <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100">
                    <p className="mb-3 font-bold text-[#0f172a]">The price does not include:</p>
                    <ul className="list-disc list-outside ml-6 space-y-2 marker:text-gray-400 text-sm md:text-base">
                      <li className="pl-2">Flights to or from the departure point</li>
                      <li className="pl-2">Personal expenses & alcoholic beverages</li>
                      <li className="pl-2">Travel insurance</li>
                      <li className="pl-2">Optional activities not stated in the itinerary</li>
                      <li className="pl-2">Additional services outside the package</li>
                    </ul>
                  </div>
                </div>

                {/* Section 2 */}
                <div id="section-2" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="text-[#B88E52]">2.</span> Cancellation and Amendment
                  </h2>
                  
                  <div className="bg-[#fdfaf5] p-6 md:p-8 rounded-2xl border border-[#B88E52]/20 mb-8 shadow-sm">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" /> Cancellation by Guest
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="text-[#B88E52] font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">Cancellations made <strong>60 days or more</strong> before departure may be eligible for a full refund, excluding administrative fees, transaction fees, and bank charges.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#B88E52] font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">Cancellations made <strong>within 30 days</strong> before departure may be subject to a 50% cancellation fee.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#B88E52] font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">Cancellations made <strong>less than 30 days</strong> before departure are generally non-refundable.</span>
                      </li>
                    </ul>
                    <div className="mt-5 p-3 md:p-4 bg-white/60 rounded-xl text-xs md:text-sm text-gray-500 italic border border-[#B88E52]/10">
                      Note: Booking changes are subject to availability and may involve additional administrative or operational fees.
                    </div>
                  </div>

                  <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mt-8 mb-3">Cancellation or Amendment by {BRAND_NAME}</h3>
                  <p className="mb-4 leading-relaxed">
                    We reserve the right to cancel, delay, or amend tours due to unforeseen circumstances, including but not limited to: severe weather, rough sea conditions, safety concerns, technical issues, port authority regulations, or logistical matters.
                  </p>
                  <p className="mb-4 leading-relaxed">
                    If a tour is cancelled by our team, guests may be offered a refund or the option to reschedule to another available date. {BRAND_NAME} is not responsible for additional costs or losses caused by tour cancellations, delays, or itinerary changes, including flights, hotels, transport, or other personal arrangements.
                  </p>
                </div>

                {/* Section 3 */}
                <div id="section-3" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="text-[#B88E52]">3.</span> Travel and Participation
                  </h2>
                  
                  <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mt-6 mb-3">Health and Fitness</h3>
                  <p className="mb-6 leading-relaxed">
                    Our luxury sailing trips are designed for comfort, but involve natural exploration. Guests with health concerns, medical conditions, pregnancy, physical limitations, or special needs should consult a doctor before booking and strictly inform our team in advance.
                  </p>

                  <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mt-6 mb-3">Travel Insurance</h3>
                  <p className="mb-6 leading-relaxed border-l-4 border-[#B88E52] pl-4 bg-gray-50 py-3 pr-4 rounded-r-xl">
                    We <strong>strongly recommend</strong> that all guests purchase comprehensive travel insurance covering medical expenses, trip cancellation, travel delays, personal liability, and emergency evacuation. Travel insurance is the strict responsibility of each guest.
                  </p>

                  <h3 className="font-heading text-lg md:text-xl font-bold text-[#0f172a] mt-6 mb-3">Guest Conduct & Safety</h3>
                  <p className="mb-4 leading-relaxed">
                    Guests are expected to respect local culture, fellow travelers, crew, wildlife, and the environment. Disruptive or unsafe behavior may result in removal from the tour without refund.
                  </p>
                  <p className="leading-relaxed">
                    Guests must follow all safety instructions provided by the captain and crew. Failure to follow safety instructions may put yourself and others at risk. Guest safety will always be our supreme priority.
                  </p>
                </div>

                {/* Section 4 */}
                <div id="section-4" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="text-[#B88E52]">4.</span> Accommodation & Risks
                  </h2>
                  
                  <p className="mb-6 leading-relaxed">
                    <strong className="text-[#0f172a]">Accommodation & Meals:</strong> Accommodation onboard depends on the selected boat and package. Private cabins are subject to availability. Meals are provided onboard and specially prepared by our chef. Guests with dietary restrictions or food allergies MUST inform our team before departure.
                  </p>
                  
                  <p className="mb-4 leading-relaxed">
                    <strong className="text-[#0f172a]">Adventure Risks & Wildlife:</strong> Guests understand that sailing trips involve natural risks (weather, sea conditions, trekking). By joining, guests participate voluntarily. Wildlife sightings (dragons, manta rays, etc.) are not guaranteed as they live freely in their natural habitat.
                  </p>
                </div>

                {/* Section 5 */}
                <div id="section-5" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="text-[#B88E52]">5.</span> General Provisions
                  </h2>
                  
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#0f172a] shrink-0 mt-1">A</div>
                      <div>
                        <strong className="font-heading text-[#0f172a] text-lg block mb-1">Limitation of Liability</strong>
                        <span className="leading-relaxed block">{BRAND_NAME} shall not be held responsible for injury, illness, loss, damage, or delay caused by weather, natural disasters, government regulations, third-party services, or events beyond our control. Our liability is limited to the amount paid for the tour package.</span>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#0f172a] shrink-0 mt-1">B</div>
                      <div>
                        <strong className="font-heading text-[#0f172a] text-lg block mb-1">Personal Belongings</strong>
                        <span className="leading-relaxed block">Guests are responsible for their own personal belongings. We are not liable for lost, stolen, or damaged items during the trip or transfers.</span>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#0f172a] shrink-0 mt-1">C</div>
                      <div>
                        <strong className="font-heading text-[#0f172a] text-lg block mb-1">Environmental Responsibility</strong>
                        <span className="leading-relaxed block">Guests are expected to help protect Komodo National Park. Do not throw trash into the sea, touch coral reefs, or disturb wildlife in any form.</span>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#0f172a] shrink-0 mt-1">D</div>
                      <div>
                        <strong className="font-heading text-[#0f172a] text-lg block mb-1">Governing Law</strong>
                        <span className="leading-relaxed block">These Terms & Conditions are governed exclusively by the laws of the Republic of Indonesia.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Final Agreement */}
                <div className="bg-[#0f172a] p-8 md:p-10 lg:p-12 rounded-[1.5rem] md:rounded-[2rem] border border-[#1e293b] mt-16 text-center relative overflow-hidden shadow-2xl">
                  {/* Blurs */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#B88E52]/20 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-[#B88E52] mx-auto mb-4 md:mb-6 relative z-10" />
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 relative z-10">Final Agreement</h2>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed relative z-10 max-w-xl mx-auto">
                    By completing your booking and joining our tour, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
                  </p>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </main>
  );
} 