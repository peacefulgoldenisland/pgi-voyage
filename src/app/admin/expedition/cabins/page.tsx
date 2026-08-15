'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, BedDouble, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B88E52] focus:ring-2 focus:ring-[#B88E52]/20 outline-none transition-all text-[#11223a] font-medium placeholder-gray-400 shadow-sm";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

export default function ExpeditionCabinsPage() {
  const [cabins, setCabins] = useState<any[]>([
    { name: "Private Cabin", desc: "", price: "0K", features: ["Sea view window"], image: "", popular: false }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'expedition'));
        if (docSnap.exists() && docSnap.data().cabinPackages) {
          setCabins(docSnap.data().cabinPackages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Menggunakan merge: true agar data Itinerary dll tidak tertimpa/hilang
      await setDoc(doc(db, 'settings', 'expedition'), { cabinPackages: cabins }, { merge: true });
      setSaveStatus({ type: 'success', msg: 'Paket Kabin tersimpan!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', msg: 'Gagal menyimpan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    const newCabins = [...cabins, { name: "Kabin Baru", desc: "", price: "0K", features: ["Fasilitas utama"], image: "", popular: false }];
    setCabins(newCabins);
    setActiveIdx(newCabins.length - 1);
  };

  const handleRemove = () => {
    if (cabins.length <= 1) return alert('Minimal harus ada 1 kabin!');
    if (confirm('Yakin ingin menghapus kabin ini?')) {
      const newCabins = [...cabins];
      newCabins.splice(activeIdx, 1);
      setCabins(newCabins);
      setActiveIdx(0);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-[#B88E52]" /></div>;
  }

  const currentCabin = cabins[activeIdx] || cabins[0];

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BedDouble className="w-6 h-6 text-[#B88E52]" /> Kelola Paket Kabin</h1>
          <p className="text-gray-500 text-sm mt-1">Atur harga, foto, dan fasilitas kamar kapal.</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {saveStatus && (
              <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={`text-sm font-bold px-4 py-2 rounded-lg ${saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {saveStatus.msg}
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={handleSave} disabled={isSaving} className="bg-[#B88E52] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#a37c46] flex gap-2 w-full sm:w-auto justify-center transition-all">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>} Simpan Perubahan
          </button>
        </div>
      </div>

      {/* CABIN SELECTOR */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {cabins.map((cabin, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-sm border transition-all ${
              activeIdx === idx 
                ? 'bg-[#B88E52] border-[#B88E52] text-white shadow-md' 
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {cabin.name || `Kabin ${idx + 1}`}
          </button>
        ))}
        <button 
          onClick={handleAdd}
          className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all border border-transparent"
        >
          <Plus className="w-4 h-4" /> Tambah Kabin
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: FORM EDITOR */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-2">Editor Kabin</h2>
            <button onClick={handleRemove} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Hapus Kabin">
              <Trash2 className="w-5 h-5"/>
            </button>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <span className="block text-sm font-bold text-[#11223a]">Highlight Badge</span>
              <span className="text-xs text-gray-500">Tampilkan label "Most Popular" di kartu ini</span>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${currentCabin.popular ? 'bg-[#B88E52]' : 'bg-gray-300'}`} 
                   onClick={() => { const newCb = [...cabins]; newCb[activeIdx].popular = !newCb[activeIdx].popular; setCabins(newCb); }}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${currentCabin.popular ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nama Kabin</label>
              <input type="text" value={currentCabin.name} onChange={(e) => { const newCb = [...cabins]; newCb[activeIdx].name = e.target.value; setCabins(newCb); }} className={inputClass} placeholder="Cth: Private Cabin Sea View"/>
            </div>
            <div>
              <label className={labelClass}>Harga (Cth: 4,600K)</label>
              <input type="text" value={currentCabin.price} onChange={(e) => { const newCb = [...cabins]; newCb[activeIdx].price = e.target.value; setCabins(newCb); }} className={`${inputClass} font-mono`} placeholder="4,600K"/>
            </div>
          </div>
          
          <div>
            <label className={labelClass}>Deskripsi Singkat</label>
            <textarea rows={3} value={currentCabin.desc} onChange={(e) => { const newCb = [...cabins]; newCb[activeIdx].desc = e.target.value; setCabins(newCb); }} className={`${inputClass} resize-none`} placeholder="Deskripsikan nuansa dan kelebihan kabin..."/>
          </div>

          <ImageUpload label="Foto Utama Kabin" value={currentCabin.image} onChange={(url) => { const newCb = [...cabins]; newCb[activeIdx].image = url; setCabins(newCb); }} />
          
          <div>
            <label className={`${labelClass} flex justify-between items-center`}>
              <span>Fasilitas Kabin</span> 
              <span className="text-gray-400 font-normal text-xs bg-gray-100 px-2 py-1 rounded">Tekan Enter untuk baris baru</span>
            </label>
            <textarea 
              rows={5} 
              value={(currentCabin.features || []).join('\n')} 
              onChange={(e) => { const newCb = [...cabins]; newCb[activeIdx].features = e.target.value.split('\n'); setCabins(newCb); }} 
              className={`${inputClass} leading-relaxed`} 
              placeholder="Sea view window&#10;AC Central&#10;Comfortable Bed" 
            />
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="bg-[#11223a] p-8 rounded-[2.5rem] sticky top-[100px] shadow-2xl border border-[#1a3356]">
          <h3 className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Preview Halaman Publik
          </h3>
          
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col group shadow-xl">
            <div className="h-60 overflow-hidden relative">
              <img src={currentCabin.image || "https://images.unsplash.com/photo-1599619351208-3e6c839d6828?q=80&w=600"} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11223a] to-transparent opacity-70"></div>
              
              {currentCabin.popular && (
                <div className="absolute top-4 right-4 bg-[#B88E52] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="absolute bottom-5 left-5 text-white">
                <h3 className="text-2xl font-bold">{currentCabin.name || 'Nama Kabin'}</h3>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {currentCabin.desc || "Deskripsi singkat tentang kabin ini akan muncul di sini."}
              </p>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {(currentCabin.features || ["Fasilitas utama"]).slice(0,4).map((feat: string, i: number) => (
                  feat.trim() !== '' && (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-[#B88E52] shrink-0 mt-0.5" /> 
                      <span className="leading-snug">{feat}</span>
                    </li>
                  )
                ))}
              </ul>
              
              <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-[#B88E52]">IDR</span>
                  <span className="text-2xl font-bold text-white tracking-tight">{currentCabin.price || "0K"}</span>
                  <span className="text-gray-400 text-[10px]">/pax</span>
                </div>
                <div className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#B88E52] text-white cursor-pointer hover:bg-[#a37c46] transition-colors">
                  Select
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
} 