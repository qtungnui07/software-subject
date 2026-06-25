import "server-only";

import { backendRequest } from "@/services/backend-client";

export type AdminUser = {
  id: string;
  clerkUserId: string | null;
  name: string;
  email: string;
  imageSrc: string;
  createdAt: string;
  updatedAt: string;
  authProvider: "clerk" | "local";
  hasPassword: boolean;
};

type UserListResponse = {
  ok: true;
  users: AdminUser[];
};

type DeleteUserResponse = {
  ok: true;
  user: { id: string; email: string };
};

export const listUsers = () => backendRequest<UserListResponse>("/admin/users");

export const deleteUser = (id: string) =>
  backendRequest<DeleteUserResponse>(`/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
