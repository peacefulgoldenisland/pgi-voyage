'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, CreditCard, Plus, Trash2 } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B88E52] focus:ring-2 focus:ring-[#B88E52]/20 outline-none transition-all text-[#11223a] font-medium placeholder-gray-400 shadow-sm";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

export default function ExpeditionPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([
    { name: "Bank Transfer", logo: "" }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'expedition'));
        if (docSnap.exists() && docSnap.data().paymentMethods) {
          setPayments(docSnap.data().paymentMethods);
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
      // Menggunakan merge: true agar hanya update field paymentMethods
      await setDoc(doc(db, 'settings', 'expedition'), { paymentMethods: payments }, { merge: true });
      setSaveStatus({ type: 'success', msg: 'Metode Pembayaran tersimpan!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', msg: 'Gagal menyimpan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    const newPayments = [...payments, { name: "Metode Baru", logo: "" }];
    setPayments(newPayments);
    setActiveIdx(newPayments.length - 1);
  };

  const handleRemove = () => {
    if (payments.length <= 1) return alert('Minimal harus ada 1 metode pembayaran!');
    if (confirm('Yakin ingin menghapus metode pembayaran ini?')) {
      const newPayments = [...payments];
      newPayments.splice(activeIdx, 1);
      setPayments(newPayments);
      setActiveIdx(0);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-[#B88E52]" /></div>;
  }

  const currentPayment = payments[activeIdx] || payments[0];

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-[#B88E52]" /> Kelola Pembayaran</h1>
          <p className="text-gray-500 text-sm mt-1">Atur logo bank, e-wallet, atau kartu kredit yang diterima.</p>
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

      {/* PAYMENT SELECTOR */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {payments.map((method, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-sm border transition-all ${
              activeIdx === idx 
                ? 'bg-[#B88E52] border-[#B88E52] text-white shadow-md' 
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {method.name || `Metode ${idx + 1}`}
          </button>
        ))}
        <button 
          onClick={handleAdd}
          className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all border border-transparent"
        >
          <Plus className="w-4 h-4" /> Tambah Pembayaran
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: FORM EDITOR */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-2">Editor Pembayaran</h2>
            <button onClick={handleRemove} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Hapus Metode">
              <Trash2 className="w-5 h-5"/>
            </button>
          </div>

          <div>
            <label className={labelClass}>Nama Bank / Kartu Kredit / E-Wallet</label>
            <input 
              type="text" 
              value={currentPayment.name} 
              onChange={(e) => { const newPym = [...payments]; newPym[activeIdx].name = e.target.value; setPayments(newPym); }} 
              className={inputClass} 
              placeholder="Contoh: BCA / Visa / OVO"
            />
          </div>
          
          <div className="pt-2 border-t border-gray-50">
            <ImageUpload 
              label="Upload Logo (Gunakan PNG Transparan tanpa background putih)" 
              value={currentPayment.logo} 
              onChange={(url) => { const newPym = [...payments]; newPym[activeIdx].logo = url; setPayments(newPym); }} 
            />
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="bg-[#f8f9fa] p-8 lg:p-10 rounded-[2.5rem] sticky top-[100px] shadow-inner border border-gray-200">
          <h3 className="text-xs font-bold text-emerald-500 tracking-widest uppercase mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Preview Halaman Publik
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            {payments.map((method, idx) => {
              const isActive = idx === activeIdx;
              return (
                <div key={idx} className="flex flex-col items-center group cursor-pointer">
                  <div className={`h-16 md:h-20 w-32 md:w-40 px-6 py-4 bg-white border shadow-sm rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? 'border-[#B88E52] ring-2 ring-[#B88E52]/20 grayscale-0 scale-105' 
                      : 'border-gray-200 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 hover:-translate-y-1'
                  }`}>
                    {method.logo ? (
                      <img 
                        src={method.logo} 
                        alt={method.name} 
                        className="max-h-full max-w-full object-contain" 
                      />
                    ) : (
                      <span className="text-gray-300 font-bold text-sm">No Image</span>
                    )}
                  </div>
                  <span className={`text-xs mt-4 font-semibold transition-opacity duration-300 tracking-wide ${
                    isActive 
                      ? 'text-[#B88E52] opacity-100' 
                      : 'text-gray-500 opacity-0 group-hover:opacity-100'
                  }`}>
                    {method.name || 'Nama Bank'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6 italic">
            *Logo yang kamu edit akan otomatis menjadi fokus (berwarna dan diperbesar) pada preview ini.
          </p>
        </div>
        
      </div>
    </div>
  );
}