'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Loader2, AlignLeft, Tags, User as UserIcon, Activity,
  Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, 
  Undo, Redo, Image as ImageIcon, Link as LinkIcon, UploadCloud, FileCheck2, 
  X, AlertTriangle, PenTool, Archive, MousePointerClick
} from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapImage from '@tiptap/extension-image';

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const categories = ["Travel Guide", "Wildlife", "Destinations", "Tips & Tricks", "Lifestyle", "Culinary"];

// --- TIPTAP MENU BAR COMPONENT ---
const MenuBar = ({ editor, onOpenImageModal }: { editor: any, onOpenImageModal: () => void }) => {
  if (!editor) return null;

  const buttonClass = (isActive: boolean) => `
    p-2.5 rounded-xl transition-all duration-200
    ${isActive ? 'bg-[#11223a] text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-100 hover:text-[#11223a]'}
  `;

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-3 bg-gray-50/80 border-b border-gray-200/80 sticky top-0 z-10 backdrop-blur-md">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))} title="Bold"><Bold className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))} title="Italic"><Italic className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={buttonClass(editor.isActive('strike'))} title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>

      <div className="w-px h-6 bg-gray-300 mx-2"></div>

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))} title="Heading 2"><Heading2 className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass(editor.isActive('heading', { level: 3 }))} title="Heading 3"><Heading3 className="w-4 h-4" /></button>

      <div className="w-px h-6 bg-gray-300 mx-2"></div>

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))} title="Bullet List"><List className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))} title="Ordered List"><ListOrdered className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={buttonClass(editor.isActive('blockquote'))} title="Blockquote"><Quote className="w-4 h-4" /></button>

      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      
      {/* Custom Modal Trigger */}
      <button type="button" onClick={onOpenImageModal} className="p-2.5 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors" title="Insert Image"><ImageIcon className="w-4 h-4" /></button>

      <div className="w-px h-6 bg-gray-300 mx-2"></div>

      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="p-2.5 text-gray-400 hover:text-[#11223a] transition-colors disabled:opacity-30" title="Undo"><Undo className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="p-2.5 text-gray-400 hover:text-[#11223a] transition-colors disabled:opacity-30" title="Redo"><Redo className="w-4 h-4" /></button>
    </div>
  );
};

