
import Link from 'next/link';
import { BG } from '@/lib/i18n';

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 text-white">
      <section className="w-full flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 font-orbitron italic">
          AORUS ACADEMY
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto font-mono">
          {BG.landing_hero_subtitle}
        </p>
        <Link 
          href="/login" 
          className="px-10 py-5 bg-orange-600 text-white font-black text-xl rounded-none transform skew-x-[-10deg] hover:bg-orange-700 transition-all shadow-[0_0_20px_rgba(255,107,0,0.5)]"
        >
          <span className="block transform skew-x-[10deg]">{BG.landing_btn_start}</span>
        </Link>
      </section>
    </div>
  );
}
