'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  FileText, 
  Eye, 
  Loader2, 
  AlertTriangle,
  X,
  Filter,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  Calendar,
  User as UserIcon,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

// Tipe data Blog (Sudah ditambahkan coverImage)
interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: 'Published' | 'Draft';
  coverImage?: string; // Menyimpan link gambar dari Cloudflare R2
  createdAt: any; 
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Komponen Kustom Dropdown
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function CustomSelect({ value, onChange, options, placeholder = "Select..." }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States untuk Filter & View
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Default jadi grid agar cover R2 langsung kelihatan
  
  // State Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const blogsRef = collection(db, 'blogs');
      const q = query(blogsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const blogData: Blog[] = [];
      querySnapshot.forEach((doc) => {
        blogData.push({ id: doc.id, ...doc.data() } as Blog);
      });
      
      setBlogs(blogData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      try {
        const fallbackSnapshot = await getDocs(collection(db, 'blogs'));
        const fallbackData: Blog[] = [];
        fallbackSnapshot.forEach((doc) => {
          fallbackData.push({ id: doc.id, ...doc.data() } as Blog);
        });
        setBlogs(fallbackData);
      } catch (fallbackError) {
        console.error("Fallback fetch failed:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(blogs.map(b => b.category).filter(Boolean));
    return Array.from(cats);
  }, [blogs]);

  const categoryOptions = [
    { value: 'all', label: 'Semua Kategori' },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
  ];

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'Published', label: 'Telah Terbit (Published)' },
    { value: 'Draft', label: 'Draft / Konsep' }
  ];

  const confirmDelete = (blog: Blog) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!blogToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'blogs', blogToDelete.id));
      setBlogs(blogs.filter(b => b.id !== blogToDelete.id));
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = filterCategory === 'all' || blog.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
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
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#11223a] mb-2">Journal & Articles</h1>
            <p className="text-gray-500">Kelola konten blog, panduan wisata, dan berita PGI Voyage.</p>
          </div>
          <Link 
            href="/admin/blog/create" 
            className="inline-flex items-center gap-2 bg-[#11223a] hover:bg-[#0f1f33] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" /> Tulis Artikel Baru
          </Link>
        </motion.div>

        {/* Filter Cerdas Panel */}
        <motion.div variants={fadeInUp} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#11223a] font-bold">
              <Filter className="w-5 h-5 text-[#B88E52]" />
              Smart Filters
            </div>
            
            {/* View Mode Toggle */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-20">
            {/* 1. Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari judul, kategori, penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#11223a] placeholder-gray-400 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all"
              />
            </div>

            {/* 2. Kategori Dropdown */}
            <CustomSelect 
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryOptions}
            />

            {/* 3. Status Dropdown */}
            <CustomSelect 
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
            />
          </div>
          
          {/* Active Results Status */}
          <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 mt-4">
            <span>Ditemukan <strong>{filteredBlogs.length}</strong> artikel</span>
            {(filterCategory !== 'all' || filterStatus !== 'all' || searchQuery !== '') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterStatus('all');
                }}
                className="text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Data Layout Container */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 relative z-10">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#B88E52]" />
            <p>Memuat jurnal dari arsip...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 relative z-10">
            <FileText className="w-16 h-16 mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-[#11223a] mb-1">Artikel Tidak Ditemukan</h3>
            <p className="text-sm">Silakan ubah kriteria pencarian atau buat artikel baru.</p>
          </div>
        ) : (
          <motion.div 
            layout 
            className={`relative z-10 ${
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "flex flex-col gap-3"
            }`}
          >
            <AnimatePresence>
              {filteredBlogs.map((blog) => (
                <motion.div 
                  layout
                  key={blog.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all ${
                    viewMode === 'grid' ? 'flex flex-col' : 'flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 sm:gap-6'
                  }`}
                >
                  
                  {/* --- TAMPILAN JIKA GRID MODE (CARDS) --- */}
                  {viewMode === 'grid' ? (
                    <>
                      {/* TAMPILKAN COVER IMAGE DARI CLOUDFLARE R2 */}
                      <div className="h-44 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                        {blog.coverImage ? (
                          <img 
                            src={blog.coverImage} 
                            alt={blog.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          // Fallback jika artikel tidak punya cover
                          <div className="absolute inset-0 bg-gradient-to-r from-[#11223a] to-[#1a365d] flex items-center justify-center p-6">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent mix-blend-overlay"></div>
                            <ImageIcon className="w-12 h-12 text-white/20 absolute -bottom-4 -right-4 transform -rotate-12" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                          blog.status === 'Published' 
                            ? 'bg-emerald-500/90 text-white' 
                            : 'bg-amber-500/90 text-white'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          {blog.status}
                        </div>
                      </div>

                      {/* Konten Card */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-md bg-[#B88E52]/10 text-[#B88E52] text-[10px] font-black uppercase tracking-wider">
                            {blog.category || 'Uncategorized'}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-[#11223a] text-lg leading-tight mb-4 line-clamp-2" title={blog.title}>
                          {blog.title}
                        </h3>
                        
                        <div className="mt-auto space-y-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 shrink-0 text-gray-400" />
                            <span className="truncate">{blog.author || 'Admin'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 shrink-0 text-gray-400" />
                            <span>
                              {blog.createdAt ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'long', year: 'numeric'
                              }) : 'Draft'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons (Grid) */}
                        <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-gray-100">
                          <a 
                            href={`/blog/${blog.slug}`} 
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-[#11223a] rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" /> View
                          </a>
                          <Link 
                            href={`/admin/blog/edit/${blog.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" /> Edit
                          </Link>
                          <button 
                            onClick={() => confirmDelete(blog)}
                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    
                    /* --- TAMPILAN JIKA LIST MODE (ROWS) --- */
                    <>
                      {/* Icon & Details */}
                      <div className="flex-1 min-w-0 flex items-center gap-4 w-full">
                        {/* Thumbnail Kecil (List View) */}
                        <div className="hidden sm:flex w-16 h-16 bg-gray-50 rounded-xl items-center justify-center shrink-0 border border-gray-100 text-gray-400 overflow-hidden relative">
                          {blog.coverImage ? (
                            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#11223a] text-base md:text-lg truncate mb-1" title={blog.title}>
                            {blog.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 text-[#B88E52] font-semibold bg-[#B88E52]/10 px-2 py-0.5 rounded-md text-[10px] uppercase">
                              {blog.category || 'Uncategorized'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <UserIcon className="w-4 h-4" /> {blog.author || 'Admin'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {blog.createdAt ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              }) : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge (List) */}
                      <div className="shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                          blog.status === 'Published' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${blog.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {blog.status}
                        </span>
                      </div>

                      {/* Actions (List) */}
                      <div className="shrink-0 flex items-center justify-end gap-1 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:border-l sm:pl-4">
                        <a 
                          href={`/blog/${blog.slug}`} 
                          target="_blank"
                          title="Lihat Artikel"
                          className="flex-1 sm:flex-none flex justify-center p-2.5 text-gray-400 hover:text-[#11223a] hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                        <Link 
                          href={`/admin/blog/edit/${blog.id}`}
                          title="Edit Artikel"
                          className="flex-1 sm:flex-none flex justify-center p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <Edit3 className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => confirmDelete(blog)}
                          title="Hapus Artikel"
                          className="flex-1 sm:flex-none flex justify-center p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
              <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#11223a] mb-2">Hapus Artikel?</h3>
              <p className="text-gray-600 mb-8 text-sm">
                Apakah Anda yakin ingin menghapus artikel <strong>"{blogToDelete?.title}"</strong>? Tindakan ini tidak dapat dibatalkan dan artikel akan terhapus dari website publik.
              </p>
              
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Batal
                </button>
                <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}