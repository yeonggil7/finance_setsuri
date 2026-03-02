import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const church = await prisma.church.findUnique({ where: { id } });
    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }
    return NextResponse.json(church);
  }

  const churches = await prisma.church.findMany({ orderBy: { name: "asc" } });
  if (churches.length === 0) {
    const newChurch = await prisma.church.create({
      data: { name: "", fiscalYear: 2026 },
    });
    return NextResponse.json([newChurch]);
  }
  return NextResponse.json(churches);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const church = await prisma.church.create({
    data: {
      name: body.name ?? "",
      fiscalYear: body.fiscalYear ?? 2026,
      missionFeeRate: body.missionFeeRate ?? 0,
      prevYearBalance: body.prevYearBalance ?? 0,
      prevYearFixedDeposit: body.prevYearFixedDeposit ?? 0,
      janMissionFee: body.janMissionFee ?? 0,
      janDispatchFee: body.janDispatchFee ?? 0,
    },
  });
  return NextResponse.json(church, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const updated = await prisma.church.update({
    where: { id: body.id },
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

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  await prisma.church.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
