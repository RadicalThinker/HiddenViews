import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getUserFromBearer } from '@/lib/mobileAuth';

/**
 * Resolve the authenticated user from EITHER a NextAuth cookie session (web
 * client) OR a Bearer mobile-auth JWT (`/api/auth/mobile`). Returns the user
 * `_id` plus the bits both auth paths share, or null if neither is present.
 *
 * Routes that need to serve both the web app and the mobile app should use
 * this instead of `getServerSession` directly.
 */
export async function resolveAuthUser(request: Request): Promise<{
  _id: string;
  username?: string;
  isVerified?: boolean;
} | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?._id) {
      return {
        _id: session.user._id,
        username: session.user.username,
        isVerified: session.user.isVerified,
      };
    }
  } catch {
    // NextAuth session read failed (e.g. route running on edge or
    // misconfigured). Fall through to bearer check rather than failing.
  }

  try {
    const tokenPayload = await getUserFromBearer(request);
    if (tokenPayload?.sub) {
      return {
        _id: tokenPayload.sub,
        username: tokenPayload.username,
        isVerified: tokenPayload.isVerified,
      };
    }
  } catch {
    // Invalid/expired bearer — nothing else to try.
  }

  return null;
}
