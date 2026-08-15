'use client';

import { motion } from 'framer-motion';

export default function PublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      // Memulai dengan transparan, posisi sedikit ke bawah, dan sedikit blur
      initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
      
      // Menganimasi ke bentuk normal (terlihat jelas dan posisi pas)
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      
      // Mengatur durasi dan kurva pergerakan (easing) agar terasa sangat premium dan tidak kaku
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1], // Kurva "ease-out-cubic" yang memberikan efek melambat secara halus di akhir
      }}
      className="w-full min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
} 