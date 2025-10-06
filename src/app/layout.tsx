// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Oliyo AI Image Platform',
  description: 'Generate and edit images using advanced AI models',
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={`${inter.className} min-h-[100dvh] bg-[#0F1115] text-[#E6E8EA] flex flex-col`}>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}