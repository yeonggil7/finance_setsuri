"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { INCOME_ACCOUNTS, EXPENSE_ACCOUNTS, BANK_ACCOUNTS } from "@/lib/accounts";
import { formatNumber, monthLabel } from "@/lib/utils";
import { Lock, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function MonthlyPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">読み込み中...</div>}>
      <MonthlyPage />
    </Suspense>
  );
}

type Church = {
  id: string;
  name: string;
  fiscalYear: number;
  missionFeeRate: number;
  prevYearBalance: number;
  prevYearFixedDeposit: number;
};

type Entry = {
  id: string;
  reportId: string;
  section: string;
  categoryCode: string;
  subcategoryCode: string;
  amount: number;
  memo: string;
};

type Transfer = {
  id: string;
  reportId: string;
  bankAccount: string;
  itemName: string;
  amount: number;
};

type Report = {
  id: string;
  churchId: string;
  month: number;
  isClosed: boolean;
  closedAt: string | null;
  note: string;
  entries: Entry[];
  transfers: Transfer[];
};

function MonthlyPage() {
  const { user } = useAuth();
  const [church, setChurch] = useState<Church | null>(null);
  const searchParams = useSearchParams();
  const [month, setMonth] = useState(() => {
    const m = searchParams.get("m");
    if (m) return parseInt(m);
    const now = new Date();
    return now.getMonth() + 1;
  });
  const [report, setReport] = useState<Report | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [saving, setSaving] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (!user.churchId) return;
    fetch(`/api/church?id=${user.churchId}`)
      .then((r) => r.json())
      .then((c) => {
        setChurch(c);
        fetch(`/api/reports?churchId=${c.id}`)
          .then((r) => r.json())
          .then(setAllReports);
      });
  }, [user.churchId]);

  useEffect(() => {
    if (!church) return;
    fetch(`/api/reports?churchId=${church.id}&month=${month}`)
      .then((r) => r.json())
      .then(setReport);
  }, [church, month]);

  const getEntryAmount = useCallback(
    (section: string, categoryCode: string, subcategoryCode: string) => {
      if (!report) return 0;
      const entry = report.entries.find(
        (e) =>
          e.section === section &&
          e.categoryCode === categoryCode &&
          e.subcategoryCode === subcategoryCode
      );
      return entry?.amount ?? 0;
    },
    [report]
  );

  const getEntryMemo = useCallback(
    (section: string, categoryCode: string, subcategoryCode: string) => {
      if (!report) return "";
      const entry = report.entries.find(
        (e) =>
          e.section === section &&
          e.categoryCode === categoryCode &&
          e.subcategoryCode === subcategoryCode
      );
      return entry?.memo ?? "";
    },
    [report]
  );

  const saveEntry = async (
    section: string,
    categoryCode: string,
    subcategoryCode: string,
    amount: number,
    memo?: string
  ) => {
    if (!report || report.isClosed) return;
    setSaving(true);
    const res = await fetch("/api/entries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: report.id,
        section,
        categoryCode,
        subcategoryCode,
        amount,
        memo,
      }),
    });
    await res.json();
    const updated = await fetch(
      `/api/reports?churchId=${church!.id}&month=${month}`
    );
    setReport(await updated.json());
    setSaving(false);
  };

  const totalIncome = useCallback(() => {
    if (!report) return 0;
    return report.entries
      .filter((e) => e.section === "income" && e.categoryCode !== "7")
      .reduce((sum, e) => sum + e.amount, 0);
  }, [report]);

  const totalExpense = useCallback(() => {
    if (!report) return 0;
    return report.entries
      .filter((e) => e.section === "expense" && e.categoryCode !== "7")
      .reduce((sum, e) => sum + e.amount, 0);
  }, [report]);

  const prevBalance = useCallback(() => {
    if (!church) return 0;
    if (month === 1) return church.prevYearBalance;
    const prevReport = allReports.find((r) => r.month === month - 1);
    if (!prevReport) return church.prevYearBalance;
    const prevIncome = prevReport.entries
      .filter((e) => e.section === "income" && e.categoryCode !== "7")
      .reduce((s, e) => s + e.amount, 0);
    const prevExpense = prevReport.entries
      .filter((e) => e.section === "expense" && e.categoryCode !== "7")
      .reduce((s, e) => s + e.amount, 0);
    let bal = church.prevYearBalance;
    for (const r of allReports.filter((r) => r.month < month)) {
      const inc = r.entries
        .filter((e) => e.section === "income" && e.categoryCode !== "7")
        .reduce((s, e) => s + e.amount, 0);
      const exp = r.entries
        .filter((e) => e.section === "expense" && e.categoryCode !== "7")
        .reduce((s, e) => s + e.amount, 0);
      bal += inc - exp;
    }
    return bal;
  }, [church, month, allReports]);

  const closeMonth = async () => {
    if (!report) return;
    if (
      !confirm(
        `${month}月分を締めてよろしいですか？\n締めると入力ができなくなります。`
      )
    )
      return;
    await fetch("/api/reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: report.id, isClosed: true }),
    });
    const updated = await fetch(
      `/api/reports?churchId=${church!.id}&month=${month}`
    );
    setReport(await updated.json());
  };

  if (!church || !report)
    return <div className="p-8 text-slate-500">読み込み中...</div>;

  const income = totalIncome();
  const expense = totalExpense();
  const balance = income - expense;
  const prev = prevBalance();
  const totalBalance = prev + balance;

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {church.fiscalYear}年{monthLabel(month)}分
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {church.name || "(教会名未設定)"}教会
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth(Math.max(1, month - 1))}
            disabled={month === 1}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="input-field"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
          <button
            onClick={() => setMonth(Math.min(12, month + 1))}
            disabled={month === 12}
            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {saving && (
            <span className="text-xs text-blue-500 ml-2">保存中...</span>
          )}
        </div>
      </div>

      {report.isClosed && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 mb-6 text-sm">
          <Lock className="w-4 h-4" />
          <span>
            このシートは締め済みです（{report.closedAt
              ? new Date(report.closedAt).toLocaleDateString("ja-JP")
              : ""}）。入力の修正は翌月分で行ってください。
          </span>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <SummaryCard
          label="①前月 合計保有残高"
          value={prev}
          color="slate"
        />
        <SummaryCard label="②当月 収入額" value={income} color="green" />
        <SummaryCard label="③当月 支出額" value={expense} color="red" />
        <SummaryCard
          label="④当月 収支額"
          value={balance}
          color={balance >= 0 ? "green" : "red"}
        />
        <SummaryCard
          label="⑤当月 合計保有残高"
          value={totalBalance}
          color="blue"
        />
      </div>

      {/* Income Section */}
      <section className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-green-50 rounded-t-xl">
          <h3 className="font-bold text-green-800">収入の部</h3>
          <span className="text-sm font-semibold text-green-700">
            合計: {formatNumber(income)}円
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {INCOME_ACCOUNTS.map((cat) => (
            <CategorySection
              key={cat.code}
              category={cat}
              section="income"
              getAmount={getEntryAmount}
              getMemo={getEntryMemo}
              onSave={saveEntry}
              disabled={report.isClosed}
              tooltip={tooltip}
              setTooltip={setTooltip}
            />
          ))}
        </div>
      </section>

      {/* Expense Section */}
      <section className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-red-50 rounded-t-xl">
          <h3 className="font-bold text-red-800">支出の部</h3>
          <span className="text-sm font-semibold text-red-700">
            合計: {formatNumber(expense)}円
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {EXPENSE_ACCOUNTS.map((cat) => (
            <CategorySection
              key={cat.code}
              category={cat}
              section="expense"
              getAmount={getEntryAmount}
              getMemo={getEntryMemo}
              onSave={saveEntry}
              disabled={report.isClosed}
              tooltip={tooltip}
              setTooltip={setTooltip}
            />
          ))}
        </div>
      </section>

      {/* Transfer Info */}
      <section className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="px-5 py-4 border-b border-slate-200 bg-purple-50 rounded-t-xl">
          <h3 className="font-bold text-purple-800">振込情報</h3>
          <p className="text-xs text-purple-600 mt-0.5">
            振込月: {month + 1 > 12 ? "翌年1" : month + 1}月
          </p>
        </div>
        <div className="p-5 space-y-6">
          {BANK_ACCOUNTS.map((bank) => (
            <div key={bank.code}>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                ◆ {bank.name}
              </h4>
              <div className="space-y-2 pl-4">
                {bank.items.map((item) => {
                  const existing = report.transfers.find(
                    (t) =>
                      t.bankAccount === bank.code && t.itemName === item.code
                  );
                  return (
                    <div
                      key={item.code}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm text-slate-600 w-56 shrink-0">
                        {item.name}
                      </span>
                      <input
                        key={`${report.id}-${bank.code}-${item.code}`}
                        type="number"
                        className="input-field w-36 text-right"
                        defaultValue={existing?.amount ?? ""}
                        disabled={report.isClosed}
                        placeholder="0"
                        onBlur={async (e) => {
                          const val = parseInt(e.target.value) || 0;
                          await fetch("/api/transfers", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              reportId: report.id,
                              bankAccount: bank.code,
                              itemName: item.code,
                              amount: val,
                            }),
                          });
                          const updated = await fetch(
                            `/api/reports?churchId=${church!.id}&month=${month}`
                          );
                          setReport(await updated.json());
                        }}
                      />
                      <span className="text-sm text-slate-500">円</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Note */}
      <section className="bg-white rounded-xl border border-slate-200 mb-6 p-5">
        <h3 className="font-semibold text-slate-700 mb-3">教会からの連絡</h3>
        <textarea
          key={`note-${report.id}`}
          className="input-field w-full h-24 resize-y"
          defaultValue={report.note}
          disabled={report.isClosed}
          placeholder="連絡事項があれば記入してください"
          onBlur={async (e) => {
            await fetch("/api/reports", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: report.id,
                isClosed: report.isClosed,
                note: e.target.value,
              }),
            });
            const updated = await fetch(
              `/api/reports?churchId=${church!.id}&month=${month}`
            );
            setReport(await updated.json());
          }}
        />
      </section>

      {/* Close Button */}
      {!report.isClosed && (
        <div className="text-center py-4">
          <p className="text-sm text-red-600 mb-3">
            入力漏れがないか、確認をお願いします。
          </p>
          <button
            onClick={closeMonth}
            className="bg-red-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            今月分のシートを締める
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    green: "bg-green-50 border-green-200 text-green-700",
    red: "bg-red-50 border-red-200 text-red-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
      <p className="text-xs font-medium mb-1 opacity-75">{label}</p>
      <p className="text-lg font-bold">{formatNumber(value)}円</p>
    </div>
  );
}

function CategorySection({
  category,
  section,
  getAmount,
  getMemo,
  onSave,
  disabled,
  tooltip,
  setTooltip,
}: {
  category: { code: string; name: string; items: { code: string; name: string; description: string }[] };
  section: string;
  getAmount: (s: string, cat: string, sub: string) => number;
  getMemo: (s: string, cat: string, sub: string) => string;
  onSave: (
    s: string,
    cat: string,
    sub: string,
    amount: number,
    memo?: string
  ) => void;
  disabled: boolean;
  tooltip: string | null;
  setTooltip: (v: string | null) => void;
}) {
  const catTotal = category.items.reduce(
    (sum, item) => sum + getAmount(section, category.code, item.code),
    0
  );

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-slate-700">
          {category.name}
        </span>
        <span className="text-sm text-slate-500">
          小計: {formatNumber(catTotal)}円
        </span>
      </button>
      {!collapsed && (
        <div className="px-5 pb-3 space-y-1">
          {category.items.map((item) => {
            const tipKey = `${section}-${category.code}-${item.code}`;
            return (
              <div key={item.code} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-48 shrink-0">
                  <span className="text-sm text-slate-600">{item.name}</span>
                  <button
                    className="text-slate-400 hover:text-blue-500 relative"
                    onMouseEnter={() => setTooltip(tipKey)}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {tooltip === tipKey && (
                      <div className="absolute left-6 bottom-0 z-50 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 w-64 shadow-lg">
                        {item.description}
                      </div>
                    )}
                  </button>
                </div>
                <input
                  type="number"
                  className="input-field w-32 text-right"
                  disabled={disabled}
                  defaultValue={
                    getAmount(section, category.code, item.code) || ""
                  }
                  placeholder="0"
                  onBlur={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const memo = getMemo(section, category.code, item.code);
                    onSave(section, category.code, item.code, val, memo);
                  }}
                />
                <input
                  type="text"
                  className="input-field flex-1 text-sm"
                  disabled={disabled}
                  defaultValue={getMemo(section, category.code, item.code)}
                  placeholder="備考"
                  onBlur={(e) => {
                    const amount = getAmount(
                      section,
                      category.code,
                      item.code
                    );
                    onSave(
                      section,
                      category.code,
                      item.code,
                      amount,
                      e.target.value
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
