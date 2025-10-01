import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

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
        console.log('🔑 AUTHORIZE FUNCTION TRIGGERED:', {
          hasCredentials: !!credentials,
          identifier: credentials?.identifier,
          hasPassword: !!credentials?.password,
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

          console.log('👤 USER LOOKUP RESULT:', {
            found: !!user,
            userId: user?._id,
            username: user?.username,
            email: user?.email,
            isVerified: user?.isVerified
          });

          if (!user) {
            throw new Error('No user found with this email or username');
          }

          if (!user.isVerified) {
            throw new Error('Please verify your email before signing in');
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔐 PASSWORD CHECK:', {
            passwordCorrect: isPasswordCorrect,
            timestamp: new Date().toISOString()
          });

          if (isPasswordCorrect) {
            console.log('✅ AUTH SUCCESS - RETURNING USER:', user.username);
            return user;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          console.log('❌ AUTH ERROR:', err.message);
          throw new Error(err.message || 'An error occurred during authentication');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔐 JWT Callback TRIGGERED - Basic:', {
        hasUser: !!user,
        hasToken: !!token,
        userId: user?.id || user?._id,
        tokenId: token?.sub,
        timestamp: new Date().toISOString()
      });

      // If user is provided (during sign-in), set the token
      if (user) {
        console.log('✅ Setting JWT token for user:', user.username || user.email);
        token._id = user._id?.toString();
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }

      console.log('📤 JWT returning token for:', token.username || 'unknown');
      return token;
    },
    async session({ session, token }) {
      console.log('🎭 Session Callback TRIGGERED - Basic:', {
        hasSession: !!session,
        hasToken: !!token,
        tokenUser: token?.username,
        sessionUser: session?.user?.name,
        timestamp: new Date().toISOString()
      });

      if (token) {
        console.log('✅ Setting session data for:', token.username);
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
      }

      console.log('📤 Session returning for:', session.user.username || 'unknown');
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
  
  pages: {
    signIn: '/sign-in',
  },
};
