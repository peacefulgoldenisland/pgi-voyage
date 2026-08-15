'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Mengambil instance auth dari file yang baru kita buat
import { Lock, Mail, Ship, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mencoba login ke Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Set cookie 'admin_session' agar Middleware Next.js tahu user sudah login
      document.cookie = "admin_session=true; path=/; max-age=86400"; // Berlaku 1 hari
      
      // Jika berhasil, arahkan ke halaman Dashboard Admin
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      // Penanganan pesan error agar lebih mudah dipahami
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email atau password salah. Silakan coba lagi.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Terlalu banyak percobaan gagal. Akun terkunci sementara, coba lagi nanti.');
      } else {
        setError('Terjadi kesalahan saat login. Hubungi tim teknis.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b1728] px-6 relative overflow-hidden">
      {/* Ornamen Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#B88E52]/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Tombol Kembali ke Home */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#B88E52] transition-colors text-sm font-medium">
            <ArrowRight className="w-4 h-4 rotate-180" /> Kembali ke Website Utama
          </a>
        </div>

        {/* Card Login */}
        <div className="bg-[#11223a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-[#1a3356] border border-[#B88E52]/30 flex items-center justify-center mb-6 shadow-inner">
              <Ship className="w-8 h-8 text-[#B88E52]" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">PGI Command</h1>
            <p className="text-gray-400 text-center text-sm">
              Sistem Manajemen Terpadu PGI Voyage.<br/> Silakan masuk menggunakan kredensial otoritas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pgivoyage.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0b1728]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0b1728]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52] transition-all"
                  required
                />
              </div>
            </div>

            {/* Pesan Error */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              </motion.div>
            )}

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-[#B88E52] hover:bg-[#a37c46] text-white font-bold transition-all shadow-[0_4px_20px_rgba(184,142,82,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengautentikasi...
                </>
              ) : (
                <>
                  Akses Sistem <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
          </form>
          
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" /> Enkripsi Keamanan Diaktifkan
            </p>
          </div>

        </div>
      </motion.div>
    </main>
  );
} 