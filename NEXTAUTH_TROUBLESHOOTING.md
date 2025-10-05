# NextAuth URL Configuration Troubleshooting

## Issue Summary
Authentication works with `NEXTAUTH_URL=localhost:3000` but fails with the production domain.

## Root Cause Analysis
The issue is likely one of the following:

### 1. **Incorrect Domain Name**
- ❌ `hiddenreview.yashcore.app` (missing 's')
- ✅ `hiddenreviews.yashcore.app` (correct)

### 2. **Missing HTTPS Protocol**
- ❌ `NEXTAUTH_URL=hiddenreviews.yashcore.app`
- ✅ `NEXTAUTH_URL=https://hiddenreviews.yashcore.app`

### 3. **Trailing Slash Issues**
- ❌ `NEXTAUTH_URL=https://hiddenreviews.yashcore.app/`
- ✅ `NEXTAUTH_URL=https://hiddenreviews.yashcore.app`

## Correct Configuration

### Production Environment (.env.production)
```bash
NEXTAUTH_URL=https://hiddenreviews.yashcore.app
NODE_ENV=production
NEXTAUTH_SECRET=your-long-secure-secret-key
```

### Development Environment (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
NEXTAUTH_SECRET=your-development-secret
```

## Testing Steps

1. **Check Environment Variables**
   ```bash
   # Visit this endpoint to verify your environment
   https://hiddenreviews.yashcore.app/api/debug-env
   ```

2. **Verify CORS Configuration**
   ```bash
   # Test CORS headers
   https://hiddenreviews.yashcore.app/api/cors-test
   ```

3. **Check NextAuth Endpoints**
   ```bash
   # Should return NextAuth configuration
   https://hiddenreviews.yashcore.app/api/auth/providers
   ```

## Common Fixes

### Fix 1: Correct NEXTAUTH_URL
```bash
# In your production environment
NEXTAUTH_URL=https://hiddenreviews.yashcore.app
```

### Fix 2: Verify Domain Spelling
Make sure it's `hiddenreviews` (with 's'), not `hiddenreview`

### Fix 3: Check DNS Resolution
```bash
# Test if your domain resolves correctly
nslookup hiddenreviews.yashcore.app
```

### Fix 4: Verify SSL Certificate
Make sure your HTTPS certificate is valid and trusted

## Deployment Checklist

- [ ] `NEXTAUTH_URL` includes `https://`
- [ ] Domain name is spelled correctly (`hiddenreviews` with 's')
- [ ] No trailing slash in the URL
- [ ] `NEXTAUTH_SECRET` is set and secure (32+ characters)
- [ ] `NODE_ENV=production` is set
- [ ] DNS points to the correct server
- [ ] SSL certificate is valid
- [ ] Cookies are not blocked by browser settings

## Debug Commands

```bash
# Check environment on production server
curl https://hiddenreviews.yashcore.app/api/debug-env

# Test CORS
curl -H "Origin: https://hiddenreviews.yashcore.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://hiddenreviews.yashcore.app/api/auth/signin

# Test NextAuth providers
curl https://hiddenreviews.yashcore.app/api/auth/providers
```

## Expected Behavior After Fix

1. Sign-in should work with production `NEXTAUTH_URL`
2. Session tokens should be properly set as cookies
3. Dashboard should load without 307 redirects
4. Authentication state should persist across page reloads