import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? "1");
  const year = parseInt(searchParams.get("year") ?? "2026");

  const churches = await prisma.church.findMany({
    where: { fiscalYear: year },
    include: {
      monthlyReports: {
        where: { month },
        include: { transfers: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = churches.map((church) => {
    const report = church.monthlyReports[0] ?? null;
    const transfers = report?.transfers ?? [];

    return {
      churchId: church.id,
      churchName: church.name || "(未設定)",
      reportId: report?.id ?? null,
      isClosed: report?.isClosed ?? false,
      transfers: transfers.map((t) => ({
        id: t.id,
        bankAccount: t.bankAccount,
        itemName: t.itemName,
        amount: t.amount,
        adminMemo: t.adminMemo,
      })),
    };
  });

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, adminMemo } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updated = await prisma.transferEntry.update({
    where: { id },
    data: { adminMemo: adminMemo ?? "" },
  });

  return NextResponse.json(updated);
}
