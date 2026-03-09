"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  ArrowUpRight,
  BarChart2,
  Activity,
  BookOpen,
  Building2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Tool } from "@/data/tools";
import { categories, newToolIds } from "@/data/tools";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  BarChart2,
  Activity,
  BookOpen,
  Building2,
  Zap,
};

const FAVORITES_KEY = "belinda-favorites";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function toggleFavorite(id: string): void {
  const fav = getFavorites();
  const next = fav.includes(id) ? fav.filter((f) => f !== id) : [...fav, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
}

export function ToolCard({
  tool,
  onFavoriteChange,
  index = 0,
}: {
  tool: Tool;
  onFavoriteChange?: () => void;
  index?: number;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const category = categories.find((c) => c.id === tool.categoryId);
  const isNew = newToolIds.includes(tool.id);
  const IconComponent = category?.icon ? CATEGORY_ICONS[category.icon] : null;

  useEffect(() => {
    setIsFavorite(getFavorites().includes(tool.id));
  }, [tool.id, onFavoriteChange]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(tool.id);
    setIsFavorite(getFavorites().includes(tool.id));
    onFavoriteChange?.();
  };

  return (
    <article
      className="animate-fade-up group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Colored accent bar at top */}
      <div
        className="h-[3px] w-full shrink-0"
        style={{ backgroundColor: category?.color || "#DF3B20" }}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
            style={{
              backgroundColor: category?.bgColor || "rgba(223,59,32,0.08)",
              color: category?.color || "#DF3B20",
            }}
          >
            {IconComponent && (
              <IconComponent className="h-4 w-4" strokeWidth={1.75} />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isNew && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                style={{ backgroundColor: category?.color || "#DF3B20" }}
              >
                Новое
              </span>
            )}
            <button
              type="button"
              onClick={handleFavorite}
              className="rounded-lg p-1.5 text-slate-300 transition-all hover:text-rose-400 hover:bg-rose-50 active:scale-95"
              aria-label={
                isFavorite ? "Убрать из избранного" : "Добавить в избранное"
              }
            >
              <Heart
                className="h-4 w-4"
                fill={isFavorite ? "#f43f5e" : "none"}
                stroke={isFavorite ? "#f43f5e" : "currentColor"}
                strokeWidth={1.75}
              />
            </button>
          </div>
        </div>

        <h3 className="mb-1.5 text-sm font-semibold leading-snug text-slate-900">
          {tool.name}
        </h3>
        <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {tool.description}
        </p>

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: category?.color || "#DF3B20" }}
        >
          Открыть
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </a>
      </div>
    </article>
  );
}
