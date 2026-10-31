import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { addCorsHeaders, handleCorsPreflightRequest } from '@/lib/cors';

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/settings/:path*',
    '/sign-in', 
    '/sign-up', 
    '/', 
    '/verify/:path*', 
    '/forgot-password', 
    '/reset-password', 
    '/api/:path*'
  ],
};

const authMiddleware = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect authenticated users away from auth pages to dashboard
    if (token && (
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password')
    )) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // For all other routes, NextAuth middleware will handle authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes and API routes
        if (pathname.startsWith('/api/') || 
            pathname.startsWith('/e/') ||
            pathname === '/') {
          return true;
        }
        
        // Auth pages and verify: allow through (redirect handled in middleware body)
        if (pathname.startsWith('/sign-in') || 
            pathname.startsWith('/sign-up') || 
            pathname.startsWith('/forgot-password') || 
            pathname.startsWith('/reset-password') ||
            pathname.startsWith('/verify')) {
          return true;
        }
        
        // For dashboard and other protected routes, require authentication
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
          return !!token;
        }
        
        // Default: allow access
        return true;
      },
    },
    pages: {
      signIn: '/sign-in',
    },
  }
);

// NextAuth skips its callback for /api/auth/*; apply API CORS before withAuth.
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (req.method === 'OPTIONS') {
      return handleCorsPreflightRequest(req);
    }
    return addCorsHeaders(NextResponse.next(), req.headers.get('origin') || undefined);
  }
  return authMiddleware(req as NextRequestWithAuth, event);
}
