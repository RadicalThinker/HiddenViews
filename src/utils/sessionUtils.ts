'use client';

import { signOut } from 'next-auth/react';

export function clearSessionAndRedirect() {
  console.log('🧹 Clearing all session data');

  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();

  // Clear all cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  // Force sign out
  signOut({ callbackUrl: '/sign-in', redirect: true });
}

export function forceSessionRefresh() {
  console.log('🔄 Forcing session refresh');

  // Clear NextAuth specific storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('next-auth')) {
      localStorage.removeItem(key);
    }
  });

  // Force page reload to get fresh session
  window.location.reload();
}