import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });

    const formatted = plans.map((p) => ({
      ...p,
      features: JSON.parse(p.features || "[]"),
    }));

    return NextResponse.json({ plans: formatted });
  } catch (error) {
    console.error("Billing plans error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
