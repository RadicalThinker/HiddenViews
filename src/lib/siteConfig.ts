/** Canonical website origin for metadata, email links, and CORS. */
export function getSiteOrigin(): string {
  const fallback = process.env.NODE_ENV === 'production'
    ? 'https://hiddenreviews.yashvrawat.in'
    : 'http://localhost:3000';
  return new URL(process.env.NEXTAUTH_URL || fallback).origin;
}

/** Must belong to a verified sending domain in Resend. */
export function getEmailFrom(): string {
  return process.env.EMAIL_FROM || 'HiddenViews <verify@hiddenreviews.yashvrawat.in>';
}
