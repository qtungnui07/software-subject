import type { LearningSessionDraft } from "@/types/learning-session-draft";

const PREFIX = "robogo";

export const getLearningSessionDraftKey = ({
  kind,
  userId,
  contentId,
}: {
  kind: "lesson" | "checkpoint";
  userId: string;
  contentId: string;
}) => `${PREFIX}:${kind}-draft:${userId}:${contentId}`;

const resolveStorage = (storage?: Storage) => {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const readLearningSessionDraft = ({
  key,
  storage,
}: {
  key: string;
  storage?: Storage;
}): unknown => {
  try {
    const raw = resolveStorage(storage)?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeLearningSessionDraft = ({
  key,
  draft,
  storage,
}: {
  key: string;
  draft: LearningSessionDraft;
  storage?: Storage;
}) => {
  try {
    resolveStorage(storage)?.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
};

export const removeLearningSessionDraft = ({
  key,
  storage,
}: {
  key: string;
  storage?: Storage;
}) => {
  try {
    resolveStorage(storage)?.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
