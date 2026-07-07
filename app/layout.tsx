import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="min-h-screen bg-white font-sans text-gray-900">
        {children}
      </body>
    </html>
  );
}
