import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '../context/AuthProvider';
import { ThemeProvider } from '../context/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import PWAInstaller from '@/components/PWAInstaller';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HiddenViews - Anonymous Reviews & Queries',
  description: 'Get honest feedback and answer questions anonymously. Build trust through transparency.',
  keywords: ['anonymous feedback', 'reviews', 'queries', 'honest opinions', 'feedback platform'],
  authors: [{ name: 'HiddenViews Team' }],
  manifest: '/manifest.json',
  themeColor: '#080808',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HiddenViews',
  },
  openGraph: {
    title: 'HiddenViews - Anonymous Reviews & Queries',
    description: 'Get honest feedback and answer questions anonymously. Build trust through transparency.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#080808" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HiddenViews" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#080808" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body className={inter.className}>
        <div className="">
        <ThemeProvider>
          <AuthProvider>
            <PWAInstaller />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

