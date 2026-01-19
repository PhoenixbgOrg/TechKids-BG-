
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { nickname } = await req.json();
    if (!nickname) return NextResponse.json({ error: "Name required" }, { status: 400 });

    // Upsert kid profile
    const kid = await prisma.kidProfile.upsert({
      where: { nickname },
      update: {},
      create: { nickname }
    });

    // Set cookie
    (await cookies()).set('kidId', kid.id, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return NextResponse.json({ success: true, kidId: kid.id });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
