'use client';

import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BRAND_NAME } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, CheckCircle2, User, Globe, MessageSquareQuote, X, UploadCloud } from "lucide-react";

interface WriteReviewFormProps {
  onSuccessSubmit: (optimisticReview: any) => void;
  onClose?: () => void; // Tambahan prop untuk menutup modal
}

export default function WriteReviewForm({ onSuccessSubmit, onClose }: WriteReviewFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    rating: 0,
    text: "",
    image: "", 
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size is too large. Maximum 10MB allowed.");
      return;
    }
    
    setIsUploadingImage(true);
    setErrorMsg("");
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        throw new Error("Gagal mengupload gambar.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Failed to upload image. Please ensure a stable internet connection.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim() || !formData.origin.trim() || !formData.text.trim()) {
      setErrorMsg("Please fill out all required fields."); return;
    }
    if (formData.rating === 0) {
      setErrorMsg("Please select a star rating to describe your experience."); return;
    }

    setIsSubmitting(true);
    try {
      const reviewPayload = {
        ...formData,
        status: 'pending',
        source: 'direct', 
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'reviews'), reviewPayload);
      
      setIsSuccess(true);
      onSuccessSubmit({
        id: Date.now().toString(),
        ...reviewPayload,
        createdAt: new Date(),
      });
      
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setErrorMsg("An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#fdfaf5] rounded-full flex items-center justify-center mb-8 border border-[#B88E52]/20 shadow-inner">
          <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-[#B88E52]" />
        </div>
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-[#0f172a] mb-4">Thank You!</h2>
        <p className="text-gray-600 mb-10 max-w-md mx-auto text-sm md:text-base leading-relaxed font-light">
          Your story has been successfully submitted and is awaiting brief review. We deeply appreciate your feedback!
        </p>
        <button 
          onClick={() => {
            setIsSuccess(false);
            setFormData({ name: "", origin: "", rating: 0, text: "", image: "" });
            if (onClose) onClose(); // Panggil fungsi close modal dari halaman utama
          }}
          className="px-8 py-4 bg-[#0f172a] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#1e293b] transition-all shadow-xl hover:-translate-y-1"
        >
          Close & Read Reviews
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
      <div className="text-center mb-8 md:mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fdfaf5] text-[#B88E52] border border-[#B88E52]/20 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            Submit Your Story
        </span>
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-4">How was your voyage?</h2>
        <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed">
          Thank you for choosing to explore with {BRAND_NAME}! Your genuine feedback helps us perfect the art of maritime hospitality.
        </p>
      </div>

      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-8 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">
          {errorMsg}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {/* Star Rating */}
        <div className="flex flex-col items-center justify-center p-8 bg-[#fdfaf5] rounded-2xl border border-[#B88E52]/10">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#0f172a] mb-5 block">Rate Your Experience</span>
            <div className="flex gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setFormData(prev => ({ ...prev, rating: star }))} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} className="focus:outline-none transition-transform hover:scale-125 active:scale-95">
                  <Star className={`w-10 h-10 md:w-12 md:h-12 transition-colors duration-200 ${star <= (hoveredStar || formData.rating) ? "fill-[#B88E52] text-[#B88E52] drop-shadow-md" : "fill-transparent text-gray-300 hover:text-gray-400"}`} />
                </button>
              ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Full Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="E.g. James Bond" className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all text-[#0f172a] text-sm md:text-base font-medium shadow-sm" required disabled={isSubmitting} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Origin Country *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Globe className="h-4 w-4 text-gray-400" /></div>
              <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} placeholder="E.g. United Kingdom" className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all text-[#0f172a] text-sm md:text-base font-medium shadow-sm" required disabled={isSubmitting} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Your Story *</label>
          <div className="relative">
            <div className="absolute top-5 left-4 pointer-events-none"><MessageSquareQuote className="h-4 w-4 text-gray-400" /></div>
            <textarea name="text" value={formData.text} onChange={handleInputChange} rows={6} placeholder="Tell us about the highlights of your trip..." className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all text-[#0f172a] text-sm md:text-base resize-none leading-relaxed font-light shadow-sm" required disabled={isSubmitting} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1 flex items-center justify-between">
            <span>Share a Moment</span><span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className={`relative border-2 border-dashed rounded-2xl transition-all text-center overflow-hidden ${formData.image ? 'border-gray-200 bg-gray-50 p-2' : 'border-gray-300 hover:bg-[#fdfaf5] hover:border-[#B88E52]/50 cursor-pointer p-8 md:p-12'}`} onClick={() => !formData.image && !isUploadingImage && fileInputRef.current?.click()}>
            <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden"/>
            {isUploadingImage ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-6"><Loader2 className="w-8 h-8 animate-spin text-[#B88E52]" /><p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Uploading image...</p></div>
            ) : formData.image ? (
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden group">
                <img src={formData.image} alt="Review moment" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: "" })); }} className="px-6 py-3 bg-red-500 text-white rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg uppercase tracking-widest transform hover:scale-105"><X className="w-4 h-4" /> Remove</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-4 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-2"><UploadCloud className="w-8 h-8" /></div>
                <p className="text-[#0f172a] font-bold text-sm md:text-base">Click here to upload a photo</p>
                <p className="text-gray-500 text-xs">Supported formats: JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 md:pt-6">
          <button type="submit" disabled={isSubmitting || isUploadingImage} className="w-full flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-8 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest text-xs md:text-sm transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <>Submit Experience <Send className="w-5 h-5 ml-2" /></>}
          </button>
        </div>
      </form>
    </motion.div>
  );
}