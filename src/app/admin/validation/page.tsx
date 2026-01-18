import { prisma } from "@/lib/prisma";
import { BG } from "@/lib/i18n";
import { AlertTriangle, CheckCircle, ShieldAlert, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminValidationPage() {
  const lessons = await prisma.lesson.findMany({
    include: { questions: true },
    orderBy: { order: 'asc' }
  });

  const validationResults = lessons.map(lesson => {
    const sources = JSON.parse(lesson.sources || '[]');
    const errors: string[] = [];

    if (sources.length < 2) errors.push(BG.admin_error_no_sources);
    if (lesson.questions.length === 0) errors.push(BG.admin_error_no_questions);
    
    lesson.questions.forEach((q, idx) => {
      if (!q.explanationBG) errors.push(`Въпрос ${idx + 1}: Липсва обяснение.`);
      if (!q.explanationSrc) errors.push(`Въпрос ${idx + 1}: Липсва източник за обяснение.`);
    });

    return {
      lesson,
      isValid: errors.length === 0,
      errors
    };
  });

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-blue-600" />
        {BG.admin_validation_title}
      </h1>

      <div className="space-y-6">
        {validationResults.map(({ lesson, isValid, errors }) => (
          <div key={lesson.id} className={`bg-white rounded-3xl p-8 border-2 transition-all ${
            isValid ? 'border-green-100 shadow-sm' : 'border-red-100 shadow-lg shadow-red-50'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-slate-400 text-sm font-black">#{lesson.order}</span>
                  {lesson.titleBG}
                </h3>
                <p className="text-slate-400 text-sm mt-1">Slug: {lesson.slug}</p>
              </div>
              {isValid ? (
                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-xs font-black uppercase">
                  <CheckCircle className="w-4 h-4" /> {BG.admin_val_status_ok}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-black uppercase">
                  <AlertTriangle className="w-4 h-4" /> {errors.length} Проблема
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Статус на урока
                </h4>
                <div className="space-y-2">
                  <div className={`text-sm p-3 rounded-xl border flex items-center justify-between ${JSON.parse(lesson.sources).length >= 2 ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-red-50 border-red-100 text-red-700 font-bold'}`}>
                    <span>Източници (мин. 2)</span>
                    <span>{JSON.parse(lesson.sources).length} / 2</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <HelpCircle className="w-3 h-3" /> Статус на въпросите
                </h4>
                <div className="space-y-2">
                  <div className={`text-sm p-3 rounded-xl border flex items-center justify-between ${lesson.questions.length > 0 ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-red-50 border-red-100 text-red-700 font-bold'}`}>
                    <span>Брой въпроси</span>
                    <span>{lesson.questions.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <ul className="space-y-2">
                  {errors.map((err, i) => (
                    <li key={i} className="text-sm text-red-600 flex items-center gap-2 font-medium">
                      <div className="w-1 h-1 bg-red-400 rounded-full" /> {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex gap-3">
               <Link href={`/admin/lessons/${lesson.id}`} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                 Редактирай урок
               </Link>
               <Link href={`/admin/questions?lessonId=${lesson.id}`} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                 Редактирай въпроси
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
