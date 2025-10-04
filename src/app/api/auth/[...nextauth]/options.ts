import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { logger } from '@/lib/logger';

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
    async jwt({ token, user }) {
      // If user is provided (during sign-in), set the token
      if (user) {
        logger.debug('Setting JWT token', { username: user.username });
        token._id = user._id?.toString();
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
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
  
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Use 'lax' for same-origin in production
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // No domain restriction in production for mobile compatibility
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
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
