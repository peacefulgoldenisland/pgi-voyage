'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, FileText, CheckCircle2, XCircle, MessageCircleQuestion, Plus, Trash2 } from 'lucide-react';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B88E52] focus:ring-2 focus:ring-[#B88E52]/20 outline-none transition-all text-[#11223a] font-medium placeholder-gray-400 shadow-sm";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

export default function ExpeditionInfoPage() {
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'expedition'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.inclusions) setInclusions(data.inclusions);
          if (data.exclusions) setExclusions(data.exclusions);
          if (data.faqs) setFaqs(data.faqs);
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
      // Menggunakan merge: true agar hanya update Inclusions, Exclusions, dan FAQs
      await setDoc(doc(db, 'settings', 'expedition'), { 
        inclusions, 
        exclusions, 
        faqs 
      }, { merge: true });
      
      setSaveStatus({ type: 'success', msg: 'Info & FAQs tersimpan!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', msg: 'Gagal menyimpan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { q: "Pertanyaan Baru?", a: "Tulis jawaban di sini..." }]);
  };

  const handleRemoveFaq = (idx: number) => {
    if (confirm('Yakin ingin menghapus FAQ ini?')) {
      const newFaqs = [...faqs];
      newFaqs.splice(idx, 1);
      setFaqs(newFaqs);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-[#B88E52]" /></div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-[#B88E52]" /> Kelola Info & FAQs</h1>
          <p className="text-gray-500 text-sm mt-1">Atur fasilitas yang termasuk (Inclusions), tidak termasuk (Exclusions), dan Pusat Bantuan.</p>
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

      {/* INCLUSIONS & EXCLUSIONS */}
      <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* INCLUSIONS */}
        <div>
          <h2 className="text-xl font-bold text-[#11223a] mb-6 border-b border-gray-100 pb-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500"/> What's Included
          </h2>
          <p className="text-sm text-gray-500 mb-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 leading-relaxed">
            Daftar fasilitas yang <strong>termasuk</strong> dalam harga tiket. Tekan <kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded font-mono text-xs">Enter</kbd> untuk memisahkan setiap item.
          </p>
          <textarea 
            rows={10} 
            value={(inclusions || []).join('\n')} 
            onChange={(e) => setInclusions(e.target.value.split('\n'))} 
            className={`${inputClass} leading-relaxed resize-y`} 
            placeholder="Makan 3x sehari&#10;Peralatan Snorkeling&#10;Teh & Kopi"
          />
        </div>

        {/* EXCLUSIONS */}
        <div>
          <h2 className="text-xl font-bold text-[#11223a] mb-6 border-b border-gray-100 pb-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500"/> Not Included
          </h2>
          <p className="text-sm text-gray-500 mb-4 bg-red-50/50 p-4 rounded-xl border border-red-100/50 leading-relaxed">
            Daftar item/fasilitas yang <strong>tidak termasuk</strong> (pengeluaran pribadi). Tekan <kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded font-mono text-xs">Enter</kbd> untuk memisahkan setiap item.
          </p>
          <textarea 
            rows={10} 
            value={(exclusions || []).join('\n')} 
            onChange={(e) => setExclusions(e.target.value.split('\n'))} 
            className={`${inputClass} leading-relaxed resize-y`} 
            placeholder="Tiket Pesawat&#10;Uang Tip Kru Kapal&#10;Minuman Beralkohol"
          />
        </div>
      </div>

      {/* FAQS SECTION */}
      <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#11223a] flex items-center gap-3">
              <MessageCircleQuestion className="w-6 h-6 text-[#B88E52]" /> Pusat Bantuan (FAQs)
            </h2>
            <p className="text-sm text-gray-500 mt-1">Daftar pertanyaan yang sering diajukan oleh calon tamu.</p>
          </div>
          <button 
            onClick={handleAddFaq}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#11223a] text-white rounded-xl text-sm font-bold hover:bg-[#0f1f33] transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah FAQ Baru
          </button>
        </div>
        
        <div className="space-y-6">
          {faqs && faqs.length > 0 ? (
            faqs.map((faq, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 relative group flex flex-col md:flex-row gap-6 hover:border-[#B88E52]/40 transition-colors">
                 <button 
                   onClick={() => handleRemoveFaq(idx)} 
                   className="absolute -top-3 -right-3 bg-white text-red-500 p-2.5 rounded-full border border-gray-200 shadow-md hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all z-10"
                   title="Hapus FAQ"
                 >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-full md:w-1/3">
                  <label className={labelClass}>Pertanyaan (Tampil di Judul)</label>
                  <textarea 
                    rows={3} 
                    value={faq.q} 
                    onChange={(e) => { const newFaqs = [...faqs]; newFaqs[idx].q = e.target.value; setFaqs(newFaqs); }} 
                    className={`${inputClass} resize-none h-[calc(100%-28px)] font-bold`} 
                    placeholder="Contoh: What should I bring?" 
                  />
                </div>
                <div className="w-full md:w-2/3">
                  <label className={labelClass}>Jawaban Lengkap</label>
                  <textarea 
                    rows={3} 
                    value={faq.a} 
                    onChange={(e) => { const newFaqs = [...faqs]; newFaqs[idx].a = e.target.value; setFaqs(newFaqs); }} 
                    className={`${inputClass} leading-relaxed h-[calc(100%-28px)]`} 
                    placeholder="Silakan bawa ID yang valid, kacamata hitam, sunblock..." 
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
              <MessageCircleQuestion className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Belum ada daftar FAQ (Tanya Jawab).</p>
              <p className="text-gray-400 text-sm mt-1">Tambahkan FAQ untuk membantu mengurangi pertanyaan berulang dari tamu.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}