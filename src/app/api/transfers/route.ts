import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { reportId, bankAccount, itemName, amount } = body;

  const entry = await prisma.transferEntry.upsert({
    where: {
      reportId_bankAccount_itemName: { reportId, bankAccount, itemName },
    },
    update: { amount },
    create: { reportId, bankAccount, itemName, amount },
  });

  return NextResponse.json(entry);
}
