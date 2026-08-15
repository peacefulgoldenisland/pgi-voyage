import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Boat Details & Safety | PGI Voyage',
  description: 'Explore the specifications, amenities, and official legalities of our flagship vessel, KM Pulau Mas 88.',
  openGraph: {
    title: 'KM Pulau Mas 88 - Boat Details & Safety | PGI Voyage',
    description: 'Explore the specifications, amenities, and official legalities of our flagship vessel, KM Pulau Mas 88.',
    images: ['https://pgivoyage.vercel.app/images/Kapal_Pulau_Mas_88.png'],
    type: 'website',
  },
};

export default function BoatDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 