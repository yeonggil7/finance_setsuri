-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL DEFAULT 2026,
    "missionFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prevYearBalance" INTEGER NOT NULL DEFAULT 0,
    "prevYearFixedDeposit" INTEGER NOT NULL DEFAULT 0,
    "janMissionFee" INTEGER NOT NULL DEFAULT 0,
    "janDispatchFee" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportEntry" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "subcategoryCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "memo" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ReportEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferEntry" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "bankAccount" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TransferEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReport_churchId_month_key" ON "MonthlyReport"("churchId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "ReportEntry_reportId_section_categoryCode_subcategoryCode_key" ON "ReportEntry"("reportId", "section", "categoryCode", "subcategoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "TransferEntry_reportId_bankAccount_itemName_key" ON "TransferEntry"("reportId", "bankAccount", "itemName");

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEntry" ADD CONSTRAINT "ReportEntry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MonthlyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferEntry" ADD CONSTRAINT "TransferEntry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MonthlyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
