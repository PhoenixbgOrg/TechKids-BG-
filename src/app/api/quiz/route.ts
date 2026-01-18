import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');

  if (!lessonId) return NextResponse.json([], { status: 400 });

  // Get all questions for lesson
  const allQuestions = await prisma.question.findMany({
    where: { lessonId },
  });

  // Simple shuffle
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  
  // Return top 5 for demo (in real app, use 10-20)
  return NextResponse.json(shuffled.slice(0, 5));
}
