# CORS Configuration for HiddenViews

## Overview
This document explains the CORS (Cross-Origin Resource Sharing) implementation added to resolve production authentication issues.

## What was added:

### 1. NextAuth Route Handler (`/src/app/api/auth/[...nextauth]/route.ts`)
- Added comprehensive CORS headers to all NextAuth requests
- Handles preflight OPTIONS requests
- Includes error handling with CORS headers
- Logs CORS requests for debugging

### 2. NextAuth Options (`/src/app/api/auth/[...nextauth]/options.ts`)
- Updated cookie `sameSite` setting to `'none'` in production for cross-origin support
- Added `trustHost: true` for production compatibility
- Maintained security with `secure: true` in production

### 3. Next.js Configuration (`next.config.js`)
- Added CORS headers for all API routes (`/api/*`)
- Configured allowed origins, methods, and headers globally

### 4. Middleware (`/src/middleware.ts`)
- Enhanced to handle CORS for API routes
- Processes preflight OPTIONS requests
- Adds CORS headers to all API responses

### 5. CORS Utility (`/src/lib/cors.ts`)
- Reusable CORS helper functions
- Standardized CORS configuration
- Easy-to-use functions for other API routes

## Environment Variables Required:

Make sure these are set in your production environment:

```bash
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-secure-secret-key
NODE_ENV=production
```

## Key CORS Headers Added:

- `Access-Control-Allow-Origin`: Your production domain
- `Access-Control-Allow-Credentials`: true (for cookies)
- `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type, Authorization, etc.
- `Access-Control-Max-Age`: 86400 (24 hours cache)

## Production Considerations:

1. **Domain Configuration**: The `NEXTAUTH_URL` should match your production domain exactly
2. **HTTPS Required**: Secure cookies require HTTPS in production
3. **Mobile Apps**: The configuration supports mobile app authentication
4. **Debugging**: Check the logs for CORS-related issues

## Testing:

1. Verify OPTIONS requests return 200 status
2. Check that all API responses include CORS headers
3. Test authentication from different origins (if applicable)
4. Monitor logs for CORS-related errors

## Troubleshooting:

If you still experience CORS issues:

1. Check that `NEXTAUTH_URL` matches your production domain
2. Verify HTTPS is properly configured
3. Check browser console for specific CORS errors
4. Review server logs for authentication failures
5. Test with curl or Postman to isolate the issue