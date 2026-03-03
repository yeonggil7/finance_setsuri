import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SAMPLE_CHURCHES = [
  { name: "東京", prevYearBalance: 1500000, missionFeeRate: 3.5 },
  { name: "大阪", prevYearBalance: 800000, missionFeeRate: 3.0 },
  { name: "名古屋", prevYearBalance: 1200000, missionFeeRate: 2.5 },
  { name: "福岡", prevYearBalance: 600000, missionFeeRate: 2.0 },
  { name: "横浜", prevYearBalance: 950000, missionFeeRate: 3.0 },
];

const INCOME_ENTRIES = [
  { categoryCode: "1", subcategoryCode: "sunday", min: 50000, max: 150000 },
  { categoryCode: "1", subcategoryCode: "tithe", min: 30000, max: 100000 },
  { categoryCode: "1", subcategoryCode: "thanks", min: 10000, max: 50000 },
  { categoryCode: "1", subcategoryCode: "other_offering", min: 5000, max: 30000 },
  { categoryCode: "3", subcategoryCode: "interest", min: 100, max: 1000 },
];

const EXPENSE_ENTRIES = [
  { categoryCode: "1-1", subcategoryCode: "mission_fee", min: 15000, max: 40000 },
  { categoryCode: "1-1", subcategoryCode: "broadcast_fee", min: 5000, max: 15000 },
  { categoryCode: "1-1", subcategoryCode: "regional_fee", min: 3000, max: 10000 },
  { categoryCode: "1-1", subcategoryCode: "dispatch_fee", min: 30000, max: 80000 },
  { categoryCode: "1-1", subcategoryCode: "pastor_travel", min: 5000, max: 20000 },
  { categoryCode: "1-1", subcategoryCode: "mission_support", min: 3000, max: 15000 },
  { categoryCode: "1-1", subcategoryCode: "event_expense", min: 5000, max: 20000 },
  { categoryCode: "1-1", subcategoryCode: "mission_consumable", min: 2000, max: 10000 },
  { categoryCode: "1-2", subcategoryCode: "temple_rent", min: 50000, max: 120000 },
  { categoryCode: "1-2", subcategoryCode: "temple_utility", min: 10000, max: 30000 },
  { categoryCode: "1-2", subcategoryCode: "temple_comm", min: 3000, max: 8000 },
  { categoryCode: "1-2", subcategoryCode: "temple_insurance", min: 2000, max: 8000 },
  { categoryCode: "1-3", subcategoryCode: "base_rent", min: 30000, max: 80000 },
  { categoryCode: "1-3", subcategoryCode: "base_utility", min: 5000, max: 15000 },
  { categoryCode: "2-1", subcategoryCode: "housing_support", min: 30000, max: 80000 },
  { categoryCode: "2-1", subcategoryCode: "church_mission_fee", min: 20000, max: 50000 },
  { categoryCode: "2-2", subcategoryCode: "welfare_fee", min: 10000, max: 25000 },
  { categoryCode: "2-2", subcategoryCode: "legal_welfare", min: 15000, max: 35000 },
];

type TransferSeed = {
  bankAccount: string;
  itemName: string;
  min: number;
  max: number;
  onlyMonth?: number;
};

const TRANSFER_ENTRIES: TransferSeed[] = [
  { bankAccount: "sbi_individual", itemName: "mission_fee", min: 15000, max: 45000 },
  { bankAccount: "sbi_individual", itemName: "dispatch_fee", min: 30000, max: 80000 },
  { bankAccount: "gmo", itemName: "mission_offering", min: 10000, max: 40000 },
  { bankAccount: "sbi_common", itemName: "welfare_fee", min: 10000, max: 25000 },
  { bankAccount: "gmo", itemName: "broadcast_fee", min: 5000, max: 15000 },
  { bankAccount: "special", itemName: "offering_316", min: 20000, max: 80000, onlyMonth: 3 },
  { bankAccount: "special", itemName: "holy_land", min: 5000, max: 20000 },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes("--reset");

  console.log("Seeding database...");

  if (shouldReset) {
    console.log("  Resetting: deleting existing sample churches...");
    for (const churchData of SAMPLE_CHURCHES) {
      const existing = await prisma.church.findFirst({
        where: { name: churchData.name },
      });
      if (existing) {
        await prisma.church.delete({ where: { id: existing.id } });
        console.log(`    Deleted: ${churchData.name}`);
      }
    }
  }

  for (const churchData of SAMPLE_CHURCHES) {
    const existing = await prisma.church.findFirst({
      where: { name: churchData.name },
    });
    if (existing) {
      console.log(`  Church "${churchData.name}" already exists, skipping.`);
      continue;
    }

    const church = await prisma.church.create({
      data: {
        name: churchData.name,
        fiscalYear: 2026,
        missionFeeRate: churchData.missionFeeRate,
        prevYearBalance: churchData.prevYearBalance,
      },
    });
    console.log(`  Created church: ${church.name} (${church.id})`);

    const monthsToSeed = [1, 2, 3];
    for (const month of monthsToSeed) {
      const report = await prisma.monthlyReport.create({
        data: {
          churchId: church.id,
          month,
          isClosed: month <= 2,
          closedAt: month <= 2 ? new Date() : null,
        },
      });

      for (const ie of INCOME_ENTRIES) {
        await prisma.reportEntry.create({
          data: {
            reportId: report.id,
            section: "income",
            categoryCode: ie.categoryCode,
            subcategoryCode: ie.subcategoryCode,
            amount: randomInt(ie.min, ie.max),
          },
        });
      }

      for (const ee of EXPENSE_ENTRIES) {
        await prisma.reportEntry.create({
          data: {
            reportId: report.id,
            section: "expense",
            categoryCode: ee.categoryCode,
            subcategoryCode: ee.subcategoryCode,
            amount: randomInt(ee.min, ee.max),
          },
        });
      }

      for (const te of TRANSFER_ENTRIES) {
        if (te.onlyMonth && te.onlyMonth !== month) continue;
        await prisma.transferEntry.create({
          data: {
            reportId: report.id,
            bankAccount: te.bankAccount,
            itemName: te.itemName,
            amount: randomInt(te.min, te.max),
          },
        });
      }

      console.log(`    Month ${month}: created with sample entries + transfers`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
