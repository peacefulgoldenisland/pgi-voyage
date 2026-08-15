'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, Navigation, Plus, Trash2, Sunrise, Sun, Sunset, Moon, Anchor, ListOrdered, CheckCircle, Coffee, BedDouble, ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

// --- STYLING CONSTANTS ---
const inputClass = "w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B88E52] focus:ring-4 focus:ring-[#B88E52]/10 outline-none transition-all text-[#0f172a] font-medium placeholder-gray-400 text-sm";
const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2";

const availableIcons = [
  { id: 'sunrise', icon: <Sunrise className="w-4 h-4" />, label: 'Pagi' },
  { id: 'sun', icon: <Sun className="w-4 h-4" />, label: 'Siang' },
  { id: 'sunset', icon: <Sunset className="w-4 h-4" />, label: 'Sore' },
  { id: 'moon', icon: <Moon className="w-4 h-4" />, label: 'Malam' },
  { id: 'anchor', icon: <Anchor className="w-4 h-4" />, label: 'Sandar' },
];

const getIconElement = (name: string, className: string = "w-5 h-5") => {
  switch (name) {
    case 'sunrise': return <Sunrise className={className} />;
    case 'sun': return <Sun className={className} />;
    case 'sunset': return <Sunset className={className} />;
    case 'moon': return <Moon className={className} />;
    case 'anchor': return <Anchor className={className} />;
    default: return <Sun className={className} />;
  }
};

