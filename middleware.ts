// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const tokenCookie = req.cookies.get('token')?.value;
  const tokenParam = req.nextUrl.searchParams.get('token');
  const path = req.nextUrl.pathname;

  // If user has NO token cookie *and* there's no ?token= in the URL:
  // and they're trying to visit "/" or anything under "/dashboard" => redirect to /login
  if (!tokenCookie && !tokenParam && (path === '/' || path.startsWith('/dashboard'))) {
    // Use req.nextUrl.clone() so the redirect is basePath-aware
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect both "/" and "/dashboard"
export const config = {
  matcher: ['/', '/dashboard/:path*']
};
