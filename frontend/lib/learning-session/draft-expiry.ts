export const LESSON_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CHECKPOINT_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export const isLearningSessionDraftExpired = ({
  savedAt,
  kind,
  now = Date.now(),
}: {
  savedAt: string;
  kind: "lesson" | "checkpoint";
  now?: number;
}) => {
  const savedAtMs = Date.parse(savedAt);
  if (!Number.isFinite(savedAtMs)) return true;
  const ttl = kind === "lesson" ? LESSON_DRAFT_TTL_MS : CHECKPOINT_DRAFT_TTL_MS;
  return now - savedAtMs > ttl;
};
