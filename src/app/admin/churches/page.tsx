"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

type Church = {
  id: string;
  name: string;
  fiscalYear: number;
  missionFeeRate: number;
  prevYearBalance: number;
  prevYearFixedDeposit: number;
  janMissionFee: number;
  janDispatchFee: number;
};

export default function ChurchManagementPage() {
  const { churches: authChurches } = useAuth();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", fiscalYear: 2026 });

  const loadChurches = async () => {
    setLoading(true);
    const res = await fetch("/api/church");
    const data = await res.json();
    setChurches(Array.isArray(data) ? data : [data]);
    setLoading(false);
  };

  useEffect(() => {
    loadChurches();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    await fetch("/api/church", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ name: "", fiscalYear: 2026 });
    setShowForm(false);
    await loadChurches();
    window.location.reload();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name || "(未設定)"}」を削除しますか？\nこの教会の全データが削除されます。`)) return;
    await fetch(`/api/church?id=${id}`, { method: "DELETE" });
    await loadChurches();
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">教会管理</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            登録教会の追加・編集・削除
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規教会を追加
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4">新規教会の追加</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-600 mb-1 block">
                教会名
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例: 東京"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">年度</label>
              <input
                type="number"
                className="input-field w-28"
                value={formData.fiscalYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fiscalYear: parseInt(e.target.value) || 2026,
                  })
                }
              />
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              追加
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-1 text-slate-500 px-4 py-2 rounded-lg text-sm hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Church List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-700">
            登録教会一覧（{churches.length}件）
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">読み込み中...</div>
        ) : churches.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            教会が登録されていません
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">
                  教会名
                </th>
                <th className="text-center px-4 py-3 text-slate-600 font-semibold">
                  年度
                </th>
                <th className="text-right px-4 py-3 text-slate-600 font-semibold">
                  前年残高
                </th>
                <th className="px-4 py-3 text-slate-600 font-semibold text-center">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {churches.map((church) => (
                <tr
                  key={church.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {church.name || "(教会名未設定)"}教会
                  </td>
                  <td className="text-center px-4 py-3 text-slate-600">
                    {church.fiscalYear}年度
                  </td>
                  <td className="text-right px-4 py-3 text-slate-600 tabular-nums">
                    {church.prevYearBalance?.toLocaleString("ja-JP")}円
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(church.id, church.name)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
