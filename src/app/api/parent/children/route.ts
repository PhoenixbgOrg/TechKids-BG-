import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BG } from "@/lib/i18n";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parent = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { children: true }
  });

  return NextResponse.json(parent?.children || []);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { nickname, age, ageBracket } = await req.json();

  // Hidden restriction
  const ageInt = parseInt(age);
  if (isNaN(ageInt) || ageInt >= 16) {
    return NextResponse.json({ error: BG.val_reg_fail_generic }, { status: 400 });
  }

  const child = await prisma.childProfile.create({
    data: {
      nickname,
      age: ageInt,
      ageBracket,
      parentId: (session.user as any).id
    }
  });

  return NextResponse.json(child);
}
