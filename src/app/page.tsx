"use client";

import { useEffect, useState } from "react";
import { formatNumber, monthLabel } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Church = {
  id: string;
  name: string;
  fiscalYear: number;
  prevYearBalance: number;
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
  isClosed: boolean;
  entries: Entry[];
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [church, setChurch] = useState<Church | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!user.churchId) return;
    fetch(`/api/church?id=${user.churchId}`)
      .then((r) => r.json())
      .then((c) => {
        setChurch(c);
        fetch(`/api/reports?churchId=${c.id}`)
          .then((r) => r.json())
          .then(setReports);
      });
  }, [user.churchId]);

  if (user.role === "DENOMINATION") {
    return (
      <div className="p-8 text-slate-500">
        教団管理者モードです。左メニューの「全教会サマリー」をご覧ください。
      </div>
    );
  }

  if (!church)
    return <div className="p-8 text-slate-500">読み込み中...</div>;

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const report = reports.find((r) => r.month === m);
    const income = report
      ? report.entries
          .filter((e) => e.section === "income" && e.categoryCode !== "7")
          .reduce((s, e) => s + e.amount, 0)
      : 0;
    const expense = report
      ? report.entries
          .filter((e) => e.section === "expense" && e.categoryCode !== "7")
          .reduce((s, e) => s + e.amount, 0)
      : 0;
    return {
      month: monthLabel(m),
      収入: income,
      支出: expense,
      収支: income - expense,
    };
  });

  const balanceData = (() => {
    let bal = church.prevYearBalance;
    return monthlyData.map((d) => {
      bal += d.収支;
      return { month: d.month, 残高: bal };
    });
  })();

  const offeringData = (() => {
    const items = [
      { code: "sunday", name: "主日献金" },
      { code: "tithe", name: "十分の一献金" },
      { code: "thanks", name: "感謝献金" },
      { code: "other_offering", name: "その他献金" },
    ];
    return items.map((item) => {
      const total = reports.reduce((sum, r) => {
        const entry = r.entries.find(
          (e) =>
            e.section === "income" &&
            e.categoryCode === "1" &&
            e.subcategoryCode === item.code
        );
        return sum + (entry?.amount ?? 0);
      }, 0);
      return { name: item.name, value: total };
    }).filter((d) => d.value > 0);
  })();

  const yearTotal = {
    income: monthlyData.reduce((s, d) => s + d.収入, 0),
    expense: monthlyData.reduce((s, d) => s + d.支出, 0),
  };
  const currentBalance =
    church.prevYearBalance + yearTotal.income - yearTotal.expense;
  const closedMonths = reports.filter((r) => r.isClosed).length;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ダッシュボード</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {church.fiscalYear}年度 {church.name || "(教会名未設定)"}教会
          </p>
        </div>
        <Link
          href="/monthly"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          月次報告を入力
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          label="年間収入合計"
          value={`${formatNumber(yearTotal.income)}円`}
          bg="bg-green-50"
        />
        <KPICard
          icon={<TrendingDown className="w-5 h-5 text-red-600" />}
          label="年間支出合計"
          value={`${formatNumber(yearTotal.expense)}円`}
          bg="bg-red-50"
        />
        <KPICard
          icon={<Wallet className="w-5 h-5 text-blue-600" />}
          label="現在の保有残高"
          value={`${formatNumber(currentBalance)}円`}
          bg="bg-blue-50"
        />
        <KPICard
          icon={
            <div className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
              {closedMonths}
            </div>
          }
          label="報告済み月数"
          value={`${closedMonths} / 12 月`}
          bg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            月別収支推移
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  v >= 10000 ? `${(v / 10000).toFixed(0)}万` : v
                }
              />
              <Tooltip
                formatter={(value) => formatNumber(Number(value)) + "円"}
              />
              <Legend />
              <Bar dataKey="収入" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="支出" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            保有残高推移
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  v >= 10000 ? `${(v / 10000).toFixed(0)}万` : v
                }
              />
              <Tooltip
                formatter={(value) => formatNumber(Number(value)) + "円"}
              />
              <Line
                type="monotone"
                dataKey="残高"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            献金内訳（年間）
          </h3>
          {offeringData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={offeringData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {offeringData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatNumber(Number(value)) + "円"}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-slate-400">
              データがありません
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            月別報告状況
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const report = reports.find((r) => r.month === m);
              const hasData =
                report && report.entries.some((e) => e.amount !== 0);
              const isClosed = report?.isClosed;
              return (
                <Link
                  key={m}
                  href={`/monthly?m=${m}`}
                  className={`p-3 rounded-lg text-center text-sm font-medium transition-colors ${
                    isClosed
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : hasData
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  <div className="text-lg">{m}月</div>
                  <div className="text-xs mt-0.5">
                    {isClosed ? "済" : hasData ? "入力中" : "未入力"}
                  </div>
                </Link>
              );
            })}
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
