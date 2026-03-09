import { NextRequest, NextResponse } from "next/server";

const SCRIPT_URL = process.env.APPS_SCRIPT_URL;

export async function POST(request: NextRequest) {
  if (!SCRIPT_URL) {
    return NextResponse.json(
      { success: false, error: "APPS_SCRIPT_URL не настроен в .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const params = new URLSearchParams({ payload: JSON.stringify(body) });
    const res = await fetch(`${SCRIPT_URL}?${params}`, { redirect: "follow" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
