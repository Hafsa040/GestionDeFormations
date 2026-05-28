import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard') && !token) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }

  if (token) {
    const role = token.role as string;

    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/etudiant', req.url));
    }

    if (pathname.startsWith('/dashboard/prof') && role !== 'PROF') {
      return NextResponse.redirect(new URL('/dashboard/etudiant', req.url));
    }

    if (pathname.startsWith('/dashboard/etudiant') && role !== 'ETUDIANT') {
      if (role === 'ADMIN') return NextResponse.next(); 
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};