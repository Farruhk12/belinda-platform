import { NextResponse } from "next/server";

const CITIES = [
  { name: "Душанбе",     lat: 38.5598, lon: 68.7738 },
  { name: "Курган-Тюбе", lat: 37.8412, lon: 68.7842 },
  { name: "Куляб",       lat: 37.9107, lon: 69.7786 },
  { name: "Худжанд",     lat: 40.2775, lon: 69.6328 },
];

// WMO code → internal code (matching WeatherIcon thresholds)
function wmoToCode(wmo: number): number {
  if (wmo === 0) return 113;                          // Ясно → Sun
  if (wmo <= 3 || wmo === 45 || wmo === 48) return 119; // Облачно/туман → Cloud
  if (wmo === 95 || wmo >= 96) return 200;            // Гроза → Lightning
  if (wmo >= 71 && wmo <= 77) return 395;             // Снег → Snow
  if (wmo === 85 || wmo === 86) return 395;           // Снегопад → Snow
  return 263;                                          // Дождь/морось → Rain
}

function wmoDesc(wmo: number): string {
  if (wmo === 0) return "Ясно";
  if (wmo === 1) return "Преим. ясно";
  if (wmo === 2) return "Перем. облачность";
  if (wmo === 3) return "Пасмурно";
  if (wmo === 45 || wmo === 48) return "Туман";
  if (wmo <= 57) return "Морось";
  if (wmo <= 67) return "Дождь";
  if (wmo <= 77) return "Снег";
  if (wmo <= 82) return "Ливень";
  if (wmo <= 86) return "Снегопад";
  if (wmo === 95) return "Гроза";
  return "Гроза с градом";
}

export async function GET() {
  const results = await Promise.allSettled(
    CITIES.map(async ({ name, lat, lon }) => {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weathercode&timezone=Asia%2FDushanbe`;
      const res = await fetch(url, { next: { revalidate: 1800 } });
      if (!res.ok) throw new Error(`open-meteo error ${res.status}`);
      const data = await res.json();
      const temp = Math.round(data.current.temperature_2m as number);
      const wmo = data.current.weathercode as number;
      return { name, temp, code: wmoToCode(wmo), desc: wmoDesc(wmo) };
    })
  );

  const data = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { name: CITIES[i].name, temp: null, code: 113, desc: "—" }
  );

  return NextResponse.json({ success: true, data });
}
