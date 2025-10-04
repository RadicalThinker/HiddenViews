import NextAuth from 'next-auth/next';
import { authOptions } from './options';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const handler = NextAuth(authOptions);

// Determine allowed origins based on environment
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the configured NEXTAUTH_URL or allow specific domains
    const allowedOrigins = [
      process.env.NEXTAUTH_URL,
      // Add your production domains here
    ].filter(Boolean);
    
    return allowedOrigins.length > 0 ? allowedOrigins.join(', ') : process.env.NEXTAUTH_URL || '*';
  }
  
  // Development origins
  return 'http://localhost:3000, http://127.0.0.1:3000';
};

// Add CORS headers for NextAuth requests
const getCorsHeaders = (origin?: string) => {
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? getAllowedOrigins()
    : 'http://localhost:3000';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-Auth-Token, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
};

// Wrap the handler to add CORS headers
async function wrappedHandler(req: NextRequest, context: any) {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);
  
  logger.debug('NextAuth CORS request', {
    method: req.method,
    origin,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    logger.debug('Handling OPTIONS preflight request', { origin, corsHeaders });
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Call the original NextAuth handler
    const response = await handler(req, context);
    
    // Add CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    logger.debug('NextAuth request completed', {
      method: req.method,
      status: response.status,
      origin,
      corsHeadersAdded: Object.keys(corsHeaders)
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
          ...corsHeaders,
        },
      }
    );
    
    return errorResponse;
  }
}

export { wrappedHandler as GET, wrappedHandler as POST, wrappedHandler as OPTIONS };