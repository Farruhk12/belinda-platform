"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";

export function UserCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const base = 12;
    const random = Math.floor(Math.random() * 36) + 1;
    setCount(base + random);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
      <span className="text-xs font-medium text-slate-500">{count} онлайн</span>
    </div>
  );
}
