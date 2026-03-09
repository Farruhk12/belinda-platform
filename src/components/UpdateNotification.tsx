"use client";

import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";

const NOTIFICATION_KEY = "belinda-notification-dismissed";

export function UpdateNotification() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem(NOTIFICATION_KEY) === "true");
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(NOTIFICATION_KEY, "true");
  };

  if (dismissed) return null;

  return (
    <div className="animate-fade-in flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <Megaphone className="h-4 w-4 text-blue-600" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Обновления платформы
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Добавлены новые инструменты: Аналитика МП, Карманный справочник продуктов
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-100 hover:text-slate-600"
        aria-label="Закрыть"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