export default function ExpeditionItineraryPage() {
  const [itinerary, setItinerary] = useState<any[]>([{ day: "DAY 1", title: "", image: "", meals: "", overnight: "", activities: [] }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'expedition'));
        if (docSnap.exists() && docSnap.data().itinerary) {
          setItinerary(docSnap.data().itinerary);
        }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'expedition'), { itinerary }, { merge: true });
      setSaveStatus({ type: 'success', msg: 'Itinerary Live Update Tersimpan!' });
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      setSaveStatus({ type: 'error', msg: 'Gagal menyimpan data.' });
    } finally { setIsSaving(false); }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#B88E52] mb-4" />
        <p className="text-gray-500 font-medium">Memuat Itinerary Workspace...</p>
      </div>
    );
  }

  const currentDayData = itinerary[activeDayIdx] || itinerary[0];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-24 relative">
      
      {/* 1. STICKY HEADER & TABS NAVIGATION */}
      <div className="sticky top-0 z-40 bg-[#f8f9fa]/90 backdrop-blur-xl border-b border-gray-200/80 pt-4 pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] flex items-center gap-3">
              <div className="p-2.5 bg-[#B88E52]/10 rounded-xl text-[#B88E52]">
                <Navigation className="w-6 h-6" />
              </div>
              Itinerary Manager
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Orkestrasi alur perjalanan, waktu, dan aktivitas tamu kapal.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {saveStatus && (
                <motion.span 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                  className={`text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm ${saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
                >
                  <CheckCircle className="w-4 h-4" /> {saveStatus.msg}
                </motion.span>
              )}
            </AnimatePresence>
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-[#1e293b] transition-all flex items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
              {isSaving ? 'Menyimpan...' : 'Publish Itinerary'}
            </button>
          </div>
        </div>

        {/* DAY SELECTOR TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
          {itinerary.map((day, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveDayIdx(idx)} 
              className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 border ${
                activeDayIdx === idx 
                  ? 'bg-[#B88E52] border-[#B88E52] text-white shadow-[0_4px_15px_rgba(184,142,82,0.3)] scale-105' 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#0f172a]'
              }`}
            >
              {day.day || `Hari ${idx + 1}`}
            </button>
          ))}
          <button 
            onClick={() => { 
              const newItin = [...itinerary, { day: `DAY ${itinerary.length + 1}`, title: "Destinasi Baru", image: "", meals: "", overnight: "", activities: [] }];
              setItinerary(newItin); 
              setActiveDayIdx(newItin.length - 1); 
            }} 
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest bg-gray-100/80 text-gray-600 hover:bg-gray-200 transition-all border border-transparent border-dashed hover:border-gray-300 ml-2"
          >
            <Plus className="w-4 h-4" /> Tambah Hari
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* ========================================= */}
        {/* LEFT COLUMN: THE EDITOR PANEL             */}
        {/* ========================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <motion.div 
            key={activeDayIdx}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-100 gap-4">
              <h2 className="text-xl font-bold text-[#0f172a] flex items-center gap-3">
                <ListOrdered className="w-5 h-5 text-[#B88E52]"/> Detail Pengaturan {currentDayData.day}
              </h2>
              <button 
                onClick={() => { 
                  if(itinerary.length <= 1) return alert("Minimal harus ada 1 hari di Itinerary.");
                  if(confirm(`Yakin ingin menghapus ${currentDayData.day}?`)) { 
                    const newItin = [...itinerary]; 
                    newItin.splice(activeDayIdx, 1); 
                    setItinerary(newItin); 
                    setActiveDayIdx(0); 
                  } 
                }} 
                className="text-red-500 hover:bg-red-50 hover:text-red-600 p-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                <Trash2 className="w-4 h-4"/> Hapus Hari
              </button>
            </div>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className={labelClass}>Label Hari (Format Bebas)</label>
                <input type="text" value={currentDayData.day} onChange={(e) => { const newItin = [...itinerary]; newItin[activeDayIdx].day = e.target.value; setItinerary(newItin); }} className={inputClass} placeholder="Contoh: DAY 1"/>
              </div>
              <div>
                <label className={labelClass}>Judul Utama Rute</label>
                <input type="text" value={currentDayData.title} onChange={(e) => { const newItin = [...itinerary]; newItin[activeDayIdx].title = e.target.value; setItinerary(newItin); }} className={inputClass} placeholder="Contoh: Welcome to Paradise"/>
              </div>
            </div>
            
            <div className="mb-8">
              <ImageUpload label="Gambar Header Background (Resolusi Tinggi)" value={currentDayData.image} onChange={(url) => { const newItin = [...itinerary]; newItin[activeDayIdx].image = url; setItinerary(newItin); }} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fdfaf5] p-6 rounded-2xl border border-[#B88E52]/10 mb-10">
              <div>
                <label className={labelClass}>Layanan Makanan (Meals)</label>
                <input type="text" value={currentDayData.meals} onChange={(e) => { const newItin = [...itinerary]; newItin[activeDayIdx].meals = e.target.value; setItinerary(newItin); }} className={inputClass} placeholder="Cth: Lunch & Dinner Included"/>
              </div>
              <div>
                <label className={labelClass}>Info Menginap (Overnight)</label>
                <input type="text" value={currentDayData.overnight} onChange={(e) => { const newItin = [...itinerary]; newItin[activeDayIdx].overnight = e.target.value; setItinerary(newItin); }} className={inputClass} placeholder="Cth: Overnight sailing to Komodo"/>
              </div>
            </div>

            {/* TIMELINE ACTIVITIES EDITOR */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a]">Timeline Aktivitas</h3>
                  <p className="text-gray-500 text-xs mt-1">Tambahkan runutan acara berdasarkan waktu.</p>
                </div>
                <button 
                  onClick={() => { 
                    const newItin = [...itinerary]; 
                    newItin[activeDayIdx].activities.push({ time: "08:00 AM", text: "Aktivitas baru...", iconName: "sun" }); 
                    setItinerary(newItin); 
                  }} 
                  className="bg-[#B88E52]/10 text-[#B88E52] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#B88E52] hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4"/> Tambah Waktu
                </button>
              </div>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gray-100">
                {currentDayData.activities.map((act: any, aIdx: number) => (
                  <div key={aIdx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    
                    {/* Icon Timeline Center */}
                    <div className="flex items-center justify-center w-11 h-11 rounded-full border-4 border-white bg-gray-50 text-gray-400 shadow-sm shrink-0 md:order-1 md:group-odd:-ml-[1.4rem] md:group-even:ml-[1.4rem] z-10 transition-colors group-hover:bg-[#B88E52] group-hover:text-white absolute left-0 md:relative md:left-auto">
                      {getIconElement(act.iconName, "w-4 h-4")}
                    </div>

                    {/* Content Box */}
                    <div className="w-[calc(100%-3rem)] ml-auto md:w-[calc(50%-2rem)] md:ml-0 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#B88E52]/30 transition-all relative">
                      <button 
                        onClick={() => { const newItin = [...itinerary]; newItin[activeDayIdx].activities.splice(aIdx,1); setItinerary(newItin); }} 
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                        title="Hapus aktivitas"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                      
                      <div className="pr-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Waktu</label>
                            <input type="text" value={act.time} onChange={(e) => { const newItin = [...itinerary]; newItin[activeDayIdx].activities[aIdx].time = e.target.value; setItinerary(newItin); }} className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[#B88E52] outline-none transition-all text-[#0f172a] font-bold text-sm" placeholder="00:00"/>
                          </div>
                        </div>
                        
                        <div>
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pilih Ikon</label>
                           <div className="flex flex-wrap gap-2">
                             {availableIcons.map(ic => (
                               <button 
                                 key={ic.id} 
                                 onClick={() => { const newItin = [...itinerary]; newItin[activeDayIdx].activities[aIdx].iconName = ic.id; setItinerary(newItin); }} 
                                 className={`p-2 rounded-lg border transition-all ${act.iconName === ic.id ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                                 title={ic.label}
                               >
                                 {ic.icon}
                               </button>
                             ))}
                           </div>
                        </div>
                        
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Deskripsi Kegiatan</label>
                          <textarea rows={2} value={act.text} onChange={(e) => { const newItin = [...itinerary]; newItin[activeDayIdx].activities[aIdx].text = e.target.value; setItinerary(newItin); }} className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[#B88E52] outline-none transition-all text-gray-600 text-sm resize-none" placeholder="Tuliskan aktivitas..."/>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
              {currentDayData.activities.length === 0 && (
                <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                  <p className="text-sm text-gray-500 font-medium">Belum ada aktivitas. Silakan tambah waktu.</p>
                </div>
              )}
            </div>
            
          </motion.div>
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: HIGH-END LIVE PREVIEW       */}
        {/* ========================================= */}
        <div className="lg:col-span-5 xl:col-span-4 h-fit sticky top-[120px]">
          <h3 className="text-xs font-bold text-emerald-500 tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> App Preview
          </h3>
          
          {/* Mockup Card */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#1e293b] flex flex-col max-h-[80vh] relative">
            
            {/* Premium Header Image */}
            <div className="relative h-64 shrink-0">
              {currentDayData.image ? (
                <img 
                  src={currentDayData.image} 
                  alt={currentDayData.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-[#1e293b] flex items-center justify-center"><ImageIcon className="w-10 h-10 text-gray-600"/></div>
              )}
              {/* Gradient Overlay ala Luxury UI */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/50 to-[#0f172a]"></div>
              
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-[#B88E52] text-[10px] font-bold text-white uppercase tracking-widest mb-3 shadow-lg">
                  {currentDayData.day || 'HARI'}
                </span>
                <h4 className="text-2xl font-bold text-white leading-tight font-heading">{currentDayData.title || 'Judul Destinasi Kosong'}</h4>
              </div>
            </div>

            {/* Content & Timeline Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0f172a]">
              
              {/* Timeline Items */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[1px] before:bg-white/10">
                {currentDayData.activities.map((act:any, i:number) => (
                  <div key={i} className="relative flex items-start gap-5">
                    <div className="w-6 h-6 rounded-full bg-[#0f172a] border-2 border-[#B88E52] flex items-center justify-center z-10 mt-0.5 shrink-0 shadow-[0_0_10px_rgba(184,142,82,0.4)]">
                      <div className="w-1.5 h-1.5 bg-[#B88E52] rounded-full"></div>
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#B88E52]">{getIconElement(act.iconName, "w-3.5 h-3.5")}</span>
                        <p className="text-sm font-bold text-white tracking-wide">{act.time || '00:00'}</p>
                      </div>
                      <p className="text-sm text-gray-400 font-light leading-relaxed">{act.text || '...'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box (Meals & Overnight) */}
              <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <Coffee className="w-4 h-4 text-[#B88E52] mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Meals Included</span>
                    <span className="text-sm text-white font-medium">{currentDayData.meals || '-'}</span>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-white/10"></div>
                <div className="flex items-start gap-3">
                  <BedDouble className="w-4 h-4 text-[#B88E52] mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Accommodation</span>
                    <span className="text-sm text-white font-medium">{currentDayData.overnight || '-'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-4 italic">
            Gambar telah dioptimasi untuk <strong className="text-gray-300">Cloudflare CDN</strong>.
          </p>
        </div>

      </div>
    </div>
  );
} 