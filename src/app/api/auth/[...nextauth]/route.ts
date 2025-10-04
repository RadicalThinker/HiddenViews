import NextAuth from 'next-auth/next';
import { authOptions } from './options';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const handler = NextAuth(authOptions);

// CORS headers for NextAuth
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://hiddenreviews.yashcore.app'
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token, X-NextAuth-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// Wrap the handler to add CORS headers
async function wrappedHandler(req: NextRequest, context: any) {
  const origin = req.headers.get('origin');
  
  logger.info('NextAuth request', {
    method: req.method,
    origin,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    logger.info('Handling NextAuth OPTIONS preflight request', { origin });
    return new NextResponse(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Call the original NextAuth handler
    const response = await handler(req, context);
    
    // Add CORS headers to the response
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    logger.info('NextAuth request completed successfully', {
      method: req.method,
      status: response.status,
      origin,
    });

    return response;
  } catch (error) {
    logger.error('NextAuth request failed', error, {
      method: req.method,
      origin,
      url: req.url
    });
    
    // Return error response with CORS headers
    const errorResponse = new NextResponse(
      JSON.stringify({ error: 'Authentication failed' }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
    
    return errorResponse;
  }
}

export { wrappedHandler as GET, wrappedHandler as POST, wrappedHandler as OPTIONS };