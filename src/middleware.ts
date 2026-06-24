import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

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

// CORS configuration
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-Auth-Token, X-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const origin = req.headers.get('origin') || '';
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
    
    // Handle CORS for API routes (except NextAuth routes which handle their own CORS)
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
              ? (process.env.NEXTAUTH_URL || origin)
              : 'http://localhost:3000',
            ...corsOptions,
          },
        });
      }

      // Continue with the request and add CORS headers to the response
      const response = NextResponse.next();
      
      response.headers.set('Access-Control-Allow-Origin', 
        process.env.NODE_ENV === 'production' 
          ? (process.env.NEXTAUTH_URL || origin)
          : 'http://localhost:3000'
      );
      
      Object.entries(corsOptions).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
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
