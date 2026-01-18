import { prisma } from "@/lib/prisma";
import { BG } from "@/lib/i18n";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ChildDashboard({ params }: { params: { childId: string } }) {
  const child = await prisma.childProfile.findUnique({
    where: { id: params.childId },
    include: { progress: true }
  });

  if (!child) return notFound();

  const lessons = await prisma.lesson.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  });

  // Calculate unlock status
  // Lesson 1 is always unlocked.
  // Lesson N is unlocked if Lesson N-1 passed.
  
  // Explicitly type the Map to ensure TS knows the structure of the values
  type ProgressType = typeof child.progress[number];
  const progressMap = new Map<string, ProgressType>(child.progress.map(p => [p.lessonId, p]));

  return (
    <div className="bg-sky-50 min-h-screen p-6 pb-20">
       <div className="max-w-4xl mx-auto">
         <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-sky-800">{BG.child_dash_title}</h1>
              <p className="text-sky-600 font-medium text-lg">Здравей, {child.nickname}! 👋</p>
            </div>
            <Link href="/dashboard/parent" className="text-sm bg-white px-4 py-2 rounded-full text-slate-500 font-bold shadow-sm">
              {BG.auth_logout}
            </Link>
         </header>

         <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              <span>🚀</span> {BG.child_lessons_title}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {lessons.map((lesson, index) => {
                const prevLesson = index > 0 ? lessons[index - 1] : null;
                const prevProgress = prevLesson ? progressMap.get(prevLesson.id) : null;
                const isLocked = index > 0 && (!prevProgress || !prevProgress.passed);
                
                const myProgress = progressMap.get(lesson.id);
                const score = myProgress ? myProgress.score : null;

                return (
                  <div key={lesson.id} className={`bg-white rounded-3xl p-6 shadow-sm border-b-4 ${isLocked ? 'border-slate-200 opacity-60' : 'border-blue-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                        #{lesson.order}
                      </span>
                      {score !== null && (
                        <span className={`font-bold text-sm ${score >= 80 ? 'text-green-500' : 'text-orange-500'}`}>
                          {score}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-slate-800">{lesson.titleBG}</h3>
                    
                    {isLocked ? (
                      <button disabled className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                        🔒 {BG.child_locked}
                      </button>
                    ) : (
                      <Link 
                        href={`/learn/${lesson.id}?childId=${child.id}`}
                        className="block w-full text-center py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95"
                      >
                        {myProgress ? BG.child_btn_review : BG.child_btn_start}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
         </section>

         <section>
            <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              <span>🏆</span> {BG.child_badges_title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {lessons.map(lesson => {
                 const p = progressMap.get(lesson.id);
                 const earned = p?.passed;
                 return (
                   <div key={lesson.id} className={`p-4 rounded-2xl text-center border-2 ${earned ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="text-4xl mb-2 grayscale transition duration-500" style={{ filter: earned ? 'none' : 'grayscale(100%) opacity(0.3)' }}>
                        🏅
                      </div>
                      <p className={`text-xs font-bold leading-tight ${earned ? 'text-yellow-800' : 'text-slate-400'}`}>
                        {lesson.titleBG}
                      </p>
                   </div>
                 )
               })}
            </div>
         </section>
       </div>
    </div>
  );
}