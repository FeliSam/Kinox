import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token =
    cookieStore.get("kinox_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const assets = await prisma.mediaAsset.findMany({
    include: { title: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    pipelineStatus: "OPERATIONAL",
    activeWorkers: 2,
    jobs: assets,
  });
}
