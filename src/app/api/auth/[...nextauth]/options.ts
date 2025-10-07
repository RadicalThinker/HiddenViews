import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { logger } from '@/lib/logger';

// Environment validation
function validateEnvironment() {
  const missingVars = [];
  
  if (!process.env.NEXTAUTH_URL) missingVars.push('NEXTAUTH_URL');
  if (!process.env.NEXTAUTH_SECRET) missingVars.push('NEXTAUTH_SECRET');
  if (!process.env.MONGODB_URI) missingVars.push('MONGODB_URI');
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  logger.info('Environment validation passed', {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    hasSecret: !!process.env.NEXTAUTH_SECRET
  });
}

// Validate environment on initialization
validateEnvironment();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          }).select('+password');

          if (!user) {
            throw new Error('No user found with this email or username');
          }

          if (!user.isVerified) {
            // Return a special error that includes username for redirect
            throw new Error(`UNVERIFIED:${user.username}`);
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

          if (isPasswordCorrect) {
            return {
              _id: user._id?.toString(),
              username: user.username,
              email: user.email,
              isVerified: user.isVerified,
            };
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          logger.error('Authorization error', err, { 
            identifier: credentials?.identifier 
          });
          throw new Error(err.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        logger.debug('JWT Token Created', {
          userId: user._id,
          username: user.username,
          email: user.email
        });
        
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/sign-in',
  },
  debug: process.env.NODE_ENV === 'development',
};
