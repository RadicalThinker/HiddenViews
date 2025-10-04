import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, handleCorsPreflightRequest } from '@/lib/cors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.info('CORS test endpoint called', {
    method: request.method,
    origin: request.headers.get('origin'),
    userAgent: request.headers.get('user-agent'),
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  });

  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);
  
  return new NextResponse(
    JSON.stringify({
      success: true,
      message: 'CORS test successful',
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      timestamp: new Date().toISOString(),
      origin: request.headers.get('origin'),
      userAgent: request.headers.get('user-agent')
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  logger.info('CORS preflight request', {
    method: request.method,
    origin: request.headers.get('origin'),
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  return handleCorsPreflightRequest(request);
}