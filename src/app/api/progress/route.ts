import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { childId, lessonId, score, passed } = await req.json();

  const existing = await prisma.progress.findUnique({
    where: {
      childId_lessonId: { childId, lessonId }
    }
  });

  if (existing) {
    // Only update if score is better or just to increment attempts
    await prisma.progress.update({
      where: { id: existing.id },
      data: {
        score: Math.max(existing.score, score),
        passed: existing.passed || passed,
        attempts: { increment: 1 }
      }
    });
  } else {
    await prisma.progress.create({
      data: {
        childId,
        lessonId,
        score,
        passed,
        attempts: 1
      }
    });
  }

  return NextResponse.json({ success: true });
}
