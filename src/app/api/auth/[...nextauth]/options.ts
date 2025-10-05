import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { logger } from '@/lib/logger';

// Add this at the top to see what's being loaded
console.log('🔍 NextAuth Configuration Loading:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
  timestamp: new Date().toISOString()
});

// Validate environment configuration
const validateEnvironment = () => {
  const authUrl = process.env.NEXTAUTH_URL;
  const secret = process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    logger.error('NEXTAUTH_SECRET is not set');
    throw new Error('NEXTAUTH_SECRET environment variable is required');
  }
  
  if (process.env.NODE_ENV === 'production') {
    if (!authUrl) {
      logger.error('NEXTAUTH_URL is not set in production');
      throw new Error('NEXTAUTH_URL environment variable is required in production');
    }
    
    if (!authUrl.startsWith('https://')) {
      logger.error('NEXTAUTH_URL must start with https:// in production', { authUrl });
      throw new Error('NEXTAUTH_URL must use HTTPS in production');
    }
    
    if (authUrl.endsWith('/')) {
      logger.warn('NEXTAUTH_URL should not end with a trailing slash', { authUrl });
    }

    // Additional validation for your specific domain
    if (!authUrl.includes('hiddenreviews.yashcore.app')) {
      logger.error('NEXTAUTH_URL does not match expected domain', { 
        authUrl, 
        expected: 'https://hiddenreviews.yashcore.app' 
      });
    }
  }
  
  logger.info('Environment validation passed', {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: authUrl,
    hasSecret: !!secret
  });
};

// Validate on module load (only in runtime, not during build)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test' && !process.env.NEXT_PHASE) {
  // Delay validation to avoid build-time issues
  setTimeout(validateEnvironment, 100);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        logger.debug('Auth attempt', {
          identifier: credentials?.identifier,
          timestamp: new Date().toISOString()
        });

        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          logger.debug('User lookup', {
            found: !!user,
            username: user?.username,
            isVerified: user?.isVerified
          });

          if (!user) {
            throw new Error('No user found with this email or username');
          }

          if (!user.isVerified) {
            throw new Error('UNVERIFIED: Please verify your email before signing in');
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            logger.info('Auth success', { 
              username: user.username,
              userId: user._id,
              timestamp: new Date().toISOString()
            });
            return user;
          } else {
            logger.warn('Auth failed - incorrect password', { 
              identifier: credentials?.identifier,
              timestamp: new Date().toISOString()
            });
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          logger.error('Authentication error', err, { 
            identifier: credentials?.identifier,
            errorMessage: err.message,
            timestamp: new Date().toISOString()
          });
          throw new Error(err.message || 'An error occurred during authentication');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('🔐 JWT Callback Triggered:', {
        trigger,
        hasUser: !!user,
        hasToken: !!token,
        tokenId: token?._id,
        userId: user?._id,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        authUrl: process.env.NEXTAUTH_URL
      });

      // If user is provided (during sign-in), set the token
      if (user) {
        logger.info('Creating JWT token', { 
          username: user.username,
          userId: user._id,
          trigger,
          timestamp: new Date().toISOString()
        });
        token._id = user._id?.toString();
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;

        console.log('✅ JWT Token Created:', {
          tokenId: token._id,
          username: token.username,
          hasAllFields: !!(token._id && token.username && token.email)
        });
      }

      logger.debug('JWT callback executed', {
        hasToken: !!token,
        tokenId: token?._id,
        username: token?.username,
        trigger,
        timestamp: new Date().toISOString()
      });

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        
        logger.debug('Session callback executed', {
          userId: token._id,
          username: token.username,
          hasSession: !!session,
          timestamp: new Date().toISOString()
        });
      } else {
        logger.warn('Session callback - no token found', {
          hasSession: !!session,
          timestamp: new Date().toISOString()
        });
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
  
  // Use default host handling for production
  useSecureCookies: process.env.NODE_ENV === 'production',

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Use specific subdomain only, not root domain
        ...(process.env.NODE_ENV === 'production' && {
          domain: 'hiddenreviews.yashcore.app'
        })
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        ...(process.env.NODE_ENV === 'production' && {
          domain: 'hiddenreviews.yashcore.app'
        })
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        ...(process.env.NODE_ENV === 'production' && {
          domain: 'hiddenreviews.yashcore.app'
        })
      },
    },
  },
  
  pages: {
    signIn: '/sign-in',
  },
  
  events: {
    async signIn({ user, account }) {
      logger.info('Sign in event', {
        userId: user.id,
        username: user.username,
        email: user.email,
        provider: account?.provider,
        timestamp: new Date().toISOString()
      });
    },
    async signOut({ token }) {
      logger.info('Sign out event', {
        userId: token?._id,
        username: token?.username,
        timestamp: new Date().toISOString()
      });
    },
    async createUser({ user }) {
      logger.info('User created event', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      });
    },
    async session({ session, token }) {
      logger.debug('Session event', {
        userId: token?._id,
        username: token?.username,
        timestamp: new Date().toISOString()
      });
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
};
