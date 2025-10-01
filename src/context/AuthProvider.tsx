'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('🔑 AuthProvider mounted at:', new Date().toISOString());
  }, []);

  return (
    <SessionProvider
      refetchInterval={0} // Disable automatic refetching
      refetchOnWindowFocus={false} // Disable refetch on window focus
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}


