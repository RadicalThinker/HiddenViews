import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const cookies = request.cookies.getAll();
    
    // Get session (the primary method for authentication)
    const session = await getServerSession(authOptions);
    
    // Get request headers
    const headers = {
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      host: request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'user-agent': request.headers.get('user-agent'),
    };

    return NextResponse.json({
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      },
      cookies: {
        count: cookies.length,
        list: cookies.map(c => ({
          name: c.name,
          valuePreview: c.value.substring(0, 20) + '...', // Truncate for security
          hasValue: !!c.value,
          length: c.value.length
        })),
        hasSessionToken: cookies.some(c => c.name.includes('session-token')),
        hasCsrfToken: cookies.some(c => c.name.includes('csrf-token')),
      },
      session: session ? {
        hasSession: true,
        user: {
          id: session.user._id,
          username: session.user.username,
          email: session.user.email,
        }
      } : {
        hasSession: false,
        reason: 'No session found'
      },
      headers,
      timestamp: new Date().toISOString(),
      diagnosis: {
        authenticated: !!session,
        hasAllCookies: cookies.some(c => c.name.includes('session-token')) && 
                        cookies.some(c => c.name.includes('csrf-token')),
        authenticationStatus: session ? 'AUTHENTICATED ✅' : 'NOT AUTHENTICATED ❌',
        recommendations: session ? [
          'User is successfully authenticated',
          'Session is active and valid',
          'Session-based authentication is working correctly'
        ] : [
          'User is not authenticated',
          'Please sign in to create a session',
          'Check that cookies are being set properly'
        ]
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}