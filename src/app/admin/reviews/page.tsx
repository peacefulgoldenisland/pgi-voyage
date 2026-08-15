'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // 🔥 TAMBAHAN: Import Link dari Next.js
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, CheckCircle2, XCircle, Trash2, Clock, MapPin, Search, Loader2,
  Image as ImageIcon, MessageSquareQuote, Filter, Quote, LayoutGrid,
  LayoutList, Eye, X, MessageCircleReply, Send, ExternalLink, RefreshCw
} from 'lucide-react';

// Icon TripAdvisor
const TripAdvisorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.957 9.878A12.022 12.022 0 0012 0 12.022 12.022 0 00.043 9.878a11.967 11.967 0 002.392 7.747 11.986 11.986 0 006.592 4.095V24h5.946v-2.28a11.986 11.986 0 006.592-4.095 11.967 11.967 0 002.392-7.747zM6.924 16.51A4.587 4.587 0 1111.511 11.92 4.587 4.587 0 016.924 16.51zm10.152 0a4.587 4.587 0 114.587-4.587 4.587 4.587 0 01-4.587 4.587zM6.924 9.174a2.752 2.752 0 102.752 2.752 2.752 2.752 0 00-2.752-2.752zm10.152 0a2.752 2.752 0 102.752 2.752 2.752 2.752 0 00-2.752-2.752z"/>
  </svg>
);

