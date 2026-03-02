"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type ChurchData = {
  id: string;
  name: string;
  fiscalYear: number;
  missionFeeRate: number;
  prevYearBalance: number;
  prevYearFixedDeposit: number;
  janMissionFee: number;
  janDispatchFee: number;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ChurchData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user.churchId) return;
    fetch(`/api/church?id=${user.churchId}`)
      .then((r) => r.json())
      .then(setData);
  }, [user.churchId]);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    const res = await fetch("/api/church", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id: data.id }),
    });
    const updated = await res.json();
    setData(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!data)
    return (
      <div className="p-8 text-slate-500">読み込み中...</div>
    );

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">基礎データ</h2>
      <p className="text-sm text-slate-500 mb-8">
        年度の入力開始時は、まず最初にこの画面に必要情報を入力してください。
      </p>

      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
          基本情報
        </h3>
        <div className="space-y-4">
          <Field label="年度">
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input-field w-28"
                value={data.fiscalYear}
                onChange={(e) =>
                  setData({ ...data, fiscalYear: parseInt(e.target.value) || 0 })
                }
              />
              <span className="text-sm text-slate-500">年度</span>
            </div>
          </Field>
          <Field label="教会名">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input-field flex-1"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="教会名を入力"
              />
              <span className="text-sm text-slate-500">教会</span>
            </div>
          </Field>
          <Field label="宣教会会費割合">
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input-field w-28"
                value={data.missionFeeRate}
                onChange={(e) =>
                  setData({
                    ...data,
                    missionFeeRate: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <span className="text-sm text-slate-500">％</span>
            </div>
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
          前年12月分の金額
        </h3>
        <div className="space-y-4">
          <Field label="合計保有残高 ⑤の金額">
            <CurrencyInput
              value={data.prevYearBalance}
              onChange={(v) => setData({ ...data, prevYearBalance: v })}
            />
          </Field>
          <Field label="定期預金/建築積立金等 最終累計額">
            <CurrencyInput
              value={data.prevYearFixedDeposit}
              onChange={(v) => setData({ ...data, prevYearFixedDeposit: v })}
            />
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
          今年1月に振り込んだ金額
        </h3>
        <div className="space-y-4">
          <Field label="宣教会会費">
            <CurrencyInput
              value={data.janMissionFee}
              onChange={(v) => setData({ ...data, janMissionFee: v })}
            />
          </Field>
          <Field label="宣教会派遣宣教費">
            <CurrencyInput
              value={data.janDispatchFee}
              onChange={(v) => setData({ ...data, janDispatchFee: v })}
            />
          </Field>
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? "保存中..." : saved ? "保存しました" : "保存する"}
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm text-slate-600 w-56 shrink-0">{label}</label>
      {children}
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="input-field w-40 text-right"
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder="0"
      />
      <span className="text-sm text-slate-500">円</span>
    </div>
  );
}
