"use client";

import React, { useEffect, useState } from "react";
import { formatNumber, monthLabel } from "@/lib/utils";
import { TRANSFER_COLUMNS } from "@/lib/transfer-columns";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

type TransferData = {
  id: string;
  bankAccount: string;
  itemName: string;
  amount: number;
  adminMemo: string;
};

type ChurchTransfer = {
  churchId: string;
  churchName: string;
  reportId: string | null;
  isClosed: boolean;
  transfers: TransferData[];
};

export default function AdminTransfersPage() {
  const [data, setData] = useState<ChurchTransfer[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return now.getMonth() + 1;
  });
  const [year, setYear] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [memoValue, setMemoValue] = useState("");

  const visibleColumns = TRANSFER_COLUMNS.filter(
    (col) => !col.onlyMonth || col.onlyMonth === month
  );

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/transfers?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [month, year]);

  const getTransfer = (church: ChurchTransfer, bankAccount: string, itemName: string) => {
    return church.transfers.find(
      (t) => t.bankAccount === bankAccount && t.itemName === itemName
    );
  };

  const getColumnTotal = (bankAccount: string, itemName: string) => {
    return data.reduce((sum, church) => {
      const t = getTransfer(church, bankAccount, itemName);
      return sum + (t?.amount ?? 0);
    }, 0);
  };

  const getRowTotal = (church: ChurchTransfer) => {
    return visibleColumns.reduce((sum, col) => {
      const t = getTransfer(church, col.bankAccount, col.itemName);
      return sum + (t?.amount ?? 0);
    }, 0);
  };

  const grandTotal = data.reduce((sum, church) => sum + getRowTotal(church), 0);

  const handleMemoSave = async (
    cellKey: string,
    existingId: string | undefined,
    churchId: string,
    bankAccount: string,
    itemName: string
  ) => {
    const payload = existingId
      ? { id: existingId, adminMemo: memoValue }
      : { churchId, month, year, bankAccount, itemName, adminMemo: memoValue };

    const res = await fetch("/api/admin/transfers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = await res.json();

    setData((prev) =>
      prev.map((church) => {
        if (church.churchId !== churchId) return church;
        const existingIdx = church.transfers.findIndex(
          (t) => t.bankAccount === bankAccount && t.itemName === itemName
        );
        if (existingIdx >= 0) {
          const updated = [...church.transfers];
          updated[existingIdx] = { ...updated[existingIdx], adminMemo: memoValue };
          return { ...church, transfers: updated };
        }
        return {
          ...church,
          transfers: [
            ...church.transfers,
            {
              id: saved.id,
              bankAccount,
              itemName,
              amount: saved.amount ?? 0,
              adminMemo: memoValue,
            },
          ],
        };
      })
    );
    setEditingKey(null);
    setMemoValue("");
  };

  const startEditMemo = (cellKey: string, currentMemo: string) => {
    setEditingKey(cellKey);
    setMemoValue(currentMemo);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">振込情報一覧</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            全教会の振込情報を一覧表示・照合チェック用
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-1">
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
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700">
            {year}年 {monthLabel(month)}分 振込情報
          </h3>
          <span className="text-xs text-slate-500">
            振込月: {month + 1 > 12 ? "翌年1" : month + 1}月
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">読み込み中...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            データがありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left px-3 py-3 text-slate-600 font-semibold sticky left-0 bg-slate-50 z-10 min-w-[120px]">
                    #
                  </th>
                  <th className="text-left px-3 py-3 text-slate-600 font-semibold sticky left-[48px] bg-slate-50 z-10 min-w-[120px]">
                    教会名
                  </th>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      colSpan={2}
                      className="text-center px-2 py-3 text-slate-600 font-semibold border-l border-slate-200"
                    >
                      <div>{col.label}</div>
                      {col.onlyMonth && (
                        <div className="text-xs font-normal text-amber-600">
                          ({col.onlyMonth}月のみ)
                        </div>
                      )}
                    </th>
                  ))}
                  <th className="text-right px-3 py-3 text-slate-800 font-bold border-l-2 border-slate-300 bg-blue-50/50">
                    合計
                  </th>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/30 text-xs">
                  <th className="sticky left-0 bg-slate-50 z-10"></th>
                  <th className="sticky left-[48px] bg-slate-50 z-10"></th>
                  {visibleColumns.map((col) => (
                    <React.Fragment key={`hdr-${col.key}`}>
                      <th className="text-right px-2 py-1 text-slate-500 border-l border-slate-200">
                        金額
                      </th>
                      <th className="text-left px-2 py-1 text-slate-500 min-w-[100px]">
                        メモ
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="border-l-2 border-slate-300"></th>
                </tr>
              </thead>
              <tbody>
                {data.map((church, idx) => (
                  <tr
                    key={church.churchId}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-3 py-2 text-slate-400 text-xs sticky left-0 bg-white z-10">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800 sticky left-[48px] bg-white z-10">
                      {church.churchName}
                    </td>
                    {visibleColumns.map((col) => {
                      const transfer = getTransfer(church, col.bankAccount, col.itemName);
                      const amount = transfer?.amount ?? 0;
                      const memoId = transfer?.id;
                      const memo = transfer?.adminMemo ?? "";
                      const cellKey = `${church.churchId}-${col.key}`;
                      const isEditing = editingKey === cellKey;

                      return (
                        <React.Fragment key={cellKey}>
                          <td
                            className={`text-right px-2 py-2 tabular-nums border-l border-slate-100 ${
                              amount > 0 ? "text-slate-800" : "text-slate-300"
                            }`}
                          >
                            {amount > 0 ? formatNumber(amount) : "-"}
                          </td>
                          <td className="px-1 py-1">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  className="input-field text-xs w-full py-1 px-1.5"
                                  value={memoValue}
                                  onChange={(e) => setMemoValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleMemoSave(cellKey, memoId, church.churchId, col.bankAccount, col.itemName);
                                    if (e.key === "Escape") setEditingKey(null);
                                  }}
                                  onBlur={() =>
                                    handleMemoSave(cellKey, memoId, church.churchId, col.bankAccount, col.itemName)
                                  }
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditMemo(cellKey, memo)}
                                className={`text-xs px-1.5 py-1 rounded w-full text-left transition-colors ${
                                  memo
                                    ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                                    : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
                                }`}
                                title={memo || "メモを追加"}
                              >
                                {memo || (
                                  <MessageSquare className="w-3 h-3 inline" />
                                )}
                              </button>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="text-right px-3 py-2 font-medium text-blue-700 tabular-nums border-l-2 border-slate-300 bg-blue-50/30">
                      {formatNumber(getRowTotal(church))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                  <td className="px-3 py-3 sticky left-0 bg-slate-100 z-10"></td>
                  <td className="px-3 py-3 text-slate-800 sticky left-[48px] bg-slate-100 z-10">
                    合計
                  </td>
                  {visibleColumns.map((col) => (
                    <React.Fragment key={`total-${col.key}`}>
                      <td className="text-right px-2 py-3 text-slate-800 tabular-nums border-l border-slate-200">
                        {formatNumber(getColumnTotal(col.bankAccount, col.itemName))}
                      </td>
                      <td></td>
                    </React.Fragment>
                  ))}
                  <td className="text-right px-3 py-3 text-blue-800 tabular-nums border-l-2 border-slate-300 bg-blue-100">
                    {formatNumber(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
        <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">使い方</h4>
        <div className="text-xs text-slate-600 space-y-1">
          <p>各金額の横にあるメモ欄（吹き出しアイコン）をクリックして、照合結果やメモを記入できます。</p>
          <p>金額の相違や教会への確認事項を記録してください。Enterキーで保存、Escキーでキャンセルです。</p>
          <p>教会がまだ振込データを入力していない場合でも、メモを記入することができます。</p>
        </div>
      </div>
    </div>
  );
}
