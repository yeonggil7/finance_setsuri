"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  TrendingUp,
  Building2,
  Users,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const CHURCH_NAV = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/monthly", label: "月次報告", icon: Calendar },
  { href: "/annual", label: "年間推移", icon: TrendingUp },
  { href: "/settings", label: "基礎データ", icon: Settings },
];

const DENOMINATION_NAV = [
  { href: "/admin", label: "全教会サマリー", icon: LayoutDashboard },
  { href: "/admin/churches", label: "教会管理", icon: Building2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, setUser, churches } = useAuth();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const navItems = user.role === "DENOMINATION" ? DENOMINATION_NAV : CHURCH_NAV;

  const handleSwitch = (value: string) => {
    if (value === "DENOMINATION") {
      setUser({ role: "DENOMINATION", churchId: null, churchName: "教団管理者" });
    } else {
      const church = churches.find((c) => c.id === value);
      if (church) {
        setUser({
          role: "CHURCH",
          churchId: church.id,
          churchName: church.name || "(教会名未設定)",
        });
      }
    }
    setSwitcherOpen(false);
  };

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">献金管理</h1>
        <p className="text-xs text-slate-500 mt-0.5">月次財政報告システム</p>
      </div>

      {/* Role Switcher */}
      <div className="px-3 py-3 border-b border-slate-200">
        <div className="relative">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              {user.role === "DENOMINATION" ? (
                <Users className="w-4 h-4 text-indigo-500 shrink-0" />
              ) : (
                <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
              )}
              <span className="truncate font-medium">{user.churchName}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${switcherOpen ? "rotate-180" : ""}`} />
          </button>

          {switcherOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleSwitch("DENOMINATION")}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 ${
                  user.role === "DENOMINATION" ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700"
                }`}
              >
                <Users className="w-4 h-4 text-indigo-500" />
                教団管理者
              </button>
              <div className="border-t border-slate-100" />
              {churches.map((church) => (
                <button
                  key={church.id}
                  onClick={() => handleSwitch(church.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                    user.churchId === church.id ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-500" />
                  {church.name || "(教会名未設定)"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-200">
        <p className="text-xs text-slate-400">
          {user.role === "DENOMINATION" ? "教団モード" : "教会モード"}
        </p>
      </div>
    </aside>
  );
}
