import { NextRequest, NextResponse } from 'next/server';

// CORS configuration
export const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-Auth-Token, X-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export function getCorsHeaders(origin?: string) {
  let allowedOrigin;
  
  if (process.env.NODE_ENV === 'production') {
    // For same-origin requests (when origin is null/undefined), use the site URL
    if (!origin) {
      allowedOrigin = process.env.NEXTAUTH_URL || 'https://hiddenreviews.yashcore.app';
    } else {
      // For cross-origin requests, validate against allowed origins
      const productionOrigins = [
        'https://hiddenreviews.yashcore.app',
        process.env.NEXTAUTH_URL
      ].filter(Boolean);
      
      allowedOrigin = productionOrigins.includes(origin) ? origin : 'https://hiddenreviews.yashcore.app';
    }
  } else {
    allowedOrigin = origin || 'http://localhost:3000';
  }

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
    response.headers.set(key, value);
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

  // Add CORS headers to existing response
  if (response) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
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