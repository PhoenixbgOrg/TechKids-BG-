
import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { BG } from '@/lib/i18n';
import { MatrixBackground } from '@/components/MatrixBackground';

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
      <body className={`${inter.className} bg-slate-950 text-slate-200 min-h-screen flex flex-col`}>
        <MatrixBackground />
        
        <header className="bg-black/60 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-black text-orange-500 flex items-center gap-2 italic uppercase tracking-tighter">
              <span className="text-2xl">🚀</span> {BG.brand_name}
            </a>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-black/40 backdrop-blur-sm py-8 mt-12 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} {BG.brand_name}. {BG.footer_rights}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
