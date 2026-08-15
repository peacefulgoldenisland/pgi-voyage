import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Satpam mengecek apakah ada cookie 'admin_session' di browser pengunjung
  const session = request.cookies.get('admin_session');
  const { pathname } = request.nextUrl;

  // RULE 1: Jika mau masuk ke area /admin (selain halaman login), TAPI tidak punya session
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) {
      // Tendang kembali ke halaman Login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // RULE 2: Jika sudah punya session (sudah login), TAPI iseng buka halaman login lagi
  if (pathname === '/admin/login' && session) {
    // Langsung masukkan ke Dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Jika aman, persilakan lewat
  return NextResponse.next();
}

// Tentukan rute mana saja yang harus dijaga oleh satpam ini
export const config = {
  matcher: ['/admin/:path*'],
}; 