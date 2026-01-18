import Link from 'next/link';
import { BG } from '@/lib/i18n';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-blue-600 text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            {BG.landing_hero_title}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {BG.landing_hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-lg hover:bg-blue-50 transition-transform transform hover:-translate-y-1 text-lg"
            >
              {BG.nav_login}
            </Link>
            <Link 
              href="/register" 
              className="px-8 py-4 bg-blue-500 border-2 border-white text-white font-bold rounded-2xl hover:bg-blue-600 transition-transform transform hover:-translate-y-1 text-lg"
            >
              {BG.nav_register}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-bold mb-2">{BG.landing_feature_1}</h3>
          <p className="text-slate-600">Кратко, ясно и интересно съдържание за всеки.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h3 className="text-xl font-bold mb-2">{BG.landing_feature_2}</h3>
          <p className="text-slate-600">Провери знанията си веднага след всеки урок.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">{BG.landing_feature_3}</h3>
          <p className="text-slate-600">Събирай награди за всяко постижение.</p>
        </div>
      </section>
    </div>
  );
}
