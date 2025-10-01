import Sidebar from '@/components/Sidebar';
import MobileSessionDebug from '@/components/MobileSessionDebug';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen dark:bg-bg-100">
      <Sidebar />
      <main className="flex-1 overflow-auto md:pl-4 pt-16 md:pt-4">
        {children}
      </main>
      <MobileSessionDebug />
    </div>
  );
}
