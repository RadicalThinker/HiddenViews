# HiddenViews - Production Deployment Guide

## Production Readiness Checklist

### ✅ Completed Optimizations

1. **Logging System**
   - Implemented production-ready logger (`src/lib/logger.ts`)
   - Removes debug logs in production
   - Keeps error and warning logs for troubleshooting
   - All API routes updated to use logger

2. **Security Headers**
   - Strict Transport Security (HSTS)
   - X-Frame-Options (SAMEORIGIN)
   - X-Content-Type-Options (nosniff)
   - X-XSS-Protection
   - Referrer-Policy
   - Permissions-Policy

3. **Next.js Configuration**
   - React Strict Mode enabled
   - SWC Minification enabled
   - Console removal in production (except errors/warnings)
   - Powered-by header disabled
   - Compression enabled
   - Image optimization with AVIF/WebP support

4. **Environment Variables**
   - `.env.production` file created
   - `.env.production.example` for reference
   - Secure cookie configuration
   - HTTPS enforcement in production

5. **Code Cleanup**
   - Removed debug components (MobileSessionDebug, SessionLogger, SimpleSessionLogger)
   - Cleaned up verbose console logs
   - Removed test/debug buttons from production

## Pre-Deployment Steps

### 1. Update Environment Variables

Edit `.env.production` with your actual production values:

```bash
# Update the production URL
NEXTAUTH_URL=https://your-actual-domain.com

# Verify database connection string is for production
MONGODB_URI=your-production-mongodb-uri

# Ensure API keys are production keys
RESEND_API_KEY=your-production-resend-key
GEMINI_API_KEY=your-production-gemini-key
```

### 2. Build and Test

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Test production build locally
npm run start
```

### 3. Verify Build Success

Check for:
- No TypeScript errors
- No build warnings
- All routes compile successfully
- Static pages generated correctly

### 4. Database Considerations

- Ensure MongoDB connection string uses production cluster
- Verify database user has appropriate permissions
- Check connection pool settings for production load
- Enable MongoDB Atlas monitoring

### 5. API Keys & Services

- **Resend**: Verify production API key and domain verification
- **Google Gemini**: Ensure production API key has appropriate quotas
- **NextAuth**: Generate a strong production secret

```bash
# Generate new NEXTAUTH_SECRET
openssl rand -base64 32
```

### 6. Deployment Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Environment variables to set in Vercel dashboard:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `MONGODB_URI`
- `RESEND_API_KEY`
- `GEMINI_API_KEY`
- `NODE_ENV=production`

#### Other Platforms

For AWS, Azure, or self-hosted:
1. Set environment variables
2. Run `npm run build`
3. Start with `npm run start`
4. Use PM2 or similar for process management
5. Configure reverse proxy (Nginx/Apache)
6. Set up SSL certificates

### 7. Post-Deployment Checks

- [ ] Test user registration flow
- [ ] Test email verification
- [ ] Test sign-in/sign-out
- [ ] Test event creation
- [ ] Test review/query submission
- [ ] Verify PWA installation works
- [ ] Check all API endpoints respond correctly
- [ ] Monitor error logs for issues
- [ ] Test on mobile devices
- [ ] Verify HTTPS is enforced
- [ ] Check SEO meta tags
- [ ] Test performance (Lighthouse)

### 8. Monitoring & Logging

In production, only the following logs will appear:
- `logger.error()` - Error messages
- `logger.warn()` - Warning messages  
- `logger.critical()` - Critical system errors

Debug and info logs are automatically suppressed.

### 9. Performance Optimization

- Images are automatically optimized to AVIF/WebP
- Static pages are pre-rendered
- API routes are optimized
- Compression is enabled
- Cache headers configured for static assets

### 10. Security Measures

- All sensitive cookies are httpOnly
- CSRF protection enabled
- Session tokens are secure
- Headers prevent XSS and clickjacking
- No sensitive data in client-side code

## Rollback Plan

If issues occur:
1. Keep previous Vercel deployment active
2. Can instantly rollback via Vercel dashboard
3. Database migrations should be backward compatible
4. Monitor error rates and user reports

## Common Issues & Solutions

### Issue: Session not persisting
- Check NEXTAUTH_URL matches actual domain
- Verify secure cookies work with HTTPS
- Check browser cookie settings

### Issue: Email not sending
- Verify Resend API key is active
- Check domain verification status
- Review Resend dashboard for errors

### Issue: Database connection fails
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for serverless)
- Check connection string format
- Verify database user credentials

### Issue: Build fails
- Clear `.next` folder and rebuild
- Check for TypeScript errors
- Verify all dependencies installed

## Support

For issues:
1. Check application logs
2. Review Vercel function logs
3. Check MongoDB Atlas logs
4. Review browser console (for client issues)

## Next Steps

After deployment:
- Set up monitoring (Sentry, LogRocket, etc.)
- Configure analytics (Google Analytics, Plausible, etc.)
- Set up uptime monitoring
- Configure automatic backups for database
- Set up CI/CD pipeline
- Plan for scaling (CDN, caching, etc.)
