'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SimpleSessionLogger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('📊 SIMPLE SESSION:', {
      status,
      hasSession: !!session,
      userId: session?.user?._id || 'none',
      username: session?.user?.username || 'none'
    });
  }, [status, session]);

  return null;
}