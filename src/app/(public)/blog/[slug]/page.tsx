'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BRAND_NAME } from '@/lib/constants';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Calendar, User, Clock, ChevronLeft, Link as LinkIcon, Loader2, Mail, CheckCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

// 1. Tambahkan Interface yang rapi untuk menggantikan tipe 'any'
interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  content: string;
  coverImage?: string;
  formattedDate: string;
  readTime?: string;
  createdAt?: any;
}

interface CommentData {
  id: string;
  name: string;
  text: string;
  formattedDate: string;
  timestamp?: number;
  createdAt?: any;
}

interface RelatedArticle {
  title: string;
  slug: string;
  coverImage?: string;
  formattedDate: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function PublicBlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  // 2. Gunakan Interface pada State
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Toast Notification "Copy Link"
  const [showToast, setShowToast] = useState(false);

  // States untuk Form Komentar
  const [newComment, setNewComment] = useState({ name: '', email: '', text: '' });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Fitur Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Fitur Submit Komentar ke Firestore
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.name || !newComment.email || !newComment.text || !article?.id) return;
    
    setIsSubmittingComment(true);
    try {
      await addDoc(collection(db, 'comments'), {
        blogId: article.id,
        name: newComment.name,
        email: newComment.email,
        text: newComment.text,
        createdAt: serverTimestamp(),
        status: 'approved'
      });

      const newCommentData: CommentData = {
        id: Date.now().toString(),
        name: newComment.name,
        text: newComment.text,
        formattedDate: 'Just now',
        createdAt: new Date()
      };
      
      setComments([newCommentData, ...comments]);
      setNewComment({ name: '', email: '', text: '' }); 
      setCommentSuccess(true);
      
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      if (!slug) return;
      
      try {
        const blogsRef = collection(db, 'blogs');
        
        // 1. Fetch Artikel Utama
        const q = query(blogsRef, where('slug', '==', slug), where('status', '==', 'Published'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docData = doc.data();
          const articleId = doc.id;
          const dateObj = docData.createdAt?.toDate();
          const formattedDate = dateObj ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj) : 'Recently';
          
          setArticle({ id: articleId, ...docData, formattedDate } as Article);

          // 2. Fetch Komentar untuk artikel ini
          const commentsRef = collection(db, 'comments');
          const commentsQ = query(commentsRef, where('blogId', '==', articleId));
          const commentsSnap = await getDocs(commentsQ);
          
          const commentsData: CommentData[] = [];
          commentsSnap.forEach(c => {
            const cData = c.data();
            if (cData.status === 'approved' || !cData.status) {
              const cDateObj = cData.createdAt?.toDate();
              const cFormattedDate = cDateObj ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(cDateObj) : 'Just now';
              const timestamp = cDateObj ? cDateObj.getTime() : 0;
              
              commentsData.push({ 
                id: c.id, 
                name: cData.name,
                text: cData.text,
                formattedDate: cFormattedDate,
                timestamp: timestamp 
              });
            }
          });
          
          commentsData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setComments(commentsData);

          // 3. Fetch Artikel Terkait
          const relatedQ = query(blogsRef, where('status', '==', 'Published'), limit(4));
          const relatedSnap = await getDocs(relatedQ);
          const relatedData: RelatedArticle[] = [];
          
          relatedSnap.forEach(d => {
            const data = d.data();
            if (data.slug !== slug) {
              const dObj = data.createdAt?.toDate();
              const relFormattedDate = dObj ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(dObj) : 'Recently';
              
              relatedData.push({
                title: data.title,
                slug: data.slug,
                coverImage: data.coverImage,
                formattedDate: relFormattedDate
              });
            }
          });
          
          setRelatedArticles(relatedData.slice(0, 3));
          
        } else {
          setArticle(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleAndComments();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] pt-20">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#B88E52] animate-spin mb-4" />
        <p className="font-heading text-gray-500 font-medium animate-pulse text-sm md:text-base tracking-widest uppercase">Unfolding story...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#f8f9fa] pt-20 px-5 md:px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-[#0f172a] mb-4">Article Not Found</h1>
        <p className="text-gray-500 text-base md:text-lg mb-8 max-w-md font-light">The story you are looking for does not exist or has been archived.</p>
        <Link href="/blog" className="px-8 py-3.5 rounded-full bg-[#B88E52] text-white font-bold shadow-lg hover:bg-[#a37c46] transition-colors text-xs md:text-sm uppercase tracking-widest">
          Return to Journal
        </Link>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] min-h-screen relative overflow-x-hidden font-body">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className="fixed bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-2 md:gap-3 bg-[#0f172a] text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 w-max"
          >
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#B88E52]" />
            <span className="font-semibold text-xs md:text-sm tracking-widest uppercase">Link copied!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative w-full min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] flex flex-col justify-end pt-32 pb-12 md:pt-48 md:pb-16">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${article.coverImage || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop"}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/40 via-[#0f172a]/60 to-[#0f172a]"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 max-w-7xl mx-auto w-full px-5 md:px-6 lg:px-12 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-4 py-1.5 rounded-full bg-[#B88E52] text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 shadow-lg">
            {article.category || 'Editorial'}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 md:mb-8 leading-[1.2] md:leading-tight drop-shadow-lg tracking-tight max-w-5xl px-2 md:px-0">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-white/80 text-xs md:text-sm font-semibold uppercase tracking-widest">
            <span className="flex items-center gap-1.5 md:gap-2"><User className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#B88E52]" /> {article.author || 'Editorial Team'}</span>
            <span className="flex items-center gap-1.5 md:gap-2"><Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#B88E52]" /> {article.formattedDate}</span>
            <span className="flex items-center gap-1.5 md:gap-2"><Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#B88E52]" /> {article.readTime || '5 min read'}</span>
          </div>
        </motion.div>
      </section>

      {/* 2. MAIN LAYOUT (2 COLUMNS) */}
      <section className="relative z-20 px-0 sm:px-5 md:px-6 lg:px-12 md:-mt-10 pb-16 md:pb-24 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* KIRI: KONTEN ARTIKEL & KOMENTAR */}
          <div className="w-full lg:w-2/3 bg-transparent sm:bg-white sm:rounded-[2rem] md:rounded-[3rem] sm:shadow-[0_20px_50px_rgba(15,23,42,0.04)] px-5 py-8 sm:p-8 md:p-12 lg:p-16 sm:border sm:border-gray-100">
            
            {/* Top Action & Share */}
            <div className="flex flex-row items-center justify-between gap-4 mb-8 md:mb-12 pb-6 md:pb-8 border-b border-gray-200 sm:border-gray-100">
              <Link href="/blog" className="inline-flex items-center gap-1.5 md:gap-2 text-gray-500 hover:text-[#B88E52] transition-colors text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Back to</span> Journal
              </Link>
              
              <div className="flex items-center gap-2 md:gap-3">
                <span className="hidden sm:inline text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Share:</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 bg-white sm:bg-transparent flex items-center justify-center text-gray-500 hover:border-[#0f172a] hover:bg-gray-50 transition-all shadow-sm sm:shadow-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 bg-white sm:bg-transparent flex items-center justify-center text-gray-500 hover:border-[#0f172a] hover:bg-gray-50 transition-all shadow-sm sm:shadow-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <button onClick={handleCopyLink} className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 bg-white sm:bg-transparent flex items-center justify-center text-gray-500 hover:border-[#0f172a] hover:bg-gray-50 transition-all shadow-sm sm:shadow-none focus:outline-none focus:ring-2 focus:ring-[#B88E52]">
                  <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>

            {/* Injeksi HTML dari TipTap Editor */}
            <div 
              className="article-content max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Author Signature & Tags */}
            <div className="mt-12 md:mt-16 pt-8 border-t border-gray-200 sm:border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#fdfaf5] border border-[#B88E52]/20 flex items-center justify-center text-[#B88E52] font-heading font-bold text-lg md:text-xl shrink-0">
                  {article.author?.charAt(0).toUpperCase() || 'E'}
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold mb-0.5 md:mb-1">Penned By</p>
                  <p className="font-heading font-bold text-[#0f172a] text-lg md:text-xl leading-tight">{article.author || 'Editorial Team'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                 <span className="px-4 py-1.5 rounded-full bg-white sm:bg-gray-50 text-gray-600 text-[10px] md:text-xs uppercase tracking-widest font-semibold border border-gray-200 sm:border-gray-100 shadow-sm sm:shadow-none">#{article.category?.replace(/\s+/g, '') || 'Article'}</span>
                 <span className="px-4 py-1.5 rounded-full bg-white sm:bg-gray-50 text-gray-600 text-[10px] md:text-xs uppercase tracking-widest font-semibold border border-gray-200 sm:border-gray-100 shadow-sm sm:shadow-none">#{BRAND_NAME.replace(/\s+/g, '')}</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* KOMENTAR SECTION                 */}
            {/* ========================================================= */}
            <div className="mt-12 md:mt-16 pt-10 md:pt-12 border-t border-gray-200 sm:border-gray-100">
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#0f172a] mb-6 md:mb-8">Join the Conversation</h3>
              
              {/* Form Leave a Reply */}
              <div className="bg-white sm:bg-[#fdfaf5] p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[2rem] border border-gray-200 sm:border-[#B88E52]/20 mb-10 md:mb-12 shadow-sm sm:shadow-none relative overflow-hidden">
                <AnimatePresence>
                  {commentSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-0 inset-x-0 bg-green-500 text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Insight shared successfully!
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <h4 className="font-heading text-xl md:text-2xl font-bold text-[#0f172a] mb-1.5 md:mb-2 mt-2">Leave a Reply</h4>
                <p className="text-xs md:text-sm text-gray-500 mb-5 md:mb-6 font-light">Your email address will not be published. Required fields are marked *</p>
                <form className="space-y-3 md:space-y-4" onSubmit={handleCommentSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <input 
                      type="text" 
                      placeholder="Name *" 
                      value={newComment.name}
                      onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                      className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] bg-white text-sm transition-all" 
                      required 
                      disabled={isSubmittingComment}
                    />
                    <input 
                      type="email" 
                      placeholder="Email *" 
                      value={newComment.email}
                      onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                      className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] bg-white text-sm transition-all" 
                      required 
                      disabled={isSubmittingComment}
                    />
                  </div>
                  <textarea 
                    placeholder="Your Insight *" 
                    rows={4} 
                    value={newComment.text}
                    onChange={(e) => setNewComment({...newComment, text: e.target.value})}
                    className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] bg-white text-sm resize-none transition-all" 
                    required
                    disabled={isSubmittingComment}
                  ></textarea>
                  <button 
                    type="submit" 
                    disabled={isSubmittingComment}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0f172a] text-white font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#1e293b] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmittingComment ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
                    ) : (
                      "Post Insight"
                    )}
                  </button>
                </form>
              </div>
              
              {/* Dynamic Comments List */}
              <div className="space-y-8 md:space-y-10">
                {comments.length > 0 ? (
                  comments.map((comment, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={comment.id || idx} 
                      className="flex gap-3 md:gap-6"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fdfaf5] border border-[#B88E52]/20 flex items-center justify-center text-[#B88E52] font-heading font-bold text-lg shrink-0 shadow-sm">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-1">
                          <h5 className="font-bold text-[#0f172a] text-sm md:text-base">{comment.name}</h5>
                          <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400">{comment.formattedDate}</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed pr-2 whitespace-pre-wrap font-light">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* KANAN: SIDEBAR (REKOMENDASI ARTIKEL) */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-28 h-fit space-y-6 md:space-y-8 pt-4 sm:pt-8 lg:pt-0 px-5 sm:px-0 pb-10 sm:pb-0">
            
            {/* Box Rekomendasi */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-[0_10px_40px_rgba(15,23,42,0.03)]">
              <h3 className="font-heading text-xl md:text-2xl font-bold text-[#0f172a] mb-5 md:mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 md:h-6 bg-[#B88E52] rounded-full inline-block"></span> Recommended
              </h3>
              
              <div className="space-y-5 md:space-y-6">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((rel, idx) => (
                    <Link key={idx} href={`/blog/${rel.slug}`} className="group flex gap-3 md:gap-4 items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        <img 
                          src={rel.coverImage || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=200"} 
                          alt={rel.title} 
                          // OPTIMASI: Lazy load untuk gambar di sidebar
                          loading="lazy" 
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f172a] text-xs md:text-sm leading-snug line-clamp-2 group-hover:text-[#B88E52] transition-colors mb-1.5 pr-2">{rel.title}</h4>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{rel.formattedDate}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs md:text-sm text-gray-500 italic">No other articles found.</p>
                )}
              </div>
              
              <Link href="/blog" className="mt-6 md:mt-8 flex items-center justify-center w-full py-3.5 rounded-full bg-gray-50 text-[#0f172a] text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors border border-gray-100">
                View All Journal Entries
              </Link>
            </div>

            {/* Box Newsletter Subscribe */}
            <div className="bg-[#0f172a] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-[#1e293b] shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B88E52]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 relative z-10">
                <Mail className="w-5 h-5 md:w-6 md:h-6 text-[#B88E52]" />
              </div>
              <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-2 relative z-10">Exclusive Travel Updates</h3>
              <p className="text-gray-400 text-xs md:text-sm mb-5 md:mb-6 relative z-10 font-light">Subscribe for secret destinations and early-bird promo codes.</p>
              
              <form className="relative z-10" onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
                <input type="email" placeholder="Email address" className="w-full px-5 py-3 md:py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs md:text-sm focus:outline-none focus:border-[#B88E52] mb-2.5 md:mb-3 backdrop-blur-sm" required />
                <button type="submit" className="w-full py-3 rounded-xl bg-[#B88E52] text-white text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#a37c46] transition-colors">Subscribe</button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Global Style untuk TipTap HTML Khusus Mobile & Desktop */}
      <style dangerouslySetInnerHTML={{__html: `
        .article-content { font-family: var(--font-body), sans-serif; overflow-wrap: break-word; word-wrap: break-word; }
        
        /* Drop cap effect */
        .article-content > p:first-of-type::first-letter { 
          font-family: var(--font-heading), serif;
          font-size: 3.5rem; 
          font-weight: 800; 
          float: left; 
          line-height: 0.8; 
          margin-right: 0.75rem; 
          color: #0f172a; 
          margin-top: 0.2rem; 
        }
        
        /* Paragraphs */
        .article-content p { color: #374151; line-height: 1.8; font-size: 1rem; margin-bottom: 1.5rem; font-weight: 300; }
        
        /* Headings */
        .article-content h2 { font-family: var(--font-heading), serif; font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-top: 3rem; margin-bottom: 1.25rem; line-height: 1.3; }
        .article-content h3 { font-family: var(--font-heading), serif; font-size: 1.35rem; font-weight: 700; color: #0f172a; margin-top: 2.5rem; margin-bottom: 1rem; }
        
        /* Lists */
        .article-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; color: #374151; font-size: 1rem; line-height: 1.8; font-weight: 300;}
        .article-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; color: #374151; font-size: 1rem; line-height: 1.8; font-weight: 300;}
        .article-content li { margin-bottom: 0.75rem; }
        
        /* Quotes */
        .article-content blockquote { 
          border-left-width: 3px; 
          border-color: #B88E52; 
          padding-left: 1.5rem; 
          font-style: italic; 
          color: #0f172a; 
          margin: 2.5rem 0; 
          font-family: var(--font-heading), serif;
          font-size: 1.25rem; 
          line-height: 1.6; 
        }
        
        /* Bold */
        .article-content strong { font-weight: 700; color: #0f172a; }
        
        /* Images inside TipTap - Style bawaan ini sudah sangat aman untuk gambar ukuran besar dari Cloudflare R2! */
        .article-content img { 
          max-width: 100%; 
          height: auto; 
          border-radius: 1rem; 
          box-shadow: 0 10px 30px rgba(15,23,42,0.08); 
          margin: 3rem auto; 
          display: block; 
        }

        /* Responsif Desktop/Tablet Besar */
        @media (min-width: 768px) {
          .article-content > p:first-of-type::first-letter { font-size: 4.5rem; }
          .article-content p { font-size: 1.125rem; line-height: 1.9; }
          .article-content h2 { font-size: 2.25rem; }
          .article-content h3 { font-size: 1.75rem; }
          .article-content ul, .article-content ol { font-size: 1.125rem; }
          .article-content blockquote { font-size: 1.5rem; padding-left: 2rem; margin: 3.5rem 0; }
        }
      `}} />

    </main>
  );
} 