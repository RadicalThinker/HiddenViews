import NextAuth from 'next-auth/next';
import { authOptions } from './options';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { addCorsHeaders, getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

// Wrap the handler to add CORS headers
async function wrappedHandler(req: NextRequest, context: any) {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);
  
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
      headers: corsHeaders,
    });
  }

  try {
    // Call the original NextAuth handler
    const response = await handler(req, context);
    
    addCorsHeaders(response, origin || undefined);

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
          ...corsHeaders,
        },
      }
    );
    
    return errorResponse;
  }
}

export { wrappedHandler as GET, wrappedHandler as POST, wrappedHandler as OPTIONS };