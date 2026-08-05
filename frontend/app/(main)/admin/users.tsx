"use client";

import { RefreshCw, Search, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { isSvgAvatar } from "@/constants/user-avatar";

type AdminUser = {
  id: string;
  clerkUserId: string | null;
  name: string;
  email: string;
  imageSrc: string;
  createdAt: string;
  updatedAt: string;
  authProvider: "local" | "clerk";
  hasPassword: boolean;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadUsers = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Không thể tải danh sách tài khoản.");
      }

      setUsers(data.users || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách tài khoản.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.id, user.clerkUserId || ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, users]);

  const providerCounts = useMemo(
    () => ({
      local: users.filter((user) => user.authProvider === "local").length,
      clerk: users.filter((user) => user.authProvider === "clerk").length,
    }),
    [users],
  );

  const deleteUser = (user: AdminUser) => {
    if (!window.confirm(`Xóa tài khoản ${user.email}?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/users", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: user.id }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Không thể xóa tài khoản.");
        }

        setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
        toast.success("Đã xóa tài khoản.");
      } catch (deleteError) {
        toast.error(deleteError instanceof Error ? deleteError.message : "Không thể xóa tài khoản.");
      }
    });
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#131f24] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-sky-100 dark:border-sky-950/40 bg-sky-50 dark:bg-sky-950/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
              <Users className="size-4" />
              Quản trị
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-800 dark:text-white sm:text-4xl">
              Quản lý tài khoản
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
              Xem tài khoản email/password trong database và tài khoản được đồng bộ từ Clerk OAuth.
            </p>
          </div>

          <Button
            type="button"
            variant="primary-outline"
            className="h-12 rounded-2xl border-2 border-sky-100 dark:border-slate-800 px-4"
            onClick={loadUsers}
            disabled={isLoading || isPending}
          >
            <RefreshCw className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-slate-100 dark:border-[#202f36] bg-slate-50 dark:bg-slate-900/30 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">Tổng tài khoản</p>
            <p className="mt-2 text-3xl font-black text-slate-800 dark:text-white">{users.length}</p>
          </div>
          <div className="rounded-2xl border-2 border-emerald-100 dark:border-emerald-950/40 bg-emerald-50 dark:bg-emerald-950/20 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Database local</p>
            <p className="mt-2 text-3xl font-black text-emerald-700 dark:text-emerald-300">{providerCounts.local}</p>
          </div>
          <div className="rounded-2xl border-2 border-violet-100 dark:border-violet-950/40 bg-violet-50 dark:bg-violet-950/20 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-violet-600 dark:text-violet-400">Clerk OAuth</p>
            <p className="mt-2 text-3xl font-black text-violet-700 dark:text-violet-300">{providerCounts.clerk}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border-2 border-slate-200 dark:border-[#202f36] bg-white dark:bg-[#131f24] shadow-sm">
        <div className="border-b-2 border-slate-100 dark:border-slate-800 p-4 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, email, ID..."
              className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-700 dark:focus:border-sky-500 dark:focus:bg-slate-950"
            />
          </div>
        </div>

        {error ? (
          <div className="p-6 text-sm font-bold text-rose-600">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-sm font-bold text-slate-500">Đang tải tài khoản...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-800 text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <th className="px-5 py-4">Tài khoản</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4">Kiểu đăng nhập</th>
                  <th className="px-5 py-4">User ID</th>
                  <th className="px-5 py-4">Ngày tạo</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isAdmin = user.email === "admin@qtitpc.dev" || user.email.toLowerCase().includes("admin");

                  return (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 overflow-hidden rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <Image
                              src={user.imageSrc}
                              alt=""
                              fill
                              className={isSvgAvatar(user.imageSrc) ? "object-contain p-2" : "object-cover p-0"}
                              sizes="48px"
                              unoptimized={user.imageSrc.startsWith("http") || user.imageSrc.startsWith("data:")}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800 dark:text-slate-200">{user.name}</p>
                            <p className="mt-1 break-all text-xs font-bold text-slate-400 dark:text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            isAdmin
                              ? "rounded-full border-2 border-amber-200 bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 px-3 py-1 text-xs font-black uppercase text-amber-700 dark:text-amber-300"
                              : "rounded-full border-2 border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/40 px-3 py-1 text-xs font-black uppercase text-slate-600 dark:text-slate-400"
                          }
                        >
                          {isAdmin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                      <span
                        className={
                          user.authProvider === "local"
                            ? "rounded-full border-2 border-emerald-100 dark:border-emerald-950/40 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400"
                            : "rounded-full border-2 border-violet-100 dark:border-violet-950/40 bg-violet-50 dark:bg-violet-950/20 px-3 py-1 text-xs font-black uppercase text-violet-600 dark:text-violet-400"
                        }
                      >
                        {user.authProvider === "local" ? "Database" : "Clerk"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">#{user.id}</p>
                      {user.clerkUserId && (
                        <p className="mt-1 max-w-[220px] truncate text-xs font-bold text-slate-400 dark:text-slate-500">
                          {user.clerkUserId}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        type="button"
                        variant="danger-outline"
                        size="sm"
                        className="rounded-xl border-2 border-rose-100 dark:border-rose-950/40"
                        onClick={() => deleteUser(user)}
                        disabled={isPending}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Xóa
                      </Button>
                    </td>
                  </tr>
                );
              })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm font-bold text-slate-400 dark:text-slate-500">
                      Không có tài khoản phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};
