import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";
import GoogleTagManager from "@/components/GoogleTagManager";
import { Analytics } from "@vercel/analytics/next";

// Font untuk Heading (Elegan & Klasik)
const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Font untuk Body (Bersih, Modern, Mudah dibaca)
const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://peacefulgoldenisland.com"),
  title: "Golden Island Voyage | Luxury Komodo Liveaboard",
  description: "Embark on an exclusive 4D3N luxury liveaboard expedition from Lombok to Komodo. Discover pristine waters and unparalleled comfort aboard our premium vessel.",
  verification: {
    google: "ev8WW01OD9DIwuithkdSFT40usPCdfpGdAHcjbyogio",
  },
  openGraph: {
    title: "Golden Island Voyage | Luxury Komodo Liveaboard",
    description: "Embark on an exclusive 4D3N luxury liveaboard expedition from Lombok to Komodo. Discover pristine waters and unparalleled comfort aboard our premium vessel.",
    url: "https://peacefulgoldenisland.com",
    siteName: "Golden Island Voyage",
    images: [
      {
        url: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Golden Island Voyage Luxury Liveaboard",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Island Voyage | Luxury Komodo Liveaboard",
    description: "Embark on an exclusive 4D3N luxury liveaboard expedition from Lombok to Komodo. Discover pristine waters and unparalleled comfort aboard our premium vessel.",
    images: ["https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lato.variable} h-full antialiased`}
    >
      {/* Set font Lato sebagai default font body dan warna teks abu gelap elegan */}
      <body className="min-h-full flex flex-col font-body text-gray-800 bg-white">
        {/* Tracking Scripts (Google, Meta, & GTM) */}
        <Suspense fallback={null}>
          {/* Fallback diubah langsung ke ID GTM asli agar langsung aktif untuk Google Ads */}
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || "GTM-T3JGT5ZL"} />
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID || ""} />
          <MetaPixel PIXEL_ID={process.env.NEXT_PUBLIC_META_PIXEL_ID || ""} />
        </Suspense>
        
        {/* Render Page Content */}
        {children}

        {/* Vercel Analytics */}
        <Analytics /> 
      </body>
    </html>
  );
} 