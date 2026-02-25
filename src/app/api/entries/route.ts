import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { reportId, section, categoryCode, subcategoryCode, amount, memo } =
    body;

  const entry = await prisma.reportEntry.upsert({
    where: {
      reportId_section_categoryCode_subcategoryCode: {
        reportId,
        section,
        categoryCode,
        subcategoryCode,
      },
    },
    update: { amount, memo: memo ?? "" },
    create: { reportId, section, categoryCode, subcategoryCode, amount, memo: memo ?? "" },
  });

  return NextResponse.json(entry);
}
