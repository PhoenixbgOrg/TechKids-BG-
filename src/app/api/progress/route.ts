
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const kidId = cookieStore.get('kidId')?.value;

  if (!kidId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, score, passed } = await req.json();

  const existing = await prisma.progress.findUnique({
    where: {
      kidId_lessonId: { kidId, lessonId }
    }
  });

  if (existing) {
    await prisma.progress.update({
      where: { id: existing.id },
      data: {
        score: Math.max(existing.score, score),
        passed: existing.passed || passed,
        attempts: { increment: 1 },
        lastAttempt: new Date()
      }
    });
  } else {
    await prisma.progress.create({
      data: {
        kidId,
        lessonId,
        score,
        passed,
        attempts: 1
      }
    });
  }

  return NextResponse.json({ success: true });
}
