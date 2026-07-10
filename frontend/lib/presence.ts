import "server-only";

export type PresenceSnapshot = {
  userId: string;
  active: boolean;
  status: "active" | "off";
  lastSeenAt: string | null;
  expiresAt: string | null;
};

const ONLINE_TTL_MS = 45_000;

type PresenceRecord = {
  lastSeenAt: number;
  expiresAt: number;
};

const globalPresence = globalThis as typeof globalThis & {
  __robogoPresenceStore?: Map<string, PresenceRecord>;
};

const presenceStore =
  globalPresence.__robogoPresenceStore ??
  new Map<string, PresenceRecord>();

globalPresence.__robogoPresenceStore = presenceStore;

const toIso = (value: number | null) =>
  value === null ? null : new Date(value).toISOString();

export const markUserOnline = (userId: string) => {
  const now = Date.now();
  const record = {
    lastSeenAt: now,
    expiresAt: now + ONLINE_TTL_MS,
  };

  presenceStore.set(userId, record);

  return getUserPresence(userId);
};

export const markUserOffline = (userId: string) => {
  presenceStore.delete(userId);

  return getUserPresence(userId);
};

export const getUserPresence = (userId: string): PresenceSnapshot => {
  const record = presenceStore.get(userId);
  const now = Date.now();
  const active = Boolean(record && record.expiresAt > now);

  if (record && !active) {
    presenceStore.delete(userId);
  }

  return {
    userId,
    active,
    status: active ? "active" : "off",
    lastSeenAt: record ? toIso(record.lastSeenAt) : null,
    expiresAt: active && record ? toIso(record.expiresAt) : null,
  };
};

export const getOnlineTtlSeconds = () => Math.round(ONLINE_TTL_MS / 1000);
