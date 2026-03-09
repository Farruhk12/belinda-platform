"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Heart, User, LogOut, Settings, ChevronDown, Loader2 } from "lucide-react";
import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
  type AppUser,
} from "@/services/userService";

const FAVORITES_KEY = "belinda-favorites";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function Header({
  onSearch,
  favoritesCount,
  onFavoritesClick,
  showFavoritesOnly,
  onAuthChange,
}: {
  onSearch?: (q: string) => void;
  favoritesCount?: number;
  onFavoritesClick?: () => void;
  showFavoritesOnly?: boolean;
  onAuthChange?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [favCount, setFavCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    setFavCount(getFavorites().length);
  }, [favoritesCount]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setLoginError("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const user = await loginUser(loginForm.login, loginForm.password);
    setLoginLoading(false);
    if (user) {
      setCurrentUser(user);
      setShowMenu(false);
      setLoginForm({ login: "", password: "" });
      onAuthChange?.();
    } else {
      setLoginError("Неверный логин или пароль");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setShowMenu(false);
    onAuthChange?.();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">

        {/* Logo */}
        <a href="/" className="shrink-0 text-base font-bold">
          <span className="text-[var(--primary)]">Belinda</span>
          <span className="text-slate-400"> Platform</span>
        </a>

        <div className="hidden h-4 w-px bg-slate-200 sm:block" />

        {/* Search */}
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="search"
              placeholder="Найти инструмент..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            type="button"
            onClick={onFavoritesClick}
            className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              showFavoritesOnly
                ? "bg-rose-50 text-rose-500"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <Heart
              className="h-4 w-4"
              fill={showFavoritesOnly ? "currentColor" : "none"}
              strokeWidth={1.75}
            />
            <span className="hidden sm:inline">Избранное</span>
            {favCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {favCount}
              </span>
            )}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 transition-all ${
                showMenu
                  ? "border-slate-300 bg-slate-100"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <User className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
              {currentUser && (
                <span className="hidden max-w-[80px] truncate text-xs font-medium text-slate-700 sm:inline">
                  {currentUser.login}
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showMenu ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${
                          currentUser.role === "admin" ? "bg-[var(--primary)]" : "bg-slate-400"
                        }`}
                      >
                        {currentUser.login[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {currentUser.login}
                        </p>
                        <p className="text-xs text-slate-400">
                          {currentUser.role === "admin" ? "Администратор" : "Сотрудник"}
                        </p>
                      </div>
                    </div>

                    <div className="p-2">
                      {currentUser.role === "admin" && (
                        <a
                          href="/admin"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
                          Администрация
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <LogOut className="h-4 w-4" strokeWidth={1.75} />
                        Выйти
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleLogin} className="p-5">
                    <p className="mb-4 text-sm font-semibold text-slate-800">Войти в систему</p>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        placeholder="Логин"
                        value={loginForm.login}
                        onChange={(e) => setLoginForm((f) => ({ ...f, login: e.target.value }))}
                        autoFocus
                        disabled={loginLoading}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:bg-white disabled:opacity-60"
                      />
                      <input
                        type="password"
                        placeholder="Пароль"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                        disabled={loginLoading}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:bg-white disabled:opacity-60"
                      />
                      {loginError && (
                        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">
                          {loginError}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-70"
                      >
                        {loginLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                            Вход...
                          </>
                        ) : (
                          "Войти"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
