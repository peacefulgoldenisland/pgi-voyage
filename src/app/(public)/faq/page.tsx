'use client';

import { useState } from "react";
import { LifeBuoy, Wallet, Anchor, ChevronDown, Mail, ArrowRight, MessageSquare } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { BRAND_NAME, CONTACT } from "@/lib/constants";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
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

const faqData = [
  {
    category: "General Information",
    icon: <Anchor className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    desc: "Essential details to know before embarking on your liveaboard journey.",
    questions: [
      {
        q: "What does the expedition package cover?",
        a: "Our exclusive packages typically include premium accommodation onboard, chef-prepared daily meals, drinking water, coffee/tea, snorkeling gear (mask and snorkel), an English-speaking guide, and designated land transfers. Please review your specific itinerary for complete inclusions."
      },
      {
        q: "Where does the journey begin?",
        a: "Meeting points vary based on your selected route. For our Lombok departures, we arrange pick-ups from designated locations (Mataram, Senggigi, Kuta, or Bangsal for Gili Islands guests) before transferring to the departure harbor."
      },
      {
        q: "What essentials should I pack?",
        a: "Pack light and practical. Essentials include swimwear, a quick-dry towel, high SPF sunscreen, sunglasses, personal medications (especially motion sickness pills), a dry bag, a reliable power bank, and basic toiletries."
      },
      {
        q: "Is this trip family-friendly?",
        a: "Yes, children are welcome onboard! However, for their safety, they must remain under strict parental or guardian supervision, particularly during water activities, trekking, and while moving around the decks."
      },
      {
        q: "Can non-swimmers participate?",
        a: "Absolutely. While swimming enhances the experience, it is not mandatory. We provide life jackets for all guests, and our professional crew is always ready to assist you during water-based activities."
      },
      {
        q: "Are the itineraries fixed?",
        a: "Sailing is deeply connected to nature. While we aim to follow the planned route, the captain holds the final authority to modify the itinerary based on weather, sea conditions, or harbor regulations to ensure everyone's supreme safety."
      }
    ]
  },
  {
    category: "The Vessel & Facilities",
    icon: <LifeBuoy className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    desc: "Details regarding your comfort, safety, and amenities onboard.",
    questions: [
      {
        q: "What amenities can I expect onboard?",
        a: "Our vessels are equipped with premium liveaboard necessities: modern life-saving equipment, first-aid kits, well-maintained shared bathrooms, an elegant dining space, an open sun deck for relaxation, daily gourmet meals, and a dedicated service crew."
      },
      {
        q: "Are there proper bathrooms onboard?",
        a: "Yes, our vessels feature shared toilet and shower facilities. Freshwater is available but must be used mindfully, as supply is carefully managed during the multi-day sea crossing."
      },
      {
        q: "Do I need to bring my own snorkeling gear?",
        a: "We provide high-quality basic snorkeling masks and tubes. However, if you prefer a customized fit or require specific fins, we highly recommend bringing your personal equipment."
      },
      {
        q: "How do you ensure passenger safety?",
        a: "Safety is our absolute priority. Our boats comply strictly with national maritime regulations and carry inflatable life rafts, life jackets, fire extinguishers, marine radios, and an experienced crew extensively trained for emergencies."
      },
      {
        q: "Can I charge my devices onboard?",
        a: "Yes, the boat has electricity, primarily supplied by a generator. Charging stations are available, but since power can be intermittent, bringing a high-capacity power bank is highly advised."
      },
      {
        q: "Will I have Wi-Fi access?",
        a: "While some areas may have intermittent mobile signal, Wi-Fi is generally not provided or reliable. Consider this voyage a wonderful opportunity to disconnect and immerse yourself in the natural world."
      },
      {
        q: "What are the sleeping arrangements?",
        a: "Depending on your selected package, you can rest in a Premium Private Suite (ideal for couples seeking privacy) or a Comfortable Shared Cabin. All spaces are optimized for practical luxury during the crossing."
      }
    ]
  },
  {
    category: "Pricing & Reservations",
    icon: <Wallet className="w-6 h-6 md:w-8 md:h-8 text-[#B88E52]" />,
    desc: "Information regarding costs, deposits, and booking procedures.",
    questions: [
      {
        q: "How are the expedition rates determined?",
        a: "Pricing varies based on the chosen route, duration, cabin category, and seasonality. For the most accurate and up-to-date rates, please refer to our booking portal or contact our concierge directly."
      },
      {
        q: "Are rates per individual or per group?",
        a: "For our scheduled shared expeditions (Open Trips), prices are quoted per person. For Private Charters, the cost is calculated for the entire vessel based on the group size and bespoke itinerary."
      },
      {
        q: "Is National Park admission included?",
        a: "Inclusions differ by package. Some options cover government taxes and Komodo National Park entrance fees, while others do not. Please carefully verify the 'Inclusions' section of your specific package before booking."
      },
      {
        q: "How do I secure my reservation?",
        a: "To confirm a booking, a 50% deposit is required. The remaining balance must be settled at least 7 days prior to the departure date, following our secure payment guidelines."
      },
      {
        q: "What is your refund policy?",
        a: "Refund eligibility is strictly tied to our cancellation timeline. Cancellations made well in advance may qualify for a refund, whereas last-minute cancellations are generally non-refundable. Please review our full Terms & Conditions for exact legal details."
      },
      {
        q: "Are there any hidden fees?",
        a: "We strive for complete transparency. However, personal expenses, travel insurance, crew gratuities (tips), and flights are not included. Any additional services requested outside the standard package will incur transparent extra charges."
      },
      {
        q: "Can I charter the entire boat?",
        a: "Absolutely. We offer Private Yacht Charters tailored for families or VIP groups. Pricing and availability depend on your preferred dates and bespoke itinerary requests."
      }
    ]
  }
];

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`border rounded-[1.25rem] md:rounded-[1.5rem] overflow-hidden bg-white transition-all duration-300 ${isOpen ? 'border-[#B88E52]/40 shadow-md' : 'border-gray-100 shadow-sm hover:border-[#B88E52]/30'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left px-5 py-4 md:px-6 md:py-5 flex items-center justify-between focus:outline-none bg-white group"
      >
        <span className={`font-bold pr-4 text-sm md:text-base leading-snug transition-colors duration-300 ${isOpen ? 'text-[#B88E52]' : 'text-[#0f172a] group-hover:text-[#B88E52]'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? 'bg-[#fdfaf5]' : 'bg-gray-50 group-hover:bg-[#fdfaf5]'}`}>
          <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#B88E52]' : 'text-gray-400 group-hover:text-[#B88E52]'}`} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden bg-white"
          >
            <div className="px-5 pb-5 md:px-6 md:pb-6 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-100/0 pt-2 font-light">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const waNumber = CONTACT.PHONE_1.replace(/\D/g, '');
  const encodedBrand = encodeURIComponent(BRAND_NAME);
  const b2cWaLink = `https://wa.me/${waNumber}?text=Hi%20${encodedBrand},%20I%20have%20a%20question%20about%20the%20luxury%20sailing%20trip.`;

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] min-h-screen overflow-x-hidden font-body">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 lg:pt-48 lg:pb-40 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1920&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/70 to-[#f8f9fa]"></div>
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#B88E52]/10 rounded-full blur-[80px] md:blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-3xl mx-auto text-center mt-6 md:mt-0"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-1.5 md:gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 border border-white/10 text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 backdrop-blur-md shadow-sm">
            <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Concierge Support
          </motion.div>
          <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-[1.15] px-2">
            Frequently Asked <br className="hidden sm:block" />
            <span className="italic font-serif text-[#B88E52]">Questions</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light px-4 md:px-0">
            Find clarity regarding our exclusive expedition routes, premium boat amenities, reservation process, and travel preparations.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. MAIN FAQ CONTENT (Two-Column Sticky Layout) */}
      <section className="px-5 md:px-6 lg:px-12 relative z-20 pb-24 md:pb-32 -mt-6 md:-mt-10">
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
          
          {faqData.map((section, idx) => (
            <motion.div 
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start"
            >
              {/* Kiri: Kategori Info (Sticky on Desktop) */}
              <motion.div variants={fadeInUp} className="w-full lg:w-1/3 lg:sticky lg:top-32 shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1rem] md:rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-5 md:mb-6">
                  {section.icon}
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-3">{section.category}</h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed pr-4 font-light">{section.desc}</p>
              </motion.div>

              {/* Kanan: Daftar Pertanyaan */}
              <motion.div variants={fadeInUp} className="w-full lg:w-2/3 space-y-3 md:space-y-4">
                {section.questions.map((item, qIdx) => (
                  <FaqItem key={qIdx} question={item.q} answer={item.a} />
                ))}
              </motion.div>
            </motion.div>
          ))}

        </div>
      </section>

      {/* 3. FINAL CONTACT CTA */}
      <section className="py-16 md:py-24 px-5 md:px-6 text-center bg-white border-t border-gray-100">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto bg-[#0f172a] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden"
        >
           {/* Decorative Blurs */}
           <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#B88E52]/20 rounded-full blur-3xl pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-[#B88E52]/10 rounded-full blur-2xl pointer-events-none"></div>
           
           <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-[#B88E52] to-[#a37c46] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg relative z-10">
             <Mail className="w-6 h-6 md:w-8 md:h-8 text-white" />
           </div>
           
           <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 relative z-10 leading-tight">Still have questions?</h2>
           <p className="text-gray-300 mb-8 md:mb-10 text-sm md:text-lg relative z-10 max-w-xl mx-auto leading-relaxed font-light px-2 md:px-0">
             Our voyage specialists and concierges are ready to help you plan the perfect Komodo adventure. Send us a message and we'll get back to you shortly.
           </p>
           
           <a 
              href={b2cWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 md:gap-3 px-8 py-4 md:px-10 md:py-5 rounded-full bg-white hover:bg-gray-100 text-[#0f172a] font-bold text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 relative z-10 w-full sm:w-auto"
            >
              Speak with Our Concierge <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </a>
        </motion.div>
      </section>

    </main>
  );
} 