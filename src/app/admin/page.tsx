"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  ArrowRight,
} from "lucide-react";

type ChurchSummary = {
  churchId: string;
  churchName: string;
  fiscalYear: number;
  annualIncome: number;
  annualExpense: number;
  balance: number;
  prevYearBalance: number;
  currentBalance: number;
  personnelCost: number;
  sanctuaryCost: number;
  activityCost: number;
  closedMonths: number;
};

export default function AdminDashboardPage() {
  const { user, setUser, churches } = useAuth();
  const [summaries, setSummaries] = useState<ChurchSummary[]>([]);
  const [year, setYear] = useState(2026);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/summary?year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        setSummaries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year]);

  const totals = summaries.reduce(
    (acc, s) => ({
      income: acc.income + s.annualIncome,
      expense: acc.expense + s.annualExpense,
      balance: acc.balance + s.balance,
      currentBalance: acc.currentBalance + s.currentBalance,
      personnelCost: acc.personnelCost + s.personnelCost,
      sanctuaryCost: acc.sanctuaryCost + s.sanctuaryCost,
      activityCost: acc.activityCost + s.activityCost,
    }),
    { income: 0, expense: 0, balance: 0, currentBalance: 0, personnelCost: 0, sanctuaryCost: 0, activityCost: 0 }
  );

  const handleViewChurch = (churchId: string) => {
    const church = churches.find((c) => c.id === churchId);
    if (church) {
      setUser({
        role: "CHURCH",
        churchId: church.id,
        churchName: church.name || "(教会名未設定)",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">全教会サマリー</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            各教会の月次報告を集計した年次サマリー
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">年度:</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}年度
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={<Building2 className="w-5 h-5 text-indigo-600" />}
          label="登録教会数"
          value={`${summaries.length} 教会`}
          bg="bg-indigo-50"
        />
        <KPICard
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          label="全教会 収入合計"
          value={`${formatNumber(totals.income)}円`}
          bg="bg-green-50"
        />
        <KPICard
          icon={<TrendingDown className="w-5 h-5 text-red-600" />}
          label="全教会 支出合計"
          value={`${formatNumber(totals.expense)}円`}
          bg="bg-red-50"
        />
        <KPICard
          icon={<Wallet className="w-5 h-5 text-blue-600" />}
          label="全教会 保有残高合計"
          value={`${formatNumber(totals.currentBalance)}円`}
          bg="bg-blue-50"
        />
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-700">教会別年次サマリー</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">読み込み中...</div>
        ) : summaries.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {year}年度のデータがありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold sticky left-0 bg-slate-50 z-10">
                    教会名
                  </th>
                  <th className="text-right px-3 py-3 text-slate-600 font-semibold">
                    保有残高
                  </th>
                  <th className="text-right px-3 py-3 text-slate-600 font-semibold">
                    年間収入
                  </th>
                  <th className="text-right px-3 py-3 text-slate-600 font-semibold">
                    年間支出
                  </th>
                  <th className="text-right px-3 py-3 text-slate-600 font-semibold">
                    年間収支
                  </th>
                  <th className="text-right px-3 py-3 text-orange-700 font-semibold bg-orange-50/50">
                    人件費
                  </th>
                  <th className="text-right px-3 py-3 text-purple-700 font-semibold bg-purple-50/50">
                    聖殿関連
                  </th>
                  <th className="text-right px-3 py-3 text-teal-700 font-semibold bg-teal-50/50">
                    活動費
                  </th>
                  <th className="text-center px-3 py-3 text-slate-600 font-semibold">
                    報告済
                  </th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr
                    key={s.churchId}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800 sticky left-0 bg-white z-10">
                      {s.churchName}
                    </td>
                    <td className="text-right px-3 py-3 font-medium text-blue-700 tabular-nums">
                      {formatNumber(s.currentBalance)}
                    </td>
                    <td className="text-right px-3 py-3 text-green-700 tabular-nums">
                      {formatNumber(s.annualIncome)}
                    </td>
                    <td className="text-right px-3 py-3 text-red-700 tabular-nums">
                      {formatNumber(s.annualExpense)}
                    </td>
                    <td
                      className={`text-right px-3 py-3 font-medium tabular-nums ${
                        s.balance >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {formatNumber(s.balance)}
                    </td>
                    <td className="text-right px-3 py-3 text-orange-700 tabular-nums bg-orange-50/30">
                      {formatNumber(s.personnelCost)}
                    </td>
                    <td className="text-right px-3 py-3 text-purple-700 tabular-nums bg-purple-50/30">
                      {formatNumber(s.sanctuaryCost)}
                    </td>
                    <td className="text-right px-3 py-3 text-teal-700 tabular-nums bg-teal-50/30">
                      {formatNumber(s.activityCost)}
                    </td>
                    <td className="text-center px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.closedMonths === 12
                            ? "bg-green-100 text-green-800"
                            : s.closedMonths > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.closedMonths}/12
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleViewChurch(s.churchId)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                      >
                        詳細
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                  <td className="px-4 py-3 text-slate-800 sticky left-0 bg-slate-100 z-10">合計</td>
                  <td className="text-right px-3 py-3 text-blue-800 tabular-nums">
                    {formatNumber(totals.currentBalance)}
                  </td>
                  <td className="text-right px-3 py-3 text-green-800 tabular-nums">
                    {formatNumber(totals.income)}
                  </td>
                  <td className="text-right px-3 py-3 text-red-800 tabular-nums">
                    {formatNumber(totals.expense)}
                  </td>
                  <td
                    className={`text-right px-3 py-3 tabular-nums ${
                      totals.balance >= 0 ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {formatNumber(totals.balance)}
                  </td>
                  <td className="text-right px-3 py-3 text-orange-800 tabular-nums bg-orange-50/50">
                    {formatNumber(totals.personnelCost)}
                  </td>
                  <td className="text-right px-3 py-3 text-purple-800 tabular-nums bg-purple-50/50">
                    {formatNumber(totals.sanctuaryCost)}
                  </td>
                  <td className="text-right px-3 py-3 text-teal-800 tabular-nums bg-teal-50/50">
                    {formatNumber(totals.activityCost)}
                  </td>
                  <td className="text-center px-3 py-3 text-slate-600">—</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
        <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">項目の説明</h4>
        <div className="grid grid-cols-3 gap-4 text-xs text-slate-600">
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1.5" />
            <span className="font-medium">人件費</span>: 宣教会派遣宣教費 + 給与手当 + 福利厚生費
          </div>
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1.5" />
            <span className="font-medium">聖殿関連</span>: 管理費(聖殿) + 不動産取得費 + 借入金返済
          </div>
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1.5" />
            <span className="font-medium">活動費</span>: 宗教活動費(会費等除く) + 管理費(拠点)
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white/50`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}
