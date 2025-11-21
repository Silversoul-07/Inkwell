import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const category = searchParams.get("category");

    const where: any = {
      project: { userId: session.user.id },
    };
    if (category && category !== "all") {
      where.category = category;
    }

    const orderBy: any = {};
    if (sortBy === "priority") {
      orderBy.priority = "desc";
    } else if (sortBy === "useCount") {
      orderBy.useCount = "desc";
    } else if (sortBy === "lastUsed") {
      orderBy.lastUsed = "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const entries = await prisma.lorebookEntry.findMany({
      where,
      include: {
        project: { select: { id: true, title: true } },
      },
      orderBy,
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Global lorebook fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
