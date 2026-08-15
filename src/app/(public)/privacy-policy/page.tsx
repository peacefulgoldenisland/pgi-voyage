'use client';

import { ShieldCheck, Lock, FileText, Mail, ChevronRight, BookOpen } from "lucide-react";
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

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 20, 2026";
  const [activeSection, setActiveSection] = useState("section-intro");

  // Intersection Observer untuk mendeteksi bagian mana yang sedang dibaca
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["section-intro", "section-1", "section-2", "section-3", "section-4", "section-5", "section-6", "section-7", "section-8", "section-9"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust threshold untuk deteksi yang lebih baik
          if (rect.top <= 200 && rect.bottom >= 200) {
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
    { id: "section-1", label: "1. Information We Collect" },
    { id: "section-2", label: "2. How We Use Information" },
    { id: "section-3", label: "3. Sharing Information" },
    { id: "section-4", label: "4. Data Security" },
    { id: "section-5", label: "5. Your Rights" },
    { id: "section-6", label: "6. Third-Party Links" },
    { id: "section-7", label: "7. Cookies Policy" },
    { id: "section-8", label: "8. Data Retention" },
    { id: "section-9", label: "9. Policy Changes" },
  ];

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] min-h-screen overflow-x-hidden font-body">
      
      {/* HERO SECTION */}
      <section className="relative pt-28 pb-32 md:pt-40 md:pb-48 lg:pt-48 lg:pb-56 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?q=80&w=1920&auto=format&fit=crop')" }}
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
            <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Legal Document
          </motion.div>
          <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.15] px-2 drop-shadow-sm">
            Privacy <br className="hidden sm:block" />
            <span className="italic font-serif text-[#B88E52]">Policy</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light px-4 md:px-0">
            We are committed to protecting your privacy. Learn how {BRAND_NAME} collects, uses, and safeguards your exclusive data.
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
              <h3 className="font-heading font-bold text-[#0f172a] text-lg">Contents</h3>
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
                <Lock className="w-4 h-4" /> Secure Data
              </div>
            </div>

            <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none text-gray-600">
              
              <div id="section-intro" className="scroll-mt-32">
                <p className="text-lg md:text-xl text-[#0f172a] mb-10 leading-relaxed font-medium">
                  At <strong className="text-[#B88E52]">{BRAND_NAME}</strong>, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you visit our website, make an exclusive booking, or use our premium services.
                  <br /><br />
                  By accessing our website and using our services, you agree to the terms of this Privacy Policy.
                </p>
              </div>

              <div className="space-y-12 md:space-y-16">
                
                {/* Section 1 */}
                <div id="section-1" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">1</span>
                    Information We Collect
                  </h2>
                  <p className="mb-6 leading-relaxed">We may collect the following types of information to provide and improve our services:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <strong className="font-heading text-[#0f172a] block mb-2 text-base md:text-lg">Personal Information</strong>
                      <span className="text-sm md:text-base leading-relaxed">This may include your name, email address, phone number, billing details, and payment information when you make a reservation or contact our team.</span>
                    </div>
                    <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <strong className="font-heading text-[#0f172a] block mb-2 text-base md:text-lg">Booking Information</strong>
                      <span className="text-sm md:text-base leading-relaxed">This may include your travel dates, selected package, number of guests, cabin preferences, special dietary requests, and trip-related details.</span>
                    </div>
                    <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <strong className="font-heading text-[#0f172a] block mb-2 text-base md:text-lg">Technical Data</strong>
                      <span className="text-sm md:text-base leading-relaxed">We may collect technical information such as your IP address, browser type, device type, pages visited, and browsing behavior on our website.</span>
                    </div>
                    <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <strong className="font-heading text-[#0f172a] block mb-2 text-base md:text-lg">Cookies & Tracking</strong>
                      <span className="text-sm md:text-base leading-relaxed">We may use cookies to improve user experience, analyze website traffic, remember preferences, and personalize content.</span>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div id="section-2" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">2</span>
                    How We Use Your Information
                  </h2>
                  <p className="mb-4 leading-relaxed">We use your information to:</p>
                  <ul className="list-disc list-outside ml-6 space-y-3 marker:text-[#B88E52]">
                    <li className="pl-2">Process bookings and payments securely.</li>
                    <li className="pl-2">Communicate with you about your reservation and itinerary.</li>
                    <li className="pl-2">Provide highly responsive concierge and customer support.</li>
                    <li className="pl-2">Improve our website, services, and overall guest experience.</li>
                    <li className="pl-2">Send promotional offers or newsletters (only with your explicit consent).</li>
                    <li className="pl-2">Prevent fraud and protect website security.</li>
                    <li className="pl-2">Comply with legal, regulatory, or tax obligations.</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div id="section-3" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">3</span>
                    How We Share Your Information
                  </h2>
                  <p className="mb-6 leading-relaxed">We do not sell, rent, or trade your personal information. However, we may share your data with trusted third parties when necessary, including:</p>
                  <ul className="space-y-5">
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#B88E52] mt-2 shrink-0"></div>
                      <div>
                        <strong className="font-heading text-[#0f172a] text-lg block mb-1">Service Providers</strong>
                        <span className="leading-relaxed">Such as premium payment processors, booking systems, customer support tools, email services, and trusted marketing partners that help us operate securely.</span>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#B88E52] mt-2 shrink-0"></div>
                      <div>
                        <strong className="font-heading text-[#0f172a] text-lg block mb-1">Legal Compliance</strong>
                        <span className="leading-relaxed">We may disclose your information if required by law, regulation, legal process, or legitimate government authority requests.</span>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#B88E52] mt-2 shrink-0"></div>
                      <div>
                        <strong className="font-heading text-[#0f172a] text-lg block mb-1">Business Transfers</strong>
                        <span className="leading-relaxed">If {BRAND_NAME} is involved in a merger, acquisition, sale, or transfer of assets, your information may be transferred as part of that transaction.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Section 4 */}
                <div id="section-4" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">4</span>
                    Data Security
                  </h2>
                  <p className="leading-relaxed">
                    We take reasonable steps to protect your personal information from unauthorized access, loss, misuse, or disclosure. However, no method of data transmission over the internet or electronic storage is completely secure. Therefore, we cannot guarantee absolute security, and we encourage guests to take appropriate precautions when submitting sensitive data.
                  </p>
                </div>

                {/* Section 5 */}
                <div id="section-5" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">5</span>
                    Your Rights and Choices
                  </h2>
                  <p className="mb-4 leading-relaxed">You hold the following rights regarding your data:</p>
                  <ul className="list-disc list-outside ml-6 space-y-3 mb-6 marker:text-[#B88E52]">
                    <li className="pl-2">Access your personal information that we store.</li>
                    <li className="pl-2">Request correction or updates to inaccurate data.</li>
                    <li className="pl-2">Request deletion of your personal information.</li>
                    <li className="pl-2">Opt out of promotional emails or newsletters at any time.</li>
                    <li className="pl-2">Disable cookies through your browser settings.</li>
                  </ul>
                  <p className="leading-relaxed bg-[#fdfaf5] p-4 rounded-xl border border-[#B88E52]/20 text-sm md:text-base">
                    For privacy-related requests, please contact our concierge through the official contact information provided on our website.
                  </p>
                </div>

                {/* Section 6 */}
                <div id="section-6" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">6</span>
                    Third-Party Links
                  </h2>
                  <p className="leading-relaxed">
                    Our website may contain links to third-party websites, booking platforms, payment providers, or travel-related services. We are not responsible for the privacy practices, content, or security of third-party websites. We strongly recommend reviewing their privacy policies before providing any personal information.
                  </p>
                </div>

                {/* Section 7 */}
                <div id="section-7" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">7</span>
                    Cookies Policy
                  </h2>
                  <p className="mb-4 leading-relaxed">
                    Cookies are small files stored on your device to help improve website functionality and user experience. We may use cookies to:
                  </p>
                  <ul className="list-disc list-outside ml-6 space-y-2 mb-6 marker:text-gray-400">
                    <li className="pl-2">Remember user preferences.</li>
                    <li className="pl-2">Analyze website traffic to optimize layout.</li>
                    <li className="pl-2">Improve website performance and load times.</li>
                    <li className="pl-2">Support marketing and advertising activities.</li>
                  </ul>
                  <p className="leading-relaxed">
                    You can choose to disable cookies through your browser settings. However, some website features may not function properly if cookies are disabled.
                  </p>
                </div>

                {/* Section 8 */}
                <div id="section-8" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">8</span>
                    Data Retention
                  </h2>
                  <p className="leading-relaxed">
                    We retain your personal information only as long as necessary to provide our services, complete bookings, comply with legal obligations, resolve disputes, and maintain business records. When your information is no longer needed, we will take reasonable and secure steps to delete or anonymize it.
                  </p>
                </div>

                {/* Section 9 */}
                <div id="section-9" className="scroll-mt-32">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#B88E52]/10 text-[#B88E52] text-sm md:text-base shrink-0">9</span>
                    Changes to This Privacy Policy
                  </h2>
                  <p className="leading-relaxed">
                    {BRAND_NAME} may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date. We encourage visitors to review this page regularly to stay informed about how we protect personal information.
                  </p>
                </div>

                {/* Contact Box */}
                <div className="bg-[#0f172a] p-8 md:p-10 lg:p-12 rounded-[1.5rem] md:rounded-[2rem] border border-[#1e293b] mt-16 text-center relative overflow-hidden shadow-2xl">
                  {/* Blurs */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#B88E52]/20 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg border border-white/20 relative z-10">
                    <Mail className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 relative z-10">Questions About Privacy?</h2>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed relative z-10 max-w-xl mx-auto">
                    If you have any questions about this Privacy Policy or how your personal information is handled by {BRAND_NAME}, please feel free to reach out to our support team.
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