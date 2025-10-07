import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*', '/forgot-password', '/reset-password', '/api/:path*'],
};

// CORS configuration
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-Auth-Token, X-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export async function middleware(request: NextRequest) {
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

  // Auth middleware logic - try multiple methods to detect authentication
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
    secureCookie: process.env.NODE_ENV === 'production',
  });

  // Also check for session cookie directly as a fallback
  const sessionCookie = request.cookies.get('next-auth.session-token');
  const isAuthenticated = !!(token || sessionCookie);

  const url = request.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    isAuthenticated &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname.startsWith('/forgot-password') ||
      url.pathname.startsWith('/reset-password') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isAuthenticated && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
