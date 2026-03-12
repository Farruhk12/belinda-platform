"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart2,
  Activity,
  BookOpen,
  Building2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Header } from "@/components/Header";
import { InfoBanner } from "@/components/InfoBanner";
import { ToolCard } from "@/components/ToolCard";
import { UpdateNotification } from "@/components/UpdateNotification";
import { LoginPage } from "@/components/LoginPage";
import { categories, tools as defaultTools } from "@/data/tools";
import { getCurrentUser, type AppUser } from "@/services/userService";
import { getTools } from "@/services/toolService";

const FAVORITES_KEY = "belinda-favorites";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  BarChart2,
  Activity,
  BookOpen,
  Building2,
  Zap,
};

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [sessionUser, setSessionUser] = useState<AppUser | null>(null);
  const [tools, setTools] = useState(defaultTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoritesVersion, setFavoritesVersion] = useState(0);
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    setMounted(true);
    setSessionUser(getCurrentUser());
  }, []);

  useEffect(() => {
    getTools().then((apiTools) => {
      if (apiTools.length > 0) setTools(apiTools);
    });
  }, []);

  const refreshFavorites = useCallback(() => {
    setFavoritesVersion((v) => v + 1);
  }, []);

  const handleAuthChange = useCallback(() => {
    setAuthVersion((v) => v + 1);
    setSessionUser(getCurrentUser());
  }, []);

  const filteredTools = useMemo(() => {
    const fav = typeof window !== "undefined" ? getFavorites() : [];
    const currentUser = getCurrentUser();

    let result = tools;

    // Apply user permission filter
    if (currentUser && currentUser.allowedToolIds !== null) {
      result = result.filter((t) => currentUser.allowedToolIds!.includes(t.id));
    }

    if (showFavoritesOnly) {
      result = result.filter((t) => fav.includes(t.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          categories.find((c) => c.id === t.categoryId)?.name.toLowerCase().includes(q)
      );
    }

    return result;
    // authVersion triggers re-read of getCurrentUser
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, showFavoritesOnly, favoritesVersion, authVersion]);

  const toolsByCategory = useMemo(() => {
    const map = new Map<string, typeof tools>();
    for (const tool of filteredTools) {
      const list = map.get(tool.categoryId) || [];
      list.push(tool);
      map.set(tool.categoryId, list);
    }
    return map;
  }, [filteredTools]);

  const handleFavoritesClick = useCallback(() => {
    setShowFavoritesOnly((v) => !v);
  }, []);

  // SSR: nothing until mounted (avoids hydration mismatch)
  if (!mounted) return null;

  // Auth guard
  if (!sessionUser) {
    return <LoginPage onLogin={(user) => { setSessionUser(user); setAuthVersion((v) => v + 1); }} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        onSearch={setSearchQuery}
        favoritesCount={favoritesVersion}
        onFavoritesClick={handleFavoritesClick}
        showFavoritesOnly={showFavoritesOnly}
        onAuthChange={handleAuthChange}
      />
      <InfoBanner />

      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">

        {/* Notification */}
        <div className="mb-8">
          <UpdateNotification />
        </div>

        {/* Favorites filter indicator */}
        {showFavoritesOnly && (
          <div className="mb-6 flex items-center gap-2 animate-fade-in">
            <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500">
              Только избранное
            </span>
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(false)}
              className="text-xs text-slate-400 underline hover:text-slate-600 transition-colors"
            >
              Показать все
            </button>
          </div>
        )}

        {/* All tools by category */}
        <section>
          {filteredTools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
              <p className="text-sm text-slate-400">
                {showFavoritesOnly
                  ? "В избранном пока ничего нет. Нажмите на сердечко на карточке, чтобы добавить."
                  : "Ничего не найдено. Попробуйте изменить запрос."}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {categories.map((category) => {
                const categoryTools = toolsByCategory.get(category.id) || [];
                if (categoryTools.length === 0) return null;

                const CatIcon = CATEGORY_ICONS[category.icon];

                return (
                  <div key={category.id}>
                    <div className="mb-5 flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                        style={{
                          backgroundColor: category.bgColor,
                          color: category.color,
                        }}
                      >
                        {CatIcon && (
                          <CatIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        )}
                      </div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        {category.name}
                      </h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {categoryTools.map((tool, i) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          onFavoriteChange={refreshFavorites}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-16 border-t border-slate-200/60 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400 lg:px-8">
          Belinda Platform © {new Date().getFullYear()} — Единый портал доступа к инструментам
        </div>
      </footer>
    </div>
  );
}
