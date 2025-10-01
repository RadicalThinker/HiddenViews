import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Debug logging for troubleshooting
  console.log('🏗️ Middleware - Path:', url.pathname);
  console.log('🏗️ Middleware - Token exists:', !!token);
  console.log('🏗️ Middleware - Token user:', token?.username || 'No username');
  console.log('🏗️ Middleware - Token ID:', token?._id || 'No ID');
  console.log('🏗️ Middleware - Full Token:', token ? JSON.stringify(token, null, 2) : 'NULL');
  console.log('🏗️ Middleware - Cookies:', request.cookies.get('next-auth.session-token')?.value ? 'Session cookie exists' : 'No session cookie');
  console.log('🏗️ Middleware - Timestamp:', new Date().toISOString());

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
