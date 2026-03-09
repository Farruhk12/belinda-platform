import { NextResponse } from "next/server";

const SOURCES = [
  "https://www.asiaplustj.info/ru/rss.xml",
  "https://news.tj/rss/ru",
  "https://avesta.tj/feed/",
];

const KEYWORDS = [
  "фарм", "лекарств", "здравоохран", "медицин", "минздрав",
  "аптек", "препарат", "вакцин", "болезн", "лечени", "санитар",
  "эпидем", "вирус", "грипп", "клиник", "больниц", "здоровь",
];

type RssItem = { title: string; link: string; pubDate: string };
type RssResponse = { status: string; feed?: { title?: string }; items?: RssItem[] };

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET() {
  const all: Array<{ title: string; link: string; source: string; date: string }> = [];
  const cutoff = Date.now() - THIRTY_DAYS_MS;

  await Promise.allSettled(
    SOURCES.map(async (url) => {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=50`;
      // no-store so we always get fresh news
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) return;
      const json: RssResponse = await res.json();
      if (json.status !== "ok" || !json.items) return;
      for (const item of json.items) {
        // filter: only last 30 days
        const pub = item.pubDate ? new Date(item.pubDate).getTime() : 0;
        if (pub > 0 && pub < cutoff) continue;
        all.push({
          title: item.title?.trim() ?? "",
          link: item.link,
          source: json.feed?.title ?? "Новости",
          date: item.pubDate,
        });
      }
    })
  );

  // sort newest first
  all.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  // deduplicate by title prefix
  const seen = new Set<string>();
  const unique = all.filter((item) => {
    const key = item.title.slice(0, 60).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const pharma = unique.filter((item) =>
    KEYWORDS.some((kw) => item.title.toLowerCase().includes(kw))
  );

  const result = pharma.length >= 3 ? pharma : unique;

  return NextResponse.json({ success: true, data: result.slice(0, 12) });
}
