import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '../context/AuthProvider';
import { ThemeProvider } from '../context/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HiddenViews - Anonymous Reviews & Queries',
  description: 'Get honest feedback and answer questions anonymously. Build trust through transparency.',
  keywords: ['anonymous feedback', 'reviews', 'queries', 'honest opinions', 'feedback platform'],
  authors: [{ name: 'HiddenViews Team' }],
  openGraph: {
    title: 'HiddenViews - Anonymous Reviews & Queries',
    description: 'Get honest feedback and answer questions anonymously. Build trust through transparency.',
    type: 'website',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

