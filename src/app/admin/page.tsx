"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  X,
  Check,
  Shield,
  Users,
  User,
  Loader2,
  Link2,
} from "lucide-react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  type AppUser,
} from "@/services/userService";
import { LoginPage } from "@/components/LoginPage";
import { tools as defaultTools } from "@/data/tools";
import { getTools } from "@/services/toolService";

type FormState = {
  login: string;
  password: string;
  role: "admin" | "user";
  allowedToolIds: string[] | null;
};

const EMPTY_FORM: FormState = { login: "", password: "", role: "user", allowedToolIds: null };

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [allAccess, setAllAccess] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tools, setTools] = useState(defaultTools);

  useEffect(() => {
    getTools().then((apiTools) => {
      if (apiTools.length > 0) setTools(apiTools);
    });
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());
    loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setAllAccess(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (user: AppUser) => {
    setEditingUser(user);
    setForm({ login: user.login, password: "", role: user.role, allowedToolIds: user.allowedToolIds });
    setAllAccess(user.allowedToolIds === null);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingUser(null); setError(""); };

  const toggleTool = (toolId: string) => {
    const current = form.allowedToolIds ?? [];
    const next = current.includes(toolId)
      ? current.filter((id) => id !== toolId)
      : [...current, toolId];
    setForm((f) => ({ ...f, allowedToolIds: next }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.login.trim()) { setError("Введите логин"); return; }
    if (!editingUser && !form.password.trim()) { setError("Введите пароль"); return; }
    if (users.find((u) => u.login === form.login.trim() && u.id !== editingUser?.id)) {
      setError("Пользователь с таким логином уже существует");
      return;
    }

    setSubmitting(true);
    const toolIds = allAccess ? null : (form.allowedToolIds ?? []);

    if (editingUser) {
      const upd: Parameters<typeof updateUser>[1] = {
        login: form.login.trim(),
        role: form.role,
        allowedToolIds: toolIds,
      };
      if (form.password.trim()) upd.password = form.password;
      await updateUser(editingUser.id, upd);
    } else {
      await createUser({
        login: form.login.trim(),
        password: form.password,
        role: form.role,
        allowedToolIds: toolIds,
      });
    }

    setSubmitting(false);
    await loadUsers();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await deleteUser(id);
      await loadUsers();
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <Shield className="h-6 w-6 text-red-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-slate-600">Нет доступа</p>
          <p className="mt-1 text-xs text-slate-400">Этот раздел только для администраторов</p>
          <a href="/" className="mt-4 inline-block text-xs text-[var(--primary)] underline">← На главную</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 lg:px-8">
          <a href="/" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            Назад
          </a>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="text-sm font-semibold text-slate-800">Администрация</h1>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/admin/tools"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Ссылки на инструменты
            </a>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Создать пользователя
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Всего", value: users.length, icon: Users, color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Администраторов", value: users.filter((u) => u.role === "admin").length, icon: Shield, color: "text-[var(--primary)]", bg: "bg-red-50" },
            { label: "Сотрудников", value: users.filter((u) => u.role === "user").length, icon: User, color: "text-blue-500", bg: "bg-blue-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.75} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{loading ? "—" : value}</p>
              <p className="mt-0.5 text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Users list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" strokeWidth={1.75} />
          </div>
        ) : (
          <div className="space-y-2.5">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${
                    user.role === "admin" ? "bg-[var(--primary)]" : "bg-slate-300"
                  }`}
                >
                  {user.login[0].toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{user.login}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        user.role === "admin"
                          ? "bg-red-50 text-[var(--primary)]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {user.role === "admin" ? "Администратор" : "Сотрудник"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {user.allowedToolIds === null
                      ? "Доступ ко всем инструментам"
                      : `${user.allowedToolIds.length} ${
                          user.allowedToolIds.length === 1 ? "инструмент" :
                          user.allowedToolIds.length < 5 ? "инструмента" : "инструментов"
                        }`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => openEdit(user)}
                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    title="Редактировать"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  {user.id !== "admin-default" && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={`rounded-xl p-2 transition-colors ${
                        deleteConfirm === user.id
                          ? "bg-red-100 text-red-500"
                          : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                      }`}
                      title={deleteConfirm === user.id ? "Нажмите ещё раз для подтверждения" : "Удалить"}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-800">
                {editingUser ? "Редактировать пользователя" : "Новый пользователь"}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-6">
              <div className="space-y-5">
                {/* Login */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Логин</label>
                  <input
                    type="text"
                    value={form.login}
                    onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
                    placeholder="username"
                    autoFocus
                    disabled={submitting}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:bg-white disabled:opacity-60"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {editingUser ? "Новый пароль (оставьте пустым, чтобы не менять)" : "Пароль"}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    disabled={submitting}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:bg-white disabled:opacity-60"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Роль</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(["user", "admin"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        disabled={submitting}
                        onClick={() => setForm((f) => ({ ...f, role: r }))}
                        className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                          form.role === r
                            ? r === "admin"
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {r === "admin" ? "Администратор" : "Сотрудник"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Access */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Доступ к инструментам
                  </label>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setAllAccess(!allAccess)}
                    className={`mt-1.5 flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                      allAccess
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        allAccess ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                      }`}
                    >
                      {allAccess && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </div>
                    Доступ ко всем инструментам
                  </button>

                  {!allAccess && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-2">
                      {tools.map((tool) => {
                        const selected = (form.allowedToolIds ?? []).includes(tool.id);
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            disabled={submitting}
                            onClick={() => toggleTool(tool.id)}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                              selected ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                                selected ? "border-white bg-white" : "border-slate-300"
                              }`}
                            >
                              {selected && <Check className="h-2.5 w-2.5 text-slate-900" strokeWidth={3} />}
                            </div>
                            {tool.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-500">{error}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                        Сохранение...
                      </>
                    ) : editingUser ? "Сохранить" : "Создать"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
