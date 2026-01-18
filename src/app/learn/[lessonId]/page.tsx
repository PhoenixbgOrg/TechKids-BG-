import { prisma } from "@/lib/prisma";
import { BG } from "@/lib/i18n";
import React from 'react';
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, AlertCircle, Info, ExternalLink, ArrowRight } from "lucide-react";

export default async function LessonPage({ 
  params, 
  searchParams 
}: { 
  params: { lessonId: string }, 
  searchParams: { childId: string } 
}) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId }
  });

  if (!lesson) return notFound();

  const sections = lesson.contentSections as any[];
  const enTerms = lesson.keyTermsEN as any[];
  const sources = lesson.sources as any[];
  const mistakes = lesson.mistakesBG as string[];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href={`/dashboard/child/${searchParams.childId}`} className="text-sm font-bold text-slate-400 hover:text-blue-600">
             ← {BG.lesson_back_btn}
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-[10px] font-black uppercase text-green-600">{BG.lesson_verified_badge}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">{lesson.titleBG}</h1>
          <p className="text-xl text-slate-500 font-medium">{lesson.summaryBG}</p>
        </header>

        <main className="space-y-8 mb-20">
          {sections.map((s, i) => (
            <div key={i} className={`p-8 rounded-[2rem] ${
              s.type === 'warning' ? 'bg-orange-50 border-2 border-orange-100' : 
              s.type === 'info' ? 'bg-blue-50 border-2 border-blue-100' : 'bg-white shadow-sm border border-slate-100'
            }`}>
              <div className="flex gap-4">
                {s.type === 'warning' && <AlertCircle className="w-6 h-6 text-orange-500 shrink-0" />}
                {s.type === 'info' && <Info className="w-6 h-6 text-blue-500 shrink-0" />}
                <p className={`leading-relaxed font-medium text-lg ${s.type === 'warning' ? 'text-orange-900' : 'text-slate-700'}`}>
                  {s.content}
                </p>
              </div>
            </div>
          ))}

          {/* Mistakes Box */}
          <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2rem]">
            <h3 className="text-red-800 font-black mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {BG.lesson_mistakes_title}
            </h3>
            <ul className="space-y-3">
              {mistakes.map((m, i) => (
                <li key={i} className="text-red-700 font-bold bg-white/50 p-3 rounded-xl border border-red-50">✕ {m}</li>
              ))}
            </ul>
          </div>
        </main>

        {/* English Layer */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem]">
            <h4 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-6">{BG.lesson_panel_en_terms}</h4>
            <div className="space-y-4">
              {enTerms.map((t, i) => (
                <div key={i} className="group">
                  <span className="block font-black text-lg group-hover:text-blue-400 transition-colors">{t.term}</span>
                  <span className="text-sm text-slate-400">{t.def}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] flex flex-col justify-center">
            <h4 className="text-blue-200 text-xs font-black uppercase tracking-widest mb-4">{BG.lesson_panel_en_summary}</h4>
            <p className="text-2xl font-black italic">"{lesson.summaryEN}"</p>
          </div>
        </div>

        {/* Sources Footer */}
        <footer className="pt-10 border-t border-slate-200">
           <h5 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">{BG.lesson_sources_title}</h5>
           <div className="flex flex-wrap gap-4">
             {sources.map((src, i) => (
               <a key={i} href={src.url} target="_blank" className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all">
                 {src.title} <ExternalLink className="w-3 h-3" />
               </a>
             ))}
           </div>
        </footer>
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none">
        <Link 
          href={`/learn/${lesson.id}/quiz?childId=${searchParams.childId}`}
          className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-blue-200 flex items-center gap-3 transform hover:-translate-y-1 transition-all"
        >
          {BG.lesson_quiz_btn} <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
