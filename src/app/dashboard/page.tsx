
import { prisma } from "@/lib/prisma";
import { BG } from "@/lib/i18n";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Lock, CheckCircle, Play, LogOut, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const kidId = cookieStore.get('kidId')?.value;

  if (!kidId) redirect('/login');

  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidId },
    include: { progress: true }
  });

  if (!kid) redirect('/login');

  const lessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' }
  });

  type ProgressType = typeof kid.progress[number];
  const progressMap = new Map<string, ProgressType>(kid.progress.map(p => [p.lessonId, p]));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 pb-20">
       <div className="max-w-2xl mx-auto">
         <header className="flex justify-between items-start mb-10 border-b border-slate-800 pb-6 pt-4">
            <div>
              <h1 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{BG.dash_title}</h1>
              <p className="text-3xl md:text-4xl font-black text-white leading-none">{BG.dash_welcome} <br/><span className="text-orange-500">{kid.nickname}</span></p>
            </div>
            <Link href="/login" className="text-[10px] bg-slate-900 border border-slate-700 hover:border-red-500 hover:text-red-500 px-3 py-2 uppercase font-bold transition-colors flex items-center gap-1 rounded">
              <LogOut size={12} /> {BG.dash_logout}
            </Link>
         </header>

         <div className="space-y-4">
            {lessons.map((lesson, index) => {
               const prevLesson = index > 0 ? lessons[index - 1] : null;
               const prevPassed = prevLesson ? progressMap.get(prevLesson.id)?.passed : true;
               const isLocked = !prevPassed;
               const myProgress = progressMap.get(lesson.id);
               const passed = myProgress?.passed;

               const Wrapper = isLocked ? 'div' : Link;
               const wrapperProps = isLocked ? {} : { href: `/learn/${lesson.id}` };

               return (
                 <Wrapper 
                    key={lesson.id} 
                    {...wrapperProps}
                    className={`block relative p-6 bg-slate-900 rounded-3xl border-2 transition-all active:scale-[0.98] ${
                        isLocked 
                        ? 'border-slate-800 opacity-60 grayscale cursor-not-allowed' 
                        : passed 
                            ? 'border-green-500/50 hover:border-green-500 bg-green-900/5' 
                            : 'border-orange-500 hover:bg-orange-900/10'
                    }`}
                 >
                    <div className="flex justify-between items-center gap-4">
                       <div className="flex-1">
                          <span className={`text-[10px] font-black uppercase mb-1 block tracking-widest ${passed ? 'text-green-500' : 'text-slate-500'}`}>
                             Module {lesson.order}
                          </span>
                          <h3 className="text-xl font-bold text-white leading-tight mb-2">{lesson.titleBG}</h3>
                          
                          {!isLocked && (
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                  {passed ? (
                                      <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12} /> {myProgress?.score}% SCORE</span>
                                  ) : (
                                      <span className="text-orange-400 flex items-center gap-1">{BG.lesson_start} <ChevronRight size={12} /></span>
                                  )}
                              </div>
                          )}
                       </div>
                       
                       <div className="shrink-0">
                          {passed && (
                            <div className="w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg shadow-green-900/50">
                              <CheckCircle size={24} />
                            </div>
                          )}
                          
                          {isLocked && (
                             <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                                <Lock size={20} />
                             </div>
                          )}
                          
                          {!passed && !isLocked && (
                             <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-900/50 animate-pulse">
                                <Play size={20} fill="currentColor" />
                             </div>
                          )}
                       </div>
                    </div>
                 </Wrapper>
               );
            })}
         </div>
       </div>
    </div>
  );
}
