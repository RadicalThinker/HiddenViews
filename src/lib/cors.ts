import { NextRequest, NextResponse } from 'next/server';
import { getSiteOrigin } from './siteConfig';

// CORS configuration
export const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-Auth-Token, X-CSRF-Token, X-NextAuth-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export function getCorsHeaders(origin?: string): Record<string, string> {
  const siteOrigin = getSiteOrigin();
  const developmentOrigins = process.env.NODE_ENV === 'production' ? [] : [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:19006',
  ];
  const allowedOrigins = [
    siteOrigin,
    ...developmentOrigins,
    ...(process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean),
  ];

  // Never reflect an untrusted origin or emit multiple origins in one header.
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : siteOrigin;
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    ...corsOptions,
    'Vary': 'Origin',
  };
}

export function handleCorsPreflightRequest(req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export function addCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  const corsHeaders = getCorsHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (key === 'Vary') {
      const existing = response.headers.get('Vary');
      const values = (existing || '').split(',').map(value => value.trim()).filter(Boolean);
      if (!values.some(value => value.toLowerCase() === 'origin') && !values.includes('*')) {
        values.push('Origin');
      }
      response.headers.set(key, values.join(', '));
    } else {
      response.headers.set(key, value);
    }
  });
  
  return response;
}

// Legacy function for backward compatibility - returns headers object only
export function handleCors(req: NextRequest, response?: NextResponse) {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (response) {
    return addCorsHeaders(response, origin || undefined);
  }

  // Return CORS headers for manual application
  return corsHeaders;
}

export function corsResponse(data: any, options: { status?: number; headers?: Record<string, string> } = {}) {
  const { status = 200, headers = {} } = options;
  
  return new NextResponse(
    typeof data === 'string' ? data : JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(),
        ...headers,
      },
    }
  );
}