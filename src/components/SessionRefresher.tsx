'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SessionRefresher() {
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const hasRefreshedRef = useRef(false);

  useEffect(() => {
    // Only refresh once when first authenticated, not on every session change
    if (status === 'authenticated' && session && !hasRefreshedRef.current) {
      console.log('🔄 Performing one-time session refresh after authentication');
      hasRefreshedRef.current = true;
      update();
    }
  }, [status, session, update]);

  useEffect(() => {
    // Check for refresh parameter in URL (only once)
    const refresh = searchParams.get('refresh');
    if (refresh && status === 'authenticated' && !hasRefreshedRef.current) {
      console.log('🔄 Refresh parameter detected, forcing session update');
      hasRefreshedRef.current = true;
      update();

      // Clean up URL by removing refresh parameter
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('refresh');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, status, update]);

  return null; // This component doesn't render anything
}