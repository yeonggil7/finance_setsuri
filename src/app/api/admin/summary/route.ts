import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EXCLUDED_ACTIVITY_CODES = ["mission_fee", "broadcast_fee", "regional_fee", "dispatch_fee"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? "2026");

  const churches = await prisma.church.findMany({
    where: { fiscalYear: year },
    include: {
      monthlyReports: {
        include: { entries: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const summaries = churches.map((church) => {
    let annualIncome = 0;
    let annualExpense = 0;
    let personnelCost = 0;
    let sanctuaryCost = 0;
    let activityCost = 0;
    let closedMonths = 0;

    for (const report of church.monthlyReports) {
      if (report.isClosed) closedMonths++;
      for (const entry of report.entries) {
        if (entry.categoryCode === "7") continue;
        if (entry.section === "income") annualIncome += entry.amount;
        if (entry.section === "expense") annualExpense += entry.amount;

        if (entry.section !== "expense") continue;

        // 年間人件費: 派遣宣教費 + 人件費(1)給与手当 + 人件費(2)福利厚生費
        if (entry.categoryCode === "1-1" && entry.subcategoryCode === "dispatch_fee") {
          personnelCost += entry.amount;
        }
        if (entry.categoryCode === "2-1" || entry.categoryCode === "2-2") {
          personnelCost += entry.amount;
        }

        // 年間聖殿関連支出: 管理費(聖殿) + 不動産取得費 + 借入金返済支出
        if (entry.categoryCode === "1-2") {
          sanctuaryCost += entry.amount;
        }
        if (entry.categoryCode === "3" && entry.subcategoryCode === "realestate_purchase") {
          sanctuaryCost += entry.amount;
        }
        if (entry.categoryCode === "6") {
          sanctuaryCost += entry.amount;
        }

        // 年間活動費: 宗教活動費(上4つ除外) + 管理費(拠点)
        if (entry.categoryCode === "1-1" && !EXCLUDED_ACTIVITY_CODES.includes(entry.subcategoryCode)) {
          activityCost += entry.amount;
        }
        if (entry.categoryCode === "1-3") {
          activityCost += entry.amount;
        }
      }
    }

    const balance = annualIncome - annualExpense;
    const currentBalance = church.prevYearBalance + balance;

    return {
      churchId: church.id,
      churchName: church.name || "(未設定)",
      fiscalYear: church.fiscalYear,
      annualIncome,
      annualExpense,
      balance,
      prevYearBalance: church.prevYearBalance,
      currentBalance,
      personnelCost,
      sanctuaryCost,
      activityCost,
      closedMonths,
    };
  });

  return NextResponse.json(summaries);
}
