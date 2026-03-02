"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "DENOMINATION" | "CHURCH";

export type CurrentUser = {
  role: UserRole;
  churchId: string | null;
  churchName: string;
};

type ChurchOption = {
  id: string;
  name: string;
};

type AuthContextType = {
  user: CurrentUser;
  setUser: (user: CurrentUser) => void;
  churches: ChurchOption[];
  loading: boolean;
};

const DENOMINATION_USER: CurrentUser = {
  role: "DENOMINATION",
  churchId: null,
  churchName: "教団管理者",
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(DENOMINATION_USER);
  const [churches, setChurches] = useState<ChurchOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/churches")
      .then((r) => r.json())
      .then((list: ChurchOption[]) => {
        setChurches(list);
        if (list.length > 0) {
          setUser({
            role: "CHURCH",
            churchId: list[0].id,
            churchName: list[0].name || "(教会名未設定)",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, churches, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
