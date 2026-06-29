import "server-only";

import { backendRequest, type BackendResult } from "@/services/backend-client";

export type LocalUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type LocalAuthResponse = {
  ok: true;
  user: LocalUser;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SyncClerkUserInput = {
  clerkUserId: string;
  name: string;
  email: string;
  imageSrc: string;
};

export const signUpLocalUser = (input: SignUpInput) =>
  backendRequest<LocalAuthResponse>("/auth/sign-up", { method: "POST", body: input });

export const signInLocalUser = (input: SignInInput) =>
  backendRequest<LocalAuthResponse>("/auth/sign-in", { method: "POST", body: input });

export const syncClerkUser = (
  input: SyncClerkUserInput
): Promise<BackendResult<{ ok: true; user: unknown }>> =>
  backendRequest("/internal/users/sync", {
    method: "POST",
    body: input,
    timeoutMs: 2000,
  });
