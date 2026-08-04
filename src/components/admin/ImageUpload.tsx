'use client';

import { useState, useRef } from 'react';
import { Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B88E52] focus:ring-2 focus:ring-[#B88E52]/20 outline-none transition-all text-[#11223a] font-medium placeholder-gray-400 shadow-sm text-sm";

export default function ImageUpload({ value, onChange, label }: { value: string, onChange: (url: string) => void, label: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    // Hapus upload_preset cloudinary, cukup kirim 'file' ke route.ts kamu

    try {
      // Tembak ke API Cloudflare R2 milikmu sendiri
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload ke server gagal.');
      }

      const uploadData = await res.json();
      
      // Tangkap response 'url' dari route.ts kamu
      if (uploadData.url) {
        onChange(uploadData.url);
      } else {
        throw new Error('URL gambar tidak ditemukan dari response.');
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal mengunggah gambar ke Cloudflare R2.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        
        {/* Preview Box */}
        <div className="w-24 h-24 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center relative shadow-sm">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-300" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#B88E52]" />
            </div>
          )}
        </div>
        
        <div className="flex-1 w-full space-y-3">
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder="Atau paste URL gambar R2 di sini..." 
            className={inputClass} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading} 
            className="px-6 py-3 bg-[#0f172a] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-all shadow-md w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-4 h-4" /> 
            {isUploading ? 'Uploading...' : 'Upload Gambar Baru'}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
}