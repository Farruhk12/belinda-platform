export type AppUser = {
  id: string;
  login: string;
  password: string;
  role: "admin" | "user";
  allowedToolIds: string[] | null; // null = доступ ко всем инструментам
  createdAt: string;
};

const SESSION_KEY = "belinda-session-user";

async function callApi(body: object): Promise<{ success: boolean; data?: AppUser | AppUser[]; error?: string }> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Синхронно читает кэшированного пользователя из localStorage
export function getCurrentUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const json = localStorage.getItem(SESSION_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function getUsers(): Promise<AppUser[]> {
  const result = await callApi({ action: "getUsers" });
  return result.success ? (result.data as AppUser[]) : [];
}

export async function login(loginStr: string, password: string): Promise<AppUser | null> {
  const result = await callApi({ action: "login", login: loginStr, password });
  if (result.success && result.data) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(result.data));
    return result.data as AppUser;
  }
  return null;
}

export function logout(): void {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
}

export async function createUser(data: Omit<AppUser, "id" | "createdAt">): Promise<AppUser | null> {
  const result = await callApi({ action: "createUser", data });
  return result.success ? (result.data as AppUser) : null;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<AppUser, "id" | "createdAt">>
): Promise<boolean> {
  const result = await callApi({ action: "updateUser", id, data });
  return result.success;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await callApi({ action: "deleteUser", id });
  if (result.success) {
    const current = getCurrentUser();
    if (current?.id === id) logout();
  }
  return result.success;
}
