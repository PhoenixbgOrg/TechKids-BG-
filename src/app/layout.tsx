import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { BG } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata = {
  title: 'TechKids BG',
  description: 'Образователна платформа за деца',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body className={inter.className + " bg-slate-50 text-slate-800 min-h-screen flex flex-col"}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <span>🚀</span> {BG.brand_name}
            </a>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-slate-100 py-8 mt-12 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} {BG.brand_name}. {BG.footer_rights}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}