interface Review {
  id: string;
  name: string;
  origin: string;
  rating: number;
  text: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  reply?: string;
  repliedAt?: any;
  source?: 'direct' | 'tripadvisor';
  url?: string;
}

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';
type SourceFilterType = 'all' | 'direct' | 'tripadvisor';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(150));
      const querySnapshot = await getDocs(q);
      const data: Review[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Review);
      });
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Gagal memuat data ulasan. Periksa koneksi atau rules Firestore.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    setProcessingId(id);
    try {
      const reviewRef = doc(db, 'reviews', id);
      await updateDoc(reviewRef, { status: newStatus });
      setReviews(prev => prev.map(rev => rev.id === id ? { ...rev, status: newStatus } : rev));
      if (selectedReview && selectedReview.id === id) {
        setSelectedReview({ ...selectedReview, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal memperbarui status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus ulasan ini secara permanen? Data yang dihapus tidak dapat dikembalikan.")) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviews(prev => prev.filter(rev => rev.id !== id));
      if (selectedReview?.id === id) setSelectedReview(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Gagal menghapus ulasan.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    setIsReplying(true);
    try {
      await updateDoc(doc(db, 'reviews', selectedReview.id), {
        reply: replyText.trim(),
        repliedAt: serverTimestamp()
      });
      
      const updatedReviews = reviews.map(r => 
        r.id === selectedReview.id ? { ...r, reply: replyText.trim() } : r
      );
      setReviews(updatedReviews);
      setSelectedReview({ ...selectedReview, reply: replyText.trim() });
      alert("Balasan berhasil disimpan!");
    } catch (error) {
      console.error("Error saving reply:", error);
      alert("Gagal menyimpan balasan.");
    } finally {
      setIsReplying(false);
    }
  };

  const openPreview = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
  };

  const filteredReviews = reviews.filter(rev => {
    const matchesFilter = filter === 'all' || rev.status === filter;
    const revSource = rev.source || 'direct'; 
    const matchesSource = sourceFilter === 'all' || revSource === sourceFilter;
    
    const matchesSearch = rev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.origin.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSource && matchesSearch;
  });

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#B88E52]" />
        <p className="text-gray-500 font-medium">Memuat dan mengoptimasi data ulasan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER DENGAN TOMBOL SYNC */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#11223a] flex items-center gap-3">
            <MessageSquareQuote className="w-8 h-8 text-[#B88E52]" /> Guest Reviews
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Moderasi ulasan tamu. Tampilan List disarankan untuk memproses banyak data.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* 🔥 TOMBOL SYNC TRIPADVISOR */}
          <Link 
            href="/admin/reviews/tripadvisor"
            className="flex items-center gap-2 px-5 py-3 bg-[#34e0a1]/10 text-[#00a680] border border-[#34e0a1]/30 hover:bg-[#00a680] hover:text-white rounded-2xl font-bold text-sm transition-all shadow-sm group"
          >
            <TripAdvisorIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Sync TripAdvisor</span>
          </Link>

          <div className="bg-amber-50 border border-amber-200 px-6 py-3 rounded-2xl text-center min-w-[100px]">
            <span className="block text-2xl font-bold text-amber-600">{pendingCount}</span>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Menunggu</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-2xl text-center min-w-[100px]">
            <span className="block text-2xl font-bold text-emerald-600">{approvedCount}</span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Disetujui</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH & VIEW TOGGLE */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm sticky top-[88px] z-30">
        
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
            <Filter className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Hidden' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id as FilterType)} className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${filter === tab.id ? 'bg-[#11223a] text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar md:border-l border-gray-200 md:pl-4">
             <button onClick={() => setSourceFilter('all')} className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${sourceFilter === 'all' ? 'bg-[#11223a] text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                Semua Sumber
             </button>
             <button onClick={() => setSourceFilter('direct')} className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${sourceFilter === 'direct' ? 'bg-[#fdfaf5] text-[#B88E52] border border-[#B88E52]/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                Direct Web
             </button>
             <button onClick={() => setSourceFilter('tripadvisor')} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${sourceFilter === 'tripadvisor' ? 'bg-[#34e0a1]/20 text-[#00a680] border border-[#34e0a1]/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <TripAdvisorIcon className="w-3.5 h-3.5" /> TripAdvisor
             </button>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full xl:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari ulasan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all text-sm font-medium"
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#B88E52]' : 'text-gray-400 hover:text-[#11223a]'}`}>
              <LayoutList className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#B88E52]' : 'text-gray-400 hover:text-[#11223a]'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* REVIEWS RENDER AREA */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <MessageSquareQuote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak ada ulasan ditemukan</h3>
          <p className="text-gray-500">Mungkin belum ada tamu yang mengirim ulasan untuk filter ini.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {viewMode === 'list' ? (
            /* --- LIST VIEW --- */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              {filteredReviews.map((review) => {
                const date = review.createdAt ? (review.createdAt.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })) : 'Baru saja';
                const isProcessing = processingId === review.id;
                const isTripAdvisor = review.source === 'tripadvisor';

                return (
                  <motion.div 
                    key={review.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
                      review.status === 'pending' ? 'border-amber-200 hover:border-amber-400' :
                      review.status === 'approved' ? 'border-emerald-200 hover:border-emerald-400' : 'border-gray-200'
                    }`}
                  >
                    {isProcessing && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#B88E52]" />
                      </div>
                    )}

                    {/* Avatar / Thumbnail */}
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative cursor-pointer" onClick={() => openPreview(review)}>
                      {review.image ? (
                        <>
                          <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Eye className="w-5 h-5 text-white" /></div>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-400">{review.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Core Info */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-bold text-[#11223a] truncate text-base">{review.name}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md truncate max-w-[120px]"><MapPin className="w-3 h-3 inline mr-1 -mt-0.5" />{review.origin}</span>
                        {isTripAdvisor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#34e0a1]/20 text-[#00a680] border border-[#34e0a1]/30 rounded-md flex items-center gap-1">
                            <TripAdvisorIcon className="w-3 h-3" /> TripAdvisor
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1"><Clock className="w-3 h-3"/> {date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-0.5 shrink-0">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#B88E52] text-[#B88E52]' : 'fill-transparent text-gray-300'}`} />)}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1 italic">"{review.text}"</p>
                      </div>
                      {review.reply && <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md w-fit"><MessageCircleReply className="w-3.5 h-3.5" /> Dibalas</div>}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 justify-between lg:justify-end">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        review.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        review.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {review.status}
                      </div>

                      <div className="flex gap-1.5">
                        <button onClick={() => openPreview(review)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors border border-blue-100" title="Lihat & Balas"><Eye className="w-4 h-4" /></button>
                        {review.status !== 'approved' && <button onClick={() => handleUpdateStatus(review.id, 'approved')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-100" title="Setujui"><CheckCircle2 className="w-4 h-4" /></button>}
                        {review.status === 'approved' && <button onClick={() => handleUpdateStatus(review.id, 'rejected')} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors border border-amber-100" title="Sembunyikan"><XCircle className="w-4 h-4" /></button>}
                        <button onClick={() => handleDelete(review.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-100" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* --- GRID VIEW --- */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReviews.map((review) => {
                const date = review.createdAt ? (review.createdAt.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })) : 'Baru saja';
                const isProcessing = processingId === review.id;
                const isTripAdvisor = review.source === 'tripadvisor';

                return (
                  <motion.div key={review.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-white rounded-[2rem] border overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow relative ${
                      review.status === 'pending' ? 'border-amber-200' :
                      review.status === 'approved' ? 'border-emerald-200' : 'border-gray-200'
                    }`}
                  >
                    {isProcessing && <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#B88E52]" /></div>}

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                      {isTripAdvisor ? (
                        <div className="bg-[#34e0a1] text-[#000000] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md pointer-events-auto">
                          <TripAdvisorIcon className="w-3 h-3" /> TripAdvisor
                        </div>
                      ) : (
                        <div></div> // Spacer
                      )}
                      
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md pointer-events-auto ${
                        review.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {review.status === 'pending' && <Clock className="w-3 h-3" />}
                        {review.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {review.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {review.status}
                      </div>
                    </div>

                    {/* Image Attachment */}
                    {review.image ? (
                      <div className="h-48 w-full bg-gray-100 relative group overflow-hidden cursor-pointer" onClick={() => openPreview(review)}>
                        <img src={review.image} alt="Review attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2"><Eye className="w-4 h-4"/> Lihat Foto</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 w-full bg-gradient-to-r from-gray-50 to-gray-100"></div>
                    )}

                    <div className="p-6 flex flex-col flex-grow">
                      {/* Header */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-[#11223a]">{review.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#B88E52]" /> {review.origin}</span>
                          <span>•</span>
                          <span className="text-xs">{date}</span>
                        </div>
                        <div className="flex gap-1 mt-3">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#B88E52] text-[#B88E52]' : 'fill-transparent text-gray-300'}`} />)}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-grow mb-6 relative">
                        <Quote className="absolute top-2 right-2 w-8 h-8 text-gray-200 rotate-180" />
                        <p className="text-gray-700 text-sm leading-relaxed relative z-10 font-medium italic line-clamp-4 hover:line-clamp-none transition-all cursor-pointer" onClick={() => openPreview(review)}>
                          "{review.text}"
                        </p>
                      </div>

                      {review.reply && <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit"><MessageCircleReply className="w-4 h-4" /> Telah Dibalas</div>}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-auto">
                        <button onClick={() => openPreview(review)} className="flex items-center justify-center p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white border border-blue-200 hover:border-blue-500 rounded-xl transition-colors" title="Lihat Detail & Balas"><Eye className="w-4 h-4" /></button>
                        
                        {review.status !== 'approved' ? (
                          <button onClick={() => handleUpdateStatus(review.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-xl text-sm font-bold transition-colors">
                            <CheckCircle2 className="w-4 h-4" /> Setujui
                          </button>
                        ) : (
                          <button onClick={() => handleUpdateStatus(review.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-200 hover:border-amber-500 rounded-xl text-sm font-bold transition-colors">
                            <XCircle className="w-4 h-4" /> Sembunyikan
                          </button>
                        )}

                        <button onClick={() => handleDelete(review.id)} className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 rounded-xl transition-colors" title="Hapus Permanen"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* REVIEW PREVIEW MODAL */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0b1728]/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedReview(null)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-20">
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col lg:flex-row">
                {selectedReview.image && (
                  <div className="w-full lg:w-2/5 min-h-[300px] lg:min-h-[500px] bg-gray-900 relative">
                    <img src={selectedReview.image} alt="Guest moment" className="w-full h-full object-contain absolute inset-0" />
                  </div>
                )}

                <div className={`p-8 md:p-10 flex flex-col ${selectedReview.image ? 'w-full lg:w-3/5' : 'w-full'}`}>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider items-center gap-1.5 ${
                      selectedReview.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      selectedReview.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {selectedReview.status}
                    </div>
                    {selectedReview.source === 'tripadvisor' && (
                      <div className="inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider items-center gap-1.5 bg-[#34e0a1]/20 text-[#00a680] border border-[#34e0a1]/30">
                        <TripAdvisorIcon className="w-3.5 h-3.5"/> TripAdvisor
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold text-[#11223a] mb-2">{selectedReview.name}</h2>
                  <div className="flex items-center gap-4 text-gray-500 font-medium mb-6">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md"><MapPin className="w-4 h-4 text-[#B88E52]" /> {selectedReview.origin}</span>
                    <span className="text-sm">{selectedReview.createdAt ? (selectedReview.createdAt.seconds ? new Date(selectedReview.createdAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(selectedReview.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })) : 'Baru saja'}</span>
                  </div>

                  <div className="flex gap-1.5 mb-6 p-4 bg-[#fdfaf5] border border-[#B88E52]/20 rounded-2xl w-max">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-6 h-6 ${i < selectedReview.rating ? 'fill-[#B88E52] text-[#B88E52]' : 'fill-transparent text-gray-300'}`} />)}
                  </div>

                  <div className="relative mb-8 flex-grow">
                    <Quote className="absolute -top-4 -left-4 w-12 h-12 text-gray-100 rotate-180" />
                    <p className="text-gray-700 text-lg leading-relaxed relative z-10 italic">"{selectedReview.text}"</p>
                  </div>

                  {selectedReview.source === 'tripadvisor' && selectedReview.url && (
                    <a href={selectedReview.url} target="_blank" rel="noopener noreferrer" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#00a680] hover:text-[#008060] transition-colors">
                      Lihat ulasan asli di TripAdvisor <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {/* Admin Reply Section (Hanya untuk direct review) */}
                  {selectedReview.source !== 'tripadvisor' ? (
                    <div className="mt-4 pt-6 border-t border-gray-100">
                      <label className="flex items-center gap-2 text-sm font-bold text-[#11223a] mb-3 uppercase tracking-wider">
                        <MessageCircleReply className="w-4 h-4 text-[#B88E52]" /> Balasan PMM Voyage
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan untuk ulasan tamu ini..."
                        className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] min-h-[100px] text-gray-700 text-sm leading-relaxed resize-none bg-gray-50"
                      />
                      <div className="flex justify-end mt-3 mb-6">
                        <button onClick={handleSendReply} disabled={isReplying || !replyText.trim()} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11223a] hover:bg-[#0b1728] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md">
                          {isReplying ? 'Menyimpan...' : <>Simpan Balasan <Send className="w-4 h-4" /></>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-6 border-t border-gray-100">
                       <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl">Ulasan dari TripAdvisor tidak dapat dibalas melalui dashboard ini. Silakan balas langsung melalui akun TripAdvisor Anda.</p>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-auto">
                    {selectedReview.status !== 'approved' && (
                      <button onClick={() => handleUpdateStatus(selectedReview.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5">
                        <CheckCircle2 className="w-5 h-5" /> Setujui & Tampilkan
                      </button>
                    )}
                    {selectedReview.status === 'approved' && (
                      <button onClick={() => handleUpdateStatus(selectedReview.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-white hover:bg-amber-600 rounded-xl font-bold transition-all shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5">
                        <XCircle className="w-5 h-5" /> Sembunyikan dari Publik
                      </button>
                    )}
                    <button onClick={() => handleDelete(selectedReview.id)} className="px-6 py-3.5 bg-white text-red-500 hover:bg-red-50 border border-red-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                      <Trash2 className="w-5 h-5" /> Hapus
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
} 