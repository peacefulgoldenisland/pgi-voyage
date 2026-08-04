'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, Map, Plus, Trash2, LayoutGrid } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B88E52] outline-none transition-all text-[#11223a] font-medium";

export default function ExpeditionHighlightsPage() {
  const [highlights, setHighlights] = useState<any[]>([{ title: "", desc: "", image: "", span: "md:col-span-2 row-span-1" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<any>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, 'settings', 'expedition'));
      if (snap.exists() && snap.data().highlights) setHighlights(snap.data().highlights);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await setDoc(doc(db, 'settings', 'expedition'), { highlights }, { merge: true });
    setSaveStatus({ type: 'success', msg: 'Tersimpan!' });
    setTimeout(() => setSaveStatus(null), 3000);
    setIsSaving(false);
  };

  if (isLoading) return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-[#B88E52]" /></div>;
  const current = highlights[activeIdx] || highlights[0];

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 pb-20">
      <div className="flex justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold flex gap-2 items-center"><Map className="text-[#B88E52]"/> Kelola Highlights</h1>
        <button onClick={handleSave} className="bg-[#B88E52] text-white px-6 py-2.5 rounded-xl font-bold flex gap-2">{isSaving ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>} Simpan</button>
      </div>

      <div className="flex gap-2 pb-4 overflow-x-auto">
        {highlights.map((_, idx) => (
          <button key={idx} onClick={() => setActiveIdx(idx)} className={`px-6 py-2.5 rounded-full font-bold border ${activeIdx === idx ? 'bg-[#B88E52] text-white' : 'bg-white'}`}>Card {idx+1}</button>
        ))}
        <button onClick={() => { setHighlights([...highlights, { title: "New", desc: "", image: "", span: "md:col-span-1 row-span-1" }]); setActiveIdx(highlights.length); }} className="px-4 bg-gray-200 rounded-full"><Plus className="w-4 h-4"/></button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border">
          <div className="flex justify-between border-b pb-4 mb-4"><h2 className="font-bold flex gap-2"><LayoutGrid/> Edit Card</h2><button onClick={() => { const arr=[...highlights]; arr.splice(activeIdx,1); setHighlights(arr); setActiveIdx(0); }} className="text-red-500"><Trash2 className="w-5 h-5"/></button></div>
          <div className="space-y-4">
            <input type="text" value={current.title} onChange={(e) => { const arr=[...highlights]; arr[activeIdx].title = e.target.value; setHighlights(arr); }} className={inputClass} placeholder="Judul Destinasi"/>
            <textarea value={current.desc} onChange={(e) => { const arr=[...highlights]; arr[activeIdx].desc = e.target.value; setHighlights(arr); }} className={inputClass} placeholder="Deskripsi"/>
            <ImageUpload label="Foto Latar" value={current.image} onChange={(url) => { const arr=[...highlights]; arr[activeIdx].image = url; setHighlights(arr); }} />
          </div>
        </div>

        <div className="bg-gray-900 p-8 rounded-3xl sticky top-[100px]">
           <h3 className="text-emerald-400 font-bold mb-4">PREVIEW</h3>
           <div className="relative rounded-2xl overflow-hidden h-64 border border-white/20">
             <img src={current.image} className="w-full h-full object-cover"/>
             <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
               <h3 className="text-2xl font-bold">{current.title}</h3>
               <p className="text-sm opacity-80">{current.desc}</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}