import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let church = await prisma.church.findFirst();
  if (!church) {
    church = await prisma.church.create({
      data: { name: "", fiscalYear: 2026 },
    });
  }
  return NextResponse.json(church);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  let church = await prisma.church.findFirst();
  if (!church) {
    church = await prisma.church.create({ data: { name: "", fiscalYear: 2026 } });
  }
  const updated = await prisma.church.update({
    where: { id: church.id },
    data: {
      name: body.name,
      fiscalYear: body.fiscalYear,
      missionFeeRate: body.missionFeeRate,
      prevYearBalance: body.prevYearBalance,
      prevYearFixedDeposit: body.prevYearFixedDeposit,
      janMissionFee: body.janMissionFee,
      janDispatchFee: body.janDispatchFee,
    },
  });
  return NextResponse.json(updated);
}
