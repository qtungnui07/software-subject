export const STUDY_SESSION_LOCK_KEY = "robogo:active-study-session";
export const STUDY_SESSION_HEARTBEAT_MS = 5_000;
export const STUDY_SESSION_LEASE_MS = 30_000;

export type StudySessionLease = {
  tabId: string;
  lastHeartbeatAt: number;
};

export const parseStudySessionLease = (
  value: string | null,
): StudySessionLease | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StudySessionLease>;
    const tabId = typeof parsed.tabId === "string" ? parsed.tabId.trim() : "";
    const lastHeartbeatAt = Number(parsed.lastHeartbeatAt);

    if (!tabId || !Number.isFinite(lastHeartbeatAt)) {
      return null;
    }

    return {
      tabId,
      lastHeartbeatAt: Math.trunc(lastHeartbeatAt),
    };
  } catch {
    return null;
  }
};

export const isStudySessionLeaseStale = (
  lease: StudySessionLease | null,
  now = Date.now(),
) => !lease || now - lease.lastHeartbeatAt >= STUDY_SESSION_LEASE_MS;

export const canAcquireStudySessionLease = (
  lease: StudySessionLease | null,
  tabId: string,
  now = Date.now(),
) => lease?.tabId === tabId || isStudySessionLeaseStale(lease, now);

export const createStudySessionLease = (
  tabId: string,
  now = Date.now(),
): StudySessionLease => ({
  tabId,
  lastHeartbeatAt: now,
});
