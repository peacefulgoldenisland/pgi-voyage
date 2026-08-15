'use client';

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BRAND_NAME } from "@/lib/constants";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, BookOpen, Clock, Star, Mail, Loader2, Filter, CheckCircle, Feather } from "lucide-react";

// 1. Tambahkan Interface TypeScript yang rapi (menggantikan 'any')
interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: string;
  coverImage?: string;
  content?: string;
  excerpt: string;
  formattedDate: string;
  readTime: string;
  createdAt: any;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

// Fungsi helper untuk membersihkan tag HTML dari isi artikel
const stripHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function BlogPage() {
  // Gunakan interface Blog yang sudah dibuat
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Filter Kategori
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");

  // State untuk Newsletter
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchPublishedBlogs = async () => {
      setIsLoading(true);
      try {
        const blogsRef = collection(db, 'blogs');
        // Hanya ambil yang Published, urutkan dari yang terbaru
        const q = query(blogsRef, where('status', '==', 'Published'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedBlogs: Blog[] = [];
        const uniqueCategories = new Set<string>();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Format tanggal
          const dateObj = data.createdAt?.toDate();
          const formattedDate = dateObj ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateObj) : 'Recently';
          
          // Buat excerpt (ringkasan 120 karakter) dari konten HTML
          const plainText = stripHtml(data.content || "");
          const excerpt = plainText.length > 120 ? plainText.substring(0, 120) + "..." : plainText;

          // Ekstrak Kategori Dinamis
          const category = data.category || "Uncategorized";
          uniqueCategories.add(category);

          fetchedBlogs.push({
            id: doc.id,
            ...data,
            category,
            formattedDate,
            excerpt,
            readTime: data.readTime || "5 min read"
          } as Blog);
        });
        
        setBlogs(fetchedBlogs);
        // Susun daftar kategori: "All" di urutan pertama
        setCategories(["All", ...Array.from(uniqueCategories)]);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedBlogs();
  }, []);

  // Handler untuk Form Newsletter Subscribe
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setSubscribeStatus('idle');

    try {
      await addDoc(collection(db, 'subscribers'), {
        email: email,
        source: 'Blog Page',
        createdAt: serverTimestamp(),
      });
      setSubscribeStatus('success');
      setEmail(""); // Kosongkan input setelah berhasil
      
      // Kembalikan status ke idle setelah 3 detik
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    } catch (error) {
      console.error("Error subscribing:", error);
      setSubscribeStatus('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  // 1. Artikel Pertama selalu menjadi Featured Post (Sorotan Utama) dan TIDAK terpengaruh filter
  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  
  // 2. Artikel sisanya masuk ke array Grid Posts
  const gridPosts = blogs.length > 1 ? blogs.slice(1) : [];

  // 3. Filter HANYA berlaku untuk Grid Posts
  const displayedGridPosts = activeCategory === "All" 
    ? gridPosts 
    : gridPosts.filter(post => post.category === activeCategory);

  return (
    <main className="flex flex-col w-full bg-[#f8f9fa] min-h-screen overflow-x-hidden font-body">
      
      {/* 1. HERO SECTION (MAGAZINE COVER STYLE) */}
      <section className="relative pt-28 pb-32 md:pt-40 md:pb-48 lg:pt-48 lg:pb-56 px-5 md:px-12 bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/70 to-[#0f172a]"></div>
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#B88E52]/10 rounded-full blur-[80px] md:blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-3xl mx-auto text-center mt-6 md:mt-0"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/5 border border-white/10 text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 backdrop-blur-md shadow-sm">
            <Feather className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Editorial Journal
          </motion.div>
          <motion.h1 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-md tracking-tight leading-[1.15] px-2">
            The Voyager's <br className="sm:hidden" /><span className="italic font-serif text-[#B88E52] font-medium">Chronicles</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-base md:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-light px-4 md:px-0">
            Immerse yourself in our curated tales of the sea. Discover exclusive travel guides, destination secrets, and majestic stories from {BRAND_NAME}.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. OVERLAPPING MAIN CONTENT AREA */}
      <section className="px-5 md:px-6 lg:px-12 mt-[-60px] md:mt-[-100px] relative z-20 pb-24 min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 p-12 md:p-20 relative z-10">
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#B88E52] animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-sm md:text-base tracking-widest uppercase">Curating stories...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 p-12 md:p-20 text-center relative z-10">
              <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-4 md:mb-6" />
              <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0f172a] mb-2">No Stories Yet</h2>
              <p className="text-gray-500 text-sm md:text-base">Check back later for new travel guides and stories.</p>
            </div>
          ) : (
            <>
              {/* === FEATURED POST (Artikel Terbaru - The Masterpiece) === */}
              {featuredPost && (
                <motion.a 
                  href={`/blog/${featuredPost.slug}`}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-[#0f172a]/10 border border-gray-100 flex flex-col lg:flex-row group cursor-pointer mb-12 md:mb-20 block transition-transform duration-500 hover:-translate-y-2 relative z-10"
                >
                  <div className="w-full lg:w-3/5 h-64 sm:h-80 lg:h-[500px] relative overflow-hidden bg-gray-100 shrink-0">
                    {featuredPost.coverImage ? (
                      <img 
                        src={featuredPost.coverImage} 
                        alt={featuredPost.title}
                        // OPTIMASI SEO & LCP: fetchPriority high untuk artikel sorotan
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#fdfaf5]">
                        <Feather className="w-16 h-16 text-[#B88E52]/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0f172a]/90 backdrop-blur-md text-white text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg">
                      <Star className="w-3 h-3 text-[#B88E52]" /> Editor's Pick
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-2/5 p-8 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center">
                    <div className="text-[#B88E52] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 md:mb-4">
                      {featuredPost.category}
                    </div>
                    <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#0f172a] mb-5 md:mb-6 leading-tight group-hover:text-[#B88E52] transition-colors line-clamp-3">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base lg:text-lg leading-relaxed mb-6 md:mb-8 line-clamp-3 font-light">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-6 text-[10px] md:text-xs text-gray-400 mb-6 md:mb-8 border-b border-gray-100 pb-6 md:pb-8 uppercase tracking-widest font-semibold">
                      <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#B88E52]"/> {featuredPost.formattedDate}</div>
                      <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#B88E52]"/> {featuredPost.readTime}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center shadow-md font-heading font-bold text-lg">
                          {featuredPost.author?.charAt(0).toUpperCase() || 'E'}
                        </div>
                        <span className="font-semibold text-[#0f172a] text-sm md:text-base tracking-wide">{featuredPost.author || 'Editorial Team'}</span>
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-[#B88E52] group-hover:border-[#B88E52] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.a>
              )}

              {/* === SECTION BAWAH: FILTER & GRID POSTS === */}
              {gridPosts.length > 0 && (
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={staggerContainer}
                >
                  {/* HEADER & FILTER STICKY */}
                  <div className="sticky top-[72px] md:top-[88px] z-40 bg-[#f8f9fa]/90 backdrop-blur-md pt-4 pb-4 md:pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-5 mb-8 md:mb-12 -mx-5 px-5 md:mx-0 md:px-0 border-b border-gray-200 md:border-none shadow-sm md:shadow-none">
                    <div>
                      <span className="text-[#B88E52] font-semibold tracking-widest uppercase text-xs md:text-sm mb-1.5 md:mb-2 block">More Inspiration</span>
                      <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f172a] shrink-0">
                        {activeCategory === "All" ? "Latest Publications" : `${activeCategory} Stories`}
                      </h3>
                    </div>
                    
                    {/* Horizontal Scroll Filter */}
                    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0 snap-x w-full md:w-auto">
                      <div className="flex items-center justify-center p-2.5 md:p-3 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 shrink-0">
                         <Filter className="w-4 h-4 text-[#B88E52]" />
                      </div>
                      {categories.map((cat, index) => {
                        const isActive = activeCategory === cat;
                        return (
                          <button 
                            key={index}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 md:px-6 py-2.5 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold transition-all duration-300 whitespace-nowrap snap-center border ${
                              isActive 
                                ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#B88E52] hover:text-[#B88E52]'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* GRID KONTEN EDITORIAL */}
                  <AnimatePresence mode="wait">
                    {displayedGridPosts.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 py-20 text-center shadow-sm"
                      >
                         <Feather className="w-12 h-12 text-gray-300 mb-4" />
                         <h3 className="font-heading text-xl md:text-2xl font-bold text-[#0f172a] mb-2">No Articles Found</h3>
                         <p className="text-gray-500 text-sm font-light">We couldn't find any other articles in the "{activeCategory}" category.</p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key={activeCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
                      >
                        {displayedGridPosts.map((post) => (
                          <motion.a 
                            href={`/blog/${post.slug}`}
                            key={post.id}
                            variants={fadeInUp}
                            className="bg-transparent group cursor-pointer flex flex-col block"
                          >
                            <div className="h-56 md:h-64 relative overflow-hidden bg-gray-100 shrink-0 rounded-[1.5rem] md:rounded-[2rem] mb-6 shadow-md border border-gray-100">
                              {post.coverImage ? (
                                <img 
                                  src={post.coverImage} 
                                  alt={post.title}
                                  // OPTIMASI: Gambar grid diload secara "lazy" agar menghemat kuota internet dan mempercepat halaman
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#fdfaf5] text-[#B88E52]/30">
                                  <BookOpen className="w-10 h-10 md:w-12 md:h-12" />
                                </div>
                              )}
                              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-[#0f172a] text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                {post.category}
                              </div>
                            </div>
                            
                            <div className="flex flex-col flex-grow px-2">
                              <div className="flex items-center gap-4 text-[9px] md:text-[10px] text-gray-400 mb-3 uppercase tracking-widest font-semibold">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-[#B88E52]"/> {post.formattedDate}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#B88E52]"/> {post.readTime}</span>
                              </div>
                              
                              <h4 className="font-heading text-xl md:text-2xl font-bold text-[#0f172a] mb-3 leading-snug group-hover:text-[#B88E52] transition-colors line-clamp-2">
                                {post.title}
                              </h4>
                              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3 font-light">
                                {post.excerpt}
                              </p>
                              
                              <div className="mt-auto pt-4 border-t border-gray-200 flex items-center text-[#B88E52] font-bold text-[10px] md:text-xs group-hover:text-[#a37c46] transition-colors uppercase tracking-widest">
                                Read Full Story <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </motion.a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
          
        </div>
      </section>

      {/* 3. NEWSLETTER SECTION (EXCLUSIVE CLUB THEME) */}
      <section className="py-16 md:py-24 px-5 md:px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto bg-[#0f172a] rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#B88E52]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-[#B88E52]/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-[#B88E52] to-[#a37c46] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg">
              <Mail className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">Join The Voyager's Club</h2>
            <p className="text-gray-300 mb-8 md:mb-10 text-sm md:text-lg max-w-xl mx-auto leading-relaxed font-light px-2 md:px-0">
              Subscribe to our private journal and receive exclusive travel guides, secret island destinations, and early-bird promotional offers directly to your inbox.
            </p>
            
            {/* Status Pesan Subscribe */}
            {subscribeStatus === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center justify-center gap-2 text-white bg-green-500/20 py-2.5 px-5 rounded-full w-max mx-auto border border-green-500/50 text-sm font-semibold tracking-wide"
              >
                <CheckCircle className="w-4 h-4" /> Successfully Subscribed!
              </motion.div>
            )}

            {subscribeStatus === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center justify-center gap-2 text-white bg-red-500/20 py-2.5 px-5 rounded-full w-max mx-auto border border-red-500/50 text-sm font-semibold tracking-wide"
              >
                Failed to subscribe. Please try again.
              </motion.div>
            )}

            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="flex-grow px-6 py-4 md:px-8 md:py-4 rounded-full border border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] text-sm md:text-base w-full disabled:opacity-50 backdrop-blur-sm" 
                required
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="px-8 py-4 rounded-full bg-[#B88E52] hover:bg-[#a37c46] text-white font-bold transition-all whitespace-nowrap shadow-lg w-full sm:w-auto text-sm md:text-base uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubscribing ? (
                  <><Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Subscribing...</>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

    </main>
  );
} 