'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { 
  Settings, Users, ShieldCheck, Plus, Trash2, Mail, 
  Loader2, Activity, Globe, Phone, AlertTriangle, CheckCircle2
} from 'lucide-react';

// Ganti dengan email developer / superadmin milikmu
const SUPERADMIN_EMAIL = 'developer@pgivoyage.com'; 

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'team'>('general');
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // State Team Management
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Editor');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Cek Akses Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Cek apakah yang login adalah superadmin
      if (currentUser?.email === SUPERADMIN_EMAIL) {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
        // Paksa ke tab general jika bukan superadmin
        if (activeTab === 'team') setActiveTab('general');
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  // Fetch Team Members dari Firestore
  const fetchTeamMembers = async () => {
    setIsLoadingTeam(true);
    try {
      const q = query(collection(db, 'admin_users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const members: any[] = [];
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
      setTeamMembers(members);
    } catch (error) {
      console.error("Gagal menarik data tim:", error);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team' && isSuperAdmin) {
      fetchTeamMembers();
    }
  }, [activeTab, isSuperAdmin]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsAddingMember(true);
    setMessage({ type: '', text: '' });

    try {
      // Cek apakah email sudah ada (bisa dikembangkan dengan query where)
      const existing = teamMembers.find(m => m.email === newEmail);
      if (existing) {
        throw new Error('Email ini sudah terdaftar di dalam tim.');
      }

      await addDoc(collection(db, 'admin_users'), {
        email: newEmail.toLowerCase(),
        role: newRole,
        addedBy: user?.email,
        createdAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: `Email ${newEmail} berhasil ditambahkan sebagai ${newRole}.` });
      setNewEmail('');
      fetchTeamMembers(); // Refresh data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal menambahkan anggota.' });
    } finally {
      setIsAddingMember(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleRemoveMember = async (id: string, email: string) => {
    if (email === SUPERADMIN_EMAIL) {
      alert("Tidak dapat menghapus akun Superadmin utama!");
      return;
    }
    
    if (confirm(`Yakin ingin mencabut akses admin untuk ${email}?`)) {
      try {
        await deleteDoc(doc(db, 'admin_users', id));
        fetchTeamMembers();
      } catch (error) {
        alert("Gagal menghapus anggota tim.");
      }
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88E52]/5 rounded-bl-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-[#11223a] flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-[#B88E52]" /> System Settings
          </h1>
          <p className="text-gray-500 font-medium">Kelola konfigurasi website B2C dan akses otoritas tim.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 relative z-10">
          <ShieldCheck className={`w-5 h-5 ${isSuperAdmin ? 'text-emerald-500' : 'text-blue-500'}`} />
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current Role</p>
            <p className="text-sm font-black text-[#11223a]">{isSuperAdmin ? 'Super Administrator' : 'Editor'}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'general' 
              ? 'border-[#B88E52] text-[#B88E52]' 
              : 'border-transparent text-gray-400 hover:text-[#11223a]'
          }`}
        >
          <Globe className="w-4 h-4" /> General Web Settings
        </button>
        
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 ${
              activeTab === 'team' 
                ? 'border-[#B88E52] text-[#B88E52]' 
                : 'border-transparent text-gray-400 hover:text-[#11223a]'
            }`}
          >
            <Users className="w-4 h-4" /> Team Access (Whitelist)
          </button>
        )}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        
        {/* --- GENERAL SETTINGS TAB --- */}
        {activeTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-[#11223a] mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#B88E52]" /> Konfigurasi Website Publik
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Booking Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="628123456789"
                      defaultValue="628123456789"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#11223a] focus:outline-none focus:border-[#B88E52] focus:ring-4 focus:ring-[#B88E52]/10 transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 font-medium">Gunakan kode negara (62). Nomor ini akan menerima lemparan booking B2C.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Instagram Link</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    defaultValue="https://instagram.com/peacefulgoldenisland"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#11223a] focus:outline-none focus:border-[#B88E52] focus:ring-4 focus:ring-[#B88E52]/10 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100">
                <button className="w-full sm:w-auto bg-[#11223a] hover:bg-[#0f1f33] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" /> Simpan Konfigurasi
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0c1828] to-[#11223a] p-8 rounded-[2.5rem] border border-[#1a3356] shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Activity className="w-48 h-48 text-[#B88E52]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3">Informasi Sistem</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Perubahan pada Konfigurasi Website Publik akan langsung memengaruhi website B2C (peacefulgoldenisland.com) secara *real-time* tanpa perlu melakukan *re-deploy*.
                </p>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Arsitektur</span>
                    <span className="font-bold text-white">Decoupled Next.js</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Database</span>
                    <span className="font-bold text-white">Firestore (NoSQL)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Storage</span>
                    <span className="font-bold text-emerald-400">Cloudinary API</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TEAM ACCESS TAB (Superadmin Only) --- */}
        {activeTab === 'team' && isSuperAdmin && (
          <motion.div
            key="team"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            
            {/* Form Tambah Anggota */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-[#11223a] mb-2">Tambah Akses Tim</h2>
                <p className="text-sm text-gray-500 font-medium mb-6">Daftarkan email GMAIL tim agar mereka bisa masuk ke dashboard.</p>
                
                {message.text && (
                  <div className={`p-4 rounded-2xl text-sm font-bold flex items-start gap-2 mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {message.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    <span>{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleAddMember} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email (Google)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="nama@gmail.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#11223a] focus:outline-none focus:border-[#B88E52] focus:ring-4 focus:ring-[#B88E52]/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Role (Hak Akses)</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#11223a] focus:outline-none focus:border-[#B88E52] focus:ring-4 focus:ring-[#B88E52]/10 transition-all appearance-none"
                    >
                      <option value="Editor">Editor (Hanya Artikel & Galeri)</option>
                      <option value="Admin">Admin (Kelola Harga & Expedisi)</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={isAddingMember}
                    className="w-full bg-[#11223a] hover:bg-[#0f1f33] text-white py-3.5 rounded-2xl font-bold transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                  >
                    {isAddingMember ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    {isAddingMember ? 'Memproses...' : 'Daftarkan Email'}
                  </button>
                </form>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    <strong className="text-amber-900 block mb-1">Keamanan Tanpa Password:</strong>
                    Anggota yang ditambahkan ke sini cukup login menggunakan tombol <strong>"Sign in with Google"</strong>. Mereka tidak perlu mengingat password khusus aplikasi ini.
                  </p>
                </div>
              </div>
            </div>

            {/* List Anggota Terdaftar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div>
                    <h2 className="text-xl font-bold text-[#11223a]">Daftar Tim (Whitelisted)</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Hanya email di daftar ini yang bisa login ke Admin PGI.</p>
                  </div>
                  <div className="bg-[#11223a] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md">
                    {teamMembers.length}
                  </div>
                </div>

                <div className="p-0">
                  {isLoadingTeam ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#B88E52]">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p className="font-bold text-sm">Memuat daftar tim...</p>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-20">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Belum ada anggota tim terdaftar.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {/* Superadmin Card Biasa diletakkan paling atas secara statis atau visual*/}
                      <li className="p-6 sm:px-8 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#B88E52]/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#11223a] text-white flex items-center justify-center font-black shadow-md border-2 border-white">
                            SA
                          </div>
                          <div>
                            <p className="font-bold text-[#11223a]">{SUPERADMIN_EMAIL}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Sistem Developer</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg">Superadmin</span>
                        </div>
                      </li>

                      {/* Map data member lainnya */}
                      {teamMembers.map((member) => (
                        <li key={member.id} className="p-6 sm:px-8 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-inner border border-blue-100">
                              {member.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#11223a]">{member.email}</p>
                              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                Ditambahkan: {member.createdAt?.toDate().toLocaleDateString('id-ID') || 'Baru saja'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg">
                              {member.role}
                            </span>
                            <button 
                              onClick={() => handleRemoveMember(member.id, member.email)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                              title="Cabut Akses"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
} 