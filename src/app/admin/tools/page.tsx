"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  Pencil,
  X,
  Check,
  Link2,
  Loader2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { getTools, updateTool, setupTools } from "@/services/toolService";
import { getCurrentUser } from "@/services/userService";
import { LoginPage } from "@/components/LoginPage";
import { categories } from "@/data/tools";
import type { Tool } from "@/data/tools";

export default function AdminToolsPage() {
  const [mounted, setMounted] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  const loadTools = useCallback(async () => {
    setLoading(true);
    const data = await getTools();
    setTools(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());
    loadTools();
  }, [loadTools]);

  const startEdit = (tool: Tool) => {
    setEditingId(tool.id);
    setEditUrl(tool.url);
    setEditName(tool.name);
    setEditDesc(tool.description);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError("");
  };

  const handleSave = async () => {
    if (!editingId) return;
    if (!editUrl.trim()) {
      setError("Введите ссылку");
      return;
    }

    setSubmitting(true);
    setError("");
    const ok = await updateTool(editingId, {
      url: editUrl.trim(),
      name: editName.trim() || undefined,
      description: editDesc.trim() || undefined,
    });
    setSubmitting(false);

    if (ok) {
      await loadTools();
      cancelEdit();
    } else {
      setError("Не удалось сохранить. Проверьте APPS_SCRIPT_URL.");
    }
  };

  const handleSetupTools = async () => {
    setSetupLoading(true);
    const ok = await setupTools();
    setSetupLoading(false);
    if (ok) {
      await loadTools();
    }
  };

  if (!mounted) return null;

  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">Нет доступа</p>
          <a href="/" className="mt-4 inline-block text-xs text-[var(--primary)] underline">
            ← На главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 lg:px-8">
          <a
            href="/admin"
            className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            Назад
          </a>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="text-sm font-semibold text-slate-800">Ссылки на инструменты</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <p className="mb-6 text-xs text-slate-500">
          Измените ссылки, названия и описания инструментов. Изменения сохраняются в Google Таблице.
        </p>

        {tools.length === 0 && !loading && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="mb-3 text-sm text-amber-800">
              Таблица инструментов ещё не создана. Нажмите кнопку ниже.
            </p>
            <button
              onClick={handleSetupTools}
              disabled={setupLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
            >
              {setupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
              )}
              Создать таблицу инструментов
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" strokeWidth={1.75} />
          </div>
        ) : (
          <div className="space-y-3">
            {tools.map((tool) => {
              const cat = categories.find((c) => c.id === tool.categoryId);
              const isEditing = editingId === tool.id;

              return (
                <div
                  key={tool.id}
                  className="rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  {!isEditing ? (
                    <div className="flex items-start gap-4">
                      <div className="flex min-w-0 flex-1">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{tool.name}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{cat?.name}</p>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {tool.url}
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => startEdit(tool)}
                        className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        title="Изменить"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Название
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Название инструмента"
                          disabled={submitting}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-300 focus:bg-white disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Ссылка (URL)
                        </label>
                        <input
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="https://..."
                          disabled={submitting}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-300 focus:bg-white disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Описание
                        </label>
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Краткое описание"
                          rows={2}
                          disabled={submitting}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-300 focus:bg-white disabled:opacity-60"
                        />
                      </div>
                      {error && (
                        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={submitting}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                        >
                          <X className="h-4 w-4" strokeWidth={1.75} />
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={submitting}
                          className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                          ) : (
                            <Check className="h-4 w-4" strokeWidth={1.75} />
                          )}
                          Сохранить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
