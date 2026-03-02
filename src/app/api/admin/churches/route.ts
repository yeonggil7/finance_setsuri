import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const churches = await prisma.church.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, fiscalYear: true },
  });
  return NextResponse.json(churches);
}
