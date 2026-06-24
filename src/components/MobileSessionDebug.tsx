'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function MobileSessionDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Mobile-specific debugging
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('📱 MOBILE DEBUG:', {
        isMobile,
        userAgent: navigator.userAgent,
        status,
        hasSession: !!session,
        sessionUser: session?.user?.username || 'none',
        cookieString: document.cookie,
        hasSessionCookie: document.cookie.includes('next-auth.session-token'),
        hasCsrfCookie: document.cookie.includes('next-auth.csrf-token'),
        url: window.location.href,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        timestamp: new Date().toISOString()
      });

      // Check if we're in production and using HTTPS
      if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        console.warn('⚠️ MOBILE WARNING: Using HTTP in production may cause cookie issues on mobile');
      }
    }
  }, [session, status]);

  // Only show debug info in development or for debugging
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
      <div>Status: {status}</div>
      <div>User: {session?.user?.username || 'none'}</div>
      <div>Mobile: {typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}</div>
    </div>
  );
}