import type { Tool } from "@/data/tools";

async function callApi(body: object): Promise<{
  success: boolean;
  data?: Tool[];
  error?: string;
  message?: string;
}> {
  const res = await fetch("/api/tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getTools(): Promise<Tool[]> {
  const result = await callApi({ action: "getTools" });
  return result.success && result.data ? result.data : [];
}

export async function updateTool(
  id: string,
  data: Partial<Pick<Tool, "name" | "description" | "url" | "categoryId" | "isNew">>
): Promise<boolean> {
  const result = await callApi({ action: "updateTool", id, data });
  return result.success === true;
}

export async function setupTools(): Promise<boolean> {
  const result = await callApi({ action: "setupTools" });
  return result.success === true;
}
