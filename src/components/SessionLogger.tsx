'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionLogger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('📊 SESSION LOGGER:', {
      status,
      hasSession: !!session,
      userId: session?.user?._id || 'none',
      username: session?.user?.username || 'none',
      timestamp: new Date().toISOString()
    });
  }, [status, session]);

  // Simple visual indicator
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed top-4 left-4 p-2 bg-green-900 text-white text-xs rounded z-50">
        <div>Session: {status}</div>
        <div>User: {session?.user?.username || 'None'}</div>
      </div>
    );
  }

  return null;
}