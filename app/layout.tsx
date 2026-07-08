import type { Metadata } from 'next';
import './globals.css';
import { PreferencesProvider } from '@/src/contexts/PreferencesContext';

export const metadata: Metadata = {
  title: 'OROELU GODWIN AGIDI & CO',
  description: 'Modern legal representation. Transparent pricing. Accessible anywhere.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-gray-100 transition-colors">
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
