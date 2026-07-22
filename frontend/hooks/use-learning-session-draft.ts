"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  readLearningSessionDraft,
  removeLearningSessionDraft,
  writeLearningSessionDraft,
} from "@/lib/learning-session/draft-storage";
import type {
  DraftSaveStatus,
  LearningSessionDraft,
} from "@/types/learning-session-draft";

export const useLearningSessionDraft = ({
  storageKey,
  enabled,
  draft,
  debounceMs = 500,
}: {
  storageKey: string | null;
  enabled: boolean;
  draft: LearningSessionDraft | null;
  debounceMs?: number;
}) => {
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const read = useCallback(
    () => (storageKey ? readLearningSessionDraft({ key: storageKey }) : null),
    [storageKey],
  );

  const clear = useCallback(() => {
    if (storageKey) removeLearningSessionDraft({ key: storageKey });
    setSaveStatus("idle");
  }, [storageKey]);

  const saveNow = useCallback(() => {
    if (!enabled || !storageKey || !draft) return false;
    setSaveStatus("saving");
    const saved = writeLearningSessionDraft({ key: storageKey, draft });
    setSaveStatus(saved ? "saved" : "error");
    return saved;
  }, [draft, enabled, storageKey]);

  useEffect(() => {
    if (!enabled || !storageKey || !draft) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveNow, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [debounceMs, draft, enabled, saveNow, storageKey]);

  useEffect(() => {
    if (!enabled) return;
    const flush = () => saveNow();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, saveNow]);

  return { read, clear, saveNow, saveStatus };
};
