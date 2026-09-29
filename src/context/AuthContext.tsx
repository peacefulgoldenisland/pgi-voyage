'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Definisikan tipe data user kita
interface UserData {
  uid: string;
  email: string | null;
  role: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Memulai listener auth...");
    // Dengarkan perubahan status login dari Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("AuthContext: User terdeteksi dari Firebase Auth:", firebaseUser.uid);
        try {
          // Ambil role dari Firestore berdasarkan UID
          // Disamakan dengan pmm-booking-engine: menggunakan koleksi 'users'
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let role = 'user'; // Default role jika dokumen tidak ditemukan

          if (userDocSnap.exists()) {
            console.log("AuthContext: Dokumen users ditemukan!");
            role = userDocSnap.data().role || 'user';
          } else {
            console.warn("AuthContext: Dokumen users TIDAK DITEMUKAN untuk UID ini.");
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: role,
          });
        } catch (error) {
          console.error("AuthContext: Gagal mengambil data user dari Firestore:", error);
          setUser(null);
        }
      } else {
        console.log("AuthContext: Tidak ada user yang login.");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => useContext(AuthContext);