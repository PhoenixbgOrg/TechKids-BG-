
import { prisma } from "@/lib/prisma";
import { BG } from "@/lib/i18n";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ShieldCheck, AlertCircle, Info, ExternalLink, ArrowRight, BookOpen } from "lucide-react";

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const cookieStore = await cookies();
  if (!cookieStore.get('kidId')) redirect('/login');

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId }
  });

  if (!lesson) return notFound();

  // Handle Prisma JSON types safely
  const sections = (lesson.contentSections as any[]) || [];
  const enTerms = (lesson.keyTermsEN as any[]) || [];
  const sources = (lesson.sources as any[]) || [];
  const mistakes = (lesson.mistakesBG as string[]) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
             ← {BG.back_btn}
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black uppercase text-orange-500">{BG.verified}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-12 border-b border-slate-800 pb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter">{lesson.titleBG}</h1>
          <p className="text-xl text-slate-400 font-medium">{lesson.summaryBG}</p>
        </header>

        <main className="space-y-8 mb-20">
          {sections.map((s, i) => (
            <div key={i} className={`p-8 border-l-4 ${
              s.type === 'warning' ? 'bg-red-900/20 border-red-500' : 
              s.type === 'info' ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-900 border-slate-700'
            }`}>
              <div className="flex gap-4">
                {s.type === 'warning' && <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />}
                {s.type === 'info' && <Info className="w-6 h-6 text-blue-500 shrink-0" />}
                {s.type === 'text' && <BookOpen className="w-6 h-6 text-slate-500 shrink-0" />}
                <p className="leading-relaxed font-medium text-lg text-slate-200">
                  {s.content}
                </p>
              </div>
            </div>
          ))}

          {mistakes.length > 0 && (
            <div className="bg-slate-900 border border-red-900/50 p-8">
              <h3 className="text-red-500 font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-sm">
                <AlertCircle className="w-4 h-4" /> {BG.mistakes_title}
              </h3>
              <ul className="space-y-3">
                {mistakes.map((m, i) => (
                  <li key={i} className="text-red-400 font-bold">✕ {m}</li>
                ))}
              </ul>
            </div>
          )}
        </main>

        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {enTerms.length > 0 && (
            <div className="bg-black border border-slate-800 p-8">
              <h4 className="text-blue-500 text-xs font-black uppercase tracking-widest mb-6">{BG.en_terms}</h4>
              <div className="space-y-4">
                {enTerms.map((t, i) => (
                  <div key={i}>
                    <span className="block font-black text-lg text-white">{t.term}</span>
                    <span className="text-sm text-slate-500">{t.def}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Link 
            href={`/learn/${lesson.id}/quiz`}
            className="bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-12 uppercase tracking-widest shadow-lg shadow-orange-900/20 flex items-center gap-3 transform hover:-translate-y-1 transition-all"
          >
            {BG.quiz_btn} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
