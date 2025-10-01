import NextAuth from 'next-auth/next';
import { authOptions } from './options';

const handler = NextAuth(authOptions);

console.log('🔐 NextAuth Route Handler loaded');

export { handler as GET, handler as POST };