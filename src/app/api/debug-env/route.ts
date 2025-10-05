import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const authUrl = process.env.NEXTAUTH_URL;
  const nodeEnv = process.env.NODE_ENV;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET';
  
  logger.info('Environment debug check', {
    NEXTAUTH_URL: authUrl,
    NODE_ENV: nodeEnv,
    NEXTAUTH_SECRET: nextAuthSecret,
    requestOrigin: request.headers.get('origin'),
    requestHost: request.headers.get('host'),
    requestUrl: request.url,
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  return NextResponse.json({
    environment: {
      NODE_ENV: nodeEnv,
      NEXTAUTH_URL: authUrl,
      NEXTAUTH_SECRET: nextAuthSecret,
      requestHost: request.headers.get('host'),
      requestOrigin: request.headers.get('origin'),
    },
    validation: {
      hasProtocol: authUrl?.startsWith('https://') || authUrl?.startsWith('http://'),
      correctDomain: authUrl?.includes('hiddenreviews.yashcore.app'),
      noTrailingSlash: authUrl && !authUrl.endsWith('/'),
      isValidUrl: authUrl === 'https://hiddenreviews.yashcore.app',
    },
    recommendations: authUrl === 'https://hiddenreviews.yashcore.app' 
      ? 'Configuration looks correct'
      : `Should be: https://hiddenreviews.yashcore.app (currently: ${authUrl})`
  });
}