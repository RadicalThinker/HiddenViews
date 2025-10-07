import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

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
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get('origin') || '';
    
    // Handle CORS for API routes (except NextAuth routes which handle their own CORS)
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
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

    // For authenticated routes, NextAuth middleware will handle authentication
    console.log('🔐 Middleware: User is authenticated, allowing access to:', pathname);
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
        
        // Allow access to auth pages when not authenticated
        if (pathname.startsWith('/sign-in') || 
            pathname.startsWith('/sign-up') || 
            pathname.startsWith('/verify') || 
            pathname.startsWith('/forgot-password') || 
            pathname.startsWith('/reset-password')) {
          // If user is already authenticated, redirect to dashboard
          if (token) {
            return false; // This will redirect to the default page (dashboard)
          }
          return true;
        }
        
        // For dashboard and other protected routes, require authentication
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
          console.log('🔒 Middleware: Checking auth for protected route:', pathname, 'Has token:', !!token);
          return !!token;
        }
        
        // Default: allow access
        return true;
      },
    },
    pages: {
      signIn: '/sign-in',
    },
    // Redirect authenticated users trying to access auth pages to dashboard
    async redirect({ url, baseUrl, token }) {
      if (token && (url.includes('/sign-in') || url.includes('/sign-up') || url.includes('/verify') || url.includes('/forgot-password') || url.includes('/reset-password'))) {
        return `${baseUrl}/dashboard`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  }
);
