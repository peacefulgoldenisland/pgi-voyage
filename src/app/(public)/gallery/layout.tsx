import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery & Reels | PGI Voyage',
  description: 'A visual journey through the untamed beauty of the Indonesian archipelago. Explore our curated collections from Kenawa, Whale Sharks in Saleh Bay, to Komodo National Park.',
  openGraph: {
    title: 'Gallery & Reels | PGI Voyage',
    description: 'A visual journey through the untamed beauty of the Indonesian archipelago. Explore our curated collections from Kenawa, Whale Sharks in Saleh Bay, to Komodo National Park.',
    images: ['https://images.unsplash.com/photo-1604560929658-bbc3c2ba6a36?q=80&w=773&auto=format&fit=crop'], // Gambar Padar Island
    type: 'website',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}  