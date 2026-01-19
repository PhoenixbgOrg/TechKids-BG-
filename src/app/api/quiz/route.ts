
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');

  if (!lessonId) return NextResponse.json([], { status: 400 });

  const questions = await prisma.question.findMany({
    where: { lessonId },
  });

  // Randomize order
  const shuffled = questions.sort(() => 0.5 - Math.random());
  
  // Return top 10 questions to keep quizzes manageable
  return NextResponse.json(shuffled.slice(0, 10));
}
