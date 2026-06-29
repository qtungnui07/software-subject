import "server-only";

import { backendRequest } from "@/services/backend-client";

export type Account = {
  name: string;
  email: string;
  isClerk: boolean;
};

export type AccountResponse = {
  ok: true;
  account: Account;
};

export type UpdateAccountInput = {
  name: string;
  email: string;
};

export const getAccount = (userId: string) =>
  backendRequest<AccountResponse>("/settings/account", { userId });

export const updateAccount = (userId: string, input: UpdateAccountInput) =>
  backendRequest<AccountResponse>("/settings/account", {
    method: "PATCH",
    userId,
    body: input,
  });
