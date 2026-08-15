import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '4D3N Expedition Route | PGI Voyage',
  description: 'Explore the ultimate sailing itinerary from Lombok to Labuan Bajo. Encounter whale sharks, Komodo dragons, and Pink Beach.',
  openGraph: {
    title: '4D3N Expedition Route | PGI Voyage',
    description: 'Explore the ultimate sailing itinerary from Lombok to Labuan Bajo. Encounter whale sharks, Komodo dragons, and Pink Beach.',
    images: ['[https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=1973&auto=format&fit=crop](https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=1973&auto=format&fit=crop)'], // Gambar Padar Island
    type: 'website',
  },
};

export default function ExpeditionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 