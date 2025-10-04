import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from the request
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Log all request details for debugging
    logger.info('Token debug endpoint called', {
      hasToken: !!token,
      tokenData: token ? {
        _id: token._id,
        username: token.username,
        email: token.email,
        isVerified: token.isVerified
      } : null,
      cookies: Object.fromEntries(
        Array.from(request.cookies.getAll().map(cookie => [cookie.name, cookie.value]))
      ),
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent')
      },
      url: request.url,
      timestamp: new Date().toISOString()
    });

    const response = {
      success: true,
      hasToken: !!token,
      token: token ? {
        _id: token._id,
        username: token.username,
        email: token.email,
        isVerified: token.isVerified,
        isAcceptingMessages: token.isAcceptingMessages
      } : null,
      cookies: Object.fromEntries(
        Array.from(request.cookies.getAll().map(cookie => [cookie.name, cookie.value.substring(0, 50) + '...']))
      ),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    logger.error('Token debug endpoint error', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve token information',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}