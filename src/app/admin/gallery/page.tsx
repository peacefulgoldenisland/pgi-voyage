'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  AlertTriangle,
  X,
  PlaySquare,
  MapPin,
  Calendar,
  Filter,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  Edit
} from 'lucide-react';
import Link from 'next/link';

// Tipe Data Media
interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'reel';
  categoryId: string;
  tripId: string; 
  tripName?: string; 
  location: string;
  src: string; 
  storagePath: string; 
  createdAt: any;
  isDummy?: boolean;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const categoriesMap: Record<string, string> = {
  'vessel': 'KM Pulau Mas 88',
  'kenawa': 'Kenawa Island',
  'whaleshark': 'Saleh Bay (Whale Shark)',
  'komodo': 'Komodo Island',
  'pinkbeach': 'Pink Beach',
  'padar': 'Padar Island',
  'majarite': 'Majarite & Kelor'
};

// Data Mockup Unsplash
const dummyAdminMedia: MediaItem[] = [
  { id: 'd1', title: 'Pesta Kapal Saat Senja', type: 'reel', categoryId: 'vessel', tripId: 't1', tripName: 'Voyage Chapter 42', location: 'Laut Flores', src: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop', storagePath: '', createdAt: new Date(), isDummy: true },
  { id: 'd2', title: 'Puncak Padar', type: 'image', categoryId: 'padar', tripId: 't1', tripName: 'Voyage Chapter 42', location: 'Pulau Padar', src: 'https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=800&auto=format&fit=crop', storagePath: '', createdAt: new Date(), isDummy: true },
  { id: 'd3', title: 'Berenang Bersama Hiu Paus', type: 'image', categoryId: 'whaleshark', tripId: 't1', tripName: 'Voyage Chapter 42', location: 'Teluk Saleh', src: 'https://images.unsplash.com/photo-1580580297368-c782fb65d271?q=80&w=800&auto=format&fit=crop', storagePath: '', createdAt: new Date(), isDummy: true },
  { id: 'd4', title: 'Pasir Pantai Pink', type: 'image', categoryId: 'pinkbeach', tripId: 't2', tripName: 'Voyage Chapter 41', location: 'Pantai Pink', src: 'https://images.unsplash.com/photo-1724127722795-96efb9caffbc?q=80&w=800&auto=format&fit=crop', storagePath: '', createdAt: new Date(), isDummy: true },
  { id: 'd5', title: 'Surga Snorkeling', type: 'reel', categoryId: 'majarite', tripId: 't2', tripName: 'Voyage Chapter 41', location: 'Majarite', src: 'https://images.unsplash.com/photo-1518182170546-076616fd6dc7?q=80&w=600&auto=format&fit=crop', storagePath: '', createdAt: new Date(), isDummy: true },
];

// Komponen Kustom Dropdown (Pengganti <select> bawaan browser)
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function CustomSelect({ value, onChange, options, placeholder = "Select..." }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown jika user klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none transition-all flex items-center justify-between text-left
          ${isOpen ? 'border-[#B88E52] ring-1 ring-[#B88E52]' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <span className={`block truncate ${selectedOption ? 'text-[#11223a] font-medium' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#B88E52]' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 custom-scrollbar"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center
                  ${value === opt.value 
                    ? 'bg-[#B88E52]/10 text-[#B88E52] font-bold border-l-2 border-[#B88E52]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#11223a] border-l-2 border-transparent'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminGalleryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States untuk Filter Cerdas
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'reel'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTrip, setFilterTrip] = useState<string>('all');
  
  // State untuk Mode Tampilan (Grid / List)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'galleries'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const data: MediaItem[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as MediaItem);
      });
      
      if (data.length === 0) {
        setMediaList(dummyAdminMedia);
      } else {
        setMediaList(data);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      setMediaList(dummyAdminMedia);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Ekstrak daftar Trip unik dari mediaList agar dropdown Trip dinamis
  const uniqueTrips = useMemo(() => {
    const tripsMap = new Map<string, string>();
    mediaList.forEach(m => {
      if (m.tripId && m.tripName) {
        tripsMap.set(m.tripId, m.tripName);
      }
    });
    return Array.from(tripsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [mediaList]);

  // Siapkan opsi untuk dropdown kustom
  const categoryOptions = [
    { value: 'all', label: 'All Destinations' },
    ...Object.entries(categoriesMap).map(([value, label]) => ({ value, label }))
  ];

  const tripOptions = [
    { value: 'all', label: 'All Voyages (Trips)' },
    ...uniqueTrips.map(trip => ({ value: trip.id, label: trip.name }))
  ];

  const confirmDelete = (media: MediaItem) => {
    setMediaToDelete(media);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!mediaToDelete) return;
    setIsDeleting(true);
    try {
      if (mediaToDelete.isDummy) {
        setMediaList(mediaList.filter(m => m.id !== mediaToDelete.id));
      } else {
        await deleteDoc(doc(db, 'galleries', mediaToDelete.id));
        setMediaList(mediaList.filter(m => m.id !== mediaToDelete.id));
        
        // TODO (Optional): Tambahkan logic penghapusan file di server Cloudflare R2
        // melalui endpoint khusus /api/upload/delete jika diperlukan di kemudian hari.
      }
      setIsDeleteModalOpen(false);
      setMediaToDelete(null);
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("Gagal menghapus media.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Logic Bertingkat (Cerdas)
  const filteredMedia = mediaList.filter(media => {
    const matchesSearch = 
      media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (media.tripName && media.tripName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      categoriesMap[media.categoryId]?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' ? true : media.type === filterType;
    const matchesCategory = filterCategory === 'all' ? true : media.categoryId === filterCategory;
    const matchesTrip = filterTrip === 'all' ? true : media.tripId === filterTrip;

    return matchesSearch && matchesType && matchesCategory && matchesTrip;
  });

  return (
    <>
      {/* Tambahkan sedikit style untuk scrollbar dropdown agar lebih rapi */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#11223a] mb-2">Gallery Assets</h1>
            <p className="text-gray-500">Manage photos and reels for Expedition Archives.</p>
          </div>
          <Link 
            href="/admin/gallery/create" 
            className="inline-flex items-center gap-2 bg-[#11223a] hover:bg-[#0f1f33] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" /> Upload Media
          </Link>
        </motion.div>

        {/* Filter Cerdas Panel */}
        <motion.div variants={fadeInUp} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#11223a] font-bold">
              <Filter className="w-5 h-5 text-[#B88E52]" />
              Advanced Filters
            </div>
            
            {/* View Mode Toggle (Grid / List) */}
            <div className="flex bg-gray-100 p-1 rounded-xl items-center border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#11223a] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#11223a] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20">
            {/* 1. Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#11223a] placeholder-gray-400 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all"
              />
            </div>

            {/* 2. Custom Destination/Category Dropdown */}
            <CustomSelect 
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryOptions}
            />

            {/* 3. Custom Voyage/Trip Dropdown */}
            <CustomSelect 
              value={filterTrip}
              onChange={setFilterTrip}
              options={tripOptions}
            />

            {/* 4. Format/Type Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-white text-[#11223a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('image')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'image' ? 'bg-white text-[#11223a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Photo
              </button>
              <button 
                onClick={() => setFilterType('reel')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'reel' ? 'bg-white text-[#11223a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <PlaySquare className="w-3.5 h-3.5" /> Reel
              </button>
            </div>
          </div>
          
          {/* Active Results Status */}
          <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 mt-4">
            <span>Menampilkan <strong>{filteredMedia.length}</strong> media aset</span>
            {(filterCategory !== 'all' || filterTrip !== 'all' || filterType !== 'all' || searchQuery !== '') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterTrip('all');
                  setFilterType('all');
                }}
                className="text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Media Layout Container */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 relative z-10">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#B88E52]" />
            <p>Loading media from secure vault...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 relative z-10">
            <ImageIcon className="w-16 h-16 mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-[#11223a] mb-1">No Media Found</h3>
            <p className="text-sm">Silakan ubah kriteria filter Anda atau unggah media baru.</p>
          </div>
        ) : (
          <motion.div 
            layout 
            className={`relative z-10 ${
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6" 
                : "flex flex-col gap-4"
            }`}
          >
            <AnimatePresence>
              {filteredMedia.map((media) => (
                <motion.div 
                  layout
                  key={media.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow ${
                    viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row items-center p-3 gap-5'
                  }`}
                >
                  
                  {/* --- TAMPILAN JIKA GRID MODE --- */}
                  {viewMode === 'grid' ? (
                    <>
                      {/* Image/Video Preview (Grid) */}
                      <div className={`relative w-full bg-gray-100 overflow-hidden ${media.type === 'reel' ? 'aspect-[9/16]' : 'aspect-[4/3]'}`}>
                        {media.type === 'reel' && !media.isDummy ? (
                          <video 
                            src={media.src} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            muted
                            autoPlay
                            loop
                            playsInline
                          />
                        ) : (
                          <img 
                            src={media.src} 
                            alt={media.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        
                        {/* Penanda Jika Data Dummy */}
                        {media.isDummy && (
                          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            MOCKUP
                          </div>
                        )}
                        
                        {/* Type Badge */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          {media.type === 'reel' ? <PlaySquare className="w-3 h-3 text-red-400" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
                          {media.type}
                        </div>

                        {/* Delete Button Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          {media.isDummy ? (
                            <button 
                              onClick={() => alert("Data Mockup tidak dapat diedit.")}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg"
                              title="Edit Media (Disabled for Mockup)"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          ) : (
                            <Link 
                              href={`/admin/gallery/edit/${media.id}`}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg"
                              title="Edit Media"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                          )}
                          <button 
                            onClick={() => confirmDelete(media)}
                            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg"
                            title="Delete Media"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Details (Grid) */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-[#11223a] text-sm line-clamp-1 mb-1" title={media.title}>{media.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="line-clamp-1">{categoriesMap[media.categoryId] || 'Unknown'}</span>
                        </div>
                        
                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                          {media.tripName ? (
                            <span className="flex items-center gap-1.5 text-[#B88E52] bg-[#B88E52]/10 px-2.5 py-1.5 rounded-lg w-full">
                              <Calendar className="w-3 h-3 shrink-0" /> 
                              <span className="truncate">{media.tripName}</span>
                            </span>
                          ) : (
                            <span className="w-full text-center px-2 py-1.5 bg-gray-50 rounded-lg">General Highlight</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    
                    /* --- TAMPILAN JIKA LIST MODE --- */
                    <>
                      {/* Thumbnail (List) */}
                      <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                        {media.type === 'reel' && !media.isDummy ? (
                          <video 
                            src={media.src} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            muted
                            autoPlay
                            loop
                            playsInline
                          />
                        ) : (
                          <img 
                            src={media.src} 
                            alt={media.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        {/* Type Icon Overlay */}
                        <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-md text-white">
                          {media.type === 'reel' ? <PlaySquare className="w-3 h-3 text-red-400" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
                        </div>
                        {media.isDummy && (
                          <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-gray-600 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                            MOCK
                          </div>
                        )}
                      </div>

                      {/* Details (List) */}
                      <div className="flex-1 min-w-0 py-2">
                        <h3 className="font-bold text-[#11223a] text-base md:text-lg truncate mb-1">{media.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-500 mt-2">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" /> 
                            {categoriesMap[media.categoryId] || 'Unknown'}
                          </span>
                          
                          {media.tripName ? (
                            <span className="flex items-center gap-1.5 text-[#B88E52] font-semibold">
                              <Calendar className="w-4 h-4" /> 
                              {media.tripName}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">General Highlight</span>
                          )}
                        </div>
                      </div>

                      {/* Actions (List) */}
                      <div className="shrink-0 px-2 md:px-4 border-l border-gray-100 flex items-center justify-center gap-2">
                        {media.isDummy ? (
                          <button 
                            onClick={() => alert("Data Mockup tidak dapat diedit.")}
                            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit Media (Disabled for Mockup)"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        ) : (
                          <Link 
                            href={`/admin/gallery/edit/${media.id}`}
                            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit Media"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                        )}
                        <button 
                          onClick={() => confirmDelete(media)}
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Hapus Media"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}

                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-[#11223a]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10"
            >
              <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#11223a] mb-2">Delete Media?</h3>
              <p className="text-gray-600 mb-8 text-sm">
                Are you sure you want to permanently delete <strong>"{mediaToDelete?.title}"</strong>? {mediaToDelete?.isDummy ? 'This will remove the mockup from your screen.' : 'This action cannot be undone.'}
              </p>
              
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 