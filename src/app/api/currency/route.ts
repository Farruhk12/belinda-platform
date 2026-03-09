import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    const tjs = data.rates.TJS as number;
    const rub = data.rates.RUB as number;
    const eur = data.rates.EUR as number;

    const time = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Dushanbe",
    });

    return NextResponse.json({
      success: true,
      data: {
        usdTjs: +tjs.toFixed(2),
        eurTjs: +(tjs / eur).toFixed(2),
        rubTjs: +(tjs / rub).toFixed(3),
        updatedAt: time,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Ошибка загрузки курсов" });
  }
}