export default function CreateBlogPage() {
  const router = useRouter();
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [author, setAuthor] = useState('Editorial Team');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Draft');
  
  // Cover Image Upload State
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');

  // Editor Image Modal State (NEW LOGIC)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [editorImageFile, setEditorImageFile] = useState<File | null>(null);
  const [isEditorImageDragging, setIsEditorImageDragging] = useState(false);
  const [isUploadingEditorImage, setIsUploadingEditorImage] = useState(false);
  const editorFileInputRef = useRef<HTMLInputElement>(null);

  // Cek Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Inisialisasi TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl shadow-lg my-8 max-w-full h-auto border border-gray-100',
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'p-8 min-h-[600px] focus:outline-none tiptap-editor text-gray-700 text-lg leading-relaxed',
      },
    },
  });

  // Generator Slug Otomatis
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    const autoSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(autoSlug);
  };

  // --- CLOUDFLARE R2 UPLOAD FUNCTION ---
  const uploadToR2 = async (fileToUpload: File) => {
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal upload ke server');
      }
      
      if (data.url) return data.url;
      throw new Error('Gagal mendapatkan URL dari Cloudflare R2');
    } catch (err) {
      console.error("R2 upload error:", err);
      throw new Error('Gagal mengunggah gambar ke Cloudflare R2.');
    }
  };

  // --- COVER FILE HANDLING LOGIC ---
  const processCoverFile = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) { 
      setError("Ukuran gambar terlalu besar. Maksimal 5MB.");
      return;
    }
    if (!selectedFile.type.startsWith('image/')) {
      setError("Cover artikel harus berupa gambar (JPG/PNG).");
      return;
    }
    setFile(selectedFile);
    setError('');
    setLocalPreview(URL.createObjectURL(selectedFile));
  };

  const clearCoverFile = () => {
    setFile(null);
    setLocalPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- EDITOR IMAGE MODAL HANDLING LOGIC ---
  const processEditorFile = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar. Maksimal 5MB.");
      return;
    }
    if (!selectedFile.type.startsWith('image/')) {
      alert("Harus berupa gambar (JPG/PNG/WEBP).");
      return;
    }
    setEditorImageFile(selectedFile);
    setImageUrlInput(''); // Bersihkan URL jika user milih file
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setImageUrlInput('');
    setEditorImageFile(null);
  };

  const handleInsertImage = async () => {
    if (!editor) return;

    if (editorImageFile) {
      // 1. Jika User upload file (Cloudflare R2)
      setIsUploadingEditorImage(true);
      try {
        const r2Url = await uploadToR2(editorImageFile);
        editor.chain().focus().setImage({ src: r2Url }).run();
        closeImageModal();
      } catch (err) {
        alert("Gagal mengunggah gambar ke server R2.");
      } finally {
        setIsUploadingEditorImage(false);
      }
    } else if (imageUrlInput) {
      // 2. Jika User pakai URL manual
      editor.chain().focus().setImage({ src: imageUrlInput }).run();
      closeImageModal();
    }
  };

  // --- SUBMIT ARTICLE LOGIC ---
  const saveArticle = async (targetStatus: 'Draft' | 'Published') => {
    setError('');

    if (!user) return setError('Sesi login tidak valid. Silakan login ulang.');
    if (!title) return setError("Judul artikel wajib diisi!");

    if (targetStatus === 'Published') {
      if (!content || content === '<p></p>') return setError("Konten artikel tidak boleh kosong untuk di-publish!");
      if (!file) return setError("Cover Image / Thumbnail wajib diunggah untuk di-publish.");
    }

    setIsSubmitting(true);
    setStatus(targetStatus);

    try {
      let finalCoverUrl = '';
      
      // Upload Cover ke R2 jika ada file
      if (file) {
        setUploadStatus('Mengunggah Cover Image...');
        finalCoverUrl = await uploadToR2(file);
      }

      setUploadStatus(targetStatus === 'Draft' ? 'Menyimpan ke Draft...' : 'Publishing Artikel...');
      
      // Simpan ke Firestore
      await addDoc(collection(db, 'blogs'), {
        title,
        slug,
        content,
        coverImage: finalCoverUrl,
        category,
        author,
        status: targetStatus,
        createdAt: serverTimestamp(),
      });
      
      router.push('/admin/blog');
    } catch (err: any) {
      console.error("Gagal menyimpan artikel:", err);
      setError(err.message || "Gagal menyimpan artikel.");
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  return (
    <>
      <motion.form 
        onSubmit={(e) => e.preventDefault()}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-8 max-w-[1400px] mx-auto pb-20 relative z-0"
      >
        {/* Top Action Bar */}
        <motion.div variants={fadeInUp} className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-5">
            <button 
              type="button"
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#11223a] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#11223a] leading-tight flex items-center gap-2">
                <PenTool className="w-6 h-6 text-[#B88E52]" /> Tulis Artikel
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Buat jurnal, panduan, atau berita perjalanan epik.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button 
              type="button"
              onClick={() => saveArticle('Draft')}
              disabled={isSubmitting || isAuthChecking}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                status === 'Draft' && isSubmitting 
                  ? 'bg-amber-100 text-amber-700 opacity-70' 
                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              {isSubmitting && status === 'Draft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
              {isSubmitting && status === 'Draft' ? 'Menyimpan...' : 'Simpan sbg Draft'}
            </button>
            
            <button 
              type="button"
              onClick={() => saveArticle('Published')}
              disabled={isSubmitting || isAuthChecking}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#11223a] hover:bg-[#0f1f33] text-white text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting && status === 'Published' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSubmitting && status === 'Published' ? uploadStatus || 'Menyimpan...' : 'Publish Artikel'}
            </button>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center justify-between shadow-sm relative z-20"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* KOLOM KIRI (Editor Utama) */}
          <motion.div variants={fadeInUp} className="w-full lg:w-2/3 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative z-10">
              
              {/* Input Judul */}
              <div className="p-8 pb-4 border-b border-gray-50 bg-gray-50/30">
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Tulis Judul Artikel di Sini..."
                  className="w-full bg-transparent text-4xl font-black text-[#11223a] focus:outline-none placeholder:text-gray-300 transition-all"
                />
                <div className="flex items-center gap-2 mt-4 text-sm font-mono text-gray-400 bg-white inline-flex px-4 py-2 rounded-xl border border-gray-100 shadow-inner">
                  <LinkIcon className="w-4 h-4 text-[#B88E52]" /> 
                  <span className="truncate max-w-[300px] sm:max-w-md">/blog/{slug || 'url-otomatis'}</span>
                </div>
              </div>

              {/* TipTap Rich Text Editor */}
              <div className="editor-container relative z-10">
                <MenuBar editor={editor} onOpenImageModal={() => setIsImageModalOpen(true)} />
                <div className="bg-white">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* KOLOM KANAN (Metadata & Cover Image) */}
          <motion.div variants={fadeInUp} className="w-full lg:w-1/3 space-y-6 relative z-10">
            
            {/* Card: Cover Image Settings (CLOUDFLARE R2) */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B88E52]/5 rounded-bl-[100px] -z-0 pointer-events-none"></div>
              
              <label className="flex items-center justify-between text-sm font-bold text-[#11223a] mb-5 relative z-10">
                <span className="flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5 text-[#B88E52]" /> Cover Artikel</span>
                <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg font-black">Wajib (Publish)</span>
              </label>
              
              {/* Drag & Drop Area */}
              <div 
                className={`relative border-2 border-dashed rounded-3xl p-6 transition-all text-center z-10 overflow-hidden ${
                  isDragging 
                    ? 'border-[#B88E52] bg-[#B88E52]/5 scale-[1.02]' 
                    : file 
                      ? 'border-transparent bg-gray-50' 
                      : 'border-gray-200 hover:border-[#B88E52]/50 hover:bg-gray-50 cursor-pointer'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) processCoverFile(droppedFile);
                }}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) processCoverFile(selectedFile);
                  }}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                {localPreview ? (
                  <div className="relative group rounded-2xl overflow-hidden aspect-video shadow-inner">
                    <img src={localPreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[#11223a]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearCoverFile(); }}
                        className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg"
                      >
                        <X className="w-4 h-4" /> Hapus Cover
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4 pointer-events-none">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-[#B88E52] text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-[#11223a] font-bold text-base">
                        {isDragging ? 'Lepaskan Gambar' : 'Klik atau Drag Gambar'}
                      </p>
                      <p className="text-gray-400 text-xs mt-1.5 font-medium">Format: JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Publish Settings */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-[#11223a] text-lg mb-6 border-b border-gray-100 pb-4">Metadata Artikel</h3>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2.5">
                  <Tags className="w-4 h-4 text-[#B88E52]" /> Kategori Topik
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#11223a] font-bold focus:outline-none focus:border-[#B88E52] focus:ring-4 focus:ring-[#B88E52]/10 transition-all appearance-none cursor-pointer relative z-10 bg-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2.5">
                  <UserIcon className="w-4 h-4 text-[#B88E52]" /> Penulis (Author)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Nama Penulis"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#11223a] focus:outline-none focus:border-[#B88E52] focus:ring-4 focus:ring-[#B88E52]/10 transition-all placeholder-gray-400"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-gray-50">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-100/80">
                    <Archive className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-800/80 font-medium leading-relaxed">
                      <strong className="text-amber-900">Draft:</strong> Simpan progress penulisanmu. Hanya butuh Judul untuk menyimpan.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100/50">
                    <Activity className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
                      <strong className="text-blue-900">Publish:</strong> Artikel otomatis tampil di halaman publik (Butuh Cover & Konten).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Global Style overrides untuk TipTap Content */}
        <style dangerouslySetInnerHTML={{__html: `
          .tiptap-editor p { margin-bottom: 1.2rem; color: #4b5563; }
          .tiptap-editor h2 { font-size: 2rem; font-weight: 900; color: #11223a; margin-top: 3rem; margin-bottom: 1.5rem; line-height: 1.2; letter-spacing: -0.03em; }
          .tiptap-editor h3 { font-size: 1.5rem; font-weight: 800; color: #11223a; margin-top: 2.5rem; margin-bottom: 1rem; }
          .tiptap-editor ul { list-style-type: none; padding-left: 0; margin-bottom: 2rem; }
          .tiptap-editor ul li { position: relative; padding-left: 1.75rem; margin-bottom: 0.75rem; color: #4b5563; }
          .tiptap-editor ul li::before { content: '•'; position: absolute; left: 0.5rem; color: #B88E52; font-weight: bold; font-size: 1.2rem; line-height: 1; }
          .tiptap-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 2rem; color: #4b5563; }
          .tiptap-editor ol li { margin-bottom: 0.75rem; padding-left: 0.5rem;}
          .tiptap-editor ol li::marker { color: #B88E52; font-weight: bold; }
          .tiptap-editor blockquote { position: relative; padding: 2rem 2.5rem; margin: 3rem 0; font-style: italic; color: #11223a; font-weight: 500; font-size: 1.25rem; line-height: 1.6; background: linear-gradient(to right, #fdfaf5, #ffffff); border-radius: 1.5rem; border: 1px solid #f3e8d6; box-shadow: 0 10px 30px -10px rgba(184, 142, 82, 0.1); text-align: center; }
          .tiptap-editor blockquote::before { content: '"'; position: absolute; top: -1rem; left: 50%; transform: translateX(-50%); font-size: 4rem; color: #B88E52; opacity: 0.2; font-family: serif; line-height: 1; }
          .tiptap-editor strong { font-weight: 800; color: #11223a; }
          .tiptap-editor a { color: #B88E52; text-decoration: underline; text-underline-offset: 4px; font-weight: 600; }
          .tiptap-editor p.is-editor-empty:first-child::before { content: 'Mulai menulis cerita perjalanan yang menakjubkan...'; color: #cbd5e1; float: left; height: 0; pointer-events: none; font-style: italic; }
        `}} />
      </motion.form>

      {/* --- CUSTOM EDITOR IMAGE MODAL --- */}
      <AnimatePresence>
        {isImageModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11223a]/60 backdrop-blur-md">
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-[#11223a] flex items-center gap-2 text-lg">
                  <ImageIcon className="w-5 h-5 text-[#B88E52]" /> Sisipkan Gambar ke Artikel
                </h3>
                <button 
                  onClick={closeImageModal}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                
                {/* Opsi 1: Upload File */}
                <div>
                  <label className="block text-sm font-bold text-[#11223a] mb-3">Opsi 1: Upload dari Perangkat (Otomatis ke R2)</label>
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center overflow-hidden ${
                      isEditorImageDragging 
                        ? 'border-[#B88E52] bg-[#B88E52]/5 scale-[1.02]' 
                        : editorImageFile 
                          ? 'border-emerald-200 bg-emerald-50' 
                          : 'border-gray-200 hover:border-[#B88E52]/50 hover:bg-gray-50 cursor-pointer'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsEditorImageDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsEditorImageDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsEditorImageDragging(false);
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) processEditorFile(droppedFile);
                    }}
                    onClick={() => !editorImageFile && editorFileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) processEditorFile(selectedFile);
                      }}
                      ref={editorFileInputRef}
                      className="hidden"
                    />
                    
                    {editorImageFile ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FileCheck2 className="w-10 h-10 text-emerald-500 mb-2" />
                        <p className="text-emerald-800 font-bold text-sm truncate max-w-xs">{editorImageFile.name}</p>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditorImageFile(null); }}
                          className="mt-2 px-4 py-1.5 bg-white text-red-500 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                        >
                          Batal / Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 space-y-3 pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[#11223a] font-bold text-sm">Klik atau Drop Gambar di Sini</p>
                          <p className="text-gray-400 text-[11px] mt-1">Gambar akan diunggah ke Cloudflare R2</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">ATAU</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Opsi 2: Paste URL */}
                <div className={editorImageFile ? 'opacity-50 pointer-events-none' : ''}>
                  <label className="block text-sm font-bold text-[#11223a] mb-3">Opsi 2: Paste URL Eksternal (Unsplash, dll)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-[#11223a] focus:outline-none focus:border-[#B88E52] focus:ring-4 focus:ring-[#B88E52]/10 transition-all"
                    />
                  </div>
                </div>

              </div>
              
              <div className="p-6 pt-0 flex gap-3 bg-gray-50/50 mt-4 border-t border-gray-50 rounded-b-[2rem]">
                <button 
                  onClick={closeImageModal}
                  disabled={isUploadingEditorImage}
                  className="flex-1 py-3.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleInsertImage}
                  disabled={(!editorImageFile && !imageUrlInput) || isUploadingEditorImage}
                  className="flex-1 py-3.5 text-sm font-bold text-white bg-[#11223a] hover:bg-[#0f1f33] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                >
                  {isUploadingEditorImage ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Mengunggah...</>
                  ) : (
                    <><MousePointerClick className="w-4 h-4" /> Terapkan Gambar</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  ); 
}