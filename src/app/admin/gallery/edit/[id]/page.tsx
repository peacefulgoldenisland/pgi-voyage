'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  PlaySquare, 
  MapPin, 
  Loader2,
  Calendar,
  Clock,
  Ship,
  UploadCloud,
  FileCheck2,
  X,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

// Pilihan Kategori sesuai dengan halaman publik
const categories = [
  { id: 'vessel', label: 'KM Pulau Mas 88' },
  { id: 'kenawa', label: 'Kenawa Island' },
  { id: 'whaleshark', label: 'Saleh Bay (Whale Shark)' },
  { id: 'komodo', label: 'Komodo Island' },
  { id: 'pinkbeach', label: 'Pink Beach' },
  { id: 'padar', label: 'Padar Island' },
  { id: 'majarite', label: 'Majarite & Kelor' }
];

export default function EditGalleryMediaPage() {
  const router = useRouter();
  const params = useParams();
  const mediaId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  
  // State untuk memastikan user terotentikasi
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Form States
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [existingSrc, setExistingSrc] = useState<string>(''); // Menyimpan URL asli dari DB
  const [localPreview, setLocalPreview] = useState<string>(''); // Preview file baru (jika ada)
  const [type, setType] = useState<'image' | 'reel'>('image');
  const [categoryId, setCategoryId] = useState('padar');
  const [tripName, setTripName] = useState(''); 
  const [tripDate, setTripDate] = useState(''); 
  const [location, setLocation] = useState('');

  // Ref untuk file input tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const generateTripId = (name: string) => {
    if (!name) return 'general';
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  // Cek status login & Ambil Data dari Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);

      if (currentUser && mediaId) {
        try {
          const docRef = doc(db, 'galleries', mediaId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || '');
            setLocation(data.location || '');
            setCategoryId(data.categoryId || 'padar');
            setTripName(data.tripName !== 'General Highlight' ? data.tripName : '');
            setTripDate(data.tripDate || '');
            setType(data.type || 'image');
            setExistingSrc(data.src || '');
          } else {
            setError('Data media tidak ditemukan!');
          }
        } catch (err) {
          console.error("Error fetching media:", err);
          setError('Gagal memuat data media.');
        } finally {
          setIsLoading(false);
        }
      } else if (!currentUser) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [mediaId]);

  // Handle pemilihan file (dari klik atau drop)
  const processFile = (selectedFile: File) => {
    // Validasi ukuran (contoh: max 99MB)
    if (selectedFile.size > 99 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 99MB.");
      return;
    }
    
    setFile(selectedFile);
    setError('');
    
    // Buat local preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreview(objectUrl);

    // Auto-detect tipe file (jika video, set ke reel)
    if (selectedFile.type.startsWith('video/')) {
      setType('reel');
    } else {
      setType('image');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/')) {
        processFile(droppedFile);
      } else {
        setError('Hanya mendukung file Gambar (JPG, PNG, WEBP) dan Video (MP4).');
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setLocalPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ==========================================
  // LOGIC BARU: Upload ke Endpoint API R2 kita
  // ==========================================
  const uploadToServer = async (fileToUpload: File) => {
    const formData = new FormData();
    formData.append('file', fileToUpload);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan URL dari server');
      }

      return data.url;
    } catch (err) {
      console.error("Server upload error:", err);
      throw new Error('Gagal mengunggah file ke Cloudflare R2.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Sesi login tidak terdeteksi. Silakan muat ulang halaman atau login kembali.');
      return;
    }

    if (!title || !categoryId || !location) {
      setError('Mohon lengkapi judul, lokasi, dan kategori.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalSrc = existingSrc;

      // Jika ada file baru yang diupload, upload ke Server/R2 dulu
      if (file) {
        setUploadStatus('Mengunggah media baru ke Server (R2)...');
        finalSrc = await uploadToServer(file);
      }

      setUploadStatus('Memperbarui data di arsip...');
      const docRef = doc(db, 'galleries', mediaId);
      
      const updatedData = {
        title,
        src: finalSrc,
        type,
        categoryId,
        tripName: tripName || 'General Highlight',
        tripId: generateTripId(tripName),
        tripDate: tripDate || '',
        location,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updatedData);
      
      router.push('/admin/gallery');
      router.refresh();
    } catch (err: any) {
      console.error('Error updating media:', err);
      setError(err.message || 'Terjadi kesalahan saat memperbarui data.');
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#B88E52] mb-4" />
        <p className="text-gray-500 font-medium">Memuat data media...</p>
      </div>
    );
  }

  // Tentukan gambar/video apa yang akan ditampilkan di preview (mengutamakan file baru yang dipilih)
  const previewSource = localPreview || existingSrc;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/admin/gallery" 
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#11223a] hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-[#11223a]">Edit Media</h1>
          </div>
          <p className="text-gray-500 ml-12">Ubah informasi atau ganti file untuk aset media ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form Input */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Area Custom File Upload (Drag & Drop) */}
            <div>
              <label className="block text-sm font-bold text-[#11223a] mb-2">
                Ganti File (Opsional)
              </label>
              <p className="text-xs text-gray-500 mb-3">Biarkan kosong jika tidak ingin mengganti file saat ini.</p>
              
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all text-center ${
                  isDragging 
                    ? 'border-[#B88E52] bg-[#B88E52]/5' 
                    : file 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-300 hover:bg-gray-50 cursor-pointer'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                {/* Input tersembunyi */}
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      <FileCheck2 className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[#11223a] font-bold text-lg break-all max-w-md">{file.name}</p>
                      <p className="text-gray-500 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      className="mt-4 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <X className="w-4 h-4" /> Batal Ganti File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors mb-2 ${isDragging ? 'bg-[#B88E52]/10 text-[#B88E52]' : 'bg-gray-100 text-gray-400'}`}>
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[#11223a] font-bold text-lg">
                        {isDragging ? 'Lepaskan file di sini' : 'Klik atau Drag file baru ke sini'}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">Hanya jika ingin mengganti file yang ada.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-[#11223a] mb-2">
                  Judul Media <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Puncak Padar"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all text-[#11223a] placeholder-gray-400"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-[#11223a] mb-2">
                  Lokasi Spesifik <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Pulau Padar"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all text-[#11223a] placeholder-gray-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Area Destinasi & Trip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-[#11223a] mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all appearance-none cursor-pointer text-[#11223a]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Trip/Voyage Name */}
              <div>
                <label className="block text-sm font-bold text-[#11223a] mb-2">
                  Nama Trip
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Ship className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="Voyage Chapter 43"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all text-[#11223a] placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Trip Date */}
              <div>
                <label className="block text-sm font-bold text-[#11223a] mb-2">
                  Tanggal Trip
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    placeholder="15-18 Agt 2025"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all text-[#11223a] placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Media Type (Radio) */}
            <div>
              <label className="block text-sm font-bold text-[#11223a] mb-3">Format Media (Diatur Otomatis oleh Sistem)</label>
              <div className="flex gap-4 opacity-70 pointer-events-none">
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${type === 'image' ? 'border-[#B88E52] bg-[#B88E52]/5 text-[#B88E52]' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                  <ImageIcon className="w-5 h-5" />
                  <span className="font-bold">Photo / Image</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${type === 'reel' ? 'border-[#11223a] bg-[#11223a] text-white shadow-md' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                  <PlaySquare className="w-5 h-5" />
                  <span className="font-bold">Reel (Vertical)</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
              {isSubmitting && <p className="text-[#B88E52] font-semibold text-sm mb-3 animate-pulse">{uploadStatus}</p>}
              <button
                type="submit"
                disabled={isSubmitting || isAuthChecking || !user}
                className="w-full flex items-center justify-center gap-2 bg-[#11223a] hover:bg-[#0f1f33] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting || isAuthChecking ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {isAuthChecking ? 'Memeriksa Akses...' : isSubmitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Kolom Kanan: Live Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Live Preview</h3>
            
            <div className={`relative bg-gray-100 rounded-2xl overflow-hidden shadow-inner mx-auto ${type === 'reel' ? 'aspect-[9/16] w-3/4' : 'aspect-[4/3] w-full'}`}>
              {previewSource ? (
                <>
                  {type === 'reel' ? (
                    <video 
                      src={previewSource} 
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                    />
                  ) : (
                    <img 
                      src={previewSource} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11223a]/80 via-transparent to-transparent"></div>
                  
                  {type === 'reel' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                        <PlaySquare className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h4 className="text-white font-bold leading-tight mb-1">{title || 'Judul Media...'}</h4>
                    <p className="text-white/80 text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {location || 'Lokasi...'}
                    </p>
                  </div>

                  <div className="absolute top-3 left-3 bg-[#B88E52] text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider z-10">
                    {categories.find(c => c.id === categoryId)?.label}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <ImageIcon className="w-12 h-12 mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Preview tidak tersedia</p>
                </div>
              )}
            </div>

            {tripName && (
              <div className="mt-4 p-4 bg-[#B88E52]/10 rounded-xl border border-[#B88E52]/20 text-center flex flex-col gap-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tergabung dalam arsip:</p>
                <p className="text-base font-bold text-[#B88E52] flex items-center justify-center gap-2">
                  <Ship className="w-4 h-4" /> {tripName}
                </p>
                {tripDate && (
                  <p className="text-xs text-[#B88E52]/80 flex items-center justify-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {tripDate}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}