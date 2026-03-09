"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning,
  Newspaper, ExternalLink, ChevronLeft, ChevronRight,
} from "lucide-react";

type WeatherCity = { name: string; temp: number | null; code: number; desc: string };
type CurrencyData = { usdTjs: number; eurTjs: number; rubTjs: number; updatedAt: string };
type NewsItem = { title: string; link: string; source: string; date: string };

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const cls = className ?? "h-8 w-8";
  if (code >= 395) return <CloudSnow className={cls} strokeWidth={1.25} />;
  if (code >= 263) return <CloudRain className={cls} strokeWidth={1.25} />;
  if (code >= 200) return <CloudLightning className={cls} strokeWidth={1.25} />;
  if (code >= 116) return <Cloud className={cls} strokeWidth={1.25} />;
  return <Sun className={cls} strokeWidth={1.25} />;
}

function weatherIconColor(code: number): string {
  if (code >= 395) return "text-blue-300";
  if (code >= 263) return "text-blue-400";
  if (code >= 200) return "text-yellow-300";
  if (code >= 116) return "text-slate-300";
  return "text-yellow-300";
}

const SLIDE_DURATION = 5000;

const SLIDES = [
  {
    key: "weather",
    label: "Погода",
    gradient: "from-sky-950 via-sky-900 to-blue-900",
    accent: "bg-sky-400",
  },
  {
    key: "currency",
    label: "Курс валют",
    gradient: "from-emerald-950 via-emerald-900 to-teal-900",
    accent: "bg-emerald-400",
  },
  {
    key: "news",
    label: "Фарм-новости",
    gradient: "from-violet-950 via-violet-900 to-purple-900",
    accent: "bg-violet-400",
  },
];

export function InfoBanner() {
  const [weather, setWeather] = useState<WeatherCity[] | null>(null);
  const [currency, setCurrency] = useState<CurrencyData | null>(null);
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [newsIdx, setNewsIdx] = useState(0);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/weather").then((r) => r.json()).then((d) => d.success && setWeather(d.data)).catch(() => {});
    fetch("/api/currency").then((r) => r.json()).then((d) => d.success && setCurrency(d.data)).catch(() => {});
    fetch("/api/news").then((r) => r.json()).then((d) => d.success && setNews(d.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => setSlide((s) => (s + 1) % 3), SLIDE_DURATION);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  function goTo(idx: number) {
    setSlide(idx);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(() => setSlide((s) => (s + 1) % 3), SLIDE_DURATION);
    }
  }

  const currentNews = news?.[newsIdx];
  const currentGradient = SLIDES[slide].gradient;

  return (
    <div
      className={`relative overflow-hidden transition-all duration-700 bg-gradient-to-r ${currentGradient}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-20 -top-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          key={`${slide}-${paused}`}
          className={`h-full ${SLIDES[slide].accent} ${paused ? "" : "animate-progress"}`}
        />
      </div>

      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${slide * 100}%)` }}
      >
        {/* ── Слайд 0: Погода ── */}
        <div className="w-full shrink-0 px-6 py-5 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center gap-2">
              <Sun className="h-3.5 w-3.5 text-yellow-300" strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                Погода в Таджикистане
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {weather ? weather.map((city) => {
                return (
                  <div
                    key={city.name}
                    className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                  >
                    <WeatherIcon
                      code={city.code}
                      className={`h-7 w-7 shrink-0 ${weatherIconColor(city.code)}`}
                    />
                    <div>
                      <div className="text-[10px] font-medium text-white/60 leading-none mb-0.5">
                        {city.name}
                      </div>
                      <div className="text-xl font-bold text-white leading-none">
                        {city.temp !== null
                          ? `${city.temp > 0 ? "+" : ""}${city.temp}°`
                          : "—"}
                      </div>
                      {city.desc && city.desc !== "—" && (
                        <div className="mt-0.5 text-[10px] text-white/50 leading-none">
                          {city.desc}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/10 animate-pulse" />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Слайд 1: Валюта ── */}
        <div className="w-full shrink-0 px-6 py-5 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                Курс к Таджикскому сомони
              </span>
              {currency && (
                <span className="ml-auto text-[10px] text-white/30">
                  {currency.updatedAt}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {currency ? [
                { label: "Доллар США", code: "USD", value: currency.usdTjs, symbol: "$", flag: "🇺🇸" },
                { label: "Евро", code: "EUR", value: currency.eurTjs, symbol: "€", flag: "🇪🇺" },
                { label: "Рос. рубль", code: "RUB", value: currency.rubTjs, symbol: "₽", flag: "🇷🇺" },
              ].map(({ label, code, value, symbol, flag }) => (
                <div
                  key={code}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <span className="text-2xl leading-none">{flag}</span>
                  <div>
                    <div className="text-[10px] font-medium text-white/60 leading-none mb-0.5">
                      {label}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white">{value}</span>
                      <span className="text-xs text-white/50">сом</span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/40">
                      1 {code} = {value} TJS
                    </div>
                  </div>
                </div>
              )) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/10 animate-pulse" />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Слайд 2: Новости ── */}
        <div className="w-full shrink-0 px-6 py-5 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center gap-2">
              <Newspaper className="h-3.5 w-3.5 text-violet-300" strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                Фармацевтический рынок Таджикистана
              </span>
              {news?.length && (
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => setNewsIdx((i) => (i - 1 + (news?.length ?? 1)) % (news?.length ?? 1))}
                    className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-[10px] tabular-nums text-white/40">
                    {newsIdx + 1} / {news.length}
                  </span>
                  <button
                    onClick={() => setNewsIdx((i) => (i + 1) % (news?.length ?? 1))}
                    className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>

            {news === null ? (
              <div className="h-14 rounded-xl bg-white/10 animate-pulse" />
            ) : news.length === 0 ? (
              <p className="text-sm text-white/50">Нет актуальных новостей</p>
            ) : (
              <a
                href={currentNews?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-400/20">
                  <Newspaper className="h-4 w-4 text-violet-300" strokeWidth={1.5} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-white group-hover:text-white/90">
                    {currentNews?.title}
                  </p>
                  <p className="mt-1 text-[10px] text-white/40">
                    {currentNews?.source}
                    {currentNews?.date && (
                      <> · {new Date(currentNews.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</>
                    )}
                  </p>
                </div>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-violet-300" strokeWidth={1.5} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Dot navigation */}
      <div className="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-1.5 lg:right-8">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => goTo(i)}
            title={s.label}
            className={`rounded-full transition-all duration-300 ${
              slide === i
                ? `h-4 w-1.5 ${s.accent}`
                : "h-1.5 w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
