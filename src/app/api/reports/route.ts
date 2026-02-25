import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const churchId = searchParams.get("churchId");

  if (month && churchId) {
    let report = await prisma.monthlyReport.findUnique({
      where: { churchId_month: { churchId, month: parseInt(month) } },
      include: { entries: true, transfers: true },
    });
    if (!report) {
      report = await prisma.monthlyReport.create({
        data: { churchId, month: parseInt(month) },
        include: { entries: true, transfers: true },
      });
    }
    return NextResponse.json(report);
  }

  if (churchId) {
    const reports = await prisma.monthlyReport.findMany({
      where: { churchId },
      include: { entries: true, transfers: true },
      orderBy: { month: "asc" },
    });
    return NextResponse.json(reports);
  }

  return NextResponse.json([]);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, isClosed, note } = body;

  const updated = await prisma.monthlyReport.update({
    where: { id },
    data: {
      isClosed,
      closedAt: isClosed ? new Date() : null,
      note: note ?? undefined,
    },
    include: { entries: true, transfers: true },
  });
  return NextResponse.json(updated);
}
