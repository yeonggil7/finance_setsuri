"use client";

import { useEffect, useState } from "react";
import { INCOME_ACCOUNTS, EXPENSE_ACCOUNTS } from "@/lib/accounts";
import { formatNumber, monthLabel } from "@/lib/utils";

type Church = {
  id: string;
  name: string;
  fiscalYear: number;
  prevYearBalance: number;
  prevYearFixedDeposit: number;
};

type Entry = {
  section: string;
  categoryCode: string;
  subcategoryCode: string;
  amount: number;
};

type Report = {
  id: string;
  month: number;
  entries: Entry[];
};

export default function AnnualPage() {
  const [church, setChurch] = useState<Church | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [view, setView] = useState<"income" | "expense">("income");

  useEffect(() => {
    fetch("/api/church")
      .then((r) => r.json())
      .then((c) => {
        setChurch(c);
        fetch(`/api/reports?churchId=${c.id}`)
          .then((r) => r.json())
          .then(setReports);
      });
  }, []);

  if (!church)
    return <div className="p-8 text-slate-500">読み込み中...</div>;

  const accounts = view === "income" ? INCOME_ACCOUNTS : EXPENSE_ACCOUNTS;

  function getAmount(
    month: number,
    section: string,
    categoryCode: string,
    subcategoryCode: string
  ) {
    const report = reports.find((r) => r.month === month);
    if (!report) return 0;
    const entry = report.entries.find(
      (e) =>
        e.section === section &&
        e.categoryCode === categoryCode &&
        e.subcategoryCode === subcategoryCode
    );
    return entry?.amount ?? 0;
  }

  function getMonthTotal(month: number, section: string) {
    const report = reports.find((r) => r.month === month);
    if (!report) return 0;
    return report.entries
      .filter((e) => e.section === section && e.categoryCode !== "7")
      .reduce((s, e) => s + e.amount, 0);
  }

  function getYearTotal(
    section: string,
    categoryCode: string,
    subcategoryCode: string
  ) {
    return Array.from({ length: 12 }, (_, i) =>
      getAmount(i + 1, section, categoryCode, subcategoryCode)
    ).reduce((s, v) => s + v, 0);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">年間推移</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {church.fiscalYear}年度 {church.name || "(教会名未設定)"}教会
          </p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setView("income")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "income"
                ? "bg-white text-green-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            収入の部
          </button>
          <button
            onClick={() => setView("expense")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "expense"
                ? "bg-white text-red-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            支出の部
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-slate-600 font-semibold sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                科目
              </th>
              {Array.from({ length: 12 }, (_, i) => (
                <th
                  key={i}
                  className="text-right px-3 py-3 text-slate-600 font-semibold min-w-[100px]"
                >
                  {monthLabel(i + 1)}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-slate-800 font-bold min-w-[110px] bg-blue-50">
                年間合計
              </th>
              <th className="text-right px-4 py-3 text-slate-800 font-bold min-w-[100px] bg-blue-50">
                月平均
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((cat) => (
              <>
                <tr
                  key={`cat-${cat.code}`}
                  className="border-b border-slate-100 bg-slate-50/50"
                >
                  <td className="px-4 py-2 font-semibold text-slate-700 sticky left-0 bg-slate-50/50 z-10">
                    {cat.name}
                  </td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const total = cat.items.reduce(
                      (s, item) =>
                        s + getAmount(i + 1, view, cat.code, item.code),
                      0
                    );
                    return (
                      <td
                        key={i}
                        className="text-right px-3 py-2 font-medium text-slate-700"
                      >
                        {total ? formatNumber(total) : "-"}
                      </td>
                    );
                  })}
                  <td className="text-right px-4 py-2 font-bold text-slate-800 bg-blue-50/50">
                    {formatNumber(
                      cat.items.reduce(
                        (s, item) =>
                          s + getYearTotal(view, cat.code, item.code),
                        0
                      )
                    )}
                  </td>
                  <td className="text-right px-4 py-2 text-slate-600 bg-blue-50/50">
                    {formatNumber(
                      Math.round(
                        cat.items.reduce(
                          (s, item) =>
                            s + getYearTotal(view, cat.code, item.code),
                          0
                        ) / 12
                      )
                    )}
                  </td>
                </tr>
                {cat.items.map((item) => (
                  <tr
                    key={`${cat.code}-${item.code}`}
                    className="border-b border-slate-50 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-1.5 pl-8 text-slate-600 sticky left-0 bg-white z-10">
                      {item.name}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const val = getAmount(
                        i + 1,
                        view,
                        cat.code,
                        item.code
                      );
                      return (
                        <td
                          key={i}
                          className="text-right px-3 py-1.5 text-slate-600 tabular-nums"
                        >
                          {val ? formatNumber(val) : "-"}
                        </td>
                      );
                    })}
                    <td className="text-right px-4 py-1.5 font-medium text-slate-700 bg-blue-50/50 tabular-nums">
                      {formatNumber(getYearTotal(view, cat.code, item.code))}
                    </td>
                    <td className="text-right px-4 py-1.5 text-slate-500 bg-blue-50/50 tabular-nums">
                      {formatNumber(
                        Math.round(
                          getYearTotal(view, cat.code, item.code) / 12
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </>
            ))}
            {/* Grand Total Row */}
            <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
              <td className="px-4 py-3 text-slate-800 sticky left-0 bg-slate-100 z-10">
                合計
              </td>
              {Array.from({ length: 12 }, (_, i) => (
                <td
                  key={i}
                  className="text-right px-3 py-3 text-slate-800"
                >
                  {formatNumber(getMonthTotal(i + 1, view))}
                </td>
              ))}
              <td className="text-right px-4 py-3 text-blue-800 bg-blue-100">
                {formatNumber(
                  Array.from({ length: 12 }, (_, i) =>
                    getMonthTotal(i + 1, view)
                  ).reduce((s, v) => s + v, 0)
                )}
              </td>
              <td className="text-right px-4 py-3 text-blue-700 bg-blue-100">
                {formatNumber(
                  Math.round(
                    Array.from({ length: 12 }, (_, i) =>
                      getMonthTotal(i + 1, view)
                    ).reduce((s, v) => s + v, 0) / 12
                  )
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
