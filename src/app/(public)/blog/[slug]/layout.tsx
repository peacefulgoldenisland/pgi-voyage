import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Metadata } from 'next';

const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

// 1. FUNGSI AJAIB UNTUK SEO & WHATSAPP PREVIEW (OPEN GRAPH)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const blogsRef = collection(db, 'blogs');
  const q = query(blogsRef, where('slug', '==', slug), where('status', '==', 'Published'), limit(1));
  const querySnapshot = await getDocs(q);
 
  if (querySnapshot.empty) {
    return { title: 'Article Not Found | PGI Voyage' };
  }

  const article = querySnapshot.docs[0].data();
  const plainText = stripHtml(article.content || "");
  const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + "..." : plainText;

  return {
    title: `${article.title} | PGI Voyage`,
    description: excerpt,
    openGraph: {
      title: article.title,
      description: excerpt,
      images: [article.coverImage],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: excerpt,
      images: [article.coverImage],
    }
  };
}

// 2. LAYOUT WRAPPER
export default function BlogDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hanya me-return halaman page.tsx di dalamnya
  return <>{children}</>;
}