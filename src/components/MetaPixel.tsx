'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MetaPixel({ PIXEL_ID }: { PIXEL_ID: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Jangan kirim event jika script fbq belum selesai dimuat
    if (!isLoaded) return;
    
    // Kirim event 'PageView' ke Meta setiap kali pathname atau searchParams berubah
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, isLoaded]);

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onLoad={() => setIsLoaded(true)}
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          
          // Inisialisasi Meta Pixel dengan ID dinamis
          fbq('init', '${PIXEL_ID}');
          
          // Kirim event PageView pertama kali saat script di-load
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
} 