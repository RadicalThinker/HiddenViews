# Production Authentication Debugging Guide

## Changes Applied

### 1. Enhanced NextAuth Configuration (`options.ts`)

#### Added Console Logging
- Logs NextAuth configuration on load
- Shows NEXTAUTH_URL, NODE_ENV, and NEXTAUTH_SECRET status

#### Enhanced Environment Validation
- Validates NEXTAUTH_URL includes correct domain (`hiddenreviews.yashcore.app`)
- Ensures HTTPS is used in production
- Checks for trailing slashes

#### Detailed JWT Callback Logging
```typescript
console.log('🔐 JWT Callback Triggered:', {
  trigger,
  hasUser: !!user,
  hasToken: !!token,
  // ... more debugging info
});
```

#### Updated Cookie Configuration
```typescript
cookies: {
  sessionToken: {
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      // Key change: Use root domain with dot prefix
      domain: '.yashcore.app' // in production
    }
  }
  // ... same for callbackUrl and csrfToken
}
```

**Why `.yashcore.app` instead of `hiddenreviews.yashcore.app`?**
- The dot prefix (`.yashcore.app`) allows cookies to work across all subdomains
- This ensures cookies are accessible to `hiddenreviews.yashcore.app`
- More flexible if you add more subdomains in the future

### 2. New Debug Endpoint (`/api/debug-auth`)

Access: `https://hiddenreviews.yashcore.app/api/debug-auth`

**Returns:**
- Environment configuration (NEXTAUTH_URL, NODE_ENV)
- All cookies present in the request
- JWT token status and content
- Server session status
- Request headers
- Diagnosis and recommendations

**Use this to:**
1. Verify cookies are being set
2. Check if JWT token exists
3. See if session is being created
4. Debug authentication flow

### 3. Existing Debug Endpoint (`/api/debug-env`)

Enhanced to show:
- NEXTAUTH_URL validation
- Domain verification
- Configuration recommendations

## Testing Steps

### Step 1: Verify Environment Variables
```bash
# Your production .env should have:
NEXTAUTH_URL=https://hiddenreviews.yashcore.app
NODE_ENV=production
NEXTAUTH_SECRET=<your-secure-secret-key>
```

### Step 2: Deploy Changes
Deploy to production with the updated code

### Step 3: Test Environment
Visit: `https://hiddenreviews.yashcore.app/api/debug-env`

Expected output:
```json
{
  "environment": {
    "NODE_ENV": "production",
    "NEXTAUTH_URL": "https://hiddenreviews.yashcore.app",
    "NEXTAUTH_SECRET": "SET"
  },
  "validation": {
    "hasProtocol": true,
    "correctDomain": true,
    "noTrailingSlash": true,
    "isValidUrl": true
  },
  "recommendations": "Configuration looks correct"
}
```

### Step 4: Attempt Sign-In
1. Go to `https://hiddenreviews.yashcore.app/sign-in`
2. Enter credentials
3. Click Sign In
4. **Check browser console** for the JWT callback logs
5. **Check browser DevTools** → Application → Cookies

### Step 5: Check Authentication Status
Immediately after sign-in attempt:
Visit: `https://hiddenreviews.yashcore.app/api/debug-auth`

**If Authentication is Working:**
```json
{
  "success": true,
  "cookies": {
    "hasSessionToken": true,
    "hasCsrfToken": true
  },
  "token": {
    "hasToken": true,
    "userId": "...",
    "username": "..."
  },
  "session": {
    "hasSession": true,
    "user": {...}
  },
  "diagnosis": {
    "authenticated": true
  }
}
```

**If Authentication is Failing:**
```json
{
  "cookies": {
    "hasSessionToken": false, // ❌ Cookie not set
    "hasCsrfToken": false
  },
  "token": {
    "hasToken": false,
    "reason": "No JWT token found"
  },
  "session": {
    "hasSession": false
  }
}
```

## What to Check in Browser DevTools

### 1. Console Tab
Look for:
- `🔍 NextAuth Configuration Loading:` - Shows if config is loaded correctly
- `🔐 JWT Callback Triggered:` - Shows when JWT is being created
- `✅ JWT Token Created:` - Confirms token was created successfully

### 2. Network Tab
After clicking "Sign In":
1. Find the request to `/api/auth/callback/credentials`
2. Check **Response Headers** for `Set-Cookie`
3. Should see cookies being set:
   - `next-auth.session-token`
   - `next-auth.csrf-token`
   - `next-auth.callback-url`

### 3. Application Tab → Cookies
Should see cookies with:
- **Domain**: `.yashcore.app`
- **Path**: `/`
- **Secure**: ✓ (checked)
- **HttpOnly**: ✓ (for session-token and csrf-token)
- **SameSite**: `Lax`

## Common Issues and Solutions

### Issue 1: Cookies Not Being Set
**Symptom:** No cookies in Application tab after sign-in
**Cause:** Cookie domain mismatch or HTTPS issues
**Solution:**
- Verify NEXTAUTH_URL is `https://hiddenreviews.yashcore.app`
- Ensure SSL certificate is valid
- Check that cookies use domain `.yashcore.app`

### Issue 2: Cookies Set But Not Sent
**Symptom:** Cookies exist but not included in subsequent requests
**Cause:** Domain or path mismatch
**Solution:**
- Check cookie domain in DevTools
- Ensure it matches your site domain
- Verify path is `/`

### Issue 3: 307 Redirect to /sign-in
**Symptom:** Dashboard redirects back to sign-in
**Cause:** Session not being recognized by middleware
**Solution:**
- Check `/api/debug-auth` to see if token exists
- Verify middleware is reading cookies correctly
- Check cookie domain matches

### Issue 4: Works with localhost but not production
**Symptom:** Authentication works locally but fails in production
**Possible Causes:**
1. NEXTAUTH_URL not set correctly
2. Cookie domain mismatch
3. HTTPS certificate issues
4. Environment variable not loaded
**Solution:**
- Verify environment variables via `/api/debug-env`
- Check browser console for errors
- Verify cookies are using correct domain

## Server-Side Logs to Monitor

When sign-in happens, you should see these logs:
1. `🔍 NextAuth Configuration Loading` - Config loaded
2. `Auth attempt` - User trying to sign in
3. `User lookup` - Database query result
4. `Auth success` - Password verified
5. `🔐 JWT Callback Triggered` - JWT being created
6. `Creating JWT token` - Token generation
7. `✅ JWT Token Created` - Token ready
8. `Sign in event` - Sign-in completed

## Next Steps After Applying Changes

1. ✅ Deploy to production
2. ✅ Check `/api/debug-env` endpoint
3. ✅ Attempt sign-in
4. ✅ Check browser console for logs
5. ✅ Check `/api/debug-auth` endpoint
6. ✅ Review browser DevTools cookies
7. ✅ Share results for further debugging if needed

## Expected Resolution

With these changes, authentication should work because:
1. Cookie domain is now set to `.yashcore.app` which includes your subdomain
2. Enhanced logging will show exactly where the flow breaks (if it still does)
3. Debug endpoints provide visibility into the authentication state
4. Environment validation ensures correct configuration

If it still doesn't work, the debug endpoints will tell us exactly what's wrong!