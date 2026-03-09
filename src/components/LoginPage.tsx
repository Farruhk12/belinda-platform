"use client";

import { useState } from "react";
import { Loader2, Lock, User } from "lucide-react";
import { login as loginUser, type AppUser } from "@/services/userService";

export function LoginPage({ onLogin }: { onLogin: (user: AppUser) => void }) {
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.login.trim() || !form.password.trim()) return;
    setLoading(true);
    setError("");
    const user = await loginUser(form.login.trim(), form.password);
    setLoading(false);
    if (user) {
      onLogin(user);
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blobs */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DF3B20]/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-blue-600/10 blur-[80px]" />

      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-[#DF3B20]">Belinda</span>
          <span className="text-slate-400"> Platform</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">Единый портал инструментов</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {/* Card header */}
        <div className="border-b border-white/10 px-7 py-5">
          <p className="text-sm font-semibold text-white">Вход в систему</p>
          <p className="mt-0.5 text-xs text-slate-500">Введите данные вашей учётной записи</p>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {/* Login field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Логин
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" strokeWidth={1.75} />
              <input
                type="text"
                value={form.login}
                onChange={(e) => { setForm((f) => ({ ...f, login: e.target.value })); setError(""); }}
                placeholder="Ваш логин"
                autoFocus
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-white/20 focus:bg-white/10 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" strokeWidth={1.75} />
              <input
                type="password"
                value={form.password}
                onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setError(""); }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-white/20 focus:bg-white/10 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.login.trim() || !form.password.trim()}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#DF3B20] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#c5341b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                Проверка...
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-slate-700">
        © {new Date().getFullYear()} Belinda Platform
      </p>
    </div>
  );
}